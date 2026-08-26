// Pricing calculation for MailMyPDF orders.
// Supports: page count tiers, color printing, and delivery speed upgrades.

export type MailClass = "standard" | "certified" | "registered";

export const MAIL_CLASS_LABELS: Record<MailClass, string> = {
  standard: "Standard (3-7 business days)",
  certified: "Certified Mail (tracking + signature, 3-7 days)",
  registered: "Registered Mail (insured + tracking, 5-10 days)",
};

// ── Lob per-piece costs (USPS pass-through, non-negotiable) ────────────────
// These are flat fees Lob charges regardless of volume or plan tier.
// DO NOT set the surcharge below these costs — the app would lose money.
export const LOB_CERTIFIED_COST = 695;   // $6.95 per piece
export const LOB_REGISTERED_COST = 2450; // $24.50 per piece

// Margin added on top of the Lob cost to cover processing + profit.
export const MAIL_CLASS_MARGIN = 300; // $3.00

export const MAIL_CLASS_SURCHARGE: Record<MailClass, number> = {
  standard: 0,
  certified: LOB_CERTIFIED_COST + MAIL_CLASS_MARGIN,    // $9.95
  registered: LOB_REGISTERED_COST + MAIL_CLASS_MARGIN,  // $27.50
};

// ── Display helpers (use these everywhere instead of hardcoding $) ─────────
// Returns e.g. "+$9.95" or "" for standard (no surcharge).
export function mailClassSurchargeLabel(mailClass: MailClass): string {
  const cents = MAIL_CLASS_SURCHARGE[mailClass];
  if (cents === 0) return "";
  return `+$${(cents / 100).toFixed(2)}`;
}

// Returns e.g. "9.95" (no $ sign, for structured data / JSON-LD).
export function mailClassSurchargeUsd(mailClass: MailClass): string {
  return (MAIL_CLASS_SURCHARGE[mailClass] / 100).toFixed(2);
}

// Base price by page count tier
function basePriceCents(pageCount: number): number {
  if (pageCount <= 2) return 499;
  if (pageCount <= 5) return 699;
  return 999;
}

// Color surcharge: +$0.15 per page
export const COLOR_PER_PAGE_SURCHARGE = 15;

// Color surcharge display helpers (derived from COLOR_PER_PAGE_SURCHARGE)
export function colorPerPageLabel(): string {
  return `+$${(COLOR_PER_PAGE_SURCHARGE / 100).toFixed(2)}`;
}

export function colorPerPageUsd(): string {
  return (COLOR_PER_PAGE_SURCHARGE / 100).toFixed(2);
}

export function priceCentsForPageCount(pages: number): number {
  return basePriceCents(pages);
}

export function calculateTotalPrice(args: {
  pageCount: number;
  color: boolean;
  mailClass: MailClass;
}): number {
  const base = basePriceCents(args.pageCount);
  const colorSurcharge = args.color ? args.pageCount * COLOR_PER_PAGE_SURCHARGE : 0;
  const deliverySurcharge = MAIL_CLASS_SURCHARGE[args.mailClass] ?? 0;
  return base + colorSurcharge + deliverySurcharge;
}

// Stripe line item description for the checkout
export function priceDescription(args: {
  pageCount: number;
  color: boolean;
  mailClass: MailClass;
}): string {
  const parts: string[] = [`MailMyPDF Letter (${args.pageCount} page${args.pageCount === 1 ? "" : "s"})`];
  if (args.color) parts.push("Color printing");
  if (args.mailClass === "certified") parts.push("Certified Mail");
  if (args.mailClass === "registered") parts.push("Registered Mail");
  return parts.join(" · ");
}
