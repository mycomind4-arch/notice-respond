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
const tenantId = `case-atomic-${suffix}`;
const userSubject = `case-atomic-user-${suffix}`;
const existingCaseId = `case-atomic-existing-${suffix}`;
const failedCaseId = `case-atomic-failed-${suffix}`;
const policyId = `case-atomic-policy-${suffix}`;
const policyVersion = `case-atomic-policy-version-${suffix}`;
const ruleId = `case-atomic-rule-${suffix}`;
const triggerName = `fp_case_audit_fail_${identifierSuffix}`;
const functionName = `fp_case_audit_fail_fn_${identifierSuffix}`;
let app;

const identity = {
  issuer: "https://identity.test",
  subject: userSubject,
  audiences: ["fairprocess-api"],
  expiresAt: 4_000_000_000,
};

const tokenVerifier = {
  async verify(token) {
    if (token !== "case-atomic-token") {
      throw new AuthenticationError("invalid_signature", "Unknown test token");
    }
    return identity;
  },
};

const policyRule = {
  id: ruleId,
  citation: "HCC 352",
  sourceUrl: "https://example.invalid/hcc-352",
  instrumentKind: "notice_of_violation_and_proposed_penalty",
  triggerField: "servedOn",
  earliestCalendarDaysAfterTrigger: 0,
  recordingRequired: true,
  legalReviewRequired: true,
  policyVersion,
};

before(async () => {
  if (!db) return;

  await db.query(
    "INSERT INTO tenants (id, name, kind) VALUES ($1, $2, 'advocate')",
    [tenantId, "Atomic Case Workflow Tenant"],
  );
  await db.query(
    `INSERT INTO users (tenant_id, oidc_issuer, oidc_subject, email, display_name)
     VALUES ($1, 'https://identity.test', $2, 'case-atomic@example.test', 'Case Workflow Administrator')`,
    [tenantId, userSubject],
  );
  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT u.tenant_id, u.id, r.id
     FROM users u
     JOIN roles r ON r.tenant_id = u.tenant_id
     WHERE u.oidc_subject = $1
       AND r.name = 'system_administrator'`,
    [userSubject],
  );

  await db.query(
    `INSERT INTO cases (id, tenant_id, jurisdiction, agency, agency_case_number, as_of)
     VALUES ($1, $2, 'Humboldt County, California', 'Planning', 'CASE-ATOMIC', '2026-07-18')`,
    [existingCaseId, tenantId],
  );
  await db.query(
    "INSERT INTO case_apns (case_id, apn, normalized) VALUES ($1, $2, $3)",
    [existingCaseId, "123-456-789-000", "123456789000"],
  );
  await db.query(
    `INSERT INTO instrument_expectations
       (case_id, rule_id, instrument_kind, served_on)
     VALUES ($1, $2, 'notice_of_violation_and_proposed_penalty', '2026-07-01')`,
    [existingCaseId, ruleId],
  );
  await db.query(
    `INSERT INTO policy_bundles
       (id, jurisdiction, policy_version, activation_status, rules)
     VALUES ($1, 'Humboldt County, California', $2, 'active', $3::jsonb)`,
    [policyId, policyVersion, JSON.stringify([policyRule])],
  );

  await db.query(`
    CREATE FUNCTION ${functionName}()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF NEW.tenant_id = '${tenantId}'
         AND NEW.action::text IN (
           'case_created',
           'recorder_imported',
           'audit_run',
           'evidence_uploaded'
         ) THEN
        RAISE EXCEPTION 'injected case workflow audit failure';
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

  await db.query("ALTER TABLE audit_events DISABLE TRIGGER audit_events_append_only");
  try {
    await db.query("DELETE FROM audit_events WHERE tenant_id = $1", [tenantId]);
  } finally {
    await db.query("ALTER TABLE audit_events ENABLE TRIGGER audit_events_append_only");
  }

  await db.query("DELETE FROM cases WHERE id IN ($1, $2)", [existingCaseId, failedCaseId]);
  await db.query("DELETE FROM policy_bundles WHERE id = $1", [policyId]);
  await db.query("DELETE FROM tenants WHERE id = $1", [tenantId]);
  await db.end();
});

test("case and APNs roll back when case_created audit insertion fails", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/cases",
    headers: { authorization: "Bearer case-atomic-token" },
    payload: {
      id: failedCaseId,
      jurisdiction: "Humboldt County, California",
      agency: "Planning",
      agencyCaseNumber: "FAILED-CASE",
      asOf: "2026-07-18",
      apns: ["999-888-777-000"],
    },
  });

  assert.equal(response.statusCode, 500, response.body);

  const cases = await db.query("SELECT 1 FROM cases WHERE id = $1", [failedCaseId]);
  const apns = await db.query("SELECT 1 FROM case_apns WHERE case_id = $1", [failedCaseId]);
  assert.equal(cases.rows.length, 0);
  assert.equal(apns.rows.length, 0);
});

test("recorder search and instruments roll back when recorder_imported audit insertion fails", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: `/api/cases/${existingCaseId}/recorder-csv`,
    headers: { authorization: "Bearer case-atomic-token" },
    payload: {
      csv: [
        "instrument_number,recorded_on,apn,instrument_kind,party",
        "2026-0001,2026-07-02,123-456-789-000,notice_of_violation_and_proposed_penalty,Humboldt County",
      ].join("\n"),
      searchedOn: "2026-07-18",
      source: "Recorder test export",
      scope: "agency_export",
    },
  });

  assert.equal(response.statusCode, 500, response.body);

  const searches = await db.query("SELECT 1 FROM recorder_searches WHERE case_id = $1", [
    existingCaseId,
  ]);
  const instruments = await db.query(
    "SELECT 1 FROM recorder_instruments WHERE case_id = $1",
    [existingCaseId],
  );
  assert.equal(searches.rows.length, 0);
  assert.equal(instruments.rows.length, 0);
});

test("generated report rolls back when audit_run insertion fails", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: `/api/cases/${existingCaseId}/audit`,
    headers: { authorization: "Bearer case-atomic-token" },
    payload: { policyBundleId: policyId },
  });

  assert.equal(response.statusCode, 500, response.body);

  const reports = await db.query("SELECT 1 FROM integrity_reports WHERE case_id = $1", [
    existingCaseId,
  ]);
  assert.equal(reports.rows.length, 0);
});

test("evidence row rolls back when evidence_uploaded audit insertion fails", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: `/api/cases/${existingCaseId}/evidence`,
    headers: { authorization: "Bearer case-atomic-token" },
    payload: {
      filename: "notice.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      sha256: "0".repeat(64),
      storagePath: `${tenantId}/${existingCaseId}/notice.pdf`,
    },
  });

  assert.equal(response.statusCode, 500, response.body);

  const evidence = await db.query("SELECT 1 FROM evidence_documents WHERE case_id = $1", [
    existingCaseId,
  ]);
  assert.equal(evidence.rows.length, 0);
});
