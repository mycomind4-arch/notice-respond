# Tamper-Evident Audit Chain Design

## Purpose

Upgrade FairProcess audit logging from a linkage-only chain to a tenant-wide, independently recomputable, tamper-evident chain while preserving all existing audit rows without rewriting their historical hashes.

The design is intentionally described as **tamper-evident**, not tamper-proof. Database triggers prevent normal application updates and deletes, but a PostgreSQL superuser can disable database protections. External anchoring and immutable backups remain later hardening work.

## Scope

This change implements:

- canonical serialization for every new audit event;
- a versioned v2 audit chain ordered per tenant;
- sequence numbers and a single stored event timestamp;
- SHA-256 recomputation from all evidentiary fields;
- transactional append serialization using a per-tenant PostgreSQL advisory lock;
- a genesis event for each active tenant chain that establishes the boundary from preserved legacy rows;
- database triggers that reject `UPDATE` and `DELETE` on `audit_events`;
- detailed verification statuses and failure reasons;
- API reuse of the database verification function;
- migration, tamper, ordering, boundary, and concurrency tests.

This change does not implement:

- external blockchain or transparency-log anchoring;
- cryptographic signing with organization-held private keys;
- WORM object storage;
- cross-database portability;
- deletion of legacy v1 events.

## Legacy preservation model

Existing rows are retained unchanged and labeled `chain_version = 1`. They remain visible in audit history but are explicitly reported as unverifiable because their original hash payload included a timestamp that was never persisted.

New events use `chain_version = 2`. The first v2 event for a tenant is a system-generated `audit_chain_initialized` genesis event. Its result payload records:

- the number of preserved legacy events;
- the final legacy `event_hash`, or `null` when none exists;
- the canonicalization version;
- the migration or first-use boundary timestamp.

The genesis event has `sequence_number = 1` and `prior_event_hash = null`. It does not claim that v1 rows are cryptographically validated or linked into v2. Verification also checks that the captured legacy count and final legacy hash still match, so later rows cannot be inserted and disguised as part of the preserved prefix.

## Data model

Migration `005_tamper_evident_audit_chain.sql` adds:

- `chain_version INTEGER NOT NULL DEFAULT 1`;
- `sequence_number BIGINT`;
- `occurred_at TIMESTAMPTZ`;
- `canonicalization_version TEXT`.

For v2 rows:

- `sequence_number` is required and positive;
- `occurred_at` is required;
- `canonicalization_version` is required and initially equals `fairprocess-audit-v1`;
- `event_hash` and non-null `prior_event_hash` values must be lowercase 64-character hexadecimal SHA-256 strings;
- tenant v2 sequence numbers are unique;
- tenant v2 event hashes are unique.

`created_at` remains the database insertion timestamp. `occurred_at` is the event timestamp included in the hash payload.

After migration 005 is applied, the TypeScript migration runner creates one v2 genesis event for every existing tenant. Tenants created later initialize their genesis event atomically on the first call to `recordAuditEvent`. This deliberately avoids implementing canonical hashing twice in TypeScript and PostgreSQL.

## Canonical event format

Canonicalization version `fairprocess-audit-v1` serializes a fixed object with these exact keys in this exact order:

1. `canonicalizationVersion`
2. `chainVersion`
3. `id`
4. `tenantId`
5. `caseId`
6. `sequenceNumber`
7. `occurredAt`
8. `actor`
9. `action`
10. `sourceHashes`
11. `policyVersion`
12. `extractionVersion`
13. `result`
14. `humanAuthorizedBy`
15. `priorEventHash`

Rules:

- absent optional scalar values serialize as `null`;
- `sourceHashes` defaults to `[]` and preserves order;
- `result` defaults to `{}`;
- nested object keys are recursively sorted lexicographically;
- arrays preserve element order;
- non-finite numbers and unsupported JavaScript values are rejected;
- dates are serialized as UTC ISO-8601 strings with millisecond precision;
- UTF-8 JSON bytes are hashed with SHA-256 and rendered as lowercase hex.

Including the event ID, tenant ID, sequence number, timestamp, and prior hash makes copying, reordering, or tenant reassignment detectable.

## Append protocol

`recordAuditEvent` runs entirely inside one PostgreSQL transaction:

1. acquire `pg_advisory_xact_lock(hashtextextended(tenant_id, 0))`;
2. confirm the tenant exists;
3. ensure a v2 genesis event exists;
4. read the latest v2 row ordered by `sequence_number DESC`;
5. allocate `sequence_number = previous + 1`;
6. generate the event ID and one `occurred_at` value;
7. canonicalize all event fields;
8. calculate SHA-256;
9. insert the event with the same stored ID, sequence, timestamp, prior hash, and computed hash;
10. commit.

The tenant-scoped transaction lock prevents two concurrent writers from selecting the same predecessor or sequence number. Unique constraints provide a second enforcement layer.

## Immutability controls

Migration 005 installs a `BEFORE UPDATE OR DELETE` trigger on `audit_events`. The trigger raises SQLSTATE `55000` with a clear message that audit rows are append-only.

The rollback migration removes the immutability trigger before removing v2 columns and constraints. Rolling back migration 005 intentionally removes generated v2 genesis rows and v2 application events because the v1 schema cannot represent their verified metadata. It preserves all original v1 rows.

## Verification contract

`verifyAuditChain(db, tenantId)` returns:

```ts
interface AuditChainVerification {
  status:
    | "valid"
    | "valid_with_legacy_prefix"
    | "legacy_unverifiable"
    | "invalid_hash"
    | "invalid_link"
    | "invalid_sequence"
    | "invalid_genesis"
    | "unsupported_canonicalization_version";
  valid: boolean;
  totalEvents: number;
  legacyEvents: number;
  verifiedEvents: number;
  brokenAt?: string;
  expected?: string | number | null;
  actual?: string | number | null;
}
```

Verification reads all tenant events and:

- reports `legacy_unverifiable` when no v2 rows exist;
- requires the first v2 row to be the genesis event at sequence 1 with no predecessor;
- verifies the genesis snapshot of legacy count and final legacy hash;
- rejects legacy rows added after the v2 boundary;
- checks strictly increasing contiguous sequence numbers;
- checks every predecessor link;
- rejects unknown canonicalization versions;
- recomputes every v2 event hash from stored fields;
- returns the exact first mismatch and expected/actual values;
- reports `valid_with_legacy_prefix` when preserved v1 rows precede a valid v2 chain;
- reports `valid` when only a valid v2 chain exists or the tenant has no audit events yet.

The API endpoint `GET /api/audit/verify-chain` delegates to this function instead of implementing a second verifier.

## Test strategy

Tests prove:

- deterministic canonicalization despite nested object key order;
- one-field mutation changes the hash;
- first append creates or follows a valid genesis event;
- sequential appends produce contiguous sequence numbers and correct links;
- concurrent appends do not fork or reuse a sequence number;
- updates and deletes fail at the database layer;
- modified payload fields are detected as `invalid_hash` when trigger protections are deliberately disabled for the test;
- modified predecessor links are detected as `invalid_link`;
- sequence gaps are detected as `invalid_sequence`;
- unsupported canonicalization versions are rejected;
- legacy-only, v2-only, and mixed histories return the correct status;
- legacy rows inserted after genesis invalidate the boundary;
- migration lifecycle remains up → down → up compatible;
- the authenticated API returns the complete verification contract.

Audit mutation integration tests run serially because temporarily disabling a table trigger is a database-global operation.

## Operational notes

- Existing API callers continue using `recordAuditEvent`; no caller API change is required.
- Verification responses become richer but retain a top-level `valid` boolean.
- Audit-trail queries expose `chain_version`, `sequence_number`, `occurred_at`, `canonicalization_version`, and `prior_event_hash`.
- A later release should periodically sign or externally anchor tenant chain heads so database-superuser tampering becomes independently detectable.
