export const INSURANCE_COVERAGE_DENIAL_CAPABILITIES = ["document-classification","fact-extraction","authority-resolution","deadline-verification","appeal-path-verification","coverage-analysis","evidence-analysis","contradiction-detection","timeline-analysis","adversarial-stress-test","response-strategy","drafting","independent-validation","readiness","human-approval","pricing","deterministic-pdf","submission","mailing","proof"] as const;

export const INSURANCE_COVERAGE_DENIAL_AUTHORITY_RULES = [
  "Use the actual coverage denial, policy or plan documents supplied by the user, issuer instructions, applicable regulator guidance, and current authoritative sources as the controlling record.",
  "Never invent coverage terms, exclusions, medical facts, policy language, deadlines, appeal rights, or outcomes.",
  "Do not assume all coverage denials share one appeal timeline or procedure; identify issuer, plan type, jurisdiction, and notice-specific instructions.",
  "Separate coverage interpretation, claim denial, prior authorization, internal appeal, external review, regulator complaint, and litigation paths when supported; never collapse them into one universal process.",
  "Unsupported procedural conclusions remain unresolved and block confident ready-to-send status.",
  "Never promise that coverage will be approved or a denial will be reversed.",
] as const;

export const INSURANCE_COVERAGE_DENIAL_PRICING = {
  preparationFee: 24.99,
  includedResponsePages: 3,
  responsePagePrice: 0.45,
  supportingPagePrice: 0.25,
  standardMail: 5.49,
  certifiedMail: 12.49,
  certifiedReturnReceipt: 14.99,
  registeredMail: 29.99,
  largePacketFee: 2.50,
  largePacketThresholdSheets: 7,
} as const;

export const INSURANCE_COVERAGE_DENIAL_GOLD = {
  workflowId: "insurance-coverage-denial",
  title: "Appeal an Insurance Coverage Denial",
  lifecycle: "authority",
  capabilities: INSURANCE_COVERAGE_DENIAL_CAPABILITIES,
  authorityRules: INSURANCE_COVERAGE_DENIAL_AUTHORITY_RULES,
  pricing: INSURANCE_COVERAGE_DENIAL_PRICING,
} as const;
