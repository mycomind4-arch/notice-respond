import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { Database } from "@fairprocess/database";
import { buildApp } from "../dist/app.js";
import { AuthenticationError } from "../dist/oidc.js";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const db = hasDatabase ? new Database({ connectionString: process.env.DATABASE_URL }) : null;
const suffix = randomUUID();
const identifierSuffix = suffix.replaceAll("-", "");
const tenantId = `report-atomic-${suffix}`;
const caseId = `report-atomic-case-${suffix}`;
const policyId = `report-atomic-policy-${suffix}`;
const policyVersion = `report-atomic-policy-version-${suffix}`;
const authorizerSubject = `report-atomic-authorizer-${suffix}`;
const publisherSubject = `report-atomic-publisher-${suffix}`;
const authorizeTargetId = `report-atomic-authorize-${suffix}`;
const priorPublishedId = `report-atomic-prior-${suffix}`;
const publishTargetId = `report-atomic-publish-${suffix}`;
const triggerName = `fp_report_audit_fail_${identifierSuffix}`;
const functionName = `fp_report_audit_fail_fn_${identifierSuffix}`;
let app;
let authorizerUserId;

const identities = new Map([
  [
    "report-authorizer-token",
    {
      issuer: "https://identity.test",
      subject: authorizerSubject,
      audiences: ["fairprocess-api"],
      expiresAt: 4_000_000_000,
    },
  ],
  [
    "report-publisher-token",
    {
      issuer: "https://identity.test",
      subject: publisherSubject,
      audiences: ["fairprocess-api"],
      expiresAt: 4_000_000_000,
    },
  ],
]);

const tokenVerifier = {
  async verify(token) {
    const identity = identities.get(token);
    if (!identity) {
      throw new AuthenticationError("invalid_signature", "Unknown test token");
    }
    return identity;
  },
};

before(async () => {
  if (!db) return;

  await db.query(
    "INSERT INTO tenants (id, name, kind) VALUES ($1, $2, 'advocate')",
    [tenantId, "Atomic Report Tenant"],
  );

  const users = await db.query(
    `INSERT INTO users (tenant_id, oidc_issuer, oidc_subject, email, display_name)
     VALUES
       ($1, 'https://identity.test', $2, 'report-authorizer@example.test', 'Report Authorizer'),
       ($1, 'https://identity.test', $3, 'report-publisher@example.test', 'Report Publisher')
     RETURNING id, oidc_subject`,
    [tenantId, authorizerSubject, publisherSubject],
  );
  authorizerUserId = users.rows.find((row) => row.oidc_subject === authorizerSubject).id;

  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT u.tenant_id, u.id, r.id
     FROM users u
     JOIN roles r ON r.tenant_id = u.tenant_id
     WHERE u.oidc_subject = $1
       AND r.name = 'attorney_reviewer'`,
    [authorizerSubject],
  );
  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT u.tenant_id, u.id, r.id
     FROM users u
     JOIN roles r ON r.tenant_id = u.tenant_id
     WHERE u.oidc_subject = $1
       AND r.name = 'system_administrator'`,
    [publisherSubject],
  );

  await db.query(
    `INSERT INTO cases (id, tenant_id, jurisdiction, agency, agency_case_number, as_of)
     VALUES ($1, $2, 'Humboldt County, California', 'Planning', 'REPORT-ATOMIC', '2026-07-18')`,
    [caseId, tenantId],
  );
  await db.query(
    `INSERT INTO policy_bundles
       (id, jurisdiction, policy_version, activation_status, rules)
     VALUES ($1, 'Humboldt County, California', $2, 'active', '[]'::jsonb)`,
    [policyId, policyVersion],
  );

  await db.query(
    `INSERT INTO integrity_reports
       (id, case_id, tenant_id, policy_bundle_id, report_json, report_markdown,
        status, authorized_by, authorized_at, published_at, summary)
     VALUES
       ($1, $4, $5, $6, '{}'::jsonb, '# Authorization target', 'generated',
        NULL, NULL, NULL, '{}'::jsonb),
       ($2, $4, $5, $6, '{}'::jsonb, '# Prior published report', 'published',
        $7, now() - interval '2 hours', now() - interval '1 hour', '{}'::jsonb),
       ($3, $4, $5, $6, '{}'::jsonb, '# Publication target', 'authorized',
        $7, now(), NULL, '{}'::jsonb)`,
    [
      authorizeTargetId,
      priorPublishedId,
      publishTargetId,
      caseId,
      tenantId,
      policyId,
      authorizerUserId,
    ],
  );

  await db.query(`
    CREATE FUNCTION ${functionName}()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF NEW.tenant_id = '${tenantId}'
         AND NEW.action::text IN ('report_authorized', 'report_published') THEN
        RAISE EXCEPTION 'injected report audit failure';
      END IF;
      RETURN NEW;
    END;
    $$;

    CREATE TRIGGER ${triggerName}
    BEFORE INSERT ON audit_events
    FOR EACH ROW
    EXECUTE FUNCTION ${functionName}();
  `);

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

  await db.query(`DROP TRIGGER IF EXISTS ${triggerName} ON audit_events`);
  await db.query(`DROP FUNCTION IF EXISTS ${functionName}()`);

  await db.query("DELETE FROM integrity_reports WHERE case_id = $1", [caseId]);

  await db.query("ALTER TABLE audit_events DISABLE TRIGGER audit_events_append_only");
  try {
    await db.query("DELETE FROM audit_events WHERE tenant_id = $1", [tenantId]);
  } finally {
    await db.query("ALTER TABLE audit_events ENABLE TRIGGER audit_events_append_only");
  }

  await db.query("DELETE FROM cases WHERE id = $1", [caseId]);
  await db.query("DELETE FROM policy_bundles WHERE id = $1", [policyId]);
  await db.query("DELETE FROM tenants WHERE id = $1", [tenantId]);
  await db.end();
});

test("report authorization rolls back when its audit event is rejected", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: `/api/reports/${authorizeTargetId}/authorize`,
    headers: { authorization: "Bearer report-authorizer-token" },
    payload: {},
  });

  assert.equal(response.statusCode, 500, response.body);

  const stored = await db.query(
    `SELECT status, authorized_by, authorized_at
     FROM integrity_reports
     WHERE id = $1`,
    [authorizeTargetId],
  );
  assert.equal(stored.rows[0].status, "generated");
  assert.equal(stored.rows[0].authorized_by, null);
  assert.equal(stored.rows[0].authorized_at, null);

  const audit = await db.query(
    "SELECT 1 FROM audit_events WHERE tenant_id = $1 AND action = 'report_authorized'",
    [tenantId],
  );
  assert.equal(audit.rows.length, 0);
});

test("publication and supersession roll back when audit insertion fails", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: `/api/reports/${publishTargetId}/publish`,
    headers: { authorization: "Bearer report-publisher-token" },
    payload: {},
  });

  assert.equal(response.statusCode, 500, response.body);

  const reports = await db.query(
    `SELECT id, status, published_at, superseded_by
     FROM integrity_reports
     WHERE id IN ($1, $2)`,
    [priorPublishedId, publishTargetId],
  );
  const byId = new Map(reports.rows.map((row) => [row.id, row]));

  assert.equal(byId.get(publishTargetId).status, "authorized");
  assert.equal(byId.get(publishTargetId).published_at, null);
  assert.equal(byId.get(publishTargetId).superseded_by, null);
  assert.equal(byId.get(priorPublishedId).status, "published");
  assert.equal(byId.get(priorPublishedId).superseded_by, null);

  const audit = await db.query(
    "SELECT 1 FROM audit_events WHERE tenant_id = $1 AND action = 'report_published'",
    [tenantId],
  );
  assert.equal(audit.rows.length, 0);
});
