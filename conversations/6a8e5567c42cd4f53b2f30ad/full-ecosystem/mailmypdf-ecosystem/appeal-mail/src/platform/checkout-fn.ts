import { createServerFn } from "@tanstack/react-start";
import { isReadyToMail } from "@/domain/appeal";
import { loadAppeal } from "./appeal-repository";

/* ─────────────────────────────────────────────
   Stripe checkout integration.
   Creates a checkout session only after the
   owner-scoped appeal passes the canonical
   readiness gate.
   ───────────────────────────────────────────── */

const MAILING_PRICES: Record<string, number> = {
  standard: 499,
  certified: 1494,
  registered: 3249,
};

const MAILING_LABELS: Record<string, string> = {
  standard: "Standard Mailing",
  certified: "Certified Mailing",
  registered: "Registered Mailing",
};

async function getStripe() {
  const { default: Stripe } = await import("stripe");
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  return new Stripe(secretKey, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });
}

export const createCheckoutSession = createServerFn()
  .validator((input: {
    mailingMethod: "standard" | "certified" | "registered";
    appealId: string;
    recipientName: string;
    workflowId: string;
    userId: string;
  }) => {
    if (!input.mailingMethod || !MAILING_PRICES[input.mailingMethod]) {
      throw new Error("Invalid mailing method");
    }
    if (!input.appealId.trim()) {
      throw new Error("Appeal id is required");
    }
    if (!input.workflowId.trim()) {
      throw new Error("Workflow id is required");
    }
    if (!input.recipientName.trim()) {
      throw new Error("Recipient name is required");
    }
    if (!input.userId.trim()) {
      throw new Error("Owner identity is required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const appeal = await loadAppeal({ data: { id: data.appealId, userId: data.userId } });

    if (appeal.workflowId !== data.workflowId) {
      throw new Error("Appeal workflow does not match checkout workflow");
    }

    if (!isReadyToMail(appeal)) {
      throw new Error("Appeal is not approved and readiness-validated for mailing");
    }

    const stripe = await getStripe();
    const price = MAILING_PRICES[data.mailingMethod];
    const label = MAILING_LABELS[data.mailingMethod];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: label,
              description: `Appeal Mail — ${label} for ${data.recipientName}`,
              metadata: {
                workflow_id: data.workflowId,
                appeal_id: data.appealId,
                mailing_method: data.mailingMethod,
              },
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appeal_id: data.appealId,
        workflow_id: data.workflowId,
        mailing_method: data.mailingMethod,
        recipient_name: data.recipientName,
        owner_user_id: data.userId,
      },
      success_url: `${process.env.APP_URL || "https://appeal-mail.pages.dev"}/workflows/${data.workflowId}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || "https://appeal-mail.pages.dev"}/workflows/${data.workflowId}?checkout=cancelled`,
    });

    return {
      sessionId: session.id,
      url: session.url,
      paymentStatus: session.payment_status,
    };
  });

export const verifyCheckoutSession = createServerFn()
  .validator((input: { sessionId: string }) => input)
  .handler(async ({ data }) => {
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);

    return {
      paid: session.payment_status === "paid",
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      metadata: session.metadata,
    };
  });
