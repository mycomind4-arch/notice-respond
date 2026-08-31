import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function source(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test("API route identity comes directly from the verified principal", async () => {
  const routeSources = await Promise.all([
    source("packages/api-server/src/case-workflow-routes.ts"),
    source("packages/api-server/src/report-routes.ts"),
    source("packages/api-server/src/policy-routes.ts"),
  ]);

  for (const routes of routeSources) {
    assert.match(routes, /requirePrincipal\(request\)/);
    assert.doesNotMatch(routes, /request\.headers\["x-(?:tenant|actor)-id"\]/);
  }
});

test("authentication does not mirror principal identity into request headers", async () => {
  const authentication = await source("packages/api-server/src/auth-plugin.ts");
  assert.doesNotMatch(authentication, /request\.headers\["x-(?:tenant|actor)-id"\]\s*=/);
});
