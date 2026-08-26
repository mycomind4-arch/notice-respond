import { Hono } from "hono";
import type {
  Env,
  FactExtractionRequest,
  FactExtractionResponse,
  CorrespondenceDraftRequest,
  CorrespondenceDraftResponse,
  ReportSummaryRequest,
  ReportSummaryResponse,
  EvidenceMatchRequest,
  EvidenceMatchResponse,
  EvidenceUploadResponse,
  ExtractedFact,
  DocClassificationRequest,
  DocClassificationResponse,
  DeadlineWatchdogRequest,
  DeadlineWatchdogResponse,
  DeadlineRule,
  DeadlineItem,
  DeadlineStatus,
  AuditNarrativeRequest,
  AuditNarrativeResponse,
  OrdinanceIngestionRequest,
  OrdinanceIngestionResponse,
} from "./types.js";
import {
  PROMPT_VERSION,
  FACT_EXTRACTION_SYSTEM,
  buildFactExtractionPrompt,
  CORRESPONDENCE_SYSTEM,
  buildCorrespondencePrompt,
  REPORT_SUMMARY_SYSTEM,
  buildReportSummaryPrompt,
  CLASSIFICATION_SYSTEM,
  buildClassificationPrompt,
  DEADLINE_SUMMARY_SYSTEM,
  buildDeadlineSummaryPrompt,
  AUDIT_NARRATIVE_SYSTEM,
  buildAuditNarrativePrompt,
  ORDINANCE_INGESTION_SYSTEM,
  buildOrdinanceIngestionPrompt,
} from "./prompts.js";

/**
 * FairProcess AI Worker
 *
 * Runs on Cloudflare Workers with Workers AI bindings.
 * Provides AI-assisted capabilities plus R2 evidence storage:
 *   1. Fact extraction from evidence documents
 *   2. Correspondence drafting
 *   3. Report summarization
 *   4. Evidence file upload/download via R2
 *   5. Document classification
 *   6. Deadline watchdog
 *   7. Audit narrative drafting
 *   8. Ordinance ingestion pipeline
 *
 * Safety boundary: this worker extracts facts and drafts text.
 * It never authorizes findings, publishes reports, or makes legal determinations.
 * Every output must be reviewed by a human before it enters the audit trail.
 */

const app = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Auth middleware — shared secret or FairProcess API token
// ---------------------------------------------------------------------------

app.use("/ai/*", async (c, next) => {
  if (c.env.API_KEY) {
    const auth = c.req.header("Authorization");
    const token = auth?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token || token !== c.env.API_KEY) {
      return c.json({ error: "unauthorized", message: "Invalid or missing API key" }, 401);
    }
  }
  await next();
});

app.use("/evidence/*", async (c, next) => {
  if (c.env.API_KEY) {
    const auth = c.req.header("Authorization");
    const token = auth?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token || token !== c.env.API_KEY) {
      return c.json({ error: "unauthorized", message: "Invalid or missing API key" }, 401);
    }
  }
  await next();
});

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

app.get("/health", (c) =>
  c.json({ status: "ok", service: "fairprocess-ai", timestamp: new Date().toISOString() }),
);

app.get("/ai/models", (c) =>
  c.json({
    default: c.env.DEFAULT_MODEL,
    advanced: c.env.ADVANCED_MODEL,
    embedding: c.env.EMBEDDING_MODEL,
    promptVersion: PROMPT_VERSION,
  }),
);

// ---------------------------------------------------------------------------
// R2 Evidence Storage
// ---------------------------------------------------------------------------

/**
 * POST /evidence/upload
 *
 * Accepts multipart form data:
 *   - file: the evidence file (binary)
 *   - caseId: UUID of the case (required)
 *   - tenantId: tenant ID (optional, defaults to "tenant-1")
 *
 * Returns the storage path, SHA-256 hash, and metadata that the client
 * can then send to the FairProcess API's /api/cases/:id/evidence endpoint.
 */
app.post("/evidence/upload", async (c) => {
  if (!c.env.EVIDENCE_BUCKET) {
    return c.json({ error: "r2_not_configured", message: "R2 evidence bucket is not bound to this worker" }, 503);
  }

  const formData = await c.req.formData();
  const rawFile = formData.get("file") as unknown as File | string | null;
  const caseId = formData.get("caseId");
  const tenantId = (formData.get("tenantId") as string) || "tenant-1";

  if (!rawFile || typeof rawFile === "string") {
    return c.json({ error: "invalid_request", message: "file is required (multipart upload)" }, 400);
  }
  if (!caseId) {
    return c.json({ error: "invalid_request", message: "caseId is required" }, 400);
  }

  const file = rawFile;
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Compute SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Generate evidence ID and storage path
  const evidenceId = crypto.randomUUID();
  const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${tenantId}/${caseId}/${evidenceId}/${safeFilename}`;

  // Store in R2
  await c.env.EVIDENCE_BUCKET.put(storagePath, bytes, {
    httpMetadata: {
      contentType: file.type || "application/octet-stream",
    },
    customMetadata: {
      caseId: caseId as string,
      tenantId,
      evidenceId,
      originalFilename: file.name,
      sha256,
    },
  });

  return c.json<EvidenceUploadResponse>({
    storagePath,
    sha256,
    sizeBytes: bytes.length,
    contentType: file.type || "application/octet-stream",
    filename: file.name,
  });
});

/**
 * GET /evidence/:path{.*}
 *
 * Retrieves an evidence file from R2 by its storage path.
 * Returns the file with appropriate content-type headers.
 */
app.get("/evidence/*", async (c) => {
  if (!c.env.EVIDENCE_BUCKET) {
    return c.json({ error: "r2_not_configured", message: "R2 evidence bucket is not bound to this worker" }, 503);
  }

  // Extract the path after /evidence/
  const fullPath = c.req.path;
  const storagePath = fullPath.replace(/^\/evidence\//, "");

  if (!storagePath) {
    return c.json({ error: "invalid_request", message: "storage path is required" }, 400);
  }

  const object = await c.env.EVIDENCE_BUCKET.get(storagePath);
  if (!object) {
    return c.json({ error: "not_found", message: "Evidence file not found" }, 404);
  }

  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
  headers.set("Content-Length", String(object.size));
  headers.set("ETag", object.etag);
  if (object.httpMetadata?.contentType) {
    headers.set("Content-Type", object.httpMetadata.contentType);
  }

  return new Response(object.body, { headers });
});

/**
 * DELETE /evidence/* 
 *
 * Deletes an evidence file from R2.
 */
app.delete("/evidence/*", async (c) => {
  if (!c.env.EVIDENCE_BUCKET) {
    return c.json({ error: "r2_not_configured", message: "R2 evidence bucket is not bound to this worker" }, 503);
  }

  const storagePath = c.req.path.replace(/^\/evidence\//, "");
  if (!storagePath) {
    return c.json({ error: "invalid_request", message: "storage path is required" }, 400);
  }

  await c.env.EVIDENCE_BUCKET.delete(storagePath);
  return c.json({ deleted: true, storagePath });
});

// ---------------------------------------------------------------------------
// POST /ai/extract-facts
// ---------------------------------------------------------------------------

app.post("/ai/extract-facts", async (c) => {
  const body = await c.req.json<FactExtractionRequest>();

  if (!body.documentText || body.documentText.trim().length === 0) {
    return c.json({ error: "invalid_request", message: "documentText is required" }, 400);
  }

  // Use advanced model for longer documents, default for shorter ones
  const model =
    body.documentText.length > 10_000 ? c.env.ADVANCED_MODEL : c.env.DEFAULT_MODEL;

  const prompt = buildFactExtractionPrompt(
    body.documentText,
    body.documentType,
    body.caseContext,
  );

  try {
    const response = await c.env.AI.run(model, {
      messages: [
        { role: "system", content: FACT_EXTRACTION_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.1, // Low temperature for factual extraction
      max_tokens: 4096,
    });

    const text = typeof response === "string" ? response : ((response as { response?: string })?.response ?? response);
    const parsed = parseJsonResponse<FactExtractionResponse>(text, {
      facts: [],
      model: c.env.DEFAULT_MODEL,
      promptVersion: PROMPT_VERSION,
      warnings: ["Failed to parse AI response as JSON"],
    });

    // Validate and sanitize extracted facts
    const facts = (parsed.facts || []).filter(isValidFact).map((fact) => ({
      ...fact,
      confidence: Math.min(Math.max(fact.confidence, 0), 1), // Clamp 0-1
    }));

    return c.json<FactExtractionResponse>({
      facts,
      model,
      promptVersion: PROMPT_VERSION,
      warnings: parsed.warnings || [],
    });
  } catch (error) {
    c.status(502);
    return c.json({
      error: "ai_inference_failed",
      message: error instanceof Error ? error.message : "Unknown error",
      model,
    });
  }
});

// ---------------------------------------------------------------------------
// POST /ai/draft-correspondence
// ---------------------------------------------------------------------------

app.post("/ai/draft-correspondence", async (c) => {
  const body = await c.req.json<CorrespondenceDraftRequest>();

  if (!body.caseContext?.jurisdiction) {
    return c.json({ error: "invalid_request", message: "caseContext.jurisdiction is required" }, 400);
  }
  if (!body.keyPoints || body.keyPoints.length === 0) {
    return c.json({ error: "invalid_request", message: "keyPoints must contain at least one item" }, 400);
  }

  const prompt = buildCorrespondencePrompt(body);
  const model = c.env.DEFAULT_MODEL;

  try {
    const response = await c.env.AI.run(model, {
      messages: [
        { role: "system", content: CORRESPONDENCE_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.3, // Slightly higher for natural language generation
      max_tokens: 4096,
    });

    const rawText = typeof response === "string" ? response : ((response as { response?: string })?.response ?? String(response));
    const parsed = parseCorrespondenceResponse(rawText, c.env.DEFAULT_MODEL);

    return c.json<CorrespondenceDraftResponse>({
      subject: parsed.subject || "Draft Correspondence",
      body: parsed.body || "",
      model,
      promptVersion: PROMPT_VERSION,
      warnings: parsed.warnings || [],
    });
  } catch (error) {
    c.status(502);
    return c.json({
      error: "ai_inference_failed",
      message: error instanceof Error ? error.message : "Unknown error",
      model,
    });
  }
});

// ---------------------------------------------------------------------------
// POST /ai/summarize-report
// ---------------------------------------------------------------------------

app.post("/ai/summarize-report", async (c) => {
  const body = await c.req.json<ReportSummaryRequest>();

  if (!body.reportJson) {
    return c.json({ error: "invalid_request", message: "reportJson is required" }, 400);
  }

  const prompt = buildReportSummaryPrompt(body.reportJson, body.audience || "analyst");
  const model = c.env.DEFAULT_MODEL;

  try {
    const response = await c.env.AI.run(model, {
      messages: [
        { role: "system", content: REPORT_SUMMARY_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    });

    const text = typeof response === "string" ? response : ((response as { response?: string })?.response ?? response);
    const parsed = parseJsonResponse<ReportSummaryResponse>(text, {
      summary: "",
      keyFindings: [],
      model: c.env.DEFAULT_MODEL,
      promptVersion: PROMPT_VERSION,
    });

    return c.json<ReportSummaryResponse>({
      summary: parsed.summary || "",
      keyFindings: parsed.keyFindings || [],
      model,
      promptVersion: PROMPT_VERSION,
    });
  } catch (error) {
    c.status(502);
    return c.json({
      error: "ai_inference_failed",
      message: error instanceof Error ? error.message : "Unknown error",
      model,
    });
  }
});

// ---------------------------------------------------------------------------
// POST /ai/match-evidence
// ---------------------------------------------------------------------------

app.post("/ai/match-evidence", async (c) => {
  const body = await c.req.json<EvidenceMatchRequest>();

  if (!body.candidateText || !body.knownEvidence || body.knownEvidence.length === 0) {
    return c.json<EvidenceMatchResponse>({ matches: [], model: c.env.EMBEDDING_MODEL });
  }

  try {
    // Generate embedding for the candidate text
    const candidateEmbedding = await c.env.AI.run(c.env.EMBEDDING_MODEL, {
      text: [body.candidateText],
    });

    // Generate embeddings for all known evidence
    const knownTexts = body.knownEvidence.map((e) => e.text);
    const knownEmbeddings = await c.env.AI.run(c.env.EMBEDDING_MODEL, {
      text: knownTexts,
    });

    const candidateVec = (candidateEmbedding.data as number[][])[0];
    const matches = body.knownEvidence.map((evidence, i) => ({
      evidenceId: evidence.id,
      similarity: cosineSimilarity(candidateVec, (knownEmbeddings.data as number[][])[i]),
    }));

    // Sort by similarity descending, filter low scores
    matches.sort((a, b) => b.similarity - a.similarity);
    const filtered = matches.filter((m) => m.similarity > 0.75);

    return c.json<EvidenceMatchResponse>({
      matches: filtered,
      model: c.env.EMBEDDING_MODEL,
    });
  } catch (error) {
    c.status(502);
    return c.json({
      error: "embedding_failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});


// ---------------------------------------------------------------------------
// POST /ai/classify-document
// ---------------------------------------------------------------------------

app.post("/ai/classify-document", async (c) => {
  const body = await c.req.json<DocClassificationRequest>();

  if (!body.documentText || body.documentText.trim().length === 0) {
    return c.json({ error: "invalid_request", message: "documentText is required" }, 400);
  }

  // Classification is a lighter task — use the default model
  const model = c.env.DEFAULT_MODEL;

  const prompt = buildClassificationPrompt(
    body.documentText,
    body.filename,
    body.caseContext,
  );

  try {
    const response = await c.env.AI.run(model, {
      messages: [
        { role: "system", content: CLASSIFICATION_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    });

    const text = typeof response === "string" ? response : ((response as { response?: string })?.response ?? response);
    const parsed = parseJsonResponse<DocClassificationResponse>(text, {
      documentType: "other",
      confidence: 0,
      alternativeTypes: [],
      keySignals: [],
      suggestedMetadata: {},
      model: c.env.DEFAULT_MODEL,
      promptVersion: PROMPT_VERSION,
      warnings: ["Failed to parse AI response as JSON"],
    });

    // Clamp confidence 0-1
    parsed.confidence = Math.min(Math.max(parsed.confidence, 0), 1);
    for (const alt of parsed.alternativeTypes || []) {
      alt.confidence = Math.min(Math.max(alt.confidence, 0), 1);
    }

    return c.json<DocClassificationResponse>({
      documentType: parsed.documentType || "other",
      confidence: parsed.confidence,
      alternativeTypes: parsed.alternativeTypes || [],
      keySignals: parsed.keySignals || [],
      suggestedMetadata: parsed.suggestedMetadata || {},
      model,
      promptVersion: PROMPT_VERSION,
      warnings: parsed.warnings || [],
    });
  } catch (error) {
    c.status(502);
    return c.json({
      error: "ai_inference_failed",
      message: error instanceof Error ? error.message : "Unknown error",
      model,
    });
  }
});


// ---------------------------------------------------------------------------
// POST /ai/deadline-watchdog
// ---------------------------------------------------------------------------

// Default Humboldt policy rules (used when caller doesn't provide their own)
const DEFAULT_HUMBOLDT_RULES: DeadlineRule[] = [
  {
    ruleId: "humboldt-hcc-352-4-c",
    citation: "HCC § 352-4(c)",
    instrumentKind: "notice_of_violation_and_proposed_penalty",
    triggerField: "servedOn",
    earliestDaysAfterTrigger: 10,
    maximumDaysAfterTrigger: null,
    recordingRequired: true,
    notes: "Earliest date but no explicit latest date.",
  },
  {
    ruleId: "humboldt-hcc-352-4-d-final-order",
    citation: "HCC § 352-4(d)",
    instrumentKind: "final_finding_and_order",
    triggerField: "becameFinalOn",
    earliestDaysAfterTrigger: 10,
    maximumDaysAfterTrigger: null,
    recordingRequired: true,
    notes: "Finality must be established from verified case documents.",
  },
  {
    ruleId: "humboldt-hcc-352-4-d-resolution",
    citation: "HCC § 352-4(d)",
    instrumentKind: "resolution_documentation",
    triggerField: "resolvedOn",
    earliestDaysAfterTrigger: 0,
    maximumDaysAfterTrigger: null,
    recordingRequired: true,
    notes: "Applies when allegations are unsubstantiated, dismissed, or resolved by settlement.",
  },
  {
    ruleId: "humboldt-hcc-352-23",
    citation: "HCC § 352-23",
    instrumentKind: "administrative_civil_penalty_lien",
    triggerField: "servedOn",
    earliestDaysAfterTrigger: 45,
    maximumDaysAfterTrigger: null,
    recordingRequired: true,
    notes: "Lien has force and effect only upon recordation.",
  },
];

// Reasonable default maximum (days) when policy doesn't specify one — used for watchdog alerts
const DEFAULT_MAX_DAYS = 90;

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(fromStr: string, toStr: string): number {
  const from = new Date(fromStr + "T00:00:00Z");
  const to = new Date(toStr + "T00:00:00Z");
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

function computeDeadlineStatus(
  triggerDate: string | null,
  earliestDays: number | null,
  maximumDays: number | null,
  actualRecordingDate: string | null,
  asOfDate: string,
): { status: DeadlineStatus; daysUntilEarliest: number | null; daysUntilLatest: number | null } {
  if (!triggerDate) {
    return { status: "AWAITING_TRIGGER", daysUntilEarliest: null, daysUntilLatest: null };
  }

  const earliest = earliestDays != null ? addDays(triggerDate, earliestDays) : null;
  const maxDays = maximumDays ?? DEFAULT_MAX_DAYS;
  const latest = addDays(triggerDate, maxDays);

  if (actualRecordingDate) {
    if (earliest && daysBetween(earliest, actualRecordingDate) < 0) {
      return { status: "OK", daysUntilEarliest: daysBetween(asOfDate, earliest), daysUntilLatest: daysBetween(asOfDate, latest) };
    }
    return { status: "OK", daysUntilEarliest: earliest ? daysBetween(asOfDate, earliest) : null, daysUntilLatest: daysBetween(asOfDate, latest) };
  }

  const daysUntilLatest = daysBetween(asOfDate, latest);
  const daysUntilEarliest = earliest ? daysBetween(asOfDate, earliest) : null;

  if (daysUntilLatest < 0) {
    return { status: "MISSED", daysUntilEarliest, daysUntilLatest };
  }
  if (daysUntilLatest <= 7) {
    return { status: "CRITICAL", daysUntilEarliest, daysUntilLatest };
  }
  if (daysUntilLatest <= 30) {
    return { status: "WARNING", daysUntilEarliest, daysUntilLatest };
  }
  return { status: "OK", daysUntilEarliest, daysUntilLatest };
}

app.post("/ai/deadline-watchdog", async (c) => {
  const body = await c.req.json<DeadlineWatchdogRequest>();

  if (!body.dates || Object.keys(body.dates).length === 0) {
    return c.json({ error: "invalid_request", message: "dates is required (at least one date field)" }, 400);
  }

  const rules = body.rules?.length ? body.rules : DEFAULT_HUMBOLDT_RULES;
  const asOfDate = body.asOfDate || new Date().toISOString().slice(0, 10);
  const actualRecordingDate = body.dates.recordedOn ?? null;

  // Compute each deadline deterministically
  const deadlines: DeadlineItem[] = rules.map((rule) => {
    const triggerDate = body.dates[rule.triggerField] ?? null;
    const earliest = rule.earliestDaysAfterTrigger != null && triggerDate
      ? addDays(triggerDate, rule.earliestDaysAfterTrigger)
      : null;
    const maxDays = rule.maximumDaysAfterTrigger ?? DEFAULT_MAX_DAYS;
    const latest = triggerDate ? addDays(triggerDate, maxDays) : null;

    const { status, daysUntilEarliest, daysUntilLatest } = computeDeadlineStatus(
      triggerDate,
      rule.earliestDaysAfterTrigger,
      rule.maximumDaysAfterTrigger,
      actualRecordingDate,
      asOfDate,
    );

    let explanation: string;
    switch (status) {
      case "AWAITING_TRIGGER":
        explanation = `Trigger field "${rule.triggerField}" has not been set — deadline cannot be computed yet.`;
        break;
      case "MISSED":
        explanation = `Recording window has elapsed (latest: ${latest}). No instrument located as of ${asOfDate}.`;
        break;
      case "CRITICAL":
        explanation = `Recording deadline in ${daysUntilLatest} day(s) (latest: ${latest}). No instrument located yet.`;
        break;
      case "WARNING":
        explanation = `Recording deadline in ${daysUntilLatest} day(s) (latest: ${latest}). No instrument located yet.`;
        break;
      case "OK":
        if (actualRecordingDate) {
          explanation = `Instrument located with recording date ${actualRecordingDate}.`;
        } else if (triggerDate && earliest && daysUntilEarliest != null && daysUntilEarliest > 0) {
          explanation = `Earliest recording in ${daysUntilEarliest} day(s) (${earliest}). Not yet required.`;
        } else {
          explanation = `Within expected recording window.`;
        }
        break;
      default:
        explanation = "Status unknown.";
    }

    return {
      ruleId: rule.ruleId,
      citation: rule.citation,
      instrumentKind: rule.instrumentKind,
      triggerField: rule.triggerField,
      triggerDate,
      earliestRecordingDate: earliest,
      latestRecordingDate: latest,
      actualRecordingDate,
      daysUntilEarliest,
      daysUntilLatest,
      status,
      recordingRequired: rule.recordingRequired,
      explanation,
    };
  });

  // Counts
  const missedCount = deadlines.filter(d => d.status === "MISSED").length;
  const criticalCount = deadlines.filter(d => d.status === "CRITICAL").length;
  const warningCount = deadlines.filter(d => d.status === "WARNING").length;
  const okCount = deadlines.filter(d => d.status === "OK").length;
  const awaitingCount = deadlines.filter(d => d.status === "AWAITING_TRIGGER").length;

  // Use AI for a plain-language summary
  const model = c.env.DEFAULT_MODEL;
  let summary = "";
  try {
    const prompt = buildDeadlineSummaryPrompt(
      deadlines.map(d => ({
        ruleId: d.ruleId,
        citation: d.citation,
        instrumentKind: d.instrumentKind,
        status: d.status,
        triggerDate: d.triggerDate,
        earliestRecordingDate: d.earliestRecordingDate,
        actualRecordingDate: d.actualRecordingDate,
        explanation: d.explanation,
      })),
      body.caseContext,
    );

    const response = await c.env.AI.run(model, {
      messages: [
        { role: "system", content: DEADLINE_SUMMARY_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    const text = typeof response === "string" ? response : ((response as { response?: string })?.response ?? response);
    const parsed = parseJsonResponse<{ summary: string }>(text, { summary: "" });
    summary = parsed.summary || "";
  } catch {
    // If AI fails, generate a fallback summary deterministically
    const parts: string[] = [];
    if (missedCount > 0) parts.push(`${missedCount} deadline(s) missed`);
    if (criticalCount > 0) parts.push(`${criticalCount} deadline(s) critical`);
    if (warningCount > 0) parts.push(`${warningCount} deadline(s) approaching`);
    if (okCount > 0) parts.push(`${okCount} deadline(s) on track`);
    if (awaitingCount > 0) parts.push(`${awaitingCount} deadline(s) awaiting trigger dates`);
    summary = parts.length ? parts.join(", ") + "." : "No deadlines to evaluate.";
  }

  const warnings: string[] = [];
  if (missedCount > 0) warnings.push(`${missedCount} recording deadline(s) have elapsed without a located instrument.`);

  return c.json<DeadlineWatchdogResponse>({
    deadlines,
    summary,
    missedCount,
    criticalCount,
    warningCount,
    okCount,
    awaitingCount,
    model,
    promptVersion: PROMPT_VERSION,
    warnings,
  });
});


// ---------------------------------------------------------------------------
// POST /ai/audit-narrative
// ---------------------------------------------------------------------------

app.post("/ai/audit-narrative", async (c) => {
  const body = await c.req.json<AuditNarrativeRequest>();

  if (!body.reportJson || typeof body.reportJson !== "object") {
    return c.json({ error: "invalid_request", message: "reportJson is required" }, 400);
  }

  // Narrative generation needs the advanced model for longer, structured output
  const reportStr = JSON.stringify(body.reportJson);
  const model = reportStr.length > 10_000 ? c.env.ADVANCED_MODEL : c.env.DEFAULT_MODEL;

  const prompt = buildAuditNarrativePrompt(
    body.reportJson,
    body.caseContext,
    body.purpose || "internal_memo",
    body.additionalNotes,
  );

  try {
    const response = await c.env.AI.run(model, {
      messages: [
        { role: "system", content: AUDIT_NARRATIVE_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    });

    const text = typeof response === "string" ? response : ((response as { response?: string })?.response ?? response);
    const parsed = parseJsonResponse<AuditNarrativeResponse>(text, {
      title: "",
      proceduralBackground: "",
      findings: "",
      conclusion: "",
      model: c.env.DEFAULT_MODEL,
      promptVersion: PROMPT_VERSION,
      warnings: ["Failed to parse AI response as JSON"],
    });

    return c.json<AuditNarrativeResponse>({
      title: parsed.title || "Procedural Integrity Narrative",
      proceduralBackground: parsed.proceduralBackground || "",
      findings: parsed.findings || "",
      conclusion: parsed.conclusion || "",
      model,
      promptVersion: PROMPT_VERSION,
      warnings: parsed.warnings || [],
    });
  } catch (error) {
    c.status(502);
    return c.json({
      error: "ai_inference_failed",
      message: error instanceof Error ? error.message : "Unknown error",
      model,
    });
  }
});


// ---------------------------------------------------------------------------
// POST /ai/ingest-ordinance
// ---------------------------------------------------------------------------

app.post("/ai/ingest-ordinance", async (c) => {
  const body = await c.req.json<OrdinanceIngestionRequest>();

  if (!body.ordinanceText || body.ordinanceText.trim().length < 50) {
    return c.json({ error: "invalid_request", message: "ordinanceText is required (min 50 chars)" }, 400);
  }

  // Ordinance ingestion needs the advanced model — it's complex extraction
  const model = body.ordinanceText.length > 5_000 ? c.env.ADVANCED_MODEL : c.env.DEFAULT_MODEL;

  const prompt = buildOrdinanceIngestionPrompt(
    body.ordinanceText,
    body.jurisdiction,
    body.agency,
    body.sourceUrl,
    body.scopeHint,
  );

  try {
    const response = await c.env.AI.run(model, {
      messages: [
        { role: "system", content: ORDINANCE_INGESTION_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 8192,
    });

    const text = typeof response === "string" ? response : ((response as { response?: string })?.response ?? response);
    const parsed = parseJsonResponse<OrdinanceIngestionResponse>(text, {
      jurisdiction: body.jurisdiction || "Unknown",
      agency: body.agency || "",
      policyVersion: new Date().toISOString().slice(0, 10) + "-ingested-draft",
      activationStatus: "legal_review_required",
      deadlineRules: [],
      fullRules: [],
      summary: "",
      model: c.env.DEFAULT_MODEL,
      promptVersion: PROMPT_VERSION,
      warnings: ["Failed to parse AI response as JSON"],
    });

    return c.json<OrdinanceIngestionResponse>({
      jurisdiction: parsed.jurisdiction || body.jurisdiction || "Unknown",
      agency: parsed.agency || body.agency || "",
      policyVersion: parsed.policyVersion || (new Date().toISOString().slice(0, 10) + "-ingested-draft"),
      activationStatus: "legal_review_required",
      deadlineRules: Array.isArray(parsed.deadlineRules) ? parsed.deadlineRules : [],
      fullRules: Array.isArray(parsed.fullRules) ? parsed.fullRules : [],
      summary: parsed.summary || "",
      model,
      promptVersion: PROMPT_VERSION,
      warnings: parsed.warnings || [],
    });
  } catch (error) {
    c.status(502);
    return c.json({
      error: "ai_inference_failed",
      message: error instanceof Error ? error.message : "Unknown error",
      model,
    });
  }
});


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Robust correspondence parser — handles malformed JSON from small LLMs
// ---------------------------------------------------------------------------
function parseCorrespondenceResponse(text: unknown, model: string): CorrespondenceDraftResponse {
  const str = typeof text === "string" ? text
    : text == null ? ""
    : typeof text === "object" ? (text as { response?: string })?.response ?? JSON.stringify(text)
    : String(text);

  // Try standard JSON parsing first
  const fallback = parseJsonResponse<CorrespondenceDraftResponse>(str, {
    subject: "",
    body: "",
    model,
    promptVersion: PROMPT_VERSION,
    warnings: [],
  });

  // If JSON parsing succeeded (has non-empty subject), use it
  if (fallback.subject) {
    return fallback;
  }

  // Fallback: extract subject and body using regex
  const subjectMatch = str.match(/"subject"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s);
  const bodyMatch = str.match(/"body"\s*:\s*"([\s\S]*?)"\s*(?:[,}]\s*"[\w]+")/);
  // Also try a looser body match — up to the next field or closing brace
  const bodyMatchLoose = str.match(/"body"\s*:\s*"([\s\S]*?)"\s*(?:[,}])/);

  const subject = subjectMatch?.[1]?.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\t/g, "\t") || "";
  const bodyRaw = (bodyMatch?.[1] || bodyMatchLoose?.[1] || "").replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\t/g, "\t");

  if (subject || bodyRaw) {
    return {
      subject: subject || "Draft Correspondence",
      body: bodyRaw,
      model,
      promptVersion: PROMPT_VERSION,
      warnings: bodyRaw ? [] : ["Could not extract body from AI response"],
    };
  }

  // Last resort: if the text looks like a letter (not JSON), use it as the body
  const trimmed = str.replace(/```[\s\S]*?```/g, "").trim();
  if (trimmed.length > 50 && !trimmed.startsWith("{")) {
    // Try to extract a subject from the first line
    const firstLine = trimmed.split("\n")[0];
    const subjectGuess = firstLine.replace(/^(Subject|Re|Regarding):\s*/i, "").slice(0, 100);
    return {
      subject: subjectGuess || "Draft Correspondence",
      body: trimmed,
      model,
      promptVersion: PROMPT_VERSION,
      warnings: ["AI response was not valid JSON — extracted plain text"],
    };
  }

  return {
    subject: "",
    body: "",
    model,
    promptVersion: PROMPT_VERSION,
    warnings: ["Failed to parse AI response"],
  };
}

function parseJsonResponse<T>(text: unknown, fallback: T): T {
  // Coerce to string — Cloudflare AI may return non-string response fields
  const str: string = typeof text === "string"
    ? text
    : text == null
      ? ""
      : typeof text === "object"
        ? (text as { response?: string })?.response ?? JSON.stringify(text)
        : String(text);

  // Try direct parse first
  try {
    return JSON.parse(str) as T;
  } catch {
    // Try to extract JSON from markdown code blocks
    const match = str.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1]!.trim()) as T;
      } catch {
        // fall through
      }
    }
    // Try to find the first { and last }
    const start = str.indexOf("{");
    const end = str.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(str.slice(start, end + 1)) as T;
      } catch {
        // fall through
      }
    }
  }
  return fallback;
}

function isValidFact(fact: unknown): fact is ExtractedFact {
  if (!fact || typeof fact !== "object") return false;
  const f = fact as Record<string, unknown>;
  return (
    typeof f.factType === "string" &&
    typeof f.dataType === "string" &&
    typeof f.proposedValue === "string" &&
    typeof f.normalizedValue === "string" &&
    typeof f.excerpt === "string" &&
    typeof f.confidence === "number"
  );
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export default app;
