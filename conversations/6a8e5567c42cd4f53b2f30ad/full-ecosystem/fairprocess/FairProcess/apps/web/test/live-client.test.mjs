import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(path.join(appRoot, "dist", "live.html"), "utf8");
const script = await readFile(path.join(appRoot, "dist", "live.js"), "utf8");

test("build ships the live analyst workspace", () => {
  assert.match(html, /analyst workspace/i);
  assert.match(html, /live\.css/);
  assert.match(html, /live\.js/);
});

test("live client collects an access token via textarea", () => {
  assert.match(html, /id="access-token"/);
  assert.match(html, /No password is collected/);
});

test("live client does not persist credentials", () => {
  assert.doesNotMatch(script, /localStorage|sessionStorage|document\.cookie/);
  assert.match(script, /Authorization:\s*`Bearer \$\{state\.token\}`/);
  assert.match(script, /credentials:\s*"omit"/);
});

test("live client uses textContent for status updates", () => {
  assert.match(script, /\.textContent\s*=/);
});

test("live client calls the bounded case audit workflow", () => {
  for (const endpoint of [
    "/api/me",
    "/api/cases",
    "/expectations",
    "/recorder-csv",
    "/audit",
    "/api/reports/",
    "/authorize",
    "/publish",
    "/audit-trail",
    "/api/audit-chain/verify",
  ]) {
    assert.ok(script.includes(endpoint), `expected endpoint ${endpoint}`);
  }
});

test("live client uses explicit authorization language", () => {
  assert.match(html, /Authorize report/);
  assert.match(script, /Report authorized/);
  assert.doesNotMatch(html, /Authorize review/);
  assert.doesNotMatch(script, /Report moved to human review/);
});

test("live client has no localhost references after build", () => {
  assert.doesNotMatch(script, /http:\/\/localhost:3001/);
  assert.doesNotMatch(html, /http:\/\/localhost:3001/);
});

test("live client ships without remote scripts", () => {
  assert.doesNotMatch(html, /<(?:script)[^>]+https?:\/\//i);
});
