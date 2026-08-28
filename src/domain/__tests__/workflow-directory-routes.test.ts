import test from "node:test";
import assert from "node:assert/strict";
import { noticeRespondCatalog } from "../workflow-catalog";


test("every directory workflow uses its canonical executable route", () => {
  const entries = noticeRespondCatalog.filter((workflow) => workflow.directory);
  const routes = entries.map((workflow) => workflow.searchIntent.canonicalPath);

  assert.ok(entries.length > 0, "expected executable workflows in the catalog");
  assert.equal(new Set(routes).size, routes.length, "canonical workflow routes must be unique");

  for (const workflow of entries) {
    assert.ok(workflow.searchIntent.canonicalPath.startsWith("/workflows/"));
    assert.equal(
      workflow.directory?.seoRoute === workflow.searchIntent.canonicalPath,
      false,
      `directory SEO route must not be used as the canonical application route for ${workflow.id}`,
    );
  }
});
