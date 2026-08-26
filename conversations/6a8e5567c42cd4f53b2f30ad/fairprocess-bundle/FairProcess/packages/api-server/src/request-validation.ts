import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export interface ValidationIssue {
  field: string;
  message: string;
}

type JsonObject = Record<string, unknown>;
type StringRules = {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  patternMessage?: string;
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const SHA256 = /^[a-fA-F0-9]{64}$/;
const INSTRUMENT_KINDS = [
  "notice_of_violation_and_proposed_penalty",
  "final_finding_and_order",
  "resolution_documentation",
  "administrative_civil_penalty_lien",
] as const;
const POLICY_STATUSES = [
  "draft",
  "legal_review_required",
  "active",
  "deprecated",
  "superseded",
] as const;
const RECORDS_STATUSES = [
  "draft",
  "submitted",
  "acknowledged",
  "clarification_requested",
  "partially_produced",
  "completed",
  "no_response_recorded",
  "closed",
] as const;

const VALIDATED_ROUTES = new Set([
  "POST /api/cases",
  "POST /api/cases/:id/expectations",
  "POST /api/cases/:id/recorder-csv",
  "POST /api/cases/:id/audit",
  "POST /api/cases/:id/evidence",
  "POST /api/policies",
  "POST /api/records-requests",
  "PATCH /api/records-requests/:id",
  "POST /api/cases/:id/correspondence",
]);

export function validateRequestBody(routeKey: string, body: unknown): ValidationIssue[] {
  if (!VALIDATED_ROUTES.has(routeKey)) return [];
  if (!isObject(body)) return [{ field: "$", message: "Request body must be a JSON object" }];

  const issues: ValidationIssue[] = [];
  switch (routeKey) {
    case "POST /api/cases":
      validateCase(body, issues);
      break;
    case "POST /api/cases/:id/expectations":
      validateExpectation(body, issues);
      break;
    case "POST /api/cases/:id/recorder-csv":
      validateRecorderImport(body, issues);
      break;
    case "POST /api/cases/:id/audit":
      stringField(body, "policyBundleId", issues, { max: 200 });
      break;
    case "POST /api/cases/:id/evidence":
      validateEvidence(body, issues);
      break;
    case "POST /api/policies":
      validatePolicy(body, issues);
      break;
    case "POST /api/records-requests":
      validateRecordsRequest(body, issues);
      break;
    case "PATCH /api/records-requests/:id":
      validateRecordsPatch(body, issues);
      break;
    case "POST /api/cases/:id/correspondence":
      validateCorrespondence(body, issues);
      break;
  }
  return issues;
}

export function installRequestValidation(app: FastifyInstance): void {
  app.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    const routeKey = `${request.method.toUpperCase()} ${request.routeOptions.url}`;
    const issues = validateRequestBody(routeKey, request.body);
    if (issues.length === 0) return;
    return reply.code(400).send({
      error: "invalid_request",
      message: "Request body failed validation",
      fields: issues,
    });
  });
}

function validateCase(body: JsonObject, issues: ValidationIssue[]): void {
  stringField(body, "id", issues, { max: 100, pattern: SAFE_ID });
  stringField(body, "jurisdiction", issues, { required: true, min: 2, max: 200 });
  stringField(body, "agency", issues, { max: 200 });
  stringField(body, "agencyCaseNumber", issues, { max: 200 });
  dateField(body, "asOf", issues, true);
  stringArray(body, "apns", issues, 50, 64);
}

function validateExpectation(body: JsonObject, issues: ValidationIssue[]): void {
  stringField(body, "ruleId", issues, { required: true, max: 200 });
  enumField(body, "instrumentKind", issues, INSTRUMENT_KINDS, true);
  dateField(body, "servedOn", issues, false);
  dateField(body, "becameFinalOn", issues, false);
  dateField(body, "resolvedOn", issues, false);
}

function validateRecorderImport(body: JsonObject, issues: ValidationIssue[]): void {
  stringField(body, "csv", issues, { required: true, min: 1, max: 5_000_000 });
  dateField(body, "searchedOn", issues, true);
  stringField(body, "source", issues, { required: true, min: 2, max: 2048 });
  enumField(body, "scope", issues, ["self_service_index", "certified_search", "agency_export", "unknown"], true);
  stringField(body, "notes", issues, { max: 5000 });
}

function validateEvidence(body: JsonObject, issues: ValidationIssue[]): void {
  stringField(body, "filename", issues, { required: true, min: 1, max: 512 });
  stringField(body, "contentType", issues, { required: true, min: 1, max: 255 });
  integerField(body, "sizeBytes", issues, 0, 250_000_000, true);
  stringField(body, "sha256", issues, {
    required: true,
    pattern: SHA256,
    patternMessage: "must be a 64-character hexadecimal SHA-256 digest",
  });
  stringField(body, "storagePath", issues, { required: true, min: 1, max: 2048 });
}

function validatePolicy(body: JsonObject, issues: ValidationIssue[]): void {
  stringField(body, "jurisdiction", issues, { required: true, min: 2, max: 200 });
  stringField(body, "policyVersion", issues, { required: true, min: 1, max: 100 });
  enumField(body, "activationStatus", issues, POLICY_STATUSES, false);
  if (!Array.isArray(body.rules)) {
    issues.push({ field: "rules", message: "must be an array" });
    return;
  }
  if (body.rules.length === 0 || body.rules.length > 250) {
    issues.push({ field: "rules", message: "must contain between 1 and 250 rules" });
  }
  body.rules.slice(0, 250).forEach((rule, index) => validatePolicyRule(rule, index, issues));
}

function validatePolicyRule(value: unknown, index: number, issues: ValidationIssue[]): void {
  const prefix = `rules[${index}]`;
  if (!isObject(value)) {
    issues.push({ field: prefix, message: "must be an object" });
    return;
  }
  stringField(value, "id", issues, { required: true, min: 1, max: 200 }, prefix);
  stringField(value, "citation", issues, { required: true, min: 1, max: 500 }, prefix);
  stringField(value, "sourceUrl", issues, { required: true, min: 1, max: 2048 }, prefix);
  enumField(value, "instrumentKind", issues, INSTRUMENT_KINDS, true, prefix);
  enumField(value, "triggerField", issues, ["servedOn", "becameFinalOn", "resolvedOn"], true, prefix);
  integerField(value, "earliestCalendarDaysAfterTrigger", issues, 0, 3650, true, prefix);
  booleanField(value, "recordingRequired", issues, true, prefix);
  booleanField(value, "legalReviewRequired", issues, true, prefix);
  stringField(value, "policyVersion", issues, { required: true, min: 1, max: 100 }, prefix);
}

function validateRecordsRequest(body: JsonObject, issues: ValidationIssue[]): void {
  stringField(body, "caseId", issues, { max: 100, pattern: SAFE_ID });
  stringField(body, "agency", issues, { required: true, min: 2, max: 300 });
  dateField(body, "submittedOn", issues, false);
  enumField(body, "status", issues, RECORDS_STATUSES, false);
  stringField(body, "notes", issues, { max: 20_000 });
}

function validateRecordsPatch(body: JsonObject, issues: ValidationIssue[]): void {
  enumField(body, "status", issues, RECORDS_STATUSES, false);
  stringField(body, "notes", issues, { max: 20_000 });
  dateField(body, "submitted_on", issues, false);
  if (body.status === undefined && body.notes === undefined && body.submitted_on === undefined) {
    issues.push({ field: "$", message: "at least one supported field is required" });
  }
}

function validateCorrespondence(body: JsonObject, issues: ValidationIssue[]): void {
  enumField(body, "direction", issues, ["incoming", "outgoing"], false);
  enumField(body, "channel", issues, ["email", "mail", "portal", "phone_log"], false);
  stringField(body, "subject", issues, { required: true, min: 1, max: 500 });
  stringField(body, "body", issues, { required: true, min: 1, max: 100_000 });
  booleanField(body, "draftedByAi", issues, false);
  stringField(body, "aiVersion", issues, { max: 200 });
}

function stringField(body: JsonObject, field: string, issues: ValidationIssue[], rules: StringRules, prefix?: string): void {
  const value = body[field];
  const name = qualify(prefix, field);
  if (value === undefined || value === null || value === "") {
    if (rules.required) issues.push({ field: name, message: "is required" });
    return;
  }
  if (typeof value !== "string") {
    issues.push({ field: name, message: "must be a string" });
    return;
  }
  if (rules.min !== undefined && value.trim().length < rules.min) {
    issues.push({ field: name, message: `must contain at least ${rules.min} character(s)` });
  }
  if (rules.max !== undefined && value.length > rules.max) {
    issues.push({ field: name, message: `must contain no more than ${rules.max} character(s)` });
  }
  if (rules.pattern && !rules.pattern.test(value)) {
    issues.push({ field: name, message: rules.patternMessage ?? "has an invalid format" });
  }
}

function dateField(body: JsonObject, field: string, issues: ValidationIssue[], required: boolean): void {
  const value = body[field];
  if (value === undefined || value === null || value === "") {
    if (required) issues.push({ field, message: "is required" });
    return;
  }
  if (typeof value !== "string" || !DATE_ONLY.test(value)) {
    issues.push({ field, message: "must use YYYY-MM-DD" });
    return;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    issues.push({ field, message: "must be a valid calendar date" });
  }
}

function enumField(body: JsonObject, field: string, issues: ValidationIssue[], allowed: readonly string[], required: boolean, prefix?: string): void {
  const value = body[field];
  const name = qualify(prefix, field);
  if (value === undefined || value === null || value === "") {
    if (required) issues.push({ field: name, message: "is required" });
    return;
  }
  if (typeof value !== "string" || !allowed.includes(value)) {
    issues.push({ field: name, message: `must be one of: ${allowed.join(", ")}` });
  }
}

function integerField(body: JsonObject, field: string, issues: ValidationIssue[], min: number, max: number, required: boolean, prefix?: string): void {
  const value = body[field];
  const name = qualify(prefix, field);
  if (value === undefined || value === null) {
    if (required) issues.push({ field: name, message: "is required" });
    return;
  }
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    issues.push({ field: name, message: `must be an integer between ${min} and ${max}` });
  }
}

function booleanField(body: JsonObject, field: string, issues: ValidationIssue[], required: boolean, prefix?: string): void {
  const value = body[field];
  const name = qualify(prefix, field);
  if (value === undefined || value === null) {
    if (required) issues.push({ field: name, message: "is required" });
    return;
  }
  if (typeof value !== "boolean") issues.push({ field: name, message: "must be a boolean" });
}

function stringArray(body: JsonObject, field: string, issues: ValidationIssue[], maxItems: number, itemMax: number): void {
  const value = body[field];
  if (!Array.isArray(value)) {
    issues.push({ field, message: "must be an array" });
    return;
  }
  if (value.length === 0 || value.length > maxItems) {
    issues.push({ field, message: `must contain between 1 and ${maxItems} items` });
  }
  value.slice(0, maxItems).forEach((item, index) => {
    if (typeof item !== "string" || item.trim().length === 0 || item.length > itemMax) {
      issues.push({ field: `${field}[${index}]`, message: `must be a non-empty string no longer than ${itemMax} characters` });
    }
  });
}

function qualify(prefix: string | undefined, field: string): string {
  return prefix ? `${prefix}.${field}` : field;
}

function isObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
