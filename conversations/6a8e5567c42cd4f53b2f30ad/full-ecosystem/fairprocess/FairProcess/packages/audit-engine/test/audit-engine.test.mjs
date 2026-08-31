import assert from "node:assert/strict";
import test from "node:test";

import {
  generateIntegrityReport,
  normalizeApn,
  parseAuditCase,
  parsePolicyBundle,
  parseRecorderCsv,
  renderIntegrityReportMarkdown,
} from "../dist/index.js";

const policy = parsePolicyBundle({
  jurisdiction: "Humboldt County, California",
  policyVersion: "test-policy",
  activationStatus: "legal_review_required",
  rules: [
    {
      id: "notice-rule",
      citation: "HCC § 352-4(c)",
      sourceUrl: "https://humboldt.county.codes/Code/352-4",
      instrumentKind: "notice_of_violation_and_proposed_penalty",
      triggerField: "servedOn",
      earliestCalendarDaysAfterTrigger: 10,
      recordingRequired: true,
    },
  ],
});

const caseInput = parseAuditCase({
  caseId: "synthetic-test-case",
  jurisdiction: "Humboldt County, California",
  asOf: "2026-07-16",
  apns: ["123-456-789-000"],
  recorderSearch: {
    searchedOn: "2026-07-16",
    source: "Synthetic test fixture",
    scope: "self_service_index",
  },
  expectations: [
    {
      ruleId: "notice-rule",
      instrumentKind: "notice_of_violation_and_proposed_penalty",
      servedOn: "2026-06-01",
    },
  ],
});

test("normalizes formatted APNs for matching", () => {
  assert.equal(normalizeApn("123-456-789-000"), "123456789000");
  assert.equal(normalizeApn(" 123 456 789 000 "), "123456789000");
});

test("parses quoted recorder CSV values and groups repeated instruments", () => {
  const records = parseRecorderCsv(
    'instrument_number,recorded_on,apn,instrument_kind,party\r\n' +
      '2026-001,2026-06-11,123456789000,notice_of_violation_and_proposed_penalty,"Example, Person"\r\n' +
      '2026-001,2026-06-11,999999999999,notice_of_violation_and_proposed_penalty,Second Party\r\n',
  );
  assert.equal(records.length, 1);
  assert.deepEqual(records[0].apns, ["123456789000", "999999999999"]);
  assert.equal(records[0].parties[0], "Example, Person");
});

test("matches an instrument by normalized APN and instrument kind", () => {
  const records = parseRecorderCsv(
    "instrument_number,recorded_on,apn,instrument_kind,party\n" +
      "2026-001,2026-06-11,123456789000,notice_of_violation_and_proposed_penalty,Test Party\n",
  );
  const report = generateIntegrityReport(caseInput, records, policy, "2026-07-16T12:00:00.000Z");
  assert.equal(report.findings[0].result.status, "recorded");
  assert.equal(report.recorderSearch.matchedInstrumentCount, 1);
});

test("does not match an instrument from a different APN", () => {
  const records = parseRecorderCsv(
    "instrument_number,recorded_on,apn,instrument_kind,party\n" +
      "2026-002,2026-06-11,999999999999,notice_of_violation_and_proposed_penalty,Other Party\n",
  );
  const report = generateIntegrityReport(caseInput, records, policy, "2026-07-16T12:00:00.000Z");
  assert.equal(report.findings[0].result.status, "not_located");
  assert.equal(report.recorderSearch.importedInstrumentCount, 1);
  assert.equal(report.recorderSearch.matchedInstrumentCount, 0);
});

test("preserves not-located and search-scope warnings", () => {
  const report = generateIntegrityReport(caseInput, [], policy, "2026-07-16T12:00:00.000Z");
  assert.equal(report.findings[0].result.status, "not_located");
  assert.ok(report.warnings.some((warning) => warning.includes("does not prove")));
  assert.ok(report.warnings.some((warning) => warning.includes("not identified as a certified")));
});

test("renders reviewable Markdown without breaking table cells", () => {
  const report = generateIntegrityReport(
    { ...caseInput, agencyCaseNumber: "A|B" },
    [],
    policy,
    "2026-07-16T12:00:00.000Z",
  );
  const markdown = renderIntegrityReportMarkdown(report);
  assert.match(markdown, /A\\\|B/);
  assert.match(markdown, /Human review/);
  assert.match(markdown, /not legal advice/i);
});

test("rejects an unknown policy rule instead of guessing", () => {
  const invalidCase = {
    ...caseInput,
    expectations: [{ ...caseInput.expectations[0], ruleId: "unknown-rule" }],
  };
  assert.throws(
    () => generateIntegrityReport(invalidCase, [], policy, "2026-07-16T12:00:00.000Z"),
    /Unknown policy rule/,
  );
});
