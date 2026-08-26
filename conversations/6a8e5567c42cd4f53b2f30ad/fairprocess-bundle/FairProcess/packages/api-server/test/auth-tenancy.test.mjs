import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { Database } from "@fairprocess/database";
import { buildApp } from "../dist/app.js";
import { AuthenticationError } from "../dist/oidc.js";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const db = hasDatabase ? new Database({ connectionString: process.env.DATABASE_URL }) : null;
const suffix = randomUUID();
const tenantA = `tenant-a-${suffix}`;
const tenantB = `tenant-b-${suffix}`;
const subjectA = `subject-a-${suffix}`;
const subjectReadOnly = `subject-readonly-${suffix}`;
const caseA = `case-a-${suffix}`;
const caseB = `case-b-${suffix}`;
let app;

const identities = new Map([
  ["token-a", { issuer: "https://identity.test", subject: subjectA, audiences: ["fairprocess-api"], expiresAt: 4_000_000_000 }],
  ["token-readonly", { issuer: "https://identity.test", subject: subjectReadOnly, audiences: ["fairprocess-api"], expiresAt: 4_000_000_000 }],
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
    "INSERT INTO tenants (id, name, kind) VALUES ($1, $2, 'advocate'), ($3, $4, 'agency')",
    [tenantA, "Tenant A", tenantB, "Tenant B"],
  );
  await db.query(
    `INSERT INTO users (tenant_id, oidc_issuer, oidc_subject, email, display_name)
     VALUES ($1, 'https://identity.test', $2, 'analyst-a@example.test', 'Analyst A'),
            ($1, 'https://identity.test', $3, 'observer-a@example.test', 'Observer A')`,
    [tenantA, subjectA, subjectReadOnly],
  );
  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT u.tenant_id, u.id, r.id
     FROM users u
     JOIN roles r ON r.tenant_id = u.tenant_id
     WHERE u.oidc_subject = $1 AND r.name = 'analyst'`,
    [subjectA],
  );
  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT u.tenant_id, u.id, r.id
     FROM users u
     JOIN roles r ON r.tenant_id = u.tenant_id
     WHERE u.oidc_subject = $1 AND r.name = 'read_only_observer'`,
    [subjectReadOnly],
  );
  await db.query(
    `INSERT INTO cases (id, tenant_id, jurisdiction, agency, agency_case_number, as_of)
     VALUES ($1, $2, 'Humboldt County, California', 'Planning', 'A-1', '2026-07-17'),
            ($3, $4, 'Humboldt County, California', 'Planning', 'B-1', '2026-07-17')`,
    [caseA, tenantA, caseB, tenantB],
  );

  app = await buildApp({ database: db, tokenVerifier, corsOrigins: [], logger: false });
  await app.ready();
});

after(async () => {
  if (!db) return;
  if (app) await app.close();
  await db.query("DELETE FROM cases WHERE id IN ($1, $2)", [caseA, caseB]);
  await db.query("DELETE FROM tenants WHERE id IN ($1, $2)", [tenantA, tenantB]);
  await db.end();
});

test("protected API routes reject requests without a bearer token", { skip: !hasDatabase }, async () => {
  const response = await app.inject({ method: "GET", url: "/api/cases" });
  assert.equal(response.statusCode, 401);
});

test("authentication rejects invalid writes before request validation", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/cases",
    payload: {},
  });
  assert.equal(response.statusCode, 401);
  assert.equal(response.json().error, "authentication_required");
});

test("authenticated invalid writes return structured validation errors", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/cases",
    headers: { authorization: "Bearer token-a" },
    payload: {
      jurisdiction: "Humboldt County, California",
      asOf: "2026-02-30",
      apns: [],
    },
  });
  assert.equal(response.statusCode, 400);
  const body = response.json();
  assert.equal(body.error, "invalid_request");
  assert.ok(body.fields.some((issue) => issue.field === "asOf"));
  assert.ok(body.fields.some((issue) => issue.field === "apns"));
});

test("tenant identity comes from the authenticated user and ignores spoofed tenant headers", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "GET",
    url: "/api/cases",
    headers: {
      authorization: "Bearer token-a",
      "x-tenant-id": tenantB,
      "x-actor-id": "forged-actor",
    },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.deepEqual(body.cases.map((item) => item.case_id), [caseA]);
});

test("a user cannot read a case owned by another tenant", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "GET",
    url: `/api/cases/${caseB}`,
    headers: { authorization: "Bearer token-a" },
  });
  assert.equal(response.statusCode, 404);
});

test("a user cannot create child records under another tenant's case", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: `/api/cases/${caseB}/expectations`,
    headers: { authorization: "Bearer token-a" },
    payload: {
      ruleId: "humboldt-hcc-352-4-c",
      instrumentKind: "notice_of_violation_and_proposed_penalty",
      servedOn: "2026-07-01",
    },
  });

  assert.equal(response.statusCode, 404);
  const count = await db.query("SELECT COUNT(*)::int AS count FROM instrument_expectations WHERE case_id = $1", [caseB]);
  assert.equal(count.rows[0].count, 0);
});

test("read-only roles cannot create cases", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/cases",
    headers: { authorization: "Bearer token-readonly" },
    payload: {
      jurisdiction: "Humboldt County, California",
      agency: "Planning",
      asOf: "2026-07-17",
    },
  });

  assert.equal(response.statusCode, 403);
});

test("the authenticated principal is exposed without accepting actor headers", { skip: !hasDatabase }, async () => {
  const response = await app.inject({
    method: "GET",
    url: "/api/me",
    headers: { authorization: "Bearer token-a", "x-actor-id": "forged-actor" },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.tenantId, tenantA);
  assert.equal(body.displayName, "Analyst A");
  assert.ok(body.roles.includes("analyst"));
  assert.ok(body.permissions.includes("case:write"));
});
