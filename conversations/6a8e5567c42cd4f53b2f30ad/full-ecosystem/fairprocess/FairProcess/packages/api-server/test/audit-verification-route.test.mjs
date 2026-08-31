import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { Database } from "@fairprocess/database";
import { buildApp } from "../dist/app.js";
import { AuthenticationError } from "../dist/oidc.js";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const db = hasDatabase
  ? new Database({ connectionString: process.env.DATABASE_URL })
  : null;
const suffix = randomUUID();
const tenantId = `audit-api-${suffix}`;
const subject = `audit-api-subject-${suffix}`;
let app;

const tokenVerifier = {
  async verify(token) {
    if (token !== "audit-token") {
      throw new AuthenticationError("invalid_signature", "Unknown test token");
    }
    return {
      issuer: "https://identity.test",
      subject,
      audiences: ["fairprocess-api"],
      expiresAt: 4_000_000_000,
    };
  },
};

before(async () => {
  if (!db) return;

  await db.query(
    "INSERT INTO tenants (id, name, kind) VALUES ($1, $2, 'advocate')",
    [tenantId, "Audit API tenant"],
  );
  await db.query(
    `INSERT INTO users
      (tenant_id, oidc_issuer, oidc_subject, email, display_name)
     VALUES
      ($1, 'https://identity.test', $2, 'audit@example.test', 'Audit Reviewer')`,
    [tenantId, subject],
  );
  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT u.tenant_id, u.id, r.id
       FROM users u
       JOIN roles r ON r.tenant_id = u.tenant_id
      WHERE u.oidc_subject = $1 AND r.name = 'auditor'`,
    [subject],
  );

  app = await buildApp({
    database: db,
    tokenVerifier,
    corsOrigins: [],
    logger: false,
  });
  await app.ready();
});

after(async () => {
  if (!db) return;
  if (app) await app.close();
  await db.query("DELETE FROM tenants WHERE id = $1", [tenantId]);
  await db.end();
});

test(
  "authenticated audit verification returns the complete verifier contract",
  { skip: !hasDatabase },
  async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/audit/verify-chain",
      headers: { authorization: "Bearer audit-token" },
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {
      status: "valid",
      valid: true,
      totalEvents: 0,
      legacyEvents: 0,
      verifiedEvents: 0,
    });
  },
);
