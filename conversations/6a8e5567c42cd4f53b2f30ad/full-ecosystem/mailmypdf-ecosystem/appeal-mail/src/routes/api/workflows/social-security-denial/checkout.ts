import { createFileRoute } from "@tanstack/react-router";
import { requireAuthenticatedUser, getSupabaseServer } from "@/platform/supabase";

const PRICES = { standard: 499, certified: 1494, registered: 3249 } as const;
const LABELS = { standard: "Standard Mailing", certified: "Certified Mailing", registered: "Registered Mailing" } as const;

export const Route = createFileRoute("/api/workflows/social-security-denial/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
    try {
      const user = await requireAuthenticatedUser(request);
      const input = await request.json() as { appealId?: string };
      if (!input.appealId?.trim()) return Response.json({ error: "Appeal id is required." }, { status: 400 });
      const supabase = await getSupabaseServer();
      const { data: appeal, error } = await supabase.from("appeals").select("*").eq("id", input.appealId).single();
      if (error || !appeal) return Response.json({ error: "Appeal case not found." }, { status: 404 });
      if (appeal.user_id !== user.id) return Response.json({ error: "You do not own this appeal case." }, { status: 403 });
      if (appeal.workflow_id !== "social-security-denial") return Response.json({ error: "Appeal workflow mismatch." }, { status: 409 });
      if (appeal.status !== "ready" || !appeal.review || !appeal.packet) return Response.json({ error: "Appeal is not approved and ready for payment." }, { status: 409 });
      const mailingMethod = appeal.packet.mailingMethod as keyof typeof PRICES;
      if (!PRICES[mailingMethod]) return Response.json({ error: "Invalid mailing method." }, { status: 409 });
      const { default: Stripe } = await import("stripe");
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) return Response.json({ error: "Stripe is not configured." }, { status: 503 });
      const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });
      const appUrl = process.env.APP_URL || "https://appeal-mail.pages.dev";
      const session = await stripe.checkout.sessions.create({
        mode: "payment", payment_method_types: ["card"],
        line_items: [{ price_data: { currency: "usd", product_data: { name: LABELS[mailingMethod], description: `Social Security denial appeal — ${LABELS[mailingMethod]}` }, unit_amount: PRICES[mailingMethod] }, quantity: 1 }],
        metadata: { appeal_id: appeal.id, workflow_id: "social-security-denial", mailing_method: mailingMethod, owner_user_id: user.id },
        success_url: `${appUrl}/workflows/social-security-denial?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/workflows/social-security-denial?checkout=cancelled`,
      });
      return Response.json({ ok: true, sessionId: session.id, url: session.url });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create checkout session.";
      return Response.json({ error: message }, { status: /authentication|required|token/i.test(message) ? 401 : 502 });
    }
  },
    },
  },
});
