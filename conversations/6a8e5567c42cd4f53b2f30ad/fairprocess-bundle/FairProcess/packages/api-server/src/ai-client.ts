/**
 * Client for the FairProcess AI Worker.
 *
 * The AI worker runs as a separate Cloudflare Worker with Workers AI bindings.
 * This client lets the API server call it for fact extraction, correspondence
 * drafting, and report summarization.
 *
 * Configuration via environment variables:
 *   AI_WORKER_URL   — base URL of the AI worker (e.g. https://fairprocess-ai.xxx.workers.dev)
 *   AI_WORKER_KEY   — shared API key for the AI worker
 */

export interface AiClientConfig {
  baseUrl: string;
  apiKey: string;
  fetcher?: typeof fetch;
}

export interface ExtractedFact {
  factType: string;
  dataType: string;
  proposedValue: string;
  normalizedValue: string;
  excerpt: string;
  confidence: number;
}

export interface FactExtractionResult {
  facts: ExtractedFact[];
  model: string;
  promptVersion: string;
  warnings: string[];
}

export interface CorrespondenceDraft {
  subject: string;
  body: string;
  model: string;
  promptVersion: string;
  warnings: string[];
}

export interface ReportSummary {
  summary: string;
  keyFindings: string[];
  model: string;
  promptVersion: string;
}

export interface ClassifyDocumentResult {
  documentType: string;
  documentTypeLabel: string;
  confidence: number;
  keyFieldsDetected: string[];
  suggestedMetadata: { field: string; value: string; confidence: number }[];
  model: string;
  promptVersion: string;
  warnings: string[];
}

export interface DeadlineItemResult {
  rule: string;
  citation: string;
  instrumentKind: string;
  triggerDate: string | null;
  deadlineDate: string | null;
  daysRemaining: number | null;
  status: 'OK' | 'WARNING' | 'CRITICAL' | 'MISSED' | 'NOT_TRIGGERED';
  explanation: string;
}

export interface DeadlineWatchdogResult {
  deadlines: DeadlineItemResult[];
  asOfDate: string;
  model: string;
  promptVersion: string;
  warnings: string[];
}

export interface AuditNarrativeResult {
  title: string;
  sections: { heading: string; body: string }[];
  model: string;
  promptVersion: string;
  warnings: string[];
}

export interface GeneratedRuleResult {
  id: string;
  citation: string;
  sourceUrl: string;
  instrumentKind: string;
  triggerField: string;
  earliestCalendarDaysAfterTrigger: number | null;
  maximumCalendarDaysAfterTrigger: number | null;
  recordingRequired: boolean;
  notes: string;
  ruleType: string;
  confidence: number;
  sourceExcerpt: string;
}

export interface OrdinanceIngestResult {
  jurisdiction: string;
  policyVersion: string;
  activationStatus: string;
  rules: GeneratedRuleResult[];
  summary: string;
  model: string;
  promptVersion: string;
  warnings: string[];
}

export class AiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetcher: typeof fetch;

  constructor(config: AiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.fetcher = config.fetcher ?? fetch;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env): AiClient | null {
    const baseUrl = env.AI_WORKER_URL?.trim();
    const apiKey = env.AI_WORKER_KEY?.trim();
    if (!baseUrl || !apiKey) return null;
    return new AiClient({ baseUrl, apiKey });
  }

  async extractFacts(params: {
    documentText: string;
    documentType?: string;
    caseContext?: {
      jurisdiction?: string;
      agency?: string;
      agencyCaseNumber?: string;
      knownApns?: string[];
    };
  }): Promise<FactExtractionResult> {
    return this.request("/ai/extract-facts", params);
  }

  async draftCorrespondence(params: {
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
  }): Promise<CorrespondenceDraft> {
    return this.request("/ai/draft-correspondence", params);
  }

  async summarizeReport(params: {
    reportJson: Record<string, unknown>;
    audience: "analyst" | "supervisor" | "public_record";
  }): Promise<ReportSummary> {
    return this.request("/ai/summarize-report", params);
  }

  async matchEvidence(params: {
    candidateText: string;
    knownEvidence: Array<{ id: string; text: string; sha256: string }>;
  }): Promise<{ matches: Array<{ evidenceId: string; similarity: number }>; model: string }> {
    return this.request("/ai/match-evidence", params);
  }

  async classifyDocument(params: {
    documentText: string;
    caseContext?: { jurisdiction?: string; agency?: string };
  }): Promise<ClassifyDocumentResult> {
    return this.request('/ai/classify-document', params);
  }

  async deadlineWatchdog(params: {
    facts: Array<{ factType: string; dataType: string; proposedValue: string; normalizedValue: string; excerpt: string; confidence: number }>;
    jurisdiction: string;
    policyRules?: Array<{ citation: string; instrumentKind: string; triggerField: string; earliestCalendarDaysAfterTrigger: number | null; maximumCalendarDaysAfterTrigger: number | null }>;
    asOfDate?: string;
  }): Promise<DeadlineWatchdogResult> {
    return this.request('/ai/deadline-watchdog', params);
  }

  async draftNarrative(params: {
    reportJson: Record<string, unknown>;
    caseContext?: { jurisdiction?: string; agency?: string; agencyCaseNumber?: string; apns?: string[] };
    format: 'legal_brief' | 'summary_memo' | 'public_statement';
  }): Promise<AuditNarrativeResult> {
    return this.request('/ai/draft-narrative', params);
  }

  async ingestOrdinance(params: {
    ordinanceText: string;
    jurisdiction: string;
    agency?: string;
    sourceUrl?: string;
  }): Promise<OrdinanceIngestResult> {
    return this.request('/ai/ingest-ordinance', params);
  }

  private async request<T>(path: string, body: unknown): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "request_failed" }));
      throw new Error(
        `AI worker request failed (${response.status}): ${(error as Record<string, string>).message || (error as Record<string, string>).error}`,
      );
    }

    return response.json() as Promise<T>;
  }
}
