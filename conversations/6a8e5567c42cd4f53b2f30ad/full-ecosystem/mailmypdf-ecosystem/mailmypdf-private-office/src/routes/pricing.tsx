import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Private Office" },
      { name: "description", content: "Transparent pricing for professional correspondence preparation and certified mailing." },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  { name: "Standard", price: "$4.99", desc: "USPS Standard Mail with tracking" },
  { name: "Certified", price: "$14.94", desc: "USPS Certified Mail with tracking and proof of delivery" },
  { name: "Registered", price: "$32.49", desc: "USPS Registered Mail for high-value documents" },
];

function PricingPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <SiteHeader />
      <section className="border-b border-rule bg-paper">
        <div className="container max-w-3xl py-16 md:py-24">
          <div className="section-kicker">Pricing</div>
          <h1 className="mt-4 text-4xl leading-tight text-charcoal md:text-5xl">
            Simple, transparent pricing.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone">
            Pay per document. No subscriptions. Choose your mail class and add preparation.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {tiers.map((tier) => (
              <div key={tier.name} className="rounded-xl border border-rule bg-paper p-6 shadow-card">
                <h2 className="text-xl text-charcoal">{tier.name}</h2>
                <p className="mt-3 font-display text-4xl text-navy">{tier.price}</p>
                <p className="mt-2 text-sm leading-relaxed text-stone">{tier.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-rule bg-ivory-deep p-6">
            <p className="text-sm leading-relaxed text-charcoal-soft">
              <span className="font-medium text-charcoal">Preparation fee: $24.99</span> per document. Includes document analysis, guided response drafting, and review. Additional response pages and supporting documents are priced per sheet.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-stone">
              Payment confirms your selected mailing service. Mailing remains subject to the required approval and fulfillment checks. The exact price is calculated from your final approved packet before payment.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
