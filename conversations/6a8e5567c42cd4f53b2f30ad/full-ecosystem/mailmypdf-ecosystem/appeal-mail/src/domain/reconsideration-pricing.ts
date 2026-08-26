export const RECONSIDERATION_PRICING = {
  preparationFee: 19.99,
  includedResponsePages: 3,
  responsePagePrice: 0.40,
  supportingPagePrice: 0.25,
  standardMail: 5.49,
  certifiedMail: 12.49,
  certifiedReturnReceipt: 14.99,
  registeredMail: 29.99,
  flatEnvelopeFee: 2.50,
  largePacketThresholdSheets: 7,
} as const;

export function calculateReconsiderationTotal(input: { responseSheets: number; supportingSheets: number; mailingMethod: "standard" | "certified" | "registered"; envelopeSurcharge?: boolean }) {
  const responseSheets = Math.max(1, Math.floor(input.responseSheets));
  const supportingSheets = Math.max(0, Math.floor(input.supportingSheets));
  const responsePrinting = Math.max(0, responseSheets - RECONSIDERATION_PRICING.includedResponsePages) * RECONSIDERATION_PRICING.responsePagePrice;
  const supportingPrinting = supportingSheets * RECONSIDERATION_PRICING.supportingPagePrice;
  const mailing = input.mailingMethod === "standard" ? RECONSIDERATION_PRICING.standardMail : input.mailingMethod === "certified" ? RECONSIDERATION_PRICING.certifiedMail : RECONSIDERATION_PRICING.registeredMail;
  const surcharge = input.envelopeSurcharge || responseSheets + supportingSheets >= RECONSIDERATION_PRICING.largePacketThresholdSheets ? RECONSIDERATION_PRICING.flatEnvelopeFee : 0;
  const total = RECONSIDERATION_PRICING.preparationFee + responsePrinting + supportingPrinting + mailing + surcharge;
  return { preparationFee: RECONSIDERATION_PRICING.preparationFee, responseSheets, supportingSheets, responsePrinting, supportingPrinting, mailing, surcharge, total: Number(total.toFixed(2)) };
}
