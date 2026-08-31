import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalizeAuditPayload,
  hashAuditPayload,
} from "../dist/audit-canonical.js";

const basePayload = {
  canonicalizationVersion: "fairprocess-audit-v1",
  chainVersion: 2,
  id: "event-1",
  tenantId: "tenant-1",
  caseId: null,
  sequenceNumber: 1,
  occurredAt: "2026-07-17T12:00:00.000Z",
  actor: "system",
  action: "audit_chain_initialized",
  sourceHashes: [],
  policyVersion: null,
  extractionVersion: null,
  result: { z: 1, nested: { beta: true, alpha: false } },
  humanAuthorizedBy: null,
  priorEventHash: null,
};

test("canonicalization recursively sorts object keys", () => {
  const reorderedPayload = {
    ...basePayload,
    result: { nested: { alpha: false, beta: true }, z: 1 },
  };

  assert.equal(
    canonicalizeAuditPayload(basePayload),
    canonicalizeAuditPayload(reorderedPayload),
  );
  assert.equal(hashAuditPayload(basePayload), hashAuditPayload(reorderedPayload));
});

test("changing one persisted field changes the event hash", () => {
  assert.notEqual(
    hashAuditPayload(basePayload),
    hashAuditPayload({ ...basePayload, actor: "other-actor" }),
  );
});

test("arrays preserve their original order", () => {
  assert.notEqual(
    hashAuditPayload({ ...basePayload, sourceHashes: ["a", "b"] }),
    hashAuditPayload({ ...basePayload, sourceHashes: ["b", "a"] }),
  );
});

test("canonicalization rejects non-finite numbers", () => {
  assert.throws(
    () => canonicalizeAuditPayload({ ...basePayload, result: { value: Number.NaN } }),
    /non-finite number/i,
  );
});

test("canonicalization rejects unsupported values", () => {
  assert.throws(
    () => canonicalizeAuditPayload({ ...basePayload, result: { value: undefined } }),
    /unsupported value type/i,
  );
});
