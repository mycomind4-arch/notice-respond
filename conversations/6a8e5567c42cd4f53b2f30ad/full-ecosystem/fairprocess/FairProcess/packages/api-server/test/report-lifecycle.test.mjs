import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { Database } from "@fairprocess/database";
import { buildApp } from "../dist/app.js";
import { AuthenticationError } from "../dist/oidc.js";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const db = hasDatabase ? new Database({ connectionString: process.env.DATABASE_URL }) : null;
const suffix = randomUUID();
const tenantId = `report-tenant-${suffix}`;
const caseId = `report-case-${suffix}`;
const authorizerSubject = `report-authorizer-${suffix}`;
const publisherSubject = `report-publisher-${suffix}`;
const generatedReportId = `report-generated-${suffix}`;
const reviewReportId = `report-review-${suffix}`;
const lifecycleReportId = `report-lifecycle-${suffix}`;
let app;
let authorizerUserId;
let publisherUserId;

const identities = new Map([
  ["authorizer-token", {
    issuer: "https://identity.test",
    subject: authorizerSubject,
    audiences: ["fairprocess-api"],
    expiresAt: 4_000_000_000,
  }],
  ["publisher-token", {
    issuer: "https://identity.test",
    subject: publisherSubject,
    audiences: ["fairprocess-api"],
    expiresAt: 4_000_000_000,
  }],
]);

const tokenVerifier = {
  async verify(token) {
    const identity = identities.get(token);
    if (!identity) throw new AuthenticationError("invalid_signature", "Unknown test token");
    return identity;
  },
};

before(async () => {
  if (!db) return;

  await db.query(
    "INSERT INTO tenants (id, name, kind) VALUES ($1, $2, 'advocate')",
    [tenantId, "Report Lifecycle Tenant"],
  );
  const users = await db.query(
    `INSERT INTO users (tenant_id, oidc_issuer, oidc_subject, email, display_name)
     VALUES ($1, 'https://identity.test', $2, 'authorizer@example.test', 'Report Authorizer'),
            ($1, 'https://identity.test', $3, 'publisher@example.test', 'Report Publisher')
     RETURNING id, oidc_subject`,
    [tenantId, authorizerSubject, publisherSubject],
  );
  authorizerUserId = users.rows.find((row) => row.oidc_subject === authorizerSubject).id;
  publisherUserId = users.rows.find((row) => row.oidc_subject === publisherSubject).id;

  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT u.tenant_id, u.id, r.id
     FROM users u
     JOIN roles r ON r.tenant_id = u.tenant_id
     WHERE u.oidc_subject = $1 AND r.name = 'attorney_reviewer'`,
    [authorizerSubject],
  );
  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT u.tenant_id, u.id, r.id
     FROM users u
     JOIN roles r ON r.tenant_id = u.tenant_id
     WHERE u.oidc_subject = $1 AND r.name = 'system_administrator'`,
    [publisherSubject],
  );
  await db.query(
    `INSERT INTO cases (id, tenant_id, jurisdiction, agency, agency_case_number, as_of)
     VALUES ($1, $2, 'Humboldt County, California', 'Planning', 'REPORT-1', '2026-07-18')`,
    [caseId, tenantId],
  );
  await db.query(
    `INSERT INTO integrity_reports
       (id, case_id, tenant_id, report_json, report_markdown, status, summary)
     VALUES
       ($1, $4, $5, '{}'::jsonb, '# Generated', 'generated', '{}'::jsonb),
       ($2, $4, $5, '{}'::jsonb, '# Review', 'human_review', '{}'::jsonb),
       ($3, $4, $5, '{}'::jsonb, '# Lifecycle', 'generated', '{}'::jsonb)`,
    [generatedReportId, reviewReportId, lifecycleReportId, caseId, tenantId],
  );

  app = await buildApp({
    database: db,
    tokenVerifier,
    corsOrigins: [],
    policyGovernanceTenantId: null,
    logger: false,
  });
  await app.ready();
});

after(async () => {
  if (!db) return;
  if (app) await app.close();

  await db.query("DELETE FROM integrity_reports WHERE case_id = $1", [caseId]);

  // Removing the case would otherwise update immutable audit rows through the
  // case_id foreign key. Delete disposable test audit events first.
  await db.query("ALTER TABLE audit_events DISABLE TRIGGER audit_events_append_only");
  try {
    await db.query("DELETE FROM audit_events WHERE tenant_id = $1", [tenantId]);
  } finally {
    await db.query("ALTER TABLE audit_events ENABLE TRIGGER audit_events_append_only");
  }

  await db.query("DELETE FROM cases WHERE id = $1", [caseId]);
  await db.query("DELETE FROM tenants WHERE id = $1", [tenantId]);
  await db.end();
});

test("a publisher cannot publish a generated report", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: `/api/reports/${generatedReportId}/publish`,
    headers: { authorization: "Bearer publisher-token" },
    payload: {},
  });

  assert.equal(response.statusCode, 404);
  assert.equal(response.json().error, "Report not found or not authorized");
  const stored = await db.query("SELECT status FROM integrity_reports WHERE id = $1", [generatedReportId]);
  assert.equal(stored.rows[0].status, "generated");
});

test("a publisher cannot publish a merely human-review report", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: `/api/reports/${reviewReportId}/publish`,
    headers: { authorization: "Bearer publisher-token" },
    payload: {},
  });

  assert.equal(response.statusCode, 404);
  const stored = await db.query("SELECT status FROM integrity_reports WHERE id = $1", [reviewReportId]);
  assert.equal(stored.rows[0].status, "human_review");
});

test("authorization records an explicit state and authorizer", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: `/api/reports/${lifecycleReportId}/authorize`,
    headers: { authorization: "Bearer authorizer-token" },
    payload: {},
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { id: lifecycleReportId, status: "authorized" });

  const stored = await db.query(
    "SELECT status, authorized_by, authorized_at FROM integrity_reports WHERE id = $1",
    [lifecycleReportId],
  );
  assert.equal(stored.rows[0].status, "authorized");
  assert.equal(stored.rows[0].authorized_by, authorizerUserId);
  assert.ok(stored.rows[0].authorized_at instanceof Date);
});

test("publication requires authorization and preserves the original authorizer", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: `/api/reports/${lifecycleReportId}/publish`,
    headers: { authorization: "Bearer publisher-token" },
    payload: {},
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { id: lifecycleReportId, status: "published" });

  const stored = await db.query(
    "SELECT status, authorized_by, published_at FROM integrity_reports WHERE id = $1",
    [lifecycleReportId],
  );
  assert.equal(stored.rows[0].status, "published");
  assert.equal(stored.rows[0].authorized_by, authorizerUserId);
  assert.ok(stored.rows[0].published_at instanceof Date);

  const audit = await db.query(
    `SELECT actor, human_authorized_by, result
     FROM audit_events
     WHERE tenant_id = $1
       AND action = 'report_published'
       AND result->>'reportId' = $2`,
    [tenantId, lifecycleReportId],
  );
  assert.equal(audit.rows.length, 1);
  assert.equal(audit.rows[0].actor, publisherUserId);
  assert.equal(audit.rows[0].human_authorized_by, authorizerUserId);
  assert.equal(audit.rows[0].result.status, "published");
});
