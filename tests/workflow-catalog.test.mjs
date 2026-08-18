import assert from "node:assert/strict";
import test from "node:test";
import { noticeRespondCatalog } from "../src/domain/workflow-catalog.ts";

const requiredSections = ["searchIntent", "documents", "deadlines", "requirements", "evidence", "analysis", "drafting", "submission", "qualityGate"];

for (const workflow of noticeRespondCatalog) {
  test(`${workflow.id} has a complete master definition`, () => {
    for (const section of requiredSections) {
      assert.ok(workflow[section], `${workflow.id} missing ${section}`);
    }
    assert.ok(workflow.searchIntent.primary);
    assert.ok(workflow.searchIntent.canonicalPath.startsWith("/workflows/"));
    assert.ok(workflow.analysis.capabilities.length > 0);
    assert.ok(workflow.drafting.requiredSections.length > 0);
    assert.ok(workflow.submission.methods.length > 0);
  });
}

test("the catalog is unique by workflow id", () => {
  const ids = noticeRespondCatalog.map((workflow) => workflow.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("blueprint workflows are not falsely production-ready", () => {
  const blueprints = noticeRespondCatalog.filter((workflow) => workflow.lifecycle === "blueprint");
  assert.ok(blueprints.length > 0);
  for (const workflow of blueprints) {
    assert.equal(workflow.qualityGate.documentRecognition, false);
  }
});
