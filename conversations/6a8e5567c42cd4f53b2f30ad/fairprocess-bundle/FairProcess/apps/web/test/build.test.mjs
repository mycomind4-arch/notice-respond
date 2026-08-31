import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const html = await readFile(resolve(here, "..", "dist", "index.html"), "utf8");

test("build ships the demo page as the default landing page", () => {
  assert.match(html, /FairProcess/i);
  assert.match(html, /screen-signin/i);
});

test("build does not inject the yellow demonstration banner", () => {
  assert.doesNotMatch(html, /DEMONSTRATION UI/i);
  assert.doesNotMatch(html, /prototype-banner/i);
  assert.doesNotMatch(html, /UI PROTOTYPE/i);
});

test("build does not inject prototype language", () => {
  assert.doesNotMatch(html, /Prototype Status: Demonstration/i);
  assert.doesNotMatch(html, /Demonstration Access Screen/i);
  assert.doesNotMatch(html, /Demo source indicators only/i);
  assert.doesNotMatch(html, /Prototype dataset/i);
});

test("build preserves the major analyst workbench screens", () => {
  for (const id of [
    "screen-dashboard",
    "screen-createcase",
    "screen-overview",
    "screen-evidence-upload",
    "screen-audittrail",
    "screen-portfolio",
    "screen-policystudio",
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test("build ships and links the live analyst workspace", () => {
  assert.match(html, /live\.html/);
});

test("build injects Google Client ID when available", () => {
  assert.doesNotMatch(html, /GOOGLE_CLIENT_ID_PLACEHOLDER/);
});
