/**
 * POST /api/mail/response
 *
 * Payment-protected, authenticated Notice Respond mailing endpoint.
 *
 * The client supplies only the Stripe Checkout Session ID.
 * The server verifies:
 *   1. The caller is an authenticated MailMyPDF Account user.
 *   2. The Stripe session is paid.
 *   3. The Stripe session belongs to the same user and workflow.
 *   4. The durable mailing intent exists and has not already been submitted.
 *   5. ★ The intent's approved_draft_hash matches the stored draft.
 *   6. ★ The intent's approved_recipient_hash matches the stored recipient.
 *
 * The server then reconstructs the response document from the intent,
 * uploads it to MailMyPDF, creates the communication, and records the
 * provider order/tracking state. The client never controls recipient,
 * price, or payment state at the point of mailing.
 *
 * ★ = new integrity check added by the Gold Hardening Program.
 */

import { createError, defineEventHandler, getRequestHeaders, getRequestURL, readBody, type H3Event } from "h3";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { requireAuthenticatedUser } from "../../../src/lib/auth-guard";
import { uploadDocument, createCommunication, type MailType } from "../../../src/platform/mailmypdf";

const ALLOWED_MAIL_TYPES = new Set<MailType>([
  "first_class",
  "certified",
  "certified_return_receipt",
  "registered",
]);

const MAX_DRAFT_SIZE = 500_000;

function toAuthRequest(event: H3Event): Request {
  return new Request(getRequestURL(event).toString(), {
    headers: getRequestHeaders(event) as HeadersInit,
  });
}

function getSupabaseServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) throw createError({ statusCode: 503, statusMessage: "Supabase server configuration is incomplete." });
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

function getConfiguredStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw createError({ statusCode: 503, statusMessage: "Stripe is not configured." });
  return import("stripe").then(({ default: Stripe }) => new Stripe(secretKey, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion }));
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

export default defineEventHandler(async (event) => {
  if (event.method !== "POST") throw createError({ statusCode: 405, statusMessage: "Method not allowed." });

  const user = await requireAuthenticatedUser(toAuthRequest(event));
  const input = await readBody<{ stripeSessionId?: string }>(event);
  const stripeSessionId = input?.stripeSessionId?.trim();

  if (!stripeSessionId) throw createError({ statusCode: 400, statusMessage: "Stripe Checkout Session ID is required." });

  const supabase = getSupabaseServiceClient();
  const stripe = await getConfiguredStripe();

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Invalid Stripe Checkout Session." });
  }

  if (session.payment_status !== "paid") {
    throw createError({ statusCode: 409, statusMessage: "Payment has not been completed." });
  }

  const ownerUserId = session.metadata?.owner_user_id;
  const intentId = session.metadata?.mailing_intent_id;
  if (!ownerUserId || ownerUserId !== user.id || !intentId) {
    throw createError({ statusCode: 403, statusMessage: "This payment session does not belong to the authenticated account." });
  }

  const { data: intent, error: intentError } = await supabase
    .from("mailing_intents")
    .select("*")
    .eq("id", intentId)
    .eq("owner_id", user.id)
    .single();

  if (intentError || !intent) throw createError({ statusCode: 404, statusMessage: "Mailing intent not found." });

  if (intent.stripe_session_id && intent.stripe_session_id !== stripeSessionId) {
    throw createError({ statusCode: 409, statusMessage: "Stripe session does not match the stored mailing intent." });
  }

  if (intent.provider_order_id) {
    return {
      success: true,
      providerOrderId: intent.provider_order_id,
      trackingNumber: intent.tracking_number ?? null,
      status: intent.status,
      idempotent: true,
    };
  }

  if (!ALLOWED_MAIL_TYPES.has(intent.mailing_method as MailType)) {
    throw createError({ statusCode: 409, statusMessage: "Stored mailing method is invalid." });
  }
  if (typeof intent.draft !== "string" || intent.draft.length < 20 || intent.draft.length > MAX_DRAFT_SIZE) {
    throw createError({ statusCode: 409, statusMessage: "Stored response draft is invalid or too large." });
  }

  // ── ★ APPROVAL HASH VERIFICATION ──────────────────────────
  // Verify the stored draft matches the approved draft hash.
  // This prevents any tampering between approval and mailing.
  if (intent.approved_draft_hash) {
    const computedDraftHash = sha256(intent.draft);
    if (computedDraftHash !== intent.approved_draft_hash) {
      // Record security event
      await supabase.from("audit_entries").insert({
        id: crypto.randomUUID(),
        case_id: null,
        owner_id: user.id,
        actor: user.id,
        action: "approval_hash_mismatch",
        object_type: "mailing_intent",
        description: "Stored draft hash does not match approved draft hash — mailing blocked.",
        result: "blocked",
        is_security_event: true,
        data: { intentId, computedHash: computedDraftHash, approvedHash: intent.approved_draft_hash },
      });
      throw createError({ statusCode: 403, statusMessage: "Integrity check failed: the stored draft does not match the approved draft." });
    }
  }

  const recipient = intent.recipient as {
    name?: string; org?: string; address1?: string; address2?: string;
    city?: string; state?: string; zip?: string;
  } | null;

  if (!recipient?.name || !recipient.address1 || !recipient.city || !recipient.state || !recipient.zip) {
    throw createError({ statusCode: 409, statusMessage: "Stored mailing recipient is incomplete." });
  }
  if (!/^[A-Za-z]{2}$/.test(recipient.state)) throw createError({ statusCode: 409, statusMessage: "Stored recipient state is invalid." });
  if (!/^\d{5}(-\d{4})?$/.test(recipient.zip)) throw createError({ statusCode: 409, statusMessage: "Stored recipient ZIP code is invalid." });

  // ── ★ RECIPIENT HASH VERIFICATION ─────────────────────────
  if (intent.approved_recipient_hash) {
    const computedRecipientHash = hashRecipient(recipient as Record<string, string>);
    if (computedRecipientHash !== intent.approved_recipient_hash) {
      await supabase.from("audit_entries").insert({
        id: crypto.randomUUID(),
        case_id: null,
        owner_id: user.id,
        actor: user.id,
        action: "recipient_hash_mismatch",
        object_type: "mailing_intent",
        description: "Stored recipient hash does not match approved recipient hash — mailing blocked.",
        result: "blocked",
        is_security_event: true,
        data: { intentId, computedHash: computedRecipientHash, approvedHash: intent.approved_recipient_hash },
      });
      throw createError({ statusCode: 403, statusMessage: "Integrity check failed: the stored recipient does not match the approved recipient." });
    }
  }

  const { error: paidError } = await supabase
    .from("mailing_intents")
    .update({
      status: "paid",
      stripe_session_id: stripeSessionId,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
    })
    .eq("id", intent.id)
    .eq("owner_id", user.id)
    .is("provider_order_id", null);

  if (paidError) throw createError({ statusCode: 502, statusMessage: `Unable to record payment: ${paidError.message}` });

  try {
    const file = new File([intent.draft], `response-${intent.workflow_id}-${intent.id}.txt`, { type: "text/plain" });
    const document = await uploadDocument(file);
    const idempotencyKey = `stripe:${stripeSessionId}`;

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
      metadata: {
        workflow_id: intent.workflow_id,
        source: "notice-respond",
        stripe_session_id: stripeSessionId,
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        owner_user_id: user.id,
        approval_id: intent.approval_id || null,
        approved_draft_hash: intent.approved_draft_hash || null,
      },
      idempotency_key: idempotencyKey,
    });

    await supabase
      .from("mailing_intents")
      .update({
        status: "submitted",
        provider_order_id: communication.id,
        tracking_number: communication.tracking_number ?? null,
        error_message: null,
      })
      .eq("id", intent.id)
      .eq("owner_id", user.id);

    return {
      success: true,
      providerOrderId: communication.id,
      trackingNumber: communication.tracking_number ?? null,
      status: communication.status ?? "submitted",
      idempotent: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mailing submission failed.";
    await supabase
      .from("mailing_intents")
      .update({ status: "failed", error_message: message })
      .eq("id", intent.id)
      .eq("owner_id", user.id);
    throw createError({ statusCode: 502, statusMessage: `MailMyPDF mailing submission failed: ${message}` });
  }
});
