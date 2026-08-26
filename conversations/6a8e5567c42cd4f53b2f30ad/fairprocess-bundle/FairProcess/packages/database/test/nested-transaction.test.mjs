import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";

import { Database } from "../dist/index.js";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const db = hasDatabase ? new Database({ connectionString: process.env.DATABASE_URL }) : null;
const committedTenantId = `nested-commit-${randomUUID()}`;
const rolledBackTenantId = `nested-rollback-${randomUUID()}`;

after(async () => {
  if (!db) return;
  await db.query("DELETE FROM tenants WHERE id IN ($1, $2)", [
    committedTenantId,
    rolledBackTenantId,
  ]);
  await db.end();
});

test("nested transactions reuse the outer PostgreSQL client", { skip: !hasDatabase }, async () => {
  await db.transaction(async (outerClient) => {
    await outerClient.query(
      "INSERT INTO tenants (id, name, kind) VALUES ($1, $2, 'agency')",
      [committedTenantId, "Nested Commit Tenant"],
    );

    await db.transaction(async (innerClient) => {
      assert.equal(innerClient, outerClient);
      await db.query("UPDATE tenants SET name = $1 WHERE id = $2", [
        "Nested Commit Updated",
        committedTenantId,
      ]);
    });
  });

  const stored = await db.query("SELECT name FROM tenants WHERE id = $1", [committedTenantId]);
  assert.equal(stored.rows[0].name, "Nested Commit Updated");
});

test("a nested failure rolls back the entire outer transaction", { skip: !hasDatabase }, async () => {
  await assert.rejects(
    db.transaction(async (outerClient) => {
      await outerClient.query(
        "INSERT INTO tenants (id, name, kind) VALUES ($1, $2, 'agency')",
        [rolledBackTenantId, "Nested Rollback Tenant"],
      );

      await db.transaction(async (innerClient) => {
        assert.equal(innerClient, outerClient);
        await db.query("UPDATE tenants SET name = $1 WHERE id = $2", [
          "This Must Roll Back",
          rolledBackTenantId,
        ]);
        throw new Error("injected nested transaction failure");
      });
    }),
    /injected nested transaction failure/,
  );

  const stored = await db.query("SELECT 1 FROM tenants WHERE id = $1", [rolledBackTenantId]);
  assert.equal(stored.rows.length, 0);
});
