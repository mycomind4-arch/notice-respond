import assert from "node:assert/strict";
import test from "node:test";

import { evaluateRecordation } from "../dist/index.js";

/**
 * Tests for the generic policy-engine evaluateRecordation function.
 *
 * The generic evaluator works with field names: recorded_date, trigger_date,
 * deadline_days, apn, search_limitations. The domain-specific recordation logic
 * (instrumentKind, servedOn, locatedInstruments, earliestRecordingDate, etc.)
 * lives in @fairprocess/audit-engine and has its own test suite there.
 */

const baseRule = {
  rule_id: "humboldt-rec-001",
  name: "Recordation after finality",
  jurisdiction: "Humboldt County, California",
  agency: "Planning and Building",
  proceeding_type: "code_enforcement",
  citation: "HCC § 352-4(c)",
  source_document: "Humboldt County Code",
  source_url: "https://humboldt.county.codes/Code/352-4",
  source_excerpt: "The instrument shall be recorded after finality.",
  effective_start_date: "2026-01-01",
  effective_end_date: null,
  rule_type: "recordation",
  required_inputs: {
    type: "object",
    properties: {
      recorded_date: { type: "string", format: "date" },
      trigger_date: { type: "string", format: "date" },
      apn: { type: "string" },
    },
    required: ["apn"],
  },
  deterministic_expression: "recorded_date > trigger_date AND recorded_date <= trigger_date + deadline_days",
  exceptions: [],
  output_statuses: ["Satisfied", "NotLocated", "AwaitingTrigger", "RecordedTooEarly", "RecordedAfterExpectedDeadline", "InsufficientEvidence"],
  severity: "high",
  human_review_required: false,
  legal_review_status: "Approved",
  drafted_by: "policy-engineer",
  reviewed_by: "legal-reviewer",
  approved_by: "policy-lead",
  policy_version: "2026-07-16-engineering-draft",
  test_suite: [],
  activation_state: "Active",
};

test("returns InsufficientEvidence when APN is missing", () => {
  const result = evaluateRecordation(baseRule, {
    recorded_date: "2026-06-15",
    trigger_date: "2026-06-01",
  });

  assert.equal(result.status, "InsufficientEvidence");
  assert.match(result.explanation, /APN/i);
});

test("returns NotLocated when recorded_date is missing", () => {
  const result = evaluateRecordation(baseRule, {
    apn: "123-456-789",
    trigger_date: "2026-06-01",
  });

  assert.equal(result.status, "NotLocated");
  assert.match(result.explanation, /not.*located|No recording/i);
});

test("returns AwaitingTrigger when trigger_date is missing", () => {
  const result = evaluateRecordation(baseRule, {
    apn: "123-456-789",
    recorded_date: "2026-06-15",
  });

  assert.equal(result.status, "AwaitingTrigger");
  assert.match(result.explanation, /trigger.*not.*established|AwaitingTrigger/i);
});

test("returns InsufficientEvidence for invalid date formats", () => {
  const result = evaluateRecordation(baseRule, {
    apn: "123-456-789",
    recorded_date: "not-a-date",
    trigger_date: "2026-06-01",
  });

  assert.equal(result.status, "InsufficientEvidence");
  assert.match(result.explanation, /Invalid date/i);
});

test("returns RecordedTooEarly when recording is before trigger", () => {
  const result = evaluateRecordation(baseRule, {
    apn: "123-456-789",
    recorded_date: "2026-05-25",
    trigger_date: "2026-06-01",
  });

  assert.equal(result.status, "RecordedTooEarly");
  assert.match(result.explanation, /before|early/i);
});

test("returns RecordedAfterExpectedDeadline when recording exceeds deadline", () => {
  const result = evaluateRecordation(baseRule, {
    apn: "123-456-789",
    recorded_date: "2026-08-15",
    trigger_date: "2026-06-01",
    deadline_days: 30,
  });

  assert.equal(result.status, "RecordedAfterExpectedDeadline");
  assert.match(result.explanation, /exceeds|deadline/i);
});

test("returns Satisfied when recording is within the allowed window", () => {
  const result = evaluateRecordation(baseRule, {
    apn: "123-456-789",
    recorded_date: "2026-06-15",
    trigger_date: "2026-06-01",
    deadline_days: 30,
  });

  assert.equal(result.status, "Satisfied");
  assert.match(result.explanation, /success|compl/i);
});

test("returns Satisfied when no deadline is specified", () => {
  const result = evaluateRecordation(baseRule, {
    apn: "123-456-789",
    recorded_date: "2026-12-15",
    trigger_date: "2026-06-01",
  });

  assert.equal(result.status, "Satisfied");
});

test("includes rule_id and policy_version in every result", () => {
  const result = evaluateRecordation(baseRule, {
    apn: "123-456-789",
    recorded_date: "2026-06-15",
    trigger_date: "2026-06-01",
  });

  assert.equal(result.rule_id, baseRule.rule_id);
  assert.equal(result.policy_version, baseRule.policy_version);
});

test("includes search_limitations in the result when provided", () => {
  const limitations = [
    { source_system: "recorder", query_parameter: "apn", scope_limitation: "self_service", limitation_reason: "partial_index" },
  ];
  const result = evaluateRecordation(baseRule, {
    apn: "123-456-789",
    trigger_date: "2026-06-01",
    search_limitations: limitations,
  });

  assert.equal(result.status, "NotLocated");
  assert.deepEqual(result.search_limitations, limitations);
});
