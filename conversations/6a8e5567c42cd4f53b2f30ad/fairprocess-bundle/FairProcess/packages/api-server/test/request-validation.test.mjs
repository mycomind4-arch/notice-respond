import assert from "node:assert/strict";
import test from "node:test";

import { validateRequestBody } from "../dist/request-validation.js";

function fields(issues) {
  return issues.map((issue) => issue.field);
}

const validPolicyRule = {
  id: "rule-1",
  citation: "HCC 352",
  sourceUrl: "https://example.invalid/code",
  instrumentKind: "notice_of_violation_and_proposed_penalty",
  triggerField: "servedOn",
  earliestCalendarDaysAfterTrigger: 0,
  recordingRequired: true,
  legalReviewRequired: true,
  policyVersion: "2026-07-18",
};

test("accepts a bounded case creation request", () => {
  const issues = validateRequestBody("POST /api/cases", {
    jurisdiction: "Humboldt County, California",
    agency: "Planning and Building",
    agencyCaseNumber: "CE-2026-17",
    asOf: "2026-07-18",
    apns: ["123-456-789-000"],
  });
  assert.deepEqual(issues, []);
});

test("rejects malformed dates and empty APN collections", () => {
  const issues = validateRequestBody("POST /api/cases", {
    jurisdiction: "Humboldt County, California",
    asOf: "2026-02-30",
    apns: [],
  });
  assert.ok(fields(issues).includes("asOf"));
  assert.ok(fields(issues).includes("apns"));
});

test("bounds recorder imports and requires search provenance", () => {
  const issues = validateRequestBody("POST /api/cases/:id/recorder-csv", {
    csv: "",
    searchedOn: "July 18",
    source: "",
    scope: "everything",
  });
  assert.deepEqual(new Set(fields(issues)), new Set(["csv", "searchedOn", "source", "scope"]));
});

test("validates evidence hashes and sizes", () => {
  const issues = validateRequestBody("POST /api/cases/:id/evidence", {
    filename: "notice.pdf",
    contentType: "application/pdf",
    sizeBytes: -1,
    sha256: "not-a-hash",
    storagePath: "tenant/case/notice.pdf",
  });
  assert.ok(fields(issues).includes("sizeBytes"));
  assert.ok(fields(issues).includes("sha256"));
});

test("validates nested policy rules", () => {
  const issues = validateRequestBody("POST /api/policies", {
    jurisdiction: "Humboldt County, California",
    policyVersion: "2026-07-18",
    activationStatus: "draft",
    rules: [
      {
        ...validPolicyRule,
        instrumentKind: "invalid_kind",
        earliestCalendarDaysAfterTrigger: -1,
      },
    ],
  });
  assert.ok(fields(issues).includes("rules[0].instrumentKind"));
  assert.ok(fields(issues).includes("rules[0].earliestCalendarDaysAfterTrigger"));
});

test("accepts every policy activation status allowed by PostgreSQL", () => {
  for (const activationStatus of [
    "draft",
    "legal_review_required",
    "active",
    "deprecated",
    "superseded",
  ]) {
    const issues = validateRequestBody("POST /api/policies", {
      jurisdiction: "Humboldt County, California",
      policyVersion: `version-${activationStatus}`,
      activationStatus,
      rules: [{ ...validPolicyRule, policyVersion: `version-${activationStatus}` }],
    });
    assert.deepEqual(issues, [], activationStatus);
  }
});

test("accepts every correspondence channel allowed by PostgreSQL", () => {
  for (const channel of ["email", "mail", "portal", "phone_log"]) {
    const issues = validateRequestBody("POST /api/cases/:id/correspondence", {
      direction: "outgoing",
      channel,
      subject: "Records follow-up",
      body: "Please provide the requested records.",
      draftedByAi: false,
    });
    assert.deepEqual(issues, [], channel);
  }
});

test("rejects correspondence and policy enum values not supported by PostgreSQL", () => {
  assert.ok(fields(validateRequestBody("POST /api/cases/:id/correspondence", {
    direction: "outgoing",
    channel: "letter",
    subject: "Subject",
    body: "Body",
  })).includes("channel"));

  assert.ok(fields(validateRequestBody("POST /api/policies", {
    jurisdiction: "Humboldt County, California",
    policyVersion: "bad-status",
    activationStatus: "retired",
    rules: [{ ...validPolicyRule, policyVersion: "bad-status" }],
  })).includes("activationStatus"));
});

test("requires a JSON object only for routes with a validator", () => {
  assert.deepEqual(validateRequestBody("POST /api/cases", null), [
    { field: "$", message: "Request body must be a JSON object" },
  ]);
  assert.deepEqual(validateRequestBody("GET /api/cases", null), []);
});
