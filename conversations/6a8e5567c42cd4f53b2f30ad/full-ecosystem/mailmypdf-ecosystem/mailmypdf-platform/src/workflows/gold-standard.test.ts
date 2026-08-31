import { describe, expect, it } from "vitest";
import { GOLD_STANDARD_STAGES, hasAllGoldStandardStages, isGoldStandardStage } from "./gold-standard";

describe("gold-standard workflow contract", () => {
  it("defines the canonical execution stages in order", () => {
    expect(GOLD_STANDARD_STAGES).toHaveLength(18);
    expect(GOLD_STANDARD_STAGES[0]).toBe("secure-ingest");
    expect(GOLD_STANDARD_STAGES.at(-1)).toBe("prove-audit");
  });

  it("recognizes only canonical stages", () => {
    expect(isGoldStandardStage("extract")).toBe(true);
    expect(isGoldStandardStage("fake-stage")).toBe(false);
  });

  it("requires every stage to be completed for gold-standard completion", () => {
    const stages = GOLD_STANDARD_STAGES.map((stage) => ({ stage, status: "completed" as const }));
    expect(hasAllGoldStandardStages(stages)).toBe(true);
    expect(hasAllGoldStandardStages(stages.slice(0, -1))).toBe(false);
  });

  it("does not treat blocked or failed stages as complete", () => {
    const stages = GOLD_STANDARD_STAGES.map((stage) => ({ stage, status: "completed" as const }));
    stages[3] = { stage: "understand", status: "blocked" };
    expect(hasAllGoldStandardStages(stages)).toBe(false);
  });
});
