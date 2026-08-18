/* ═══════════════════════════════════════════════════════════
   CP2000 FINDINGS — structured analysis output.

   A Finding is a single conclusion the system has reached,
   traceable back to extracted facts. The system NEVER
   generates findings without supporting facts.

   ═══════════════════════════════════════════════════════════ */

import type { NoticeFact } from "./fact";

// ── Finding Types ─────────────────────────────────────────────

export type FindingType =
  | "income_mismatch"
  | "duplicate_income"
  | "wrong_tax_year"
  | "already_reported"
  | "non_taxable_item"
  | "missing_deduction"
  | "identity_mismatch"
  | "documentation_gap"
  | "deadline_risk"
  | "penalty_assessment"
  | "proposed_change"
  | "missing_info"
  | "classification_warning";

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

export type FindingConfidence = "high" | "medium" | "low";

// ── Finding ───────────────────────────────────────────────────

export interface Finding {
  id: string;
  type: FindingType;
  severity: FindingSeverity;
  statement: string;
  supportingFacts: string[];
  sourceReferences: string[];
  confidence: FindingConfidence;
  recommendedAction: string;
  unresolved: boolean;
}

export function createFinding(params: {
  type: FindingType;
  severity: FindingSeverity;
  statement: string;
  supportingFacts: string[];
  sourceReferences?: string[];
  confidence: FindingConfidence;
  recommendedAction: string;
  unresolved?: boolean;
}): Finding {
  if (params.supportingFacts.length === 0) {
    throw new Error("Finding requires at least one supporting fact");
  }
  return {
    id: crypto.randomUUID(),
    type: params.type,
    severity: params.severity,
    statement: params.statement,
    supportingFacts: params.supportingFacts,
    sourceReferences: params.sourceReferences ?? [],
    confidence: params.confidence,
    recommendedAction: params.recommendedAction,
    unresolved: params.unresolved ?? true,
  };
}

// ── Finding Summary ───────────────────────────────────────────

export function findingSummary(findings: Finding[]): {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  unresolved: number;
} {
  return {
    total: findings.length,
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    info: findings.filter((f) => f.severity === "info").length,
    unresolved: findings.filter((f) => f.unresolved).length,
  };
}
