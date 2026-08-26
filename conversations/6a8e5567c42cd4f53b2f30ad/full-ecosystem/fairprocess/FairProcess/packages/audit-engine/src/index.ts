import { parseCsv } from "./csv.js";
import {
  type InstrumentKind,
  type LocatedInstrument,
  type RecordationResult,
  type RecordationRule,
  type TriggerField,
  type ImportedRecorderInstrument,
  type RecordationInput,
} from "./types.js";

export {
  type InstrumentKind,
  type LocatedInstrument,
  type RecordationResult,
  type RecordationRule,
  type TriggerField,
  type ImportedRecorderInstrument,
  type RecordationInput,
};

const REQUIRED_CSV_HEADERS = [
  "instrument_number",
  "recorded_on",
  "apn",
  "instrument_kind",
  "party",
] as const;

const INSTRUMENT_KINDS = new Set<InstrumentKind>([
  "notice_of_violation_and_proposed_penalty",
  "final_finding_and_order",
  "resolution_documentation",
  "administrative_civil_penalty_lien",
]);

const SEARCH_SCOPES = new Set<RecorderSearchScope>([
  "self_service_index",
  "certified_search",
  "agency_export",
  "unknown",
]);

export type RecorderSearchScope =
  | "self_service_index"
  | "certified_search"
  | "agency_export"
  | "unknown";

export interface RecorderSearch {
  searchedOn: string;
  source: string;
  scope: RecorderSearchScope;
  notes?: string;
}

export interface InstrumentExpectation {
  ruleId: string;
  instrumentKind: InstrumentKind;
  servedOn?: string;
  becameFinalOn?: string;
  resolvedOn?: string;
}

export interface AuditCaseInput {
  caseId: string;
  jurisdiction: string;
  agencyCaseNumber?: string;
  asOf: string;
  apns: string[];
  recorderSearch: RecorderSearch;
  expectations: InstrumentExpectation[];
}

export interface PolicyBundle {
  jurisdiction: string;
  policyVersion: string;
  activationStatus: string;
  rules: Array<
    Omit<RecordationRule, "jurisdiction" | "policyVersion" | "legalReviewRequired"> & {
      maximumCalendarDaysAfterTrigger?: number | null;
      notes?: string;
    }
  >;
}

export interface IntegrityFinding {
  expectation: InstrumentExpectation;
  result: RecordationResult;
  matchingRecorderInstruments: ImportedRecorderInstrument[];
}

export interface IntegrityReport {
  schemaVersion: "fairprocess.integrity-report.v1";
  generatedAt: string;
  case: AuditCaseInput;
  policy: {
    jurisdiction: string;
    version: string;
    activationStatus: string;
  };
  recorderSearch: RecorderSearch & {
    importedInstrumentCount: number;
    matchedInstrumentCount: number;
  };
  summary: Record<string, number>;
  findings: IntegrityFinding[];
  warnings: string[];
}

function assertObject(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value.trim();
}

function optionalString(value: unknown, label: string): string | undefined {
  if (value === undefined) return undefined;
  return requireString(value, label);
}

function requireDate(value: unknown, label: string): string {
  const date = requireString(value, label);
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`${label} must be a valid YYYY-MM-DD date`);
  }
  return date;
}

export function normalizeApn(value: string): string {
  const normalized = value.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  if (normalized.length === 0) {
    throw new Error("APN cannot be empty after normalization");
  }
  return normalized;
}

export function parseAuditCase(value: unknown): AuditCaseInput {
  assertObject(value, "Case input");
  assertObject(value.recorderSearch, "recorderSearch");

  if (!Array.isArray(value.apns) || value.apns.length === 0) {
    throw new Error("apns must contain at least one APN");
  }
  const apns = value.apns.map((apn, index) => requireString(apn, `apns[${index}]`));
  if (new Set(apns.map(normalizeApn)).size !== apns.length) {
    throw new Error("apns must be unique after normalization");
  }

  const scope = requireString(value.recorderSearch.scope, "recorderSearch.scope");
  if (!SEARCH_SCOPES.has(scope as RecorderSearchScope)) {
    throw new Error(`Unsupported recorder search scope: ${scope}`);
  }

  if (!Array.isArray(value.expectations) || value.expectations.length === 0) {
    throw new Error("expectations must contain at least one instrument expectation");
  }
  const expectations = value.expectations.map((candidate, index): InstrumentExpectation => {
    assertObject(candidate, `expectations[${index}]`);
    const instrumentKind = requireString(
      candidate.instrumentKind,
      `expectations[${index}].instrumentKind`,
    );
    if (!INSTRUMENT_KINDS.has(instrumentKind as InstrumentKind)) {
      throw new Error(`Unsupported instrument kind: ${instrumentKind}`);
    }

    const expectation: InstrumentExpectation = {
      ruleId: requireString(candidate.ruleId, `expectations[${index}].ruleId`),
      instrumentKind: instrumentKind as InstrumentKind,
    };
    const servedOn = optionalString(candidate.servedOn, `expectations[${index}].servedOn`);
    const becameFinalOn = optionalString(
      candidate.becameFinalOn,
      `expectations[${index}].becameFinalOn`,
    );
    const resolvedOn = optionalString(candidate.resolvedOn, `expectations[${index}].resolvedOn`);
    if (servedOn) expectation.servedOn = requireDate(servedOn, `expectations[${index}].servedOn`);
    if (becameFinalOn) {
      expectation.becameFinalOn = requireDate(
        becameFinalOn,
        `expectations[${index}].becameFinalOn`,
      );
    }
    if (resolvedOn) expectation.resolvedOn = requireDate(resolvedOn, `expectations[${index}].resolvedOn`);
    return expectation;
  });

  const ruleIds = expectations.map((expectation) => expectation.ruleId);
  if (new Set(ruleIds).size !== ruleIds.length) {
    throw new Error("expectations cannot repeat a ruleId");
  }

  const result: AuditCaseInput = {
    caseId: requireString(value.caseId, "caseId"),
    jurisdiction: requireString(value.jurisdiction, "jurisdiction"),
    asOf: requireDate(value.asOf, "asOf"),
    apns,
    recorderSearch: {
      searchedOn: requireDate(value.recorderSearch.searchedOn, "recorderSearch.searchedOn"),
      source: requireString(value.recorderSearch.source, "recorderSearch.source"),
      scope: scope as RecorderSearchScope,
    },
    expectations,
  };
  const agencyCaseNumber = optionalString(value.agencyCaseNumber, "agencyCaseNumber");
  const notes = optionalString(value.recorderSearch.notes, "recorderSearch.notes");
  if (agencyCaseNumber) result.agencyCaseNumber = agencyCaseNumber;
  if (notes) result.recorderSearch.notes = notes;
  return result;
}

export function parsePolicyBundle(value: unknown): PolicyBundle {
  assertObject(value, "Policy bundle");
  if (!Array.isArray(value.rules) || value.rules.length === 0) {
    throw new Error("Policy bundle must contain rules");
  }

  const jurisdiction = requireString(value.jurisdiction, "policy.jurisdiction");
  const policyVersion = requireString(value.policyVersion, "policy.policyVersion");
  const activationStatus = requireString(value.activationStatus, "policy.activationStatus");
  const rules = value.rules.map((candidate, index) => {
    assertObject(candidate, `policy.rules[${index}]`);
    const instrumentKind = requireString(candidate.instrumentKind, `policy.rules[${index}].instrumentKind`);
    const triggerField = requireString(candidate.triggerField, `policy.rules[${index}].triggerField`);
    const offset = candidate.earliestCalendarDaysAfterTrigger;
    if (!INSTRUMENT_KINDS.has(instrumentKind as InstrumentKind)) {
      throw new Error(`Unsupported policy instrument kind: ${instrumentKind}`);
    }
    if (!(["servedOn", "becameFinalOn", "resolvedOn"] as string[]).includes(triggerField)) {
      throw new Error(`Unsupported policy trigger field: ${triggerField}`);
    }
    if (!Number.isInteger(offset) || (offset as number) < 0) {
      throw new Error(`policy.rules[${index}].earliestCalendarDaysAfterTrigger must be a non-negative integer`);
    }
    if (candidate.recordingRequired !== true) {
      throw new Error(`policy.rules[${index}].recordingRequired must be true`);
    }

    return {
      id: requireString(candidate.id, `policy.rules[${index}].id`),
      citation: requireString(candidate.citation, `policy.rules[${index}].citation`),
      sourceUrl: requireString(candidate.sourceUrl, `policy.rules[${index}].sourceUrl`),
      instrumentKind: instrumentKind as InstrumentKind,
      triggerField: triggerField as TriggerField,
      earliestCalendarDaysAfterTrigger: offset as number,
      recordingRequired: true,
      maximumCalendarDaysAfterTrigger:
        typeof candidate.maximumCalendarDaysAfterTrigger === "number"
          ? candidate.maximumCalendarDaysAfterTrigger
          : null,
      ...(typeof candidate.notes === "string" ? { notes: candidate.notes } : {}),
    };
  });

  const ids = rules.map((rule) => rule.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Policy rule ids must be unique");
  }
  return { jurisdiction, policyVersion, activationStatus, rules };
}

export function parseRecorderCsv(input: string): ImportedRecorderInstrument[] {
  const rows = parseCsv(input);
  if (rows.length === 0) {
    const header = input.split(/\r?\n/, 1)[0]?.split(",").map((value) => value.trim()) ?? [];
    for (const required of REQUIRED_CSV_HEADERS) {
      if (!header.includes(required)) throw new Error(`Recorder CSV is missing header: ${required}`);
    }
    return [];
  }
  for (const required of REQUIRED_CSV_HEADERS) {
    if (!(required in rows[0]!)) throw new Error(`Recorder CSV is missing header: ${required}`);
  }

  const instruments = new Map<string, ImportedRecorderInstrument>();
  for (const [index, row] of rows.entries()) {
    const instrumentNumber = requireString(row.instrument_number, `CSV row ${index + 2} instrument_number`);
    const recordedOn = requireDate(row.recorded_on, `CSV row ${index + 2} recorded_on`);
    const apn = requireString(row.apn, `CSV row ${index + 2} apn`);
    const kind = requireString(row.instrument_kind, `CSV row ${index + 2} instrument_kind`);
    if (!INSTRUMENT_KINDS.has(kind as InstrumentKind)) {
      throw new Error(`CSV row ${index + 2} has unsupported instrument_kind: ${kind}`);
    }

    const existing = instruments.get(instrumentNumber);
    if (existing) {
      if (existing.recordedOn !== recordedOn || existing.instrumentKind !== kind) {
        throw new Error(`Instrument ${instrumentNumber} has inconsistent date or kind across CSV rows`);
      }
      if (!existing.apns.some((value) => normalizeApn(value) === normalizeApn(apn))) existing.apns.push(apn);
      if (row.party && !existing.parties.includes(row.party)) existing.parties.push(row.party);
    } else {
      instruments.set(instrumentNumber, {
        instrumentNumber,
        recordedOn,
        apns: [apn],
        instrumentKind: kind as InstrumentKind,
        parties: row.party ? [row.party] : [],
      });
    }
  }
  return [...instruments.values()];
}

function buildRule(bundle: PolicyBundle, ruleId: string): RecordationRule {
  const rule = bundle.rules.find((candidate) => candidate.id === ruleId);
  if (!rule) throw new Error(`Unknown policy rule: ${ruleId}`);
  return {
    id: rule.id,
    jurisdiction: bundle.jurisdiction,
    citation: rule.citation,
    sourceUrl: rule.sourceUrl,
    instrumentKind: rule.instrumentKind,
    triggerField: rule.triggerField,
    earliestCalendarDaysAfterTrigger: rule.earliestCalendarDaysAfterTrigger,
    recordingRequired: rule.recordingRequired,
    legalReviewRequired: bundle.activationStatus !== "active",
    policyVersion: bundle.policyVersion,
  };
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function parseDateOnly(value: string, field: string): Date {
  if (!DATE_ONLY.test(value)) {
    throw new Error(`${field} must use YYYY-MM-DD`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`${field} is not a valid calendar date`);
  }
  return date;
}

function addCalendarDays(value: string, days: number): string {
  const date = parseDateOnly(value, "trigger date");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getTrigger(input: RecordationInput, field: TriggerField): string | undefined {
  return input[field];
}

export function evaluateRecordation(
  input: RecordationInput,
  rule: RecordationRule,
): RecordationResult {
  if (input.instrumentKind !== rule.instrumentKind) {
    throw new Error("The input instrument kind does not match the selected rule");
  }

  parseDateOnly(input.asOf, "asOf");
  const triggerDate = getTrigger(input, rule.triggerField);
  const base = {
    ruleId: rule.id,
    citation: rule.citation,
    sourceUrl: rule.sourceUrl,
    policyVersion: rule.policyVersion,
    humanReviewRequired: rule.legalReviewRequired,
  };

  if (!triggerDate) {
    return {
      ...base,
      status: "awaiting_trigger",
      explanation: `Cannot evaluate recordation until ${rule.triggerField} is verified.`,
    };
  }

  parseDateOnly(triggerDate, rule.triggerField);
  const earliestRecordingDate = addCalendarDays(
    triggerDate,
    rule.earliestCalendarDaysAfterTrigger,
  );

  // Validate before sorting so malformed dates cannot be silently ordered and
  // then fail partway through evaluation.
  for (const instrument of input.locatedInstruments) {
    parseDateOnly(instrument.recordedOn, "recordedOn");
  }

  const instruments = [...input.locatedInstruments].sort((a, b) =>
    a.recordedOn.localeCompare(b.recordedOn),
  );

  // Prefer any instrument recorded within the valid window. An earlier invalid
  // instrument must not mask a later valid recording.
  const validInstrument = instruments.find(
    (instrument) => instrument.recordedOn >= earliestRecordingDate,
  );

  if (validInstrument) {
    return {
      ...base,
      status: "recorded",
      triggerDate,
      earliestRecordingDate,
      matchedInstrument: validInstrument,
      explanation: "A recorder instrument was located on or after the earliest recording date.",
    };
  }

  const earliestInstrument = instruments[0];
  if (earliestInstrument) {
    return {
      ...base,
      status: "recorded_too_early",
      triggerDate,
      earliestRecordingDate,
      matchedInstrument: earliestInstrument,
      explanation:
        "All located instruments predate the rule's earliest recording date. Human review is required.",
    };
  }

  if (input.asOf < earliestRecordingDate) {
    return {
      ...base,
      status: "not_yet_eligible",
      triggerDate,
      earliestRecordingDate,
      explanation: "The rule's earliest recording date has not yet arrived.",
    };
  }

  return {
    ...base,
    status: "not_located",
    triggerDate,
    earliestRecordingDate,
    explanation:
      "No matching instrument was located in the supplied search results. This is not proof that no record exists.",
  };
}

export function generateIntegrityReport(
  caseInput: AuditCaseInput,
  recorderInstruments: ImportedRecorderInstrument[],
  policy: PolicyBundle,
  generatedAt: string,
): IntegrityReport {
  if (caseInput.jurisdiction !== policy.jurisdiction) {
    throw new Error("Case jurisdiction does not match policy jurisdiction");
  }
  const caseApns = new Set(caseInput.apns.map(normalizeApn));
  const findings = caseInput.expectations.map((expectation): IntegrityFinding => {
    const rule = buildRule(policy, expectation.ruleId);
    if (rule.instrumentKind !== expectation.instrumentKind) {
      throw new Error(`Expectation ${expectation.ruleId} instrument kind does not match its policy rule`);
    }
    const matches = recorderInstruments.filter(
      (instrument) =>
        instrument.instrumentKind === expectation.instrumentKind &&
        instrument.apns.some((apn) => caseApns.has(normalizeApn(apn))),
    );
    const result = evaluateRecordation(
      {
        instrumentKind: expectation.instrumentKind,
        asOf: caseInput.asOf,
        ...(expectation.servedOn ? { servedOn: expectation.servedOn } : {}),
        ...(expectation.becameFinalOn ? { becameFinalOn: expectation.becameFinalOn } : {}),
        ...(expectation.resolvedOn ? { resolvedOn: expectation.resolvedOn } : {}),
        locatedInstruments: matches.map(({ instrumentNumber, recordedOn }) => ({ instrumentNumber, recordedOn })),
      },
      rule,
    );
    return { expectation, result, matchingRecorderInstruments: matches };
  });

  const summary: Record<string, number> = {};
  for (const finding of findings) summary[finding.result.status] = (summary[finding.result.status] ?? 0) + 1;
  const warnings = [
    "This report is an evidence-management aid, not legal advice or an adjudication.",
    "A not_located result means no match appeared in the supplied data; it does not prove that no record exists.",
  ];
  if (caseInput.recorderSearch.scope !== "certified_search") {
    warnings.push("The supplied recorder search was not identified as a certified search.");
  }
  if (policy.activationStatus !== "active") {
    warnings.push(`Policy status is ${policy.activationStatus}; legal review is required before relying on conclusions.`);
  }

  return {
    schemaVersion: "fairprocess.integrity-report.v1",
    generatedAt,
    case: caseInput,
    policy: {
      jurisdiction: policy.jurisdiction,
      version: policy.policyVersion,
      activationStatus: policy.activationStatus,
    },
    recorderSearch: {
      ...caseInput.recorderSearch,
      importedInstrumentCount: recorderInstruments.length,
      matchedInstrumentCount: new Set(
        findings.flatMap((finding) => finding.matchingRecorderInstruments.map((item) => item.instrumentNumber)),
      ).size,
    },
    summary,
    findings,
    warnings,
  };
}

function escapeMarkdown(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function renderIntegrityReportMarkdown(report: IntegrityReport): string {
  const lines = [
    "# FairProcess Recordation Integrity Report",
    "",
    `- Case ID: ${escapeMarkdown(report.case.caseId)}`,
    `- Agency case: ${escapeMarkdown(report.case.agencyCaseNumber ?? "Not supplied")}`,
    `- Jurisdiction: ${escapeMarkdown(report.case.jurisdiction)}`,
    `- APN(s): ${report.case.apns.map(escapeMarkdown).join(", ")}`,
    `- As of: ${report.case.asOf}`,
    `- Generated: ${escapeMarkdown(report.generatedAt)}`,
    `- Policy: ${escapeMarkdown(report.policy.version)} (${escapeMarkdown(report.policy.activationStatus)})`,
    "",
    "## Recorder search",
    "",
    `- Searched on: ${report.recorderSearch.searchedOn}`,
    `- Scope: ${report.recorderSearch.scope}`,
    `- Source: ${escapeMarkdown(report.recorderSearch.source)}`,
    `- Imported instruments: ${report.recorderSearch.importedInstrumentCount}`,
    `- Matched instruments: ${report.recorderSearch.matchedInstrumentCount}`,
  ];
  if (report.recorderSearch.notes) lines.push(`- Notes: ${escapeMarkdown(report.recorderSearch.notes)}`);

  lines.push(
    "",
    "## Findings",
    "",
    "| Rule | Expected instrument | Status | Located instrument | Earliest date | Review |",
    "| --- | --- | --- | --- | --- | --- |",
  );
  for (const finding of report.findings) {
    lines.push(
      `| ${escapeMarkdown(finding.result.citation)} | ${escapeMarkdown(finding.expectation.instrumentKind)} | ${finding.result.status} | ${escapeMarkdown(finding.result.matchedInstrument?.instrumentNumber ?? "Not located")} | ${finding.result.earliestRecordingDate ?? "Unknown"} | ${finding.result.humanReviewRequired ? "Required" : "Policy active"} |`,
    );
  }

  lines.push("", "## Finding details", "");
  for (const [index, finding] of report.findings.entries()) {
    lines.push(
      `### ${index + 1}. ${finding.result.citation}`,
      "",
      finding.result.explanation,
      "",
      `Source: ${finding.result.sourceUrl}`,
      "",
    );
  }

  lines.push("## Warnings", "");
  for (const warning of report.warnings) lines.push(`- ${warning}`);
  lines.push("", "## Human review", "", "Reviewer: ____________________", "", "Date: ____________________", "", "Notes:", "");
  return `${lines.join("\n")}\n`;
}
