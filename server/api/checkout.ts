/**
 * POST /api/checkout
 *
 * Creates an authenticated Stripe Checkout Session for a mailing intent.
 * No mailing is submitted until the Stripe session is verified as paid.
 */

import { createError, defineEventHandler, getRequestHeaders, getRequestURL, readBody } from "h3";
import { createClient } from "@supabase/supabase-js";
import { requireAuthenticatedUser } from "../../src/lib/auth-guard";

const PRICES = {
  standard: 499,
  certified: 1494,
  registered: 3249,
} as const;

const LABELS = {
  standard: "Standard Mailing",
  certified: "Certified Mailing",
  registered: "Registered Mailing",
} as const;

function getSupabaseServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) throw createError({ statusCode: 503, statusMessage: "Supabase server configuration is incomplete." });
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

function toAuthRequest(event: Parameters<typeof defineEventHandler>[0]) {
  return new Request(getRequestURL(event).toString(), {
    headers: getRequestHeaders(event) as HeadersInit,
  });
}

export default defineEventHandler(async (event) => {
  if (event.method !== "POST") throw createError({ statusCode: 405, statusMessage: "Method not allowed." });

  const user = await requireAuthenticatedUser(toAuthRequest(event));

  const input = await readBody<{
    draft?: string;
    workflowId?: string;
    workflowTitle?: string;
    mailingMethod?: keyof typeof PRICES;
    recipient?: { name?: string; org?: string; address1?: string; address2?: string; city?: string; state?: string; zip?: string };
    matterReference?: string;
    matterType?: string;
  }>(event);

  const draft = input?.draft?.trim();
  const workflowId = input?.workflowId?.trim();
  const mailingMethod = input?.mailingMethod;
  const recipient = input?.recipient;

  if (!draft || draft.length < 20) throw createError({ statusCode: 400, statusMessage: "A completed response draft is required." });
  if (!workflowId) throw createError({ statusCode: 400, statusMessage: "Workflow ID is required." });
  if (!mailingMethod || !(mailingMethod in PRICES)) throw createError({ statusCode: 400, statusMessage: "A valid mailing method is required." });
  if (!recipient?.name || !recipient.address1 || !recipient.city || !recipient.state || !recipient.zip) {
    throw createError({ statusCode: 400, statusMessage: "A complete recipient address is required." });
  }
  if (!/^[A-Za-z]{2}$/.test(recipient.state)) throw createError({ statusCode: 400, statusMessage: "Recipient state must be a 2-letter abbreviation." });
  if (!/^\d{5}(-\d{4})?$/.test(recipient.zip)) throw createError({ statusCode: 400, statusMessage: "Recipient ZIP code is invalid." });

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) throw createError({ statusCode: 503, statusMessage: "Stripe is not configured." });

  const supabase = getSupabaseServiceClient();
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });
  const appUrl = process.env.APP_URL || getRequestURL(event).origin;

  const { data: intent, error: intentError } = await supabase
    .from("mailing_intents")
    .insert({
      owner_id: user.id,
      workflow_id: workflowId,
      status: "pending",
      mailing_method: mailingMethod,
      draft,
      recipient,
      matter_reference: input?.matterReference?.trim() || workflowId,
      matter_type: input?.matterType?.trim() || "notice-respond",
    })
    .select("id")
    .single();

  if (intentError || !intent) throw createError({ statusCode: 502, statusMessage: `Unable to create mailing intent: ${intentError?.message || "unknown error"}` });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: LABELS[mailingMethod],
            description: `${input?.workflowTitle?.trim() || workflowId} · ${LABELS[mailingMethod]}`,
          },
          unit_amount: PRICES[mailingMethod],
        },
        quantity: 1,
      }],
      metadata: {
        mailing_intent_id: intent.id,
        owner_user_id: user.id,
        workflow_id: workflowId,
      },
      success_url: `${appUrl}/workflows/${workflowId}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/workflows/${workflowId}?checkout=cancelled`,
    });

    const { error: updateError } = await supabase
      .from("mailing_intents")
      .update({ stripe_session_id: session.id })
      .eq("id", intent.id)
      .eq("owner_id", user.id);

    if (updateError) throw updateError;
    return { ok: true, checkoutUrl: session.url, sessionId: session.id };
  } catch (error) {
    await supabase.from("mailing_intents").update({ status: "failed", error_message: error instanceof Error ? error.message : "Stripe checkout creation failed" }).eq("id", intent.id);
    throw createError({ statusCode: 502, statusMessage: error instanceof Error ? error.message : "Unable to create Stripe checkout." });
  }
});
