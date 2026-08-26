/**
 * Domain-pack certification contract.
 *
 * A registry may expose a workflow only when every declared capability has an
 * executable implementation. Catalog metadata is deliberately separate from
 * runtime capability so marketing cannot manufacture execution claims.
 */

import type { DomainPack, PipelineStage } from "./gold-standard-pipeline";

export type DomainCapability =
  | "classification"
  | "extraction"
  | "deadlines"
  | "findings"
  | "discrepancies"
  | "evidence"
  | "research"
  | "risk"
  | "strategy"
  | "draft"
  | "validation"
  | "review"
  | "approval"
  | "mailing"
  | "tracking"
  | "proofAudit";

export type DomainPackManifest = {
  id: string;
  displayName: string;
  capabilities: readonly DomainCapability[];
};

const capabilityToMethod: Record<DomainCapability, keyof DomainPack> = {
  classification: "classify",
  extraction: "extract",
  deadlines: "deadlines",
  findings: "findings",
  discrepancies: "discrepancies",
  evidence: "evidence",
  research: "research",
  risk: "risk",
  strategy: "strategy",
  draft: "draft",
  validation: "validation",
  review: "review",
  approval: "approval",
  mailing: "mailing",
  tracking: "tracking",
  proofAudit: "proofAudit",
};

export type DomainPackDiagnostic = {
  capability: DomainCapability;
  method: keyof DomainPack;
  status: "executable" | "missing";
};

export function diagnoseDomainPack(pack: DomainPack, manifest: DomainPackManifest): DomainPackDiagnostic[] {
  return manifest.capabilities.map((capability) => {
    const method = capabilityToMethod[capability];
    return {
      capability,
      method,
      status: typeof pack[method] === "function" ? "executable" : "missing",
    };
  });
}

export function isExecutableDomainPack(pack: DomainPack, manifest: DomainPackManifest): boolean {
  return diagnoseDomainPack(pack, manifest).every((diagnostic) => diagnostic.status === "executable");
}

export function missingCapabilities(pack: DomainPack, manifest: DomainPackManifest): DomainCapability[] {
  return diagnoseDomainPack(pack, manifest)
    .filter((diagnostic) => diagnostic.status === "missing")
    .map((diagnostic) => diagnostic.capability);
}

export function isConsequentialStage(stage: PipelineStage): boolean {
  return ["review", "approval", "mailing", "tracking", "proofAudit"].includes(stage);
}
