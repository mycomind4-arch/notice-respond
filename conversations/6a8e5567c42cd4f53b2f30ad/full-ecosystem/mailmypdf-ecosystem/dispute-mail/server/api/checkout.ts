import { createError, defineEventHandler, getRequestHeaders, getRequestURL, readBody, type H3Event } from "h3";
import { createClient } from "@supabase/supabase-js";
import { requireAuthenticatedUser } from "../../src/lib/auth-guard";

const PRICES = { standard: 499, certified: 1494, registered: 3249 } as const;
const LABELS = { standard: "Standard Mailing", certified: "Certified Mailing", registered: "Registered Mailing" } as const;

function authRequest(event: H3Event): Request {
  return new Request(getRequestURL(event).toString(), { headers: getRequestHeaders(event) as HeadersInit });
}
function serviceSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) throw createError({ statusCode: 503, statusMessage: "Supabase server configuration is incomplete." });
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

export default defineEventHandler(async (event) => {
  if (event.method !== "POST") throw createError({ statusCode: 405, statusMessage: "Method not allowed." });
  const user = await requireAuthenticatedUser(authRequest(event));
  const input = await readBody<{ workflowId?: string; workflowTitle?: string; caseId?: string; draftContent?: string; mailingMethod?: keyof typeof PRICES; recipient?: { name?: string; org?: string; address1?: string; address2?: string; city?: string; state?: string; zip?: string }; matterReference?: string; matterType?: string }>(event);
  const workflowId = input?.workflowId?.trim();
  const draft = input?.draftContent?.trim();
  const method = input?.mailingMethod;
  const recipient = input?.recipient;
  if (!workflowId || !draft || draft.length < 20) throw createError({ statusCode: 400, statusMessage: "Workflow and completed draft are required." });
  if (!method || !(method in PRICES)) throw createError({ statusCode: 400, statusMessage: "Invalid mailing method." });
  if (!recipient?.name || !recipient.address1 || !recipient.city || !recipient.state || !recipient.zip) throw createError({ statusCode: 400, statusMessage: "A complete recipient address is required." });
  if (!/^[A-Za-z]{2}$/.test(recipient.state)) throw createError({ statusCode: 400, statusMessage: "Recipient state must be a two-letter abbreviation." });
  if (!/^\d{5}(-\d{4})?$/.test(recipient.zip)) throw createError({ statusCode: 400, statusMessage: "Recipient ZIP code is invalid." });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) throw createError({ statusCode: 503, statusMessage: "Stripe is not configured." });
  const supabase = serviceSupabase();
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });
  const appUrl = process.env.APP_URL || getRequestURL(event).origin;

  if (input?.caseId) {
    const { data: ownedCase } = await supabase.from("dispute_cases").select("id").eq("id", input.caseId).eq("owner_id", user.id).maybeSingle();
    if (!ownedCase) throw createError({ statusCode: 404, statusMessage: "Dispute case not found." });
  }

  const { data: intent, error: intentError } = await supabase.from("mailing_intents").insert({ owner_id: user.id, workflow_id: workflowId, case_id: input?.caseId || null, status: "pending", mailing_method: method, draft_content: draft, recipient, matter_reference: input?.matterReference?.trim() || workflowId, matter_type: input?.matterType?.trim() || "dispute-mail" }).select("id").single();
  if (intentError || !intent) throw createError({ statusCode: 502, statusMessage: `Unable to create mailing intent: ${intentError?.message || "unknown error"}` });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price_data: { currency: "usd", product_data: { name: LABELS[method], description: `${input?.workflowTitle?.trim() || workflowId} · ${LABELS[method]}` }, unit_amount: PRICES[method] }, quantity: 1 }],
      metadata: { mailing_intent_id: intent.id, owner_user_id: user.id, workflow_id: workflowId },
      success_url: `${appUrl}/workflows/${workflowId}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/workflows/${workflowId}?checkout=cancelled`,
    });
    const { error: updateError } = await supabase.from("mailing_intents").update({ stripe_session_id: session.id }).eq("id", intent.id).eq("owner_id", user.id);
    if (updateError) throw updateError;
    return { ok: true, checkoutUrl: session.url, sessionId: session.id };
  } catch (error) {
    await supabase.from("mailing_intents").update({ status: "failed", error_message: error instanceof Error ? error.message : "Stripe checkout creation failed" }).eq("id", intent.id).eq("owner_id", user.id);
    throw createError({ statusCode: 502, statusMessage: error instanceof Error ? error.message : "Unable to create Stripe checkout." });
  }
});
