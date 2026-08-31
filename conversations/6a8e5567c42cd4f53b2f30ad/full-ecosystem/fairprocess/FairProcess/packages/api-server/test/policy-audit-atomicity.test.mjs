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
const tenantId = `policy-atomic-${suffix}`;
const userSubject = `policy-atomic-user-${suffix}`;
const oldActivePolicyId = `policy-atomic-active-${suffix}`;
const targetPolicyId = `policy-atomic-target-${suffix}`;
const oldPolicyVersion = `atomic-old-${suffix}`;
const targetPolicyVersion = `atomic-target-${suffix}`;
const failedCreateVersion = `atomic-create-failure-${suffix}`;
const triggerName = `test_policy_audit_failure_${identifierSuffix}`;
const functionName = `test_policy_audit_failure_fn_${identifierSuffix}`;
let app;

const identity = {
  issuer: "https://identity.test",
  subject: userSubject,
  audiences: ["fairprocess-api"],
  expiresAt: 4_000_000_000,
};

const tokenVerifier = {
  async verify(token) {
    if (token !== "policy-atomic-token") {
      throw new AuthenticationError("invalid_signature", "Unknown test token");
    }
    return identity;
  },
};

function policyRule(policyVersion) {
  return {
    id: `atomic-rule-${suffix}`,
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
    [tenantId, "Atomic Policy Tenant"],
  );
  await db.query(
    `INSERT INTO users (tenant_id, oidc_issuer, oidc_subject, email, display_name)
     VALUES ($1, 'https://identity.test', $2, 'atomic-policy@example.test', 'Atomic Policy User')`,
    [tenantId, userSubject],
  );
  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT u.tenant_id, u.id, r.id
     FROM users u
     JOIN roles r ON r.tenant_id = u.tenant_id
     WHERE u.oidc_subject = $1
       AND r.name IN ('policy_editor', 'policy_approver')`,
    [userSubject],
  );
  await db.query(
    `INSERT INTO policy_bundles (id, jurisdiction, policy_version, activation_status, rules)
     VALUES
       ($1, 'Humboldt County, California', $2, 'active', $3::jsonb),
       ($4, 'Humboldt County, California', $5, 'draft', $6::jsonb)`,
    [
      oldActivePolicyId,
      oldPolicyVersion,
      JSON.stringify([policyRule(oldPolicyVersion)]),
      targetPolicyId,
      targetPolicyVersion,
      JSON.stringify([policyRule(targetPolicyVersion)]),
    ],
  );

  await db.query(`
    CREATE FUNCTION ${functionName}()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF NEW.tenant_id = '${tenantId}'
         AND NEW.action::text IN ('policy_created', 'policy_activated') THEN
        RAISE EXCEPTION 'injected policy audit failure';
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
    policyGovernanceTenantId: tenantId,
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

  await db.query(
    "DELETE FROM policy_bundles WHERE id IN ($1, $2) OR policy_version = $3",
    [oldActivePolicyId, targetPolicyId, failedCreateVersion],
  );
  await db.query("DELETE FROM tenants WHERE id = $1", [tenantId]);
  await db.end();
});

test("policy creation rolls back when its audit event is rejected", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/policies",
    headers: { authorization: "Bearer policy-atomic-token" },
    payload: {
      jurisdiction: "Humboldt County, California",
      policyVersion: failedCreateVersion,
      activationStatus: "draft",
      rules: [policyRule(failedCreateVersion)],
    },
  });

  assert.equal(response.statusCode, 500, response.body);

  const stored = await db.query(
    "SELECT 1 FROM policy_bundles WHERE policy_version = $1",
    [failedCreateVersion],
  );
  assert.equal(stored.rows.length, 0);

  const audit = await db.query(
    "SELECT 1 FROM audit_events WHERE tenant_id = $1 AND action = 'policy_created'",
    [tenantId],
  );
  assert.equal(audit.rows.length, 0);
});

test("policy activation and supersession roll back when audit insertion fails", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "PATCH",
    url: `/api/policies/${targetPolicyId}/activate`,
    headers: { authorization: "Bearer policy-atomic-token" },
  });

  assert.equal(response.statusCode, 500, response.body);

  const policies = await db.query(
    `SELECT id, activation_status, activated_by, activated_at
     FROM policy_bundles
     WHERE id IN ($1, $2)`,
    [oldActivePolicyId, targetPolicyId],
  );
  const byId = new Map(policies.rows.map((row) => [row.id, row]));
  assert.equal(byId.get(oldActivePolicyId).activation_status, "active");
  assert.equal(byId.get(targetPolicyId).activation_status, "draft");
  assert.equal(byId.get(targetPolicyId).activated_by, null);
  assert.equal(byId.get(targetPolicyId).activated_at, null);

  const audit = await db.query(
    "SELECT 1 FROM audit_events WHERE tenant_id = $1 AND action = 'policy_activated'",
    [tenantId],
  );
  assert.equal(audit.rows.length, 0);
});
