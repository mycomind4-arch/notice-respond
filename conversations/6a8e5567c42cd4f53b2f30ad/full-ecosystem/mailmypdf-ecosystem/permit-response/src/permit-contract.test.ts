import { describe, expect, it } from "vitest";
import {
  assertNoUnsupportedApprovalClaims,
  canDraftResponse,
  canValidateResponse,
  extractPermitRequirements,
  isPermitResponseStage,
} from "./permit-contract";

describe("Permit Response contract", () => {
  it("extracts permit-specific requirements without interpreting code", () => {
    const result = extractPermitRequirements({
      jurisdiction: "Example County",
      applicationNumber: "PERMIT-123",
      documents: [
        {
          id: "notice-1",
          type: "correction_notice",
          text: "Provide revised site plan.\nSubmit drainage calculations.",
        },
      ],
    });

    expect(result.requirements).toHaveLength(2);
    expect(result.requirements.every((r) => r.status === "unmapped")).toBe(true);
    expect(result.jurisdiction).toBe("Example County");
  });

  it("blocks drafting until every requirement is mapped or explicitly excluded", () => {
    const base = extractPermitRequirements({
      documents: [{ id: "n", type: "correction_notice", text: "Provide a revised plan." }],
    });
    expect(canDraftResponse(base)).toBe(false);
    base.requirements[0].status = "evidence_found";
    expect(canDraftResponse(base)).toBe(false);
    base.requirements[0].evidenceIds.push("e1");
    expect(canDraftResponse(base)).toBe(true);
    expect(canValidateResponse(base)).toBe(true);
  });

  it("blocks supported-looking requirements with missing evidence provenance", () => {
    const base = extractPermitRequirements({
      documents: [{ id: "n", type: "correction_notice", text: "Provide a revised plan." }],
    });
    base.requirements[0].status = "response_ready";
    expect(canDraftResponse(base)).toBe(false);
  });

  it("requires authoritative sources when the domain marks them as necessary", () => {
    const base = extractPermitRequirements({
      documents: [{ id: "n", type: "correction_notice", text: "Confirm applicable setback requirement." }],
    });
    base.requirements[0].status = "needs_authoritative_source";
    expect(canDraftResponse(base)).toBe(false);
    expect(canValidateResponse(base)).toBe(false);
  });

  it("requires non-empty authority provenance before validation", () => {
    const base = extractPermitRequirements({
      documents: [{ id: "n", type: "correction_notice", text: "Confirm applicable setback requirement." }],
    });
    base.requirements[0].status = "response_ready";
    base.requirements[0].evidenceIds.push("e1");
    expect(canDraftResponse(base)).toBe(true);
    expect(canValidateResponse(base)).toBe(true);
    base.requirements[0].authoritativeSources.push("   ");
    expect(canValidateResponse(base)).toBe(false);
    base.requirements[0].authoritativeSources[0] = "county-code-2026";
    expect(canValidateResponse(base)).toBe(true);
  });

  it("rejects unsupported approval and code-compliance claims", () => {
    expect(() => assertNoUnsupportedApprovalClaims("Your permit will be approved.")).toThrow();
    expect(() => assertNoUnsupportedApprovalClaims("We request confirmation from the reviewing authority.")).not.toThrow();
  });

  it("recognizes the intended lifecycle stages", () => {
    expect(isPermitResponseStage("received")).toBe(true);
    expect(isPermitResponseStage("approved")).toBe(true);
    expect(isPermitResponseStage("proof")).toBe(true);
    expect(isPermitResponseStage("fake-stage")).toBe(false);
  });
});
