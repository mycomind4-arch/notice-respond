import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { Database } from "@fairprocess/database";
import { buildApp } from "../dist/app.js";
import { AuthenticationError } from "../dist/oidc.js";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const db = hasDatabase ? new Database({ connectionString: process.env.DATABASE_URL }) : null;
const suffix = randomUUID();
const governanceTenant = `policy-governance-${suffix}`;
const otherTenant = `policy-other-${suffix}`;
const governanceSubject = `policy-governor-${suffix}`;
const otherSubject = `policy-other-user-${suffix}`;
const directPolicyId = `policy-direct-${suffix}`;
const directPolicyVersion = `direct-${suffix}`;
const createdPolicyVersion = `created-${suffix}`;
let app;
let unconfiguredApp;
let createdPolicyId;

const identities = new Map([
  ["governance-token", {
    issuer: "https://identity.test",
    subject: governanceSubject,
    audiences: ["fairprocess-api"],
    expiresAt: 4_000_000_000,
  }],
  ["other-token", {
    issuer: "https://identity.test",
    subject: otherSubject,
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

const policyRule = {
  id: `rule-${suffix}`,
  jurisdiction: "Humboldt County, California",
  citation: "HCC 352",
  sourceUrl: "https://example.invalid/hcc-352",
  instrumentKind: "notice_of_violation_and_proposed_penalty",
  triggerField: "servedOn",
  earliestCalendarDaysAfterTrigger: 0,
  recordingRequired: true,
  legalReviewRequired: true,
  policyVersion: createdPolicyVersion,
};

before(async () => {
  if (!db) return;

  await db.query(
    "INSERT INTO tenants (id, name, kind) VALUES ($1, $2, 'agency'), ($3, $4, 'advocate')",
    [governanceTenant, "Policy Governance", otherTenant, "Other Tenant"],
  );
  await db.query(
    `INSERT INTO users (tenant_id, oidc_issuer, oidc_subject, email, display_name)
     VALUES ($1, 'https://identity.test', $2, 'governance@example.test', 'Policy Governor'),
            ($3, 'https://identity.test', $4, 'other@example.test', 'Other Administrator')`,
    [governanceTenant, governanceSubject, otherTenant, otherSubject],
  );
  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT u.tenant_id, u.id, r.id
     FROM users u
     JOIN roles r ON r.tenant_id = u.tenant_id
     WHERE u.oidc_subject = $1 AND r.name IN ('policy_editor', 'policy_approver')`,
    [governanceSubject],
  );
  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT u.tenant_id, u.id, r.id
     FROM users u
     JOIN roles r ON r.tenant_id = u.tenant_id
     WHERE u.oidc_subject = $1 AND r.name IN ('policy_editor', 'policy_approver', 'tenant_administrator')`,
    [otherSubject],
  );
  await db.query(
    `INSERT INTO policy_bundles (id, jurisdiction, policy_version, activation_status, rules)
     VALUES ($1, 'Humboldt County, California', $2, 'draft', $3::jsonb)`,
    [directPolicyId, directPolicyVersion, JSON.stringify([{ ...policyRule, policyVersion: directPolicyVersion }])],
  );

  app = await buildApp({
    database: db,
    tokenVerifier,
    corsOrigins: [],
    policyGovernanceTenantId: governanceTenant,
    logger: false,
  });
  unconfiguredApp = await buildApp({
    database: db,
    tokenVerifier,
    corsOrigins: [],
    policyGovernanceTenantId: null,
    logger: false,
  });
  await app.ready();
  await unconfiguredApp.ready();
});

after(async () => {
  if (!db) return;
  if (app) await app.close();
  if (unconfiguredApp) await unconfiguredApp.close();
  await db.query("DELETE FROM policy_bundles WHERE id = $1 OR policy_version = $2", [directPolicyId, createdPolicyVersion]);

  // Production audit events remain append-only. The disposable test database
  // temporarily disables the trigger only to remove fixtures created by the API.
  await db.query("ALTER TABLE audit_events DISABLE TRIGGER audit_events_append_only");
  try {
    await db.query("DELETE FROM audit_events WHERE tenant_id IN ($1, $2)", [governanceTenant, otherTenant]);
  } finally {
    await db.query("ALTER TABLE audit_events ENABLE TRIGGER audit_events_append_only");
  }

  await db.query("DELETE FROM tenants WHERE id IN ($1, $2)", [governanceTenant, otherTenant]);
  await db.end();
});

test("the configured governance tenant can create a global policy bundle", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/policies",
    headers: { authorization: "Bearer governance-token" },
    payload: {
      jurisdiction: "Humboldt County, California",
      policyVersion: createdPolicyVersion,
      activationStatus: "legal_review_required",
      rules: [policyRule],
    },
  });

  assert.equal(response.statusCode, 201);
  createdPolicyId = response.json().id;
  const stored = await db.query("SELECT activation_status FROM policy_bundles WHERE id = $1", [createdPolicyId]);
  assert.equal(stored.rows[0].activation_status, "legal_review_required");
});

test("another tenant is denied policy creation even with wildcard administration", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/policies",
    headers: { authorization: "Bearer other-token" },
    payload: {
      jurisdiction: "Humboldt County, California",
      policyVersion: `denied-${suffix}`,
      activationStatus: "draft",
      rules: [{ ...policyRule, policyVersion: `denied-${suffix}` }],
    },
  });

  assert.equal(response.statusCode, 403);
  assert.equal(response.json().error, "policy_governance_tenant_required");
});

test("another tenant can read the shared policy catalog", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "GET",
    url: `/api/policies/${directPolicyId}`,
    headers: { authorization: "Bearer other-token" },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().id, directPolicyId);
});

test("only the governance tenant can activate a shared policy", { skip: !hasDatabase }, async () => {
  const denied = await app.inject({
    method: "PATCH",
    url: `/api/policies/${directPolicyId}/activate`,
    headers: { authorization: "Bearer other-token" },
  });
  assert.equal(denied.statusCode, 403);
  assert.equal(denied.json().error, "policy_governance_tenant_required");

  const allowed = await app.inject({
    method: "PATCH",
    url: `/api/policies/${directPolicyId}/activate`,
    headers: { authorization: "Bearer governance-token" },
  });
  assert.equal(allowed.statusCode, 200);
  assert.equal(allowed.json().status, "active");
});

test("policy mutation fails closed when no governance tenant is configured", { skip: !hasDatabase }, async () => {
  const response = await unconfiguredApp.inject({
    method: "POST",
    url: "/api/policies",
    headers: { authorization: "Bearer governance-token" },
    payload: {
      jurisdiction: "Humboldt County, California",
      policyVersion: `unconfigured-${suffix}`,
      activationStatus: "draft",
      rules: [{ ...policyRule, policyVersion: `unconfigured-${suffix}` }],
    },
  });

  assert.equal(response.statusCode, 403);
  assert.equal(response.json().error, "policy_governance_not_configured");
});
