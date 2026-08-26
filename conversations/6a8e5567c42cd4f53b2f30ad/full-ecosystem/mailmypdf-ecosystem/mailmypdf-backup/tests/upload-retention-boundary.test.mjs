import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function source(path) {
  return readFile(join(root, path), "utf8");
}

test("preview and order creation share strict validation before storage", async () => {
  const orders = await source("src/lib/orders.functions.ts");
  const validation = await source("src/lib/pdf-validation.server.ts");

  // All validatePdfForMailing calls — should be in preview, createOrder, and createLetterOrder
  const calls = [...orders.matchAll(/validatePdfForMailing\(/g)].map((match) => match.index);
  assert.ok(calls.length >= 2, "preview and at least one order creation path must validate");

  // Each upload call must be preceded by a validate call within its function.
  // Find all upload calls and check each one has a validate call before it
  // and no upload call before the nearest preceding validate.
  const uploadCalls = [...orders.matchAll(/\.from\("order-pdfs"\)\n\s+\.upload/g)].map((match) => match.index);
  const validateCalls = [...orders.matchAll(/validatePdfForMailing\(/g)].map((match) => match.index);

  for (const uploadIdx of uploadCalls) {
    // Find the nearest preceding validate call
    const precedingValidate = validateCalls.filter((v) => v < uploadIdx).pop();
    assert.ok(precedingValidate !== undefined, "every upload must be preceded by a validation call");

    // Ensure no other upload between the validate and this upload
    const uploadBetween = uploadCalls.filter((u) => u > precedingValidate && u < uploadIdx);
    assert.equal(uploadBetween.length, 0, "validation must immediately precede its own upload");
  }

  assert.match(validation, /ignoreEncryption:\s*false/);
  assert.match(validation, /throwOnInvalidObject:\s*true/);
  assert.match(validation, /\/Encrypt\\b/);
  assert.match(validation, /\/JavaScript/);
  assert.match(validation, /\/Launch/);
  assert.match(validation, /\/EmbeddedFile/);
  assert.match(validation, /MAX_INDIRECT_OBJECTS/);
  assert.match(validation, /MAX_PAGE_POINTS/);
});

test("expired cleanup is authenticated and limited to old session-free drafts", async () => {
  const cleanup = await source("src/lib/draft-cleanup.server.ts");
  const route = await source("src/routes/api/internal/cleanup-drafts.ts");

  assert.match(cleanup, /MAILMYPDF_CLEANUP_SECRET/);
  assert.match(cleanup, /timingSafeEqual/);
  assert.match(cleanup, /\.eq\("status",\s*"draft"\)/);
  assert.match(cleanup, /\.is\("stripe_session_id",\s*null\)/);
  assert.match(cleanup, /\.lt\("created_at",\s*cutoff\)/);
  assert.match(cleanup, /\.update\(\{ status: "cancelled", admin_notes: CLEANUP_MARKER \}\)/);
  assert.match(cleanup, /\.eq\("status",\s*"cancelled"\)/);
  assert.doesNotMatch(cleanup, /paid_pending_manual_fulfillment|failed_fulfillment|submitted_to_provider/);
  assert.match(route, /requireCleanupAuthorization\(request\)/);
  assert.match(route, /result\.failed\.length > 0 \? 500 : 200/);
});

test("checkout expires a session if cleanup or another actor wins the draft claim", async () => {
  const orders = await source("src/lib/orders.functions.ts");

  const createSession = orders.indexOf("checkout.sessions.create");
  const conditionalClaim = orders.indexOf('.is("stripe_session_id", null)');
  const expireSession = orders.indexOf("checkout.sessions.expire");

  assert.ok(createSession >= 0);
  assert.ok(conditionalClaim > createSession);
  assert.ok(expireSession > conditionalClaim);
  assert.match(orders, /claimed\.length !== 1/);
  assert.match(orders, /draft expired before checkout could begin/i);
});

test("retention documentation distinguishes enforced and future cleanup", async () => {
  const policy = await source("docs/RETENTION_AND_CLEANUP.md");

  assert.match(policy, /Default retention: \*\*24 hours/);
  assert.match(policy, /not yet automatically enforced/i);
  assert.match(policy, /distributed rate limiting/i);
  assert.match(policy, /order-pdfs.*must remain private/i);
});
