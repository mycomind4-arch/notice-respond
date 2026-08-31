import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { after } from "node:test";
import { Database, recordAuditEvent, verifyAuditChain } from "../dist/index.js";

const databaseUrl = process.env.DATABASE_URL;
const databaseTest = databaseUrl ? test : test.skip;
const db = databaseUrl ? new Database({ connectionString: databaseUrl }) : null;

after(async () => {
  if (db) await db.end();
});

databaseTest("legacy rows inserted after v2 genesis invalidate the boundary", async () => {
  assert.ok(db);
  const tenantId = `audit-boundary-${randomUUID()}`;
  await db.query(
    "INSERT INTO tenants (id, name, kind) VALUES ($1, $2, 'resident')",
    [tenantId, "Legacy suffix test"],
  );

  await recordAuditEvent(db, {
    tenantId,
    actor: "analyst-1",
    action: "audit_run",
  });

  const legacyId = randomUUID();
  await db.query(
    `INSERT INTO audit_events
      (id, tenant_id, actor, action, source_hashes, result, event_hash,
       chain_version, created_at)
     VALUES
      ($1, $2, 'legacy-system', 'case_created', '[]'::jsonb, '{}'::jsonb,
       $3, 1, now() + interval '1 second')`,
    [legacyId, tenantId, "c".repeat(64)],
  );

  const verification = await verifyAuditChain(db, tenantId);
  assert.equal(verification.valid, false);
  assert.equal(verification.status, "invalid_genesis");
  assert.equal(verification.brokenAt, legacyId);
  assert.match(String(verification.actual), /legacy event after v2 genesis/i);
});
