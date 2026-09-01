import { createFileRoute } from "@tanstack/react-router";
import { authErrorResponse, NoticeRespondAuthError, requireAuthenticatedUser } from "@/lib/auth-guard";
import { calculateQuote, getWorkflowPricingProfile, LABELS, type MailClass } from "@mailmypdf/pricing";

/**
 * POST /api/checkout
 *
 * Creates a Stripe checkout session for a notice-response mailing.
 * Uses the canonical @mailmypdf/pricing engine for server-authoritative pricing.
 */

function estimatePageCount(draft: string): number {
  return Math.max(1, Math.ceil(draft.length / 3000));
}

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireAuthenticatedUser(request);
          const input = await request.json() as {
            draft?: string;
            workflowId?: string;
            workflowTitle?: string;
            mailingMethod?: string;
            recipient?: Record<string, unknown>;
          };

          if (!input.draft || input.draft.trim().length < 20) {
            return Response.json({ error: "A completed draft is required." }, { status: 400 });
          }
          if (!input.workflowId?.trim()) {
            return Response.json({ error: "Workflow ID is required." }, { status: 400 });
          }
          if (!input.mailingMethod || !["standard", "certified", "registered"].includes(input.mailingMethod)) {
            return Response.json({ error: "A valid mailing method is required." }, { status: 400 });
          }
          if (!input.recipient || !String(input.recipient.name || "").trim()) {
            return Response.json({ error: "A recipient is required." }, { status: 400 });
          }

          const key = process.env.STRIPE_SECRET_KEY;
          if (!key) return Response.json({ error: "Stripe is not configured." }, { status: 503 });

          // Canonical pricing is authoritative. Non-production workflows are not
          // allowed to create a zero-dollar payment session by accident.
          const profile = getWorkflowPricingProfile(input.workflowId);
          if (!profile || profile.commercialStatus !== "production") {
            return Response.json(
              { error: "This workflow is not currently available for paid checkout." },
              { status: 409 },
            );
          }

          const actualPages = estimatePageCount(input.draft);
          const mailClass = input.mailingMethod as MailClass;
          const quote = calculateQuote({
            workflowId: input.workflowId,
            verticalId: "notice-respond",
            actualPages,
            mailClass,
          });

          if (!Number.isInteger(quote.totalCents) || quote.totalCents <= 0) {
            return Response.json({ error: "The selected workflow does not have a valid checkout price." }, { status: 409 });
          }

          const lineItemName = `${input.workflowTitle || input.workflowId} — ${LABELS[mailClass]}`;
          const lineItemDescription = `Workflow preparation ($${(quote.basePriceCents / 100).toFixed(2)}) + ${LABELS[mailClass]}`;

          const { default: Stripe } = await import("stripe");
          const stripe = new Stripe(key, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });
          const appUrl = process.env.APP_URL || new URL(request.url).origin;

          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [{
              price_data: {
                currency: "usd",
                product_data: {
                  name: lineItemName,
                  description: lineItemDescription,
                },
                unit_amount: quote.totalCents,
              },
              quantity: 1,
            }],
            metadata: {
              workflow_id: input.workflowId,
              mailing_method: input.mailingMethod,
              owner_user_id: user.id,
              pricing_source: "canonical",
              quote_total_cents: String(quote.totalCents),
              actual_pages: String(actualPages),
            },
            success_url: `${appUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/?checkout=cancelled`,
          });

          return Response.json({ ok: true, checkoutUrl: session.url, sessionId: session.id });
        } catch (error) {
          if (error instanceof NoticeRespondAuthError) return authErrorResponse(error);
          console.error("Notice checkout failed", error);
          return Response.json({ error: "Unable to create checkout session." }, { status: 502 });
        }
      },
    },
  },
});
