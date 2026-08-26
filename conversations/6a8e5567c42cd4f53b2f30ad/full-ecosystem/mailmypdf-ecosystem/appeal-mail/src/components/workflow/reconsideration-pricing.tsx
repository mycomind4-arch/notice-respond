import { RECONSIDERATION_PRICING } from "@/domain/reconsideration-pricing";

export function ReconsiderationPricing() {
  const example = RECONSIDERATION_PRICING.preparationFee + RECONSIDERATION_PRICING.certifiedMail;
  return <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
    <h2 className="text-2xl font-semibold">Transparent pricing</h2>
    <p className="mt-3 text-sm leading-6 text-slate-600">Starting at <strong>${RECONSIDERATION_PRICING.preparationFee.toFixed(2)}</strong> for a 3-sheet response, before supporting-document sheets and mailing.</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[
      ["Preparation", `$${RECONSIDERATION_PRICING.preparationFee.toFixed(2)}`],
      ["Included response", `${RECONSIDERATION_PRICING.includedResponsePages} sheets`],
      ["Extra response", `$${RECONSIDERATION_PRICING.responsePagePrice.toFixed(2)}/sheet`],
      ["Supporting documents", `$${RECONSIDERATION_PRICING.supportingPagePrice.toFixed(2)}/sheet`],
      ["Standard", `$${RECONSIDERATION_PRICING.standardMail.toFixed(2)}`],
      ["Certified", `$${RECONSIDERATION_PRICING.certifiedMail.toFixed(2)}`],
      ["Certified + receipt", `$${RECONSIDERATION_PRICING.certifiedReturnReceipt.toFixed(2)}`],
      ["Large packet", `+$${RECONSIDERATION_PRICING.flatEnvelopeFee.toFixed(2)} at ${RECONSIDERATION_PRICING.largePacketThresholdSheets}+ sheets`],
    ].map(([label,value])=><div key={label} className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">{label}</div><div className="mt-1 font-semibold">{value}</div></div>)}</div>
    <p className="mt-6 text-sm leading-7 text-slate-600">Example: a 3-sheet response sent Certified is <strong>${example.toFixed(2)}</strong> before supporting-document sheets. Your exact total is calculated from the approved physical packet before payment.</p>
  </section>;
}
