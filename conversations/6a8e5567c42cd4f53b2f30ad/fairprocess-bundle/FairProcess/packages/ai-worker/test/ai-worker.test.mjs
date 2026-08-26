import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Unit tests for prompt construction and response parsing.
// These don't hit the actual Workers AI API — they test the pure logic
// that can run in CI without Cloudflare bindings.

describe("prompt version", () => {
  it("should have a stable version string", async () => {
    const { PROMPT_VERSION } = await import("../src/prompts.ts");
    assert.equal(PROMPT_VERSION, "fairprocess-ai-v1");
  });
});

describe("fact extraction prompt", () => {
  it("should include jurisdiction and document text", async () => {
    const { buildFactExtractionPrompt } = await import("../src/prompts.ts");
    const prompt = buildFactExtractionPrompt(
      "The notice was served on 2026-01-15.",
      "notice_of_violation",
      { jurisdiction: "Humboldt County, California", agencyCaseNumber: "CE-2026-001" },
    );
    assert.ok(prompt.includes("Humboldt County, California"));
    assert.ok(prompt.includes("CE-2026-001"));
    assert.ok(prompt.includes("notice_of_violation"));
    assert.ok(prompt.includes("2026-01-15"));
  });

  it("should handle missing case context gracefully", async () => {
    const { buildFactExtractionPrompt } = await import("../src/prompts.ts");
    const prompt = buildFactExtractionPrompt("Some text", undefined, undefined);
    assert.ok(prompt.includes("Some text"));
    assert.ok(!prompt.includes("CASE CONTEXT"));
  });
});

describe("correspondence prompt", () => {
  it("should include key points and recipient info", async () => {
    const { buildCorrespondencePrompt } = await import("../src/prompts.ts");
    const prompt = buildCorrespondencePrompt({
      caseContext: { jurisdiction: "Humboldt County, California", agencyCaseNumber: "CE-001" },
      correspondenceType: "records_request",
      tone: "formal",
      recipient: { name: "Clerk", agency: "Recorder's Office" },
      keyPoints: ["Request all recorded documents for APN 123-456-789", "Response within 10 days"],
    });
    assert.ok(prompt.includes("records_request"));
    assert.ok(prompt.includes("formal"));
    assert.ok(prompt.includes("Humboldt County"));
    assert.ok(prompt.includes("Clerk"));
    assert.ok(prompt.includes("Recorder's Office"));
    assert.ok(prompt.includes("APN 123-456-789"));
  });
});

describe("report summary prompt", () => {
  it("should include the audience and report JSON", async () => {
    const { buildReportSummaryPrompt } = await import("../src/prompts.ts");
    const prompt = buildReportSummaryPrompt(
      { schemaVersion: "fairprocess.integrity-report.v1", findings: [] },
      "supervisor",
    );
    assert.ok(prompt.includes("supervisor"));
    assert.ok(prompt.includes("integrity-report"));
  });
});
