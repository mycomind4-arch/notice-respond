// Single source of truth for MailMyPDF order pricing.
// Supports page-count tiers, color printing, USPS extra services,
// and optional vertical context for MailMyPDF workflows.

import type { VerticalOrderMetadata } from "@/verticals/types";

export type MailClass = "standard" | "certified" | "registered";

export const MAIL_CLASS_LABELS: Record<MailClass, string> = {
  standard: "Standard (3–7 business days)",
  certified: "Certified Mail (delivery tracking + confirmation, 3–7 days)",
  registered: "Registered Mail (secure handling + tracking, 5–10 days)",
};

// ── Lob per-piece costs (USPS pass-through, non-negotiable) ────────────────
// These are the current flat extra-service costs used by the integration.
// Keep customer-facing prices above these costs so MailMyPDF does not lose
// money on the USPS extra-service portion of an order.
export const LOB_CERTIFIED_COST = 695;   // $6.95 per piece
export const LOB_REGISTERED_COST = 2450; // $24.50 per piece

// Margin added on top of the Lob cost to cover processing + profit.
export const MAIL_CLASS_MARGIN = 300; // $3.00

export const MAIL_CLASS_SURCHARGE: Record<MailClass, number> = {
  standard: 0,
  certified: LOB_CERTIFIED_COST + MAIL_CLASS_MARGIN,    // $9.95
  registered: LOB_REGISTERED_COST + MAIL_CLASS_MARGIN,  // $27.50
};

// ── Display helpers (use these everywhere instead of hardcoding prices) ────
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

// Base price by page count tier.
function basePriceCents(pageCount: number): number {
  if (pageCount <= 2) return 499;
  if (pageCount <= 5) return 699;
  return 999;
}

// Color surcharge: +$0.15 per page.
export const COLOR_PER_PAGE_SURCHARGE = 15;

// Color surcharge display helpers (derived from COLOR_PER_PAGE_SURCHARGE).
export function colorPerPageLabel(): string {
  return `+$${(COLOR_PER_PAGE_SURCHARGE / 100).toFixed(2)}`;
}

export function colorPerPageUsd(): string {
  return (COLOR_PER_PAGE_SURCHARGE / 100).toFixed(2);
}

export function priceCentsForPageCount(pages: number): number {
  return basePriceCents(pages);
}

// ── Vertical Pricing Configuration ──────────────────────────────────────────

/**
 * Optional pricing overrides for a vertical.
 *
 * Verticals can:
 * - Override the base price per tier
 * - Force a minimum mail class (e.g., certified for legal docs)
 * - Add a vertical processing fee
 * - Include certified mail in the base price (no surcharge shown)
 *
 * If no vertical config is provided, pricing works exactly as before.
 */
export interface VerticalPricingConfig {
  /** Vertical slug this config belongs to */
  verticalSlug: string;
  /** Custom base prices per tier (in cents). If omitted, uses default tier pricing. */
  basePrices?: { short: number; medium: number; long: number };
  /** Minimum mail class required for this vertical */
  minimumMailClass?: MailClass;
  /** Whether certified mail is included in the base price (no surcharge) */
  includesCertified?: boolean;
  /** Additional flat processing fee in cents */
  processingFeeCents?: number;
}

// Registry of vertical pricing configs
const verticalPricingConfigs = new Map<string, VerticalPricingConfig>();

/**
 * Register a pricing configuration for a vertical.
 * Call at module load time from the vertical's setup code.
 */
export function registerVerticalPricing(config: VerticalPricingConfig): void {
  verticalPricingConfigs.set(config.verticalSlug, config);
}

/**
 * Get a vertical's pricing config, if registered.
 */
export function getVerticalPricing(slug: string): VerticalPricingConfig | undefined {
  return verticalPricingConfigs.get(slug);
}

// ── Mail class resolution with vertical context ─────────────────────────────

/**
 * Resolve the effective mail class for an order, respecting
 * vertical minimums. If a vertical requires certified but the user
 * selected standard, this upgrades to certified.
 */
export function resolveMailClass(
  requested: MailClass,
  verticalSlug?: string,
): MailClass {
  if (!verticalSlug) return requested;
  const config = getVerticalPricing(verticalSlug);
  if (!config?.minimumMailClass) return requested;

  const classRank: Record<MailClass, number> = { standard: 0, certified: 1, registered: 2 };
  if (classRank[requested] < classRank[config.minimumMailClass]) {
    return config.minimumMailClass;
  }
  return requested;
}

// ── Core pricing calculation with vertical context ──────────────────────────

export function calculateTotalPrice(args: {
  pageCount: number;
  color: boolean;
  mailClass: MailClass;
  /** Optional vertical context for vertical-specific pricing */
  vertical?: VerticalOrderMetadata;
}): number {
  const verticalSlug = args.vertical?.vertical_slug;
  const config = verticalSlug ? getVerticalPricing(verticalSlug) : undefined;

  // Base price: use vertical override or default tier pricing
  let base: number;
  if (config?.basePrices) {
    if (args.pageCount <= 2) base = config.basePrices.short;
    else if (args.pageCount <= 5) base = config.basePrices.medium;
    else base = config.basePrices.long;
  } else {
    base = basePriceCents(args.pageCount);
  }

  // Mail class: resolve with vertical minimum
  const effectiveMailClass = resolveMailClass(args.mailClass, verticalSlug);

  // Color surcharge
  const colorSurcharge = args.color ? args.pageCount * COLOR_PER_PAGE_SURCHARGE : 0;

  // Delivery surcharge: skip if vertical includes certified
  let deliverySurcharge = MAIL_CLASS_SURCHARGE[effectiveMailClass] ?? 0;
  if (config?.includesCertified && effectiveMailClass === "certified") {
    deliverySurcharge = 0;
  }

  // Vertical processing fee
  const processingFee = config?.processingFeeCents ?? 0;

  return base + colorSurcharge + deliverySurcharge + processingFee;
}

// Stripe line-item description for checkout.
export function priceDescription(args: {
  pageCount: number;
  color: boolean;
  mailClass: MailClass;
  /** Optional vertical context */
  vertical?: VerticalOrderMetadata;
}): string {
  const verticalSlug = args.vertical?.vertical_slug;
  const config = verticalSlug ? getVerticalPricing(verticalSlug) : undefined;
  const effectiveMailClass = resolveMailClass(args.mailClass, verticalSlug);

  const parts: string[] = [];

  // Include vertical name if present
  if (verticalSlug) {
    parts.push(`${verticalSlug} letter (${args.pageCount} page${args.pageCount === 1 ? "" : "s"})`);
  } else {
    parts.push(`MailMyPDF Letter (${args.pageCount} page${args.pageCount === 1 ? "" : "s"})`);
  }

  if (args.color) parts.push("Color printing");
  if (effectiveMailClass === "certified" && !config?.includesCertified) parts.push("Certified Mail");
  if (effectiveMailClass === "registered") parts.push("Registered Mail");
  if (config?.processingFeeCents) parts.push("Processing fee");

  return parts.join(" · ");
}
