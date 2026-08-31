/**
 * Shared types for the FairProcess AI Worker.
 * These mirror the types in packages/fact-workbench and packages/case-model
 * so the worker can run independently on Cloudflare's edge runtime.
 */

export type FactType =
  | "service_date"
  | "finality_date"
  | "appeal_deadline"
  | "hearing_date"
  | "instrument_number"
  | "apn"
  | "owner_identity"
  | "monetary_amount"
  | "case_number"
  | "party_name"
  | "address"
  | "document_date"
  | "recorded_date"
  | "property_description"
  | "violation_description"
  | "penalty_amount"
  | "other";

export type DataType = "string" | "date" | "apn" | "number" | "boolean";

export interface ExtractedFact {
  factType: FactType;
  dataType: DataType;
  proposedValue: string;
  normalizedValue: string;
  excerpt: string;
  confidence: number;
}

export interface FactExtractionRequest {
  documentText: string;
  documentType?: string;
  caseContext?: {
    jurisdiction?: string;
    agency?: string;
    agencyCaseNumber?: string;
    knownApns?: string[];
  };
}

export interface FactExtractionResponse {
  facts: ExtractedFact[];
  model: string;
  promptVersion: string;
  warnings: string[];
}

export interface CorrespondenceDraftRequest {
  caseContext: {
    jurisdiction: string;
    agency?: string;
    agencyCaseNumber?: string;
    apns?: string[];
  };
  correspondenceType: "records_request" | "status_inquiry" | "follow_up" | "appeal_notice";
  tone: "formal" | "neutral" | "firm";
  recipient: {
    name?: string;
    title?: string;
    agency?: string;
    address?: string;
  };
  keyPoints: string[];
  priorCorrespondence?: string;
}

export interface CorrespondenceDraftResponse {
  subject: string;
  body: string;
  model: string;
  promptVersion: string;
  warnings: string[];
}

export interface ReportSummaryRequest {
  reportJson: Record<string, unknown>;
  audience: "analyst" | "supervisor" | "public_record";
}

export interface ReportSummaryResponse {
  summary: string;
  keyFindings: string[];
  model: string;
  promptVersion: string;
}

export interface EvidenceMatchRequest {
  candidateText: string;
  knownEvidence: Array<{ id: string; text: string; sha256: string }>;
}

export interface EvidenceMatchResponse {
  matches: Array<{ evidenceId: string; similarity: number }>;
  model: string;
}

export interface EvidenceUploadResponse {
  storagePath: string;
  sha256: string;
  sizeBytes: number;
  contentType: string;
  filename: string;
}

// ---------------------------------------------------------------------------
// Document Classification
// ---------------------------------------------------------------------------

export type DocumentType =
  | "notice_of_violation"
  | "compliance_order"
  | "abatement_notice"
  | "hearing_notice"
  | "appeal_notice"
  | "recorded_document"
  | "lien"
  | "deed"
  | "correspondence"
  | "public_records_request"
  | "public_records_response"
  | "settlement_agreement"
  | "court_order"
  | "other";

export interface DocClassificationRequest {
  documentText: string;
  filename?: string;
  caseContext?: {
    jurisdiction?: string;
    agency?: string;
    agencyCaseNumber?: string;
  };
}

export interface SuggestedMetadata {
  caseNumber?: string;
  apns?: string[];
  dates?: Array<{ type: string; value: string }>;
  parties?: string[];
  monetaryAmounts?: Array<{ description: string; amount: string }>;
}

export interface DocClassificationResponse {
  documentType: DocumentType;
  confidence: number;
  alternativeTypes: Array<{ type: DocumentType; confidence: number }>;
  keySignals: string[];
  suggestedMetadata: SuggestedMetadata;
  model: string;
  promptVersion: string;
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Deadline Watchdog
// ---------------------------------------------------------------------------

/** A single policy rule relevant to deadline computation. */
export interface DeadlineRule {
  ruleId: string;
  citation: string;
  instrumentKind: string;
  triggerField: "servedOn" | "becameFinalOn" | "resolvedOn" | string;
  earliestDaysAfterTrigger: number | null;
  maximumDaysAfterTrigger: number | null;
  recordingRequired: boolean;
  notes?: string;
}

export type DeadlineStatus = "OK" | "WARNING" | "CRITICAL" | "MISSED" | "AWAITING_TRIGGER" | "NOT_APPLICABLE";

export interface DeadlineItem {
  ruleId: string;
  citation: string;
  instrumentKind: string;
  triggerField: string;
  triggerDate: string | null;
  earliestRecordingDate: string | null;
  latestRecordingDate: string | null;
  actualRecordingDate: string | null;
  daysUntilEarliest: number | null;
  daysUntilLatest: number | null;
  status: DeadlineStatus;
  recordingRequired: boolean;
  explanation: string;
}

export interface DeadlineWatchdogRequest {
  /** Extracted facts from the case — dates as YYYY-MM-DD strings. */
  dates: {
    servedOn?: string;
    becameFinalOn?: string;
    resolvedOn?: string;
    recordedOn?: string;
    [key: string]: string | undefined;
  };
  /** Policy rules to evaluate. If omitted, uses default Humboldt rules. */
  rules?: DeadlineRule[];
  /** Override "now" for testing. Defaults to current date. */
  asOfDate?: string;
  /** Case context for AI summary. */
  caseContext?: {
    jurisdiction?: string;
    agency?: string;
    agencyCaseNumber?: string;
  };
}

export interface DeadlineWatchdogResponse {
  deadlines: DeadlineItem[];
  summary: string;
  missedCount: number;
  criticalCount: number;
  warningCount: number;
  okCount: number;
  awaitingCount: number;
  model: string;
  promptVersion: string;
  warnings: string[];
}


// ---------------------------------------------------------------------------
// Audit Narrative
// ---------------------------------------------------------------------------

export type NarrativePurpose = "legal_filing" | "appeal_brief" | "internal_memo" | "public_report";

export interface AuditNarrativeRequest {
  /** The integrity report JSON from the FairProcess audit engine. */
  reportJson: Record<string, unknown>;
  /** Case context for the narrative. */
  caseContext?: {
    jurisdiction?: string;
    agency?: string;
    agencyCaseNumber?: string;
    apns?: string[];
  };
  /** What the narrative will be used for. */
  purpose: NarrativePurpose;
  /** Additional context the analyst wants included. */
  additionalNotes?: string;
}

export interface AuditNarrativeResponse {
  title: string;
  proceduralBackground: string;
  findings: string;
  conclusion: string;
  model: string;
  promptVersion: string;
  warnings: string[];
}


// ---------------------------------------------------------------------------
// Ordinance Ingestion Pipeline
// ---------------------------------------------------------------------------

export interface OrdinanceIngestionRequest {
  /** Raw municipal code text — one or more sections of ordinance. */
  ordinanceText: string;
  /** Jurisdiction name (e.g., "Humboldt County, California"). */
  jurisdiction?: string;
  /** Agency name (e.g., "Humboldt County Code Enforcement Division"). */
  agency?: string;
  /** Source URL where the ordinance was retrieved. */
  sourceUrl?: string;
  /** Optional scope hint — what kind of ordinance this is. */
  scopeHint?: "code_enforcement" | "building" | "zoning" | "nuisance" | "general";
}

/** A simple deadline rule extracted from the ordinance. */
export interface IngestedDeadlineRule {
  id: string;
  citation: string;
  sourceUrl: string | null;
  instrumentKind: string;
  triggerField: "servedOn" | "becameFinalOn" | "resolvedOn" | string;
  earliestCalendarDaysAfterTrigger: number | null;
  maximumCalendarDaysAfterTrigger: number | null;
  recordingRequired: boolean;
  notes: string;
}

/** Rule type as defined in the policy engine. */
export type IngestedRuleType =
  | "timing"
  | "recordation"
  | "service"
  | "required-event"
  | "required-document"
  | "sequence"
  | "filing"
  | "appeal-window"
  | "finality"
  | "monetary-calculation"
  | "release";

/** A full policy-engine rule extracted from the ordinance. */
export interface IngestedFullRule {
  rule_id: string;
  name: string;
  jurisdiction: string;
  agency: string;
  proceeding_type: string;
  citation: string;
  source_document: string;
  source_url: string;
  source_excerpt: string;
  effective_start_date: string;
  effective_end_date: string | null;
  rule_type: IngestedRuleType;
  required_inputs: Record<string, unknown>;
  deterministic_expression: string;
  exceptions: string[];
  severity: "low" | "medium" | "high" | "critical";
  human_review_required: boolean;
  activation_state: "Draft" | "EngineeringReview" | "LegalReview";
}

export interface OrdinanceIngestionResponse {
  jurisdiction: string;
  agency: string;
  policyVersion: string;
  activationStatus: string;
  deadlineRules: IngestedDeadlineRule[];
  fullRules: IngestedFullRule[];
  summary: string;
  model: string;
  promptVersion: string;
  warnings: string[];
}

export interface Env {
  AI: Ai;
  DEFAULT_MODEL: string;
  ADVANCED_MODEL: string;
  EMBEDDING_MODEL: string;
  FAIRPROCESS_API_URL?: string;
  FAIRPROCESS_API_TOKEN?: string;
  API_KEY?: string;
  EVIDENCE_BUCKET?: R2Bucket;
}

// Document Classification
export interface ClassifyDocumentRequest {
  documentText: string;
  caseContext?: { jurisdiction?: string; agency?: string };
}
export interface ClassifyDocumentResponse {
  documentType: string; // e.g. 'notice_of_violation', 'lien', 'deed', 'appeal', 'correspondence', 'resolution', 'permit', 'inspection_report', 'other'
  documentTypeLabel: string; // human-readable
  confidence: number;
  keyFieldsDetected: string[]; // e.g. ['service_date', 'penalty_amount', 'apn']
  suggestedMetadata: { field: string; value: string; confidence: number }[];
  model: string;
  promptVersion: string;
  warnings: string[];
}

// Deadline Watchdog
export interface DeadlineWatchdogRequest {
  facts: ExtractedFact[]; // reuse existing type
  jurisdiction: string;
  policyRules?: Array<{ citation: string; instrumentKind: string; triggerField: string; earliestCalendarDaysAfterTrigger: number | null; maximumCalendarDaysAfterTrigger: number | null }>;
  asOfDate?: string; // YYYY-MM-DD, defaults to today
}
export interface DeadlineItem {
  rule: string;
  citation: string;
  instrumentKind: string;
  triggerDate: string | null;
  deadlineDate: string | null;
  daysRemaining: number | null;
  status: 'OK' | 'WARNING' | 'CRITICAL' | 'MISSED' | 'NOT_TRIGGERED';
  explanation: string;
}
export interface DeadlineWatchdogResponse {
  deadlines: DeadlineItem[];
  asOfDate: string;
  model: string;
  promptVersion: string;
  warnings: string[];
}

// Audit Narrative
export interface AuditNarrativeRequest {
  reportJson: Record<string, unknown>;
  caseContext?: { jurisdiction?: string; agency?: string; agencyCaseNumber?: string; apns?: string[] };
  format: 'legal_brief' | 'summary_memo' | 'public_statement';
}
export interface AuditNarrativeResponse {
  title: string;
  sections: { heading: string; body: string }[];
  model: string;
  promptVersion: string;
  warnings: string[];
}

// Ordinance Ingestion
export interface OrdinanceIngestRequest {
  ordinanceText: string;
  jurisdiction: string;
  agency?: string;
  sourceUrl?: string;
}
export interface GeneratedRule {
  id: string;
  citation: string;
  sourceUrl: string;
  instrumentKind: string;
  triggerField: string;
  earliestCalendarDaysAfterTrigger: number | null;
  maximumCalendarDaysAfterTrigger: number | null;
  recordingRequired: boolean;
  notes: string;
  ruleType: string; // maps to RuleType enum
  confidence: number;
  sourceExcerpt: string;
}
export interface OrdinanceIngestResponse {
  jurisdiction: string;
  policyVersion: string;
  activationStatus: 'legal_review_required';
  rules: GeneratedRule[];
  summary: string;
  model: string;
  promptVersion: string;
  warnings: string[];
}
