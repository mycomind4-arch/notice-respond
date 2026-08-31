import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { Database } from "@fairprocess/database";
import { buildApp } from "../dist/app.js";
import { AuthenticationError } from "../dist/oidc.js";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const db = hasDatabase ? new Database({ connectionString: process.env.DATABASE_URL }) : null;
const suffix = randomUUID();
const tenantId = `policy-lifecycle-${suffix}`;
const userSubject = `policy-lifecycle-user-${suffix}`;
const caseId = `policy-lifecycle-case-${suffix}`;
const oldActivePolicyId = `policy-old-active-${suffix}`;
const inactivePolicyId = `policy-inactive-${suffix}`;
const otherJurisdictionPolicyId = `policy-other-jurisdiction-${suffix}`;
const oldPolicyVersion = `old-${suffix}`;
const inactivePolicyVersion = `inactive-${suffix}`;
const otherJurisdictionPolicyVersion = `other-jurisdiction-${suffix}`;
const targetPolicyVersion = `target-${suffix}`;
const ruleId = `policy-rule-${suffix}`;
let app;
let targetPolicyId;

const identity = {
  issuer: "https://identity.test",
  subject: userSubject,
  audiences: ["fairprocess-api"],
  expiresAt: 4_000_000_000,
};

const tokenVerifier = {
  async verify(token) {
    if (token !== "policy-token") {
      throw new AuthenticationError("invalid_signature", "Unknown test token");
    }
    return identity;
  },
};

function policyRule(policyVersion) {
  return {
    id: ruleId,
    jurisdiction: "Humboldt County, California",
    citation: "HCC 352",
    sourceUrl: "https://example.invalid/hcc-352",
    instrumentKind: "notice_of_violation_and_proposed_penalty",
    triggerField: "servedOn",
    earliestCalendarDaysAfterTrigger: 0,
    recordingRequired: true,
    legalReviewRequired: true,
    policyVersion,
  };
}

before(async () => {
  if (!db) return;

  await db.query(
    "INSERT INTO tenants (id, name, kind) VALUES ($1, $2, 'agency')",
    [tenantId, "Policy Lifecycle Tenant"],
  );
  await db.query(
    `INSERT INTO users (tenant_id, oidc_issuer, oidc_subject, email, display_name)
     VALUES ($1, 'https://identity.test', $2, 'policy-lifecycle@example.test', 'Policy Lifecycle User')`,
    [tenantId, userSubject],
  );
  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT u.tenant_id, u.id, r.id
     FROM users u
     JOIN roles r ON r.tenant_id = u.tenant_id
     WHERE u.oidc_subject = $1
       AND r.name IN ('analyst', 'policy_editor', 'policy_approver')`,
    [userSubject],
  );
  await db.query(
    `INSERT INTO cases (id, tenant_id, jurisdiction, agency, agency_case_number, as_of)
     VALUES ($1, $2, 'Humboldt County, California', 'Planning', 'POLICY-LIFECYCLE', '2026-07-18')`,
    [caseId, tenantId],
  );
  await db.query(
    "INSERT INTO case_apns (case_id, apn, normalized) VALUES ($1, $2, $3)",
    [caseId, "123-456-789-000", "123456789000"],
  );
  await db.query(
    `INSERT INTO policy_bundles (id, jurisdiction, policy_version, activation_status, rules)
     VALUES
       ($1, 'Humboldt County, California', $2, 'active', $3::jsonb),
       ($4, 'Humboldt County, California', $5, 'legal_review_required', $6::jsonb),
       ($7, 'Shasta County, California', $8, 'active', $9::jsonb)`,
    [
      oldActivePolicyId,
      oldPolicyVersion,
      JSON.stringify([policyRule(oldPolicyVersion)]),
      inactivePolicyId,
      inactivePolicyVersion,
      JSON.stringify([policyRule(inactivePolicyVersion)]),
      otherJurisdictionPolicyId,
      otherJurisdictionPolicyVersion,
      JSON.stringify([policyRule(otherJurisdictionPolicyVersion)]),
    ],
  );

  app = await buildApp({
    database: db,
    tokenVerifier,
    corsOrigins: [],
    policyGovernanceTenantId: tenantId,
    logger: false,
  });
  await app.ready();
});

after(async () => {
  if (!db) return;
  if (app) await app.close();

  await db.query("DELETE FROM integrity_reports WHERE case_id = $1", [caseId]);

  await db.query("ALTER TABLE audit_events DISABLE TRIGGER audit_events_append_only");
  try {
    await db.query("DELETE FROM audit_events WHERE tenant_id = $1", [tenantId]);
  } finally {
    await db.query("ALTER TABLE audit_events ENABLE TRIGGER audit_events_append_only");
  }

  await db.query("DELETE FROM cases WHERE id = $1", [caseId]);
  await db.query(
    `DELETE FROM policy_bundles
     WHERE id IN ($1, $2, $3)
        OR policy_version = $4`,
    [oldActivePolicyId, inactivePolicyId, otherJurisdictionPolicyId, targetPolicyVersion],
  );
  await db.query("DELETE FROM tenants WHERE id = $1", [tenantId]);
  await db.end();
});

test("policy creation cannot bypass governed activation", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/policies",
    headers: { authorization: "Bearer policy-token" },
    payload: {
      jurisdiction: "Humboldt County, California",
      policyVersion: `illegal-active-${suffix}`,
      activationStatus: "active",
      rules: [policyRule(`illegal-active-${suffix}`)],
    },
  });

  assert.equal(response.statusCode, 400, response.body);
  assert.equal(response.json().error, "invalid_request");
});

test("draft creation records policy_created instead of policy_activated", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/policies",
    headers: { authorization: "Bearer policy-token" },
    payload: {
      jurisdiction: "Humboldt County, California",
      policyVersion: targetPolicyVersion,
      activationStatus: "draft",
      rules: [policyRule(targetPolicyVersion)],
    },
  });

  assert.equal(response.statusCode, 201, response.body);
  assert.equal(response.json().status, "draft");
  targetPolicyId = response.json().id;

  const audit = await db.query(
    `SELECT action, result
     FROM audit_events
     WHERE tenant_id = $1
       AND result->>'policyBundleId' = $2`,
    [tenantId, targetPolicyId],
  );
  assert.equal(audit.rows.length, 1);
  assert.equal(audit.rows[0].action, "policy_created");
  assert.equal(audit.rows[0].result.activationStatus, "draft");
});

test("inactive and cross-jurisdiction policies cannot be used for an audit", { skip: !hasDatabase }, async () => {
  for (const policyBundleId of [inactivePolicyId, otherJurisdictionPolicyId]) {
    const response = await app.inject({
      method: "POST",
      url: `/api/cases/${caseId}/audit`,
      headers: { authorization: "Bearer policy-token" },
      payload: { policyBundleId },
    });

    assert.equal(response.statusCode, 404, response.body);
    assert.equal(response.json().error, "No active policy bundle found for this case's jurisdiction");
  }
});

test("activation supersedes the previous active version transactionally", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "PATCH",
    url: `/api/policies/${targetPolicyId}/activate`,
    headers: { authorization: "Bearer policy-token" },
  });

  assert.equal(response.statusCode, 200, response.body);
  assert.equal(response.json().status, "active");
  assert.ok(response.json().supersededPolicyIds.includes(oldActivePolicyId));

  const policies = await db.query(
    `SELECT id, activation_status
     FROM policy_bundles
     WHERE id IN ($1, $2)`,
    [oldActivePolicyId, targetPolicyId],
  );
  const statuses = new Map(policies.rows.map((row) => [row.id, row.activation_status]));
  assert.equal(statuses.get(oldActivePolicyId), "superseded");
  assert.equal(statuses.get(targetPolicyId), "active");

  await assert.rejects(
    db.query(
      "UPDATE policy_bundles SET activation_status = 'active' WHERE id = $1",
      [inactivePolicyId],
    ),
    (error) => error?.code === "23505",
  );
});

test("active policy is used for explicit and automatic audits", { skip: !hasDatabase }, async () => {
  const expectation = await app.inject({
    method: "POST",
    url: `/api/cases/${caseId}/expectations`,
    headers: { authorization: "Bearer policy-token" },
    payload: {
      ruleId,
      instrumentKind: "notice_of_violation_and_proposed_penalty",
      servedOn: "2026-07-01",
    },
  });
  assert.equal(expectation.statusCode, 201, expectation.body);

  const explicit = await app.inject({
    method: "POST",
    url: `/api/cases/${caseId}/audit`,
    headers: { authorization: "Bearer policy-token" },
    payload: { policyBundleId: targetPolicyId },
  });
  assert.equal(explicit.statusCode, 201, explicit.body);

  const automatic = await app.inject({
    method: "POST",
    url: `/api/cases/${caseId}/audit`,
    headers: { authorization: "Bearer policy-token" },
    payload: {},
  });
  assert.equal(automatic.statusCode, 201, automatic.body);

  const reports = await db.query(
    `SELECT id, policy_bundle_id
     FROM integrity_reports
     WHERE id IN ($1, $2)`,
    [explicit.json().reportId, automatic.json().reportId],
  );
  assert.equal(reports.rows.length, 2);
  assert.ok(reports.rows.every((row) => row.policy_bundle_id === targetPolicyId));
});

test("PostgreSQL rejects inactive and cross-jurisdiction report policies", { skip: !hasDatabase }, async () => {
  for (const policyBundleId of [inactivePolicyId, otherJurisdictionPolicyId]) {
    await assert.rejects(
      db.query(
        `INSERT INTO integrity_reports
         (case_id, tenant_id, policy_bundle_id, report_json, report_markdown, status, summary)
         VALUES ($1, $2, $3, '{}'::jsonb, '# Invalid', 'generated', '{}'::jsonb)`,
        [caseId, tenantId, policyBundleId],
      ),
      /integrity report policy bundle must be active/,
    );
  }
});
