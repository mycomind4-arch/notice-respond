/**
 * POST /api/webhooks/stripe
 *
 * Stripe webhook handler for Notice Respond.
 *
 * Listens for `checkout.session.completed` and triggers fulfillment
 * independently of the browser return path. Same pattern as
 * Immigration Mail's webhook.
 *
 * Closes P1 #8 (Notice Respond side): fulfillment no longer depends
 * on the user returning to the success URL.
 *
 * Security:
 *   - Verifies Stripe signature using STRIPE_WEBHOOK_SECRET
 *   - Idempotent: skips already-fulfilled intents
 *   - Verifies approved artifact hashes before mailing
 */

import { createError, defineEventHandler, getRequestHeaders, readBody, type H3Event } from "h3";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { uploadDocument, createCommunication, type MailType } from "../../../src/platform/mailmypdf";

const ALLOWED_MAIL_TYPES = new Set<MailType>([
  "first_class",
  "certified",
  "certified_return_receipt",
  "registered",
]);

function serviceSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) throw createError({ statusCode: 503, statusMessage: "Supabase server configuration is incomplete." });
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function hashRecipient(recipient: Record<string, string>): string {
  const canonical = JSON.stringify({
    name: recipient.name?.trim().toUpperCase() || "",
    org: recipient.org?.trim().toUpperCase() || "",
    address1: recipient.address1?.trim().toUpperCase() || "",
    address2: recipient.address2?.trim().toUpperCase() || "",
    city: recipient.city?.trim().toUpperCase() || "",
    state: recipient.state?.trim().toUpperCase() || "",
    zip: recipient.zip?.trim() || "",
  });
  return sha256(canonical);
}

export default defineEventHandler(async (event: H3Event) => {
  if (event.method !== "POST") throw createError({ statusCode: 405, statusMessage: "Method not allowed." });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    throw createError({ statusCode: 503, statusMessage: "Stripe webhook is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET." });
  }

  const rawBody = await readBody(event);
  const bodyText = typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);

  const headers = getRequestHeaders(event);
  const signature = headers["stripe-signature"] || headers["Stripe-Signature"];

  if (!signature) {
    throw createError({ statusCode: 400, statusMessage: "Missing Stripe signature header." });
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = await stripe.webhooks.constructEventAsync(bodyText, signature, webhookSecret);
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook signature verification failed: ${err instanceof Error ? err.message : "unknown error"}`,
    });
  }

  // ── checkout.session.completed ────────────────────────────
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return { received: true, skipped: true, reason: `payment_status=${session.payment_status}` };
    }

    const intentId = session.metadata?.mailing_intent_id;
    if (!intentId) {
      return { received: true, skipped: true, reason: "no mailing_intent_id in metadata" };
    }

    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null;
    const supabase = serviceSupabase();

    // Load the intent
    const { data: intent, error: intentError } = await supabase
      .from("mailing_intents")
      .select("*")
      .eq("id", intentId)
      .single();

    if (intentError || !intent) {
      return { received: true, fulfilled: false, error: `Mailing intent not found: ${intentId}`, intentId };
    }

    // Idempotency: already fulfilled
    if (intent.provider_order_id) {
      return { received: true, fulfilled: true, intentId, providerOrderId: intent.provider_order_id, idempotent: true };
    }
    if (intent.status === "submitted" || intent.status === "tracking") {
      return { received: true, fulfilled: true, intentId, status: intent.status, idempotent: true };
    }

    // Verify session matches
    if (intent.stripe_session_id && intent.stripe_session_id !== session.id) {
      return { received: true, fulfilled: false, error: "Stripe session mismatch.", intentId };
    }

    if (!ALLOWED_MAIL_TYPES.has(intent.mailing_method as MailType)) {
      return { received: true, fulfilled: false, error: "Invalid mailing method.", intentId };
    }

    // ── ★ APPROVAL HASH VERIFICATION ──────────────────────
    if (intent.approved_draft_hash) {
      const computedDraftHash = sha256(intent.draft_content);
      if (computedDraftHash !== intent.approved_draft_hash) {
        return { received: true, fulfilled: false, error: "Integrity check failed: draft hash mismatch.", intentId };
      }
    }

    const recipient = intent.recipient as { name?: string; org?: string; address1?: string; address2?: string; city?: string; state?: string; zip?: string };
    if (!recipient?.name || !recipient.address1 || !recipient.city || !recipient.state || !recipient.zip) {
      return { received: true, fulfilled: false, error: "Stored recipient is incomplete.", intentId };
    }

    // ── ★ RECIPIENT HASH VERIFICATION ─────────────────────
    if (intent.approved_recipient_hash) {
      const computedRecipientHash = hashRecipient(recipient as Record<string, string>);
      if (computedRecipientHash !== intent.approved_recipient_hash) {
        return { received: true, fulfilled: false, error: "Integrity check failed: recipient hash mismatch.", intentId };
      }
    }

    // Mark as paid
    await supabase
      .from("mailing_intents")
      .update({
        status: "paid",
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq("id", intentId)
      .is("provider_order_id", null);

    // Fulfill
    try {
      const file = new File(
        [intent.draft_content],
        `notice-response-${intent.workflow_id}-${intent.id}.txt`,
        { type: "text/plain" }
      );
      const document = await uploadDocument(file);
      const communication = await createCommunication({
        document_id: document.id,
        recipient: {
          name: recipient.name,
          address_line1: recipient.address1,
          address_line2: recipient.address2 || null,
          city: recipient.city,
          state: recipient.state.toUpperCase(),
          postal_code: recipient.zip,
          country: "US",
        },
        mail_type: intent.mailing_method as MailType,
        matter_reference: intent.matter_reference || intent.workflow_id,
        matter_type: intent.matter_type || "notice-respond",
        legal_reference: intent.legal_reference || {
          type: "other" as const,
          citation: "Notice Respond workflow",
          description: "Response to a government notice prepared through Notice Respond.",
        },
        metadata: {
          workflow_id: intent.workflow_id,
          source: "notice-respond",
          stripe_session_id: session.id,
          owner_user_id: intent.owner_id,
          approval_id: intent.approval_id || null,
          approved_draft_hash: intent.approved_draft_hash || null,
          fulfillment_source: "stripe-webhook",
        },
        idempotency_key: `stripe:${session.id}`,
      });

      await supabase
        .from("mailing_intents")
        .update({
          status: "submitted",
          provider_order_id: communication.id,
          tracking_number: communication.tracking_number ?? null,
          error_message: null,
        })
        .eq("id", intentId);

      return { received: true, fulfilled: true, intentId, providerOrderId: communication.id, trackingNumber: communication.tracking_number ?? null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Mailing submission failed.";
      await supabase
        .from("mailing_intents")
        .update({ status: "failed", error_message: message })
        .eq("id", intentId);
      return { received: true, fulfilled: false, error: message, intentId };
    }
  }

  // ── checkout.session.expired ──────────────────────────────
  if (stripeEvent.type === "checkout.session.expired") {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;
    const intentId = session.metadata?.mailing_intent_id;
    if (intentId) {
      const supabase = serviceSupabase();
      await supabase
        .from("mailing_intents")
        .update({ status: "expired", error_message: "Stripe checkout session expired." })
        .eq("id", intentId)
        .is("provider_order_id", null);
    }
    return { received: true, handled: "checkout.session.expired" };
  }

  // ── charge.refunded ────────────────────────────────────────
  if (stripeEvent.type === "charge.refunded") {
    const charge = stripeEvent.data.object as Stripe.Charge;
    const intentId = charge.metadata?.mailing_intent_id;
    if (intentId) {
      const supabase = serviceSupabase();
      await supabase
        .from("mailing_intents")
        .update({ status: "refunded", error_message: "Payment refunded by Stripe." })
        .eq("id", intentId);
    }
    return { received: true, handled: "charge.refunded" };
  }

  return { received: true, unhandled: stripeEvent.type };
});
