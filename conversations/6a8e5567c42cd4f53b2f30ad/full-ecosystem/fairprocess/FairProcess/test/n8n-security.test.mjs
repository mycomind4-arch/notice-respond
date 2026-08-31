import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workflowsDirectory = path.join(repositoryRoot, "n8n-workflows");

async function loadWorkflows() {
  const files = (await readdir(workflowsDirectory))
    .filter((name) => /^\d{2}-.+\.json$/.test(name))
    .sort();

  return Promise.all(
    files.map(async (name) => ({
      name,
      workflow: JSON.parse(await readFile(path.join(workflowsDirectory, name), "utf8")),
    })),
  );
}

test("n8n workflows never trust tenant or actor identity headers", async () => {
  for (const { name, workflow } of await loadWorkflows()) {
    const serialized = JSON.stringify(workflow).toLowerCase();
    assert.equal(serialized.includes("x-tenant-id"), false, `${name} trusts x-tenant-id`);
    assert.equal(serialized.includes("x-actor-id"), false, `${name} trusts x-actor-id`);
  }
});

test("every FairProcess HTTP node uses the configured bearer token", async () => {
  for (const { name, workflow } of await loadWorkflows()) {
    for (const node of workflow.nodes ?? []) {
      if (node.type !== "n8n-nodes-base.httpRequest") continue;
      const url = String(node.parameters?.url ?? "");
      if (!url.includes("FAIRPROCESS_API_URL")) continue;

      const headers = node.parameters?.headerParameters?.parameters ?? [];
      const authorization = headers.find(
        (header) => String(header.name).toLowerCase() === "authorization",
      );
      assert.ok(authorization, `${name}: ${node.name} has no Authorization header`);
      assert.match(
        String(authorization.value),
        /FAIRPROCESS_API_TOKEN/,
        `${name}: ${node.name} does not use FAIRPROCESS_API_TOKEN`,
      );
    }
  }
});

test("report distribution cannot fabricate human authorization", async () => {
  const content = await readFile(
    path.join(workflowsDirectory, "04-report-distribution.json"),
    "utf8",
  );
  assert.doesNotMatch(content, /authorizedBy/i);
  assert.doesNotMatch(content, /\/authorize["}]/i);
  assert.match(content, /previously authorized/i);
});
