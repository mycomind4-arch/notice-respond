import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { after } from "node:test";
import {
  AUDIT_CANONICALIZATION_VERSION,
  Database,
  recordAuditEvent,
  verifyAuditChain,
} from "../dist/index.js";

const databaseUrl = process.env.DATABASE_URL;
const databaseTest = databaseUrl ? test : test.skip;
const db = databaseUrl ? new Database({ connectionString: databaseUrl }) : null;

function requireDatabase() {
  assert.ok(db, "DATABASE_URL is required for audit-chain integration tests");
  return db;
}

async function createTenant(label = "Audit chain test") {
  const database = requireDatabase();
  const tenantId = `audit-test-${randomUUID()}`;
  await database.query(
    "INSERT INTO tenants (id, name, kind) VALUES ($1, $2, 'resident')",
    [tenantId, `${label} ${tenantId}`],
  );
  return tenantId;
}

async function insertLegacyEvent(tenantId, hashCharacter = "a") {
  const database = requireDatabase();
  const id = randomUUID();
  await database.query(
    `INSERT INTO audit_events
      (id, tenant_id, actor, action, source_hashes, result, event_hash)
     VALUES ($1, $2, 'legacy-system', 'case_created', '[]'::jsonb, '{}'::jsonb, $3)`,
    [id, tenantId, hashCharacter.repeat(64)],
  );
  return id;
}

async function disableImmutability() {
  await requireDatabase().query(
    "ALTER TABLE audit_events DISABLE TRIGGER audit_events_append_only",
  );
}

async function enableImmutability() {
  await requireDatabase().query(
    "ALTER TABLE audit_events ENABLE TRIGGER audit_events_append_only",
  );
}

after(async () => {
  if (db) await db.end();
});

databaseTest("legacy rows are preserved and followed by a valid v2 boundary", async () => {
  const database = requireDatabase();
  const tenantId = await createTenant("Legacy boundary");
  await insertLegacyEvent(tenantId);

  await recordAuditEvent(database, {
    tenantId,
    actor: "analyst-1",
    action: "audit_run",
    result: { reportId: "report-1" },
  });

  const verification = await verifyAuditChain(database, tenantId);
  assert.equal(verification.status, "valid_with_legacy_prefix");
  assert.equal(verification.valid, true);
  assert.equal(verification.legacyEvents, 1);
  assert.equal(verification.verifiedEvents, 2);
  assert.equal(verification.totalEvents, 3);

  const { rows } = await database.query(
    `SELECT chain_version, sequence_number::int AS sequence_number, action,
            prior_event_hash, canonicalization_version
       FROM audit_events
      WHERE tenant_id = $1
      ORDER BY chain_version, sequence_number NULLS FIRST, created_at, id`,
    [tenantId],
  );

  assert.equal(rows[0].chain_version, 1);
  assert.equal(rows[0].sequence_number, null);
  assert.deepEqual(
    rows.slice(1).map((row) => row.sequence_number),
    [1, 2],
  );
  assert.equal(rows[1].action, "audit_chain_initialized");
  assert.equal(rows[1].prior_event_hash, null);
  assert.equal(
    rows[1].canonicalization_version,
    AUDIT_CANONICALIZATION_VERSION,
  );
});

databaseTest("sequential appends create contiguous links after genesis", async () => {
  const database = requireDatabase();
  const tenantId = await createTenant("Sequential append");

  await recordAuditEvent(database, {
    tenantId,
    actor: "analyst-1",
    action: "case_created",
    result: { caseId: "case-1" },
  });
  await recordAuditEvent(database, {
    tenantId,
    actor: "analyst-1",
    action: "recorder_imported",
    result: { instrumentCount: 2 },
  });

  const { rows } = await database.query(
    `SELECT sequence_number::int AS sequence_number, prior_event_hash, event_hash
       FROM audit_events
      WHERE tenant_id = $1 AND chain_version = 2
      ORDER BY sequence_number`,
    [tenantId],
  );

  assert.deepEqual(
    rows.map((row) => row.sequence_number),
    [1, 2, 3],
  );
  assert.equal(rows[0].prior_event_hash, null);
  assert.equal(rows[1].prior_event_hash, rows[0].event_hash);
  assert.equal(rows[2].prior_event_hash, rows[1].event_hash);

  const verification = await verifyAuditChain(database, tenantId);
  assert.equal(verification.status, "valid");
  assert.equal(verification.valid, true);
  assert.equal(verification.verifiedEvents, 3);
});

databaseTest("concurrent appends cannot fork or reuse a tenant sequence", async () => {
  const database = requireDatabase();
  const tenantId = await createTenant("Concurrent append");

  await Promise.all(
    Array.from({ length: 12 }, (_, index) =>
      recordAuditEvent(database, {
        tenantId,
        actor: `worker-${index}`,
        action: "audit_run",
        result: { index },
      }),
    ),
  );

  const { rows } = await database.query(
    `SELECT sequence_number::int AS sequence_number, prior_event_hash, event_hash
       FROM audit_events
      WHERE tenant_id = $1 AND chain_version = 2
      ORDER BY sequence_number`,
    [tenantId],
  );

  assert.deepEqual(
    rows.map((row) => row.sequence_number),
    Array.from({ length: 13 }, (_, index) => index + 1),
  );
  assert.equal(new Set(rows.map((row) => row.sequence_number)).size, 13);
  for (let index = 1; index < rows.length; index += 1) {
    assert.equal(rows[index].prior_event_hash, rows[index - 1].event_hash);
  }

  const verification = await verifyAuditChain(database, tenantId);
  assert.equal(verification.status, "valid");
  assert.equal(verification.valid, true);
});

databaseTest("database rejects audit event updates and deletes", async () => {
  const database = requireDatabase();
  const tenantId = await createTenant("Immutability");
  const event = await recordAuditEvent(database, {
    tenantId,
    actor: "analyst-1",
    action: "audit_run",
  });

  await assert.rejects(
    database.query("UPDATE audit_events SET actor = 'tampered' WHERE id = $1", [event.id]),
    /append-only/i,
  );
  await assert.rejects(
    database.query("DELETE FROM audit_events WHERE id = $1", [event.id]),
    /append-only/i,
  );
});

databaseTest("verification detects a modified event payload", async () => {
  const database = requireDatabase();
  const tenantId = await createTenant("Hash tamper");
  const event = await recordAuditEvent(database, {
    tenantId,
    actor: "analyst-1",
    action: "audit_run",
    result: { original: true },
  });

  await disableImmutability();
  try {
    await database.query(
      "UPDATE audit_events SET result = '{\"original\":false}'::jsonb WHERE id = $1",
      [event.id],
    );
  } finally {
    await enableImmutability();
  }

  const verification = await verifyAuditChain(database, tenantId);
  assert.equal(verification.status, "invalid_hash");
  assert.equal(verification.valid, false);
  assert.equal(verification.brokenAt, event.id);
  assert.match(String(verification.expected), /^[0-9a-f]{64}$/);
  assert.match(String(verification.actual), /^[0-9a-f]{64}$/);
});

databaseTest("verification detects a modified predecessor before hash mismatch", async () => {
  const database = requireDatabase();
  const tenantId = await createTenant("Link tamper");
  await recordAuditEvent(database, {
    tenantId,
    actor: "analyst-1",
    action: "case_created",
  });
  const second = await recordAuditEvent(database, {
    tenantId,
    actor: "analyst-1",
    action: "audit_run",
  });

  await disableImmutability();
  try {
    await database.query(
      "UPDATE audit_events SET prior_event_hash = $1 WHERE id = $2",
      ["0".repeat(64), second.id],
    );
  } finally {
    await enableImmutability();
  }

  const verification = await verifyAuditChain(database, tenantId);
  assert.equal(verification.status, "invalid_link");
  assert.equal(verification.valid, false);
  assert.equal(verification.brokenAt, second.id);
});

databaseTest("verification detects a sequence gap before link and hash checks", async () => {
  const database = requireDatabase();
  const tenantId = await createTenant("Sequence tamper");
  const event = await recordAuditEvent(database, {
    tenantId,
    actor: "analyst-1",
    action: "audit_run",
  });

  await disableImmutability();
  try {
    await database.query(
      "UPDATE audit_events SET sequence_number = 4 WHERE id = $1",
      [event.id],
    );
  } finally {
    await enableImmutability();
  }

  const verification = await verifyAuditChain(database, tenantId);
  assert.equal(verification.status, "invalid_sequence");
  assert.equal(verification.valid, false);
  assert.equal(verification.brokenAt, event.id);
  assert.equal(verification.expected, 2);
  assert.equal(verification.actual, 4);
});

databaseTest("verification reports unsupported canonicalization versions", async () => {
  const database = requireDatabase();
  const tenantId = await createTenant("Version tamper");
  const event = await recordAuditEvent(database, {
    tenantId,
    actor: "analyst-1",
    action: "audit_run",
  });

  await disableImmutability();
  try {
    await database.query(
      "UPDATE audit_events SET canonicalization_version = 'unknown-v9' WHERE id = $1",
      [event.id],
    );
  } finally {
    await enableImmutability();
  }

  const verification = await verifyAuditChain(database, tenantId);
  assert.equal(
    verification.status,
    "unsupported_canonicalization_version",
  );
  assert.equal(verification.brokenAt, event.id);
});

databaseTest("legacy-only tenants are explicitly unverifiable", async () => {
  const database = requireDatabase();
  const tenantId = await createTenant("Legacy only");
  await insertLegacyEvent(tenantId, "b");

  const verification = await verifyAuditChain(database, tenantId);
  assert.equal(verification.status, "legacy_unverifiable");
  assert.equal(verification.valid, false);
  assert.equal(verification.legacyEvents, 1);
  assert.equal(verification.verifiedEvents, 0);
});
