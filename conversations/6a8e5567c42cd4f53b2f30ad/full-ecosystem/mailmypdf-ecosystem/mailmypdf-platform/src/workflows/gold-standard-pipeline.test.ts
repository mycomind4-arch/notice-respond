import { describe, expect, it } from "vitest";
import {
  GOLD_STANDARD_PIPELINE_STAGES,
  hasCompleteIntelligence,
  isGoldStandardPipeline,
  runGoldStandardPipeline,
  type DomainPack,
} from "./gold-standard-pipeline";

const passed = (stage: any, data?: unknown) => ({ stage, status: "passed" as const, data, messages: [] });

function makePack(): DomainPack {
  const pack: Record<string, any> = {
    id: "fixture",
    security: async () => passed("security"),
    classify: async () => passed("classification"),
    extract: async () => passed("extraction"),
  };
  for (const stage of GOLD_STANDARD_PIPELINE_STAGES.filter((stage) => !["security", "classification", "extraction", "blockingGate"].includes(stage))) {
    pack[stage] = async () => passed(stage);
  }
  return pack as DomainPack;
}

describe("gold-standard pipeline", () => {
  it("executes the complete lifecycle in canonical order", async () => {
    const result = await runGoldStandardPipeline("fixture", makePack(), { documents: [] });
    expect(result.status).toBe("completed");
    expect(result.stages.map((stage) => stage.stage)).toEqual(GOLD_STANDARD_PIPELINE_STAGES);
    expect(hasCompleteIntelligence(result)).toBe(true);
    expect(isGoldStandardPipeline(result)).toBe(true);
  });

  it("blocks before consequential actions when validation fails", async () => {
    const pack = makePack();
    pack.validation = async () => ({ stage: "validation", status: "blocked", messages: ["missing evidence"] });
    const result = await runGoldStandardPipeline("fixture", pack, { documents: [] });
    expect(result.status).toBe("blocked");
    expect(result.stages.map((stage) => stage.stage)).toEqual([
      ...GOLD_STANDARD_PIPELINE_STAGES.slice(0, 15),
      "blockingGate",
    ]);
    expect(isGoldStandardPipeline(result)).toBe(false);
  });

  it("never permits a domain adapter to return a mismatched stage", async () => {
    const pack = makePack();
    pack.extract = async () => passed("classification");
    const result = await runGoldStandardPipeline("fixture", pack, { documents: [] });
    expect(result.status).toBe("blocked");
    expect(result.stages.at(-1)?.stage).toBe("extraction");
    expect(result.stages.at(-1)?.status).toBe("failed");
  });

  it("blocks if a consequential action fails", async () => {
    const pack = makePack();
    pack.approval = async () => ({ stage: "approval", status: "blocked", messages: ["human approval required"] });
    const result = await runGoldStandardPipeline("fixture", pack, { documents: [] });
    expect(result.status).toBe("blocked");
    expect(result.stages.at(-1)?.stage).toBe("approval");
    expect(isGoldStandardPipeline(result)).toBe(false);
  });
});
