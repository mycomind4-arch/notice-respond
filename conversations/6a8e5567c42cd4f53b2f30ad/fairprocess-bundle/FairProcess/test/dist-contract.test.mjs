import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = path.join(repositoryRoot, "packages");

async function readPackageManifests() {
  const entries = await readdir(packagesRoot, { withFileTypes: true });
  const manifests = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const packageRoot = path.join(packagesRoot, entry.name);
    const manifest = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
    manifests.push({ packageRoot, manifest });
  }
  return manifests;
}

test("compiled workspace packages clean dist before every build", async () => {
  const manifests = await readPackageManifests();
  const compiled = manifests.filter(({ manifest }) => manifest.exports === "./dist/index.js");
  assert.ok(compiled.length > 0, "expected compiled FairProcess packages");

  for (const { manifest } of compiled) {
    assert.match(
      manifest.scripts?.build ?? "",
      /tsc -b tsconfig\.json --clean && tsc -b tsconfig\.json --force/,
      `${manifest.name} must perform a clean forced TypeScript build`,
    );
  }
});

test("package tests rebuild dist before importing compiled modules", async () => {
  const manifests = await readPackageManifests();
  const testable = manifests.filter(({ manifest }) => typeof manifest.scripts?.test === "string");
  assert.ok(testable.length > 0, "expected testable FairProcess packages");

  for (const { manifest } of testable) {
    assert.match(
      manifest.scripts.test,
      /^pnpm build && node --test/,
      `${manifest.name} tests must rebuild clean artifacts before the Node test runner starts`,
    );
  }
});
