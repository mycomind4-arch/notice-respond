# Tamper-Evident Audit Chain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the linkage-only audit log with a tenant-wide, versioned, recomputable, concurrency-safe, append-only audit chain while preserving legacy rows.

**Architecture:** TypeScript owns canonical serialization and SHA-256 calculation. PostgreSQL owns tenant-scoped append serialization, uniqueness constraints, genesis initialization, and update/delete rejection. Verification recomputes every v2 hash from persisted fields and returns exact failure reasons.

**Tech Stack:** TypeScript, Node.js crypto, PostgreSQL 17, `pg`, Fastify, Node test runner, pnpm.

## Global Constraints

- Preserve all existing audit rows without rewriting their original hashes.
- Label preserved rows as `chain_version = 1` and report them as unverifiable.
- Use one ordered v2 chain per tenant.
- Use canonicalization version `fairprocess-audit-v1`.
- Describe the feature as tamper-evident, never tamper-proof.
- Keep the existing `recordAuditEvent(db, input)` caller API compatible.
- Keep a top-level `valid` boolean in verification responses.
- Do not add external anchoring, signing keys, blockchains, or new runtime dependencies.

---

## File map

- Create `packages/database/src/audit-canonical.ts`: deterministic JSON normalization and SHA-256 helpers.
- Replace `packages/database/src/audit-log.ts`: transactional v2 append and complete verification.
- Modify `packages/database/src/index.ts`: export new types and helpers.
- Create `packages/database/migrations/005_tamper_evident_audit_chain.sql`: v2 fields, constraints, genesis initialization, tenant trigger, and immutability trigger.
- Create `packages/database/migrations/005_tamper_evident_audit_chain.down.sql`: remove v2 rows and protections, then restore the legacy schema shape.
- Create `packages/database/test/audit-canonical.test.mjs`: deterministic canonicalization unit tests.
- Create `packages/database/test/audit-chain.test.mjs`: PostgreSQL append, verification, tamper, immutability, legacy, and concurrency tests.
- Modify `packages/api-server/src/case-routes.ts`: delegate verification to `verifyAuditChain` and expose v2 metadata in case audit trails.
- Modify `packages/database/README.md`: document guarantees and limits.

---

### Task 1: Add failing canonicalization tests

**Files:**
- Create: `packages/database/test/audit-canonical.test.mjs`

**Interfaces:**
- Consumes: `canonicalizeAuditPayload(payload)` and `hashAuditPayload(payload)` from `../dist/audit-canonical.js`.
- Produces: executable contract for deterministic nested-key ordering and mutation-sensitive hashes.

- [ ] **Step 1: Write the failing tests**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { canonicalizeAuditPayload, hashAuditPayload } from "../dist/audit-canonical.js";

const base = {
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
  const reordered = {
    ...base,
    result: { nested: { alpha: false, beta: true }, z: 1 },
  };
  assert.equal(canonicalizeAuditPayload(base), canonicalizeAuditPayload(reordered));
  assert.equal(hashAuditPayload(base), hashAuditPayload(reordered));
});

test("changing one persisted field changes the event hash", () => {
  assert.notEqual(hashAuditPayload(base), hashAuditPayload({ ...base, actor: "other" }));
});

test("canonicalization rejects unsupported values", () => {
  assert.throws(
    () => canonicalizeAuditPayload({ ...base, result: { value: Number.NaN } }),
    /non-finite number/i,
  );
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm --filter @fairprocess/database test
```

Expected: FAIL because `dist/audit-canonical.js` does not exist.

- [ ] **Step 3: Commit the failing contract**

```bash
git add packages/database/test/audit-canonical.test.mjs
git commit -m "test: define canonical audit payload contract"
```

---

### Task 2: Implement canonical serialization and hashing

**Files:**
- Create: `packages/database/src/audit-canonical.ts`
- Modify: `packages/database/src/index.ts`

**Interfaces:**
- Produces:

```ts
export const AUDIT_CANONICALIZATION_VERSION = "fairprocess-audit-v1" as const;
export interface CanonicalAuditPayload { /* fixed persisted fields */ }
export function canonicalizeAuditPayload(payload: CanonicalAuditPayload): string;
export function hashAuditPayload(payload: CanonicalAuditPayload): string;
```

- [ ] **Step 1: Implement recursive normalization**

Use a private normalizer that preserves arrays, sorts plain-object keys, converts no values implicitly, and throws for `undefined`, functions, symbols, bigint, and non-finite numbers.

```ts
function normalize(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Audit payload contains a non-finite number");
    return value;
  }
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("Audit payload contains a non-plain object");
    }
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, normalize((value as Record<string, unknown>)[key])]),
    );
  }
  throw new TypeError(`Audit payload contains unsupported value type: ${typeof value}`);
}
```

- [ ] **Step 2: Serialize fixed top-level keys and hash UTF-8 bytes**

```ts
export function canonicalizeAuditPayload(payload: CanonicalAuditPayload): string {
  return JSON.stringify({
    canonicalizationVersion: payload.canonicalizationVersion,
    chainVersion: payload.chainVersion,
    id: payload.id,
    tenantId: payload.tenantId,
    caseId: payload.caseId,
    sequenceNumber: payload.sequenceNumber,
    occurredAt: payload.occurredAt,
    actor: payload.actor,
    action: payload.action,
    sourceHashes: normalize(payload.sourceHashes),
    policyVersion: payload.policyVersion,
    extractionVersion: payload.extractionVersion,
    result: normalize(payload.result),
    humanAuthorizedBy: payload.humanAuthorizedBy,
    priorEventHash: payload.priorEventHash,
  });
}

export function hashAuditPayload(payload: CanonicalAuditPayload): string {
  return createHash("sha256").update(canonicalizeAuditPayload(payload), "utf8").digest("hex");
}
```

- [ ] **Step 3: Export the helper from `index.ts`**

- [ ] **Step 4: Run tests and verify GREEN**

```bash
pnpm --filter @fairprocess/database test
```

Expected: canonicalization tests PASS; integration tests are not added yet.

- [ ] **Step 5: Commit**

```bash
git add packages/database/src/audit-canonical.ts packages/database/src/index.ts
git commit -m "feat: add canonical audit event hashing"
```

---

### Task 3: Add migration and database-contract tests

**Files:**
- Create: `packages/database/test/audit-chain.test.mjs`

**Interfaces:**
- Consumes: `Database`, `recordAuditEvent`, and `verifyAuditChain` from `../dist/index.js`.
- Produces: integration contract for v2 schema, append ordering, concurrency, immutability, and verification statuses.

- [ ] **Step 1: Add test setup with isolated tenants**

Create a database instance from `DATABASE_URL`, generate tenant IDs with `crypto.randomUUID()`, insert tenants, and delete dependent cases before tenant cleanup.

- [ ] **Step 2: Add a sequential append test**

Assert that two calls to `recordAuditEvent` create a genesis row followed by sequence 2 and 3, with each `prior_event_hash` equal to the previous `event_hash`, and that verification returns `valid_with_legacy_prefix` or `valid` according to fixture setup.

- [ ] **Step 3: Add a concurrency test**

Run 12 `recordAuditEvent` calls with `Promise.all`, then assert sequences equal `[1, 2, ..., 13]`, are unique, and verification is valid.

- [ ] **Step 4: Add immutability tests**

Assert direct SQL `UPDATE audit_events ...` and `DELETE FROM audit_events ...` reject with an append-only error.

- [ ] **Step 5: Add verifier mismatch tests**

Within a test transaction, disable the user trigger, modify one row, re-enable the trigger, and assert:

- changed `result` returns `invalid_hash`;
- changed `prior_event_hash` returns `invalid_link`;
- changed `sequence_number` returns `invalid_sequence`.

Always restore the original value in `finally` so later tests remain isolated.

- [ ] **Step 6: Run and verify RED**

```bash
pnpm --filter @fairprocess/database test
```

Expected: FAIL because migration 005 and v2 append behavior do not exist.

- [ ] **Step 7: Commit the failing integration contract**

```bash
git add packages/database/test/audit-chain.test.mjs
git commit -m "test: define tamper-evident audit chain behavior"
```

---

### Task 4: Add migration 005 and rollback

**Files:**
- Create: `packages/database/migrations/005_tamper_evident_audit_chain.sql`
- Create: `packages/database/migrations/005_tamper_evident_audit_chain.down.sql`

**Interfaces:**
- Produces v2 columns, constraints, genesis creation, future-tenant initialization, and immutability enforcement.

- [ ] **Step 1: Add v2 columns and constraints**

```sql
ALTER TABLE audit_events
  ADD COLUMN chain_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN sequence_number BIGINT,
  ADD COLUMN occurred_at TIMESTAMPTZ,
  ADD COLUMN canonicalization_version TEXT;

ALTER TABLE audit_events
  ADD CONSTRAINT audit_events_v2_required_fields CHECK (
    chain_version <> 2 OR (
      sequence_number > 0 AND
      occurred_at IS NOT NULL AND
      canonicalization_version IS NOT NULL AND
      event_hash ~ '^[0-9a-f]{64}$' AND
      (prior_event_hash IS NULL OR prior_event_hash ~ '^[0-9a-f]{64}$')
    )
  );

CREATE UNIQUE INDEX audit_events_tenant_chain_sequence_uq
  ON audit_events (tenant_id, chain_version, sequence_number)
  WHERE sequence_number IS NOT NULL;

CREATE UNIQUE INDEX audit_events_tenant_chain_hash_uq
  ON audit_events (tenant_id, chain_version, event_hash);
```

- [ ] **Step 2: Add append-only trigger**

```sql
CREATE FUNCTION reject_audit_event_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_events is append-only' USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER audit_events_append_only
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW EXECUTE FUNCTION reject_audit_event_mutation();
```

- [ ] **Step 3: Add genesis trigger contract**

Create a function invoked after tenant insertion that inserts a v2 genesis row using PostgreSQL `digest` only if `pgcrypto` is already available; otherwise do not duplicate TypeScript canonicalization in SQL. Because canonical hashing remains application-owned, migration genesis rows should be created by a migration script or application helper rather than a second SQL hashing implementation. The selected implementation must keep one canonicalizer.

- [ ] **Step 4: Implement rollback**

Rollback order:

1. drop tenant-genesis trigger and helper;
2. drop append-only trigger and function;
3. delete all `chain_version = 2` rows;
4. drop indexes and v2 check constraint;
5. drop v2 columns.

- [ ] **Step 5: Run migration lifecycle**

```bash
pnpm --filter @fairprocess/database build
pnpm --filter @fairprocess/database migrate
pnpm --filter @fairprocess/database migrate:down
pnpm --filter @fairprocess/database migrate
```

Expected: all migrations apply, reverse newest-first, and reapply cleanly.

- [ ] **Step 6: Commit**

```bash
git add packages/database/migrations/005_tamper_evident_audit_chain.sql packages/database/migrations/005_tamper_evident_audit_chain.down.sql
git commit -m "feat: add audit chain v2 schema protections"
```

---

### Task 5: Replace append and verification logic

**Files:**
- Replace: `packages/database/src/audit-log.ts`
- Modify: `packages/database/src/index.ts`

**Interfaces:**
- Keeps:

```ts
recordAuditEvent(db: Database, input: AuditEventInput): Promise<{ id: string; eventHash: string }>;
```

- Adds:

```ts
verifyAuditChain(db: Database, tenantId: string): Promise<AuditChainVerification>;
```

- [ ] **Step 1: Define stored-row and verification types**

Include every persisted hash field, status union, counts, mismatch location, and expected/actual values.

- [ ] **Step 2: Implement transaction-scoped append**

Inside `db.transaction`:

```ts
await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [input.tenantId]);
```

Check tenant existence, initialize genesis when missing, read latest v2 event by sequence, allocate the next sequence, calculate one event ID and timestamp, hash the exact payload, insert, and return.

- [ ] **Step 3: Implement application-owned genesis creation**

Use actor `system`, action `audit_chain_initialized`, sequence 1, no predecessor, and a result object containing legacy count, last legacy hash, boundary timestamp, and canonicalization version.

- [ ] **Step 4: Implement complete verification**

Query all fields needed to rebuild the payload. Count v1 rows separately, enforce genesis shape, sequence continuity, predecessor equality, supported version, and recomputed hash equality. Return on the first mismatch.

- [ ] **Step 5: Run integration tests and verify GREEN**

```bash
pnpm --filter @fairprocess/database test
```

Expected: canonicalization and audit-chain tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/database/src/audit-log.ts packages/database/src/index.ts
git commit -m "feat: implement serialized tamper-evident audit chain"
```

---

### Task 6: Integrate the API and document behavior

**Files:**
- Modify: `packages/api-server/src/case-routes.ts`
- Modify: `packages/database/README.md`

**Interfaces:**
- API `GET /api/audit/verify-chain` returns `AuditChainVerification`.
- Case audit-trail rows include v2 sequence and canonicalization metadata.

- [ ] **Step 1: Import and use `verifyAuditChain`**

Replace the route-local predecessor-only loop with:

```ts
const verification = await verifyAuditChain(db, tenantId);
return reply.send(verification);
```

- [ ] **Step 2: Extend audit-trail projection**

Select `chain_version`, `sequence_number`, `occurred_at`, `canonicalization_version`, and `prior_event_hash`, ordered by `chain_version, sequence_number NULLS FIRST, created_at, id`.

- [ ] **Step 3: Document guarantees and limitations**

Explain legacy preservation, v2 status values, transaction locking, mutation triggers, and the database-superuser limitation.

- [ ] **Step 4: Run full verification**

```bash
pnpm typecheck
pnpm test
pnpm build
```

Expected: all commands PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/api-server/src/case-routes.ts packages/database/README.md
git commit -m "feat: expose complete audit chain verification"
```

---

### Task 7: Final evidence and pull request

- [ ] **Step 1: Run PostgreSQL migration lifecycle and full test suite in CI**

Expected CI stages:

- frozen-lockfile install;
- typecheck;
- migration up → down → up through migration 005;
- package and integration tests;
- full build.

- [ ] **Step 2: Inspect changed files and confirm scope**

No unrelated UI, policy, Evidence Vault, or deployment work belongs in this PR.

- [ ] **Step 3: Open a draft stacked pull request**

Base: `agent/production-auth-tenancy`

Head: `agent/tamper-evident-audit-chain`

Title: `Add tamper-evident tenant audit chains`

The PR description must explicitly state that legacy rows are retained but unverifiable and that this is tamper-evident rather than tamper-proof.
