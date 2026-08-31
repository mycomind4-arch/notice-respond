/** Permit Response domain layer.
 *
 * This package intentionally owns only permit-correction/resubmission semantics.
 * Property, jurisdiction, evidence, provenance, deadline, fulfillment, tracking,
 * and proof primitives belong to shared infrastructure and must be injected.
 */

export type PermitDocumentType =
  | "correction_notice"
  | "denial"
  | "inspection_report"
  | "plan_review"
  | "zoning_notice"
  | "application"
  | "supporting_document";

export type PermitRequirementStatus =
  | "unmapped"
  | "evidence_found"
  | "evidence_missing"
  | "needs_authoritative_source"
  | "response_ready"
  | "excluded";

export type PermitRequirement = {
  id: string;
  sourceDocumentId: string;
  sourceReference?: string;
  text: string;
  requestedAction?: string;
  dueDate?: string;
  status: PermitRequirementStatus;
  evidenceIds: string[];
  authoritativeSources: string[];
};

export type PermitCaseInput = {
  documents: Array<{ id: string; type: PermitDocumentType; text: string }>;
  jurisdiction?: string;
  applicationNumber?: string;
  propertyReference?: string;
};

export type PermitCase = {
  requirements: PermitRequirement[];
  jurisdiction?: string;
  applicationNumber?: string;
  propertyReference?: string;
};

export type PermitResponseStage =
  | "received"
  | "requirements_extracted"
  | "evidence_mapped"
  | "draft_ready"
  | "validated"
  | "review"
  | "approved"
  | "mailing"
  | "tracking"
  | "proof";

export function extractPermitRequirements(input: PermitCaseInput): PermitCase {
  const requirements: PermitRequirement[] = [];
  for (const document of input.documents) {
    const lines = document.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    for (const line of lines) {
      if (!/[.!?:]/.test(line)) continue;
      requirements.push({
        id: `${document.id}:${requirements.length + 1}`,
        sourceDocumentId: document.id,
        text: line,
        status: "unmapped",
        evidenceIds: [],
        authoritativeSources: [],
      });
    }
  }
  return {
    requirements,
    jurisdiction: input.jurisdiction,
    applicationNumber: input.applicationNumber,
    propertyReference: input.propertyReference,
  };
}

export function canDraftResponse(caseData: PermitCase): boolean {
  return caseData.requirements.length > 0 && caseData.requirements.every((requirement) => {
    if (requirement.status === "excluded") return true;
    if (requirement.status !== "evidence_found" && requirement.status !== "response_ready") return false;
    return requirement.evidenceIds.some((id) => id.trim().length > 0);
  });
}

export function canValidateResponse(caseData: PermitCase): boolean {
  return canDraftResponse(caseData) && caseData.requirements.every((requirement) => {
    if (requirement.status === "needs_authoritative_source") return false;
    if (requirement.status === "excluded") return true;
    return requirement.authoritativeSources.every((source) => source.trim().length > 0);
  });
}

export function assertNoUnsupportedApprovalClaims(text: string): void {
  const prohibited = [
    /will\s+be\s+approved/i,
    /guarantee[sd]?\s+(?:approval|permit)/i,
    /meets\s+(?:all\s+)?code\s+requirements/i,
    /complies\s+with\s+all\s+(?:zoning|building)\s+codes/i,
  ];
  if (prohibited.some((pattern) => pattern.test(text))) {
    throw new Error("Response contains an unsupported approval or authoritative-code claim");
  }
}

export function isPermitResponseStage(stage: string): stage is PermitResponseStage {
  return [
    "received",
    "requirements_extracted",
    "evidence_mapped",
    "draft_ready",
    "validated",
    "review",
    "approved",
    "mailing",
    "tracking",
    "proof",
  ].includes(stage);
}
