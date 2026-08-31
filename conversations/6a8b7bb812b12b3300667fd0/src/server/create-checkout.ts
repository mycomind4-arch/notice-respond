/**
 * Checkout creation server function.
 *
 * Creates a Stripe Checkout Session with server-authoritative pricing
 * derived from the workflow profile. The client cannot set the amount.
 *
 * Architecture:
 *   Client → createServerFn (authenticated) → server-authoritative pricing
 *                                            → matter ownership verification
 *                                            → Stripe checkout creation
 *                                            → PaymentEvidence (pending)
 *                                            → checkout URL returned to client
 *
 * SECURITY:
 * - Authenticated via accountAuthMiddleware.
 * - Pricing is derived from the trusted workflow profile, not client input.
 * - Matter ownership is verified server-side.
 * - Stripe metadata binds the payment to the exact matter and owner.
 * - The Stripe secret key is server-only (process.env).
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { workflowProfiles } from "@/domain/workflow-profiles";
import type { WorkflowId } from "@/domain/workflows";
import { getStripeAdapter } from "@/platform/stripe-adapter";
import { supabasePaymentEvidenceRepository } from "@/services/supabase-payment-evidence-repository";
import { supabaseMatterRepository } from "@/services/supabase-matter-repository";
import { accountAuthMiddleware } from "@/lib/server-function-auth";

const checkoutInputSchema = z.object({
  workflowId: z.string().min(1),
  matterId: z.string().min(1),
  mailingMethod: z.enum(["standard", "certified", "registered"]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

export interface CheckoutResult {
  checkoutUrl: string;
  sessionId: string;
}

/**
 * Compute server-authoritative price from the workflow profile.
 * Returns the amount in cents (Stripe's unit).
 */
export function computeCheckoutAmount(
  workflowId: WorkflowId,
  mailingMethod: "standard" | "certified" | "registered",
): { amount: number; currency: string } {
  const profile = workflowProfiles[workflowId];
  if (!profile)
    throw new Error(`Unknown workflow: ${workflowId}`);

  const mailingCost =
    mailingMethod === "standard"
      ? profile.pricing.standardMail
      : mailingMethod === "certified"
        ? profile.pricing.certifiedMail
        : profile.pricing.registeredMail ?? profile.pricing.certifiedMail;

  const total = profile.pricing.preparationFee + mailingCost;
  // Convert to cents — Stripe uses the smallest currency unit
  return { amount: Math.round(total * 100), currency: "usd" };
}

/**
 * Create a Stripe Checkout Session with server-authoritative pricing.
 *
 * This is the raw server function — tests can call it directly with
 * injected dependencies. The TanStack Start server function wrapper
 * below handles authentication and serialization.
 */
export async function createCheckoutSessionInternal(
  ownerId: string,
  input: CheckoutInput,
  options?: {
    stripeAdapter?: ReturnType<typeof getStripeAdapter>;
    paymentEvidenceRepository?: typeof supabasePaymentEvidenceRepository;
    matterRepository?: typeof supabaseMatterRepository;
  },
): Promise<CheckoutResult> {
  const validated = checkoutInputSchema.parse(input);
  const workflowId = validated.workflowId as WorkflowId;

  const stripeAdapter =
    options?.stripeAdapter ?? getStripeAdapter();
  const paymentEvidenceRepository =
    options?.paymentEvidenceRepository ?? supabasePaymentEvidenceRepository;
  const matterRepository =
    options?.matterRepository ?? supabaseMatterRepository;

  if (!stripeAdapter)
    throw new Error("Stripe is not configured on the server.");

  // Verify matter ownership server-side
  const matter = await matterRepository.get(ownerId, validated.matterId);
  if (!matter)
    throw new Error("Matter not found or not accessible for this owner.");

  // Verify the matter belongs to the correct workflow
  if (matter.workflowId !== workflowId)
    throw new Error("Matter does not belong to the specified workflow.");

  // Compute server-authoritative pricing
  const { amount, currency } = computeCheckoutAmount(
    workflowId,
    validated.mailingMethod,
  );

  // Create Stripe checkout session with metadata binding
  const session = await stripeAdapter.createCheckoutSession({
    amount,
    currency,
    successUrl: validated.successUrl,
    cancelUrl: validated.cancelUrl,
    metadata: {
      matterId: validated.matterId,
      ownerId,
      workflowId: validated.workflowId,
    },
    description: `Private Office — ${workflowProfiles[workflowId].title} (${validated.mailingMethod} mail)`,
  });

  // Create pending PaymentEvidence
  await paymentEvidenceRepository.create({
    ownerId,
    matterId: validated.matterId,
    workflowId,
    stripeSessionId: session.sessionId,
    stripePaymentIntentId: session.paymentIntentId ?? "",
    amount,
    currency,
  });

  return { checkoutUrl: session.sessionUrl, sessionId: session.sessionId };
}

/**
 * TanStack Start server function for checkout creation.
 * Authenticated via accountAuthMiddleware.
 */
export const createCheckout = createServerFn({ method: "POST" })
  .middleware([accountAuthMiddleware])
  .validator(checkoutInputSchema)
  .handler(async ({ data, context }) => {
    const user = context.user;
    return createCheckoutSessionInternal(user.id, data);
  });
