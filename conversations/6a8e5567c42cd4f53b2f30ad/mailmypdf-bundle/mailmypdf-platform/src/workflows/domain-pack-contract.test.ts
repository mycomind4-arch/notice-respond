import { describe, expect, it } from "vitest";
import { diagnoseDomainPack, isConsequentialStage, isExecutableDomainPack, missingCapabilities, type DomainPackManifest } from "./domain-pack-contract";
import type { DomainPack } from "./gold-standard-pipeline";

const manifest: DomainPackManifest = {
  id: "fixture",
  displayName: "Fixture",
  capabilities: ["classification", "extraction", "validation", "approval", "mailing"],
};

const pack = {
  id: "fixture",
  classify: async () => ({ stage: "classification", status: "passed", messages: [] }),
  extract: async () => ({ stage: "extraction", status: "passed", messages: [] }),
  validation: async () => ({ stage: "validation", status: "passed", messages: [] }),
  approval: async () => ({ stage: "approval", status: "passed", messages: [] }),
  mailing: async () => ({ stage: "mailing", status: "passed", messages: [] }),
} as unknown as DomainPack;

describe("domain-pack certification contract", () => {
  it("detects missing implementations instead of trusting declarations", () => {
    const diagnostics = diagnoseDomainPack(pack, manifest);
    expect(diagnostics).toEqual([
      { capability: "classification", method: "classify", status: "executable" },
      { capability: "extraction", method: "extract", status: "executable" },
      { capability: "validation", method: "validation", status: "executable" },
      { capability: "approval", method: "approval", status: "executable" },
      { capability: "mailing", method: "mailing", status: "executable" },
    ]);
    expect(isExecutableDomainPack(pack, manifest)).toBe(true);
  });

  it("reports an explicitly declared but absent capability", () => {
    const incomplete = { ...pack, mailing: undefined } as unknown as DomainPack;
    expect(missingCapabilities(incomplete, manifest)).toEqual(["mailing"]);
    expect(isExecutableDomainPack(incomplete, manifest)).toBe(false);
  });

  it("keeps consequential stages explicit", () => {
    expect(isConsequentialStage("approval")).toBe(true);
    expect(isConsequentialStage("mailing")).toBe(true);
    expect(isConsequentialStage("tracking")).toBe(true);
    expect(isConsequentialStage("classification")).toBe(false);
  });
});
