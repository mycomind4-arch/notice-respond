import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Stepper, MailOptions, RecipientForm, ReviewChecks, MAIL_OPTIONS } from "@/components/workflow-shell";
import { MailingFunnel, type MailingFunnelState } from "@/components/mailing-funnel";
import { getWorkflowById } from "@/domain/workflow-catalog";
import {
  createWorkflowState, approveWorkflow, advanceStep, retreatStep, goToStep, canAdvance,
  setUpload, setExtraction, setProcessing, setUserFacts, setUserObjective,
  setDraft, setDraftValidation, setReviewChecks, setMailing,
  type WorkflowState, type DocumentUpload,
} from "@/domain/workflow-runtime";
import { classifyNoticeType, NOTICE_TYPE_META } from "@/domain/notice-type";
import { extractCP14, generateCP14Draft, type CP14Extraction } from "@/domain/cp14";
import { validateDraft } from "@/domain/draft-validator";
import { recommendStrategies, STRATEGY_TYPE_LABELS } from "@/domain/strategy";
import { detectContradictions, contradictionSummary } from "@/domain/contradiction";
import { detectMissingInfo, missingInfoSummary } from "@/domain/missing-info";

// Gold-standard CP14 intelligence
import { analyzeCP14Discrepancies, type CP14DiscrepancyResult } from "@/domain/cp14-discrepancy";
import { buildCP14EvidenceChecklist, type CP14EvidenceChecklistResult } from "@/domain/cp14-evidence";
import { generateCP14Strategy, CP14_STRATEGY_POSITION_LABELS, type CP14ResponseStrategy } from "@/domain/cp14-strategy";
import { validateCP14Draft } from "@/domain/cp14-validation";
import { createCP14Case, setCP14CaseAnalysis, setCP14CaseStrategy, setCP14CaseDraft, setCP14CaseValidation, setCP14CaseUserInput, setCP14CaseResearch, type CP14Case } from "@/domain/cp14-case";
import { getCP14ResearchPack } from "@/domain/cp14-research";

// Security
import { classifyContent, validateTextInput, validateFilename, validateFileSize, validateMimeType } from "@/domain/security";

// Draft provenance
import { buildDraftProvenance, type DraftProvenance } from "@/domain/draft-provenance";

// Wire CP14 domain packs into factory registry
import "@/domain/cp14-packs";

// AI analysis and drafting
import { analyzeDocumentWithAI } from "@/api/ai-analysis";
import { generateDraftWithAI } from "@/api/ai-drafting";
import { LLMProviderSelector, type LLMProvider } from "@/components/llm-provider-selector";
import { getLLMProviders } from "@/api/llm-providers";
import type { AnalysisResult } from "@/api/ai-analysis";

export const Route = createFileRoute("/workflows/cp14-response")({
  head: () => {
    const def = getWorkflowById("cp14-response")!;
    return {
      meta: [
        { title: def.seo?.title ?? `${def.title} — Notice Respond` },
        { name: "description", content: def.seo?.description ?? def.description },
        { property: "og:title", content: def.seo?.openGraph?.title ?? def.title },
        { property: "og:description", content: def.seo?.openGraph?.description ?? def.description },
        { property: "og:type", content: "website" },
      ],
      links: [
        { rel: "canonical", href: def.seo?.canonical ?? def.searchIntent.canonicalPath },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: (def.seo?.faq ?? []).map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }) },
        { type: "application/ld+json", children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: def.title,
          description: def.description,
          applicationCategory: "LegalDocumentService",
          operatingSystem: "Web",
          offers: { "@type": "Offer", priceFrom: "4.99", priceCurrency: "USD" },
        }) },
      ],
    };
  },
  component: CP14Response,
});

function CP14Response() {
  const definition = getWorkflowById("cp14-response")!;
  const steps = definition.ux?.steps ?? [];
  const [state, setState] = useState<WorkflowState>(() => createWorkflowState(definition));
  const [cp14Extraction, setCP14Extraction] = useState<CP14Extraction | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mailingFunnelState, setMailingFunnelState] = useState<MailingFunnelState | null>(null);

  // Gold-standard state
  const [cp14Case, setCP14Case] = useState<CP14Case | null>(null);
  const [discrepancyResult, setDiscrepancyResult] = useState<CP14DiscrepancyResult | null>(null);
  const [evidenceChecklist, setEvidenceChecklist] = useState<CP14EvidenceChecklistResult | null>(null);
  const [cp14Strategy, setCP14Strategy] = useState<CP14ResponseStrategy | null>(null);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [draftProvenance, setDraftProvenance] = useState<DraftProvenance | null>(null);

  // AI / LLM state
  const [llmProvider, setLLMProvider] = useState<LLMProvider | null>(null);
  const [aiAnalysis, setAIAnalysis] = useState<AnalysisResult | null>(null);
  const [aiAnalysisLoading, setAIAnalysisLoading] = useState(false);
  const [aiAnalysisError, setAIAnalysisError] = useState<string | null>(null);
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [aiDraftError, setAiDraftError] = useState<string | null>(null);
  const [availableProviders, setAvailableProviders] = useState<{id: LLMProvider; label: string; available: boolean}[]>([]);

  const update = (fn: (s: WorkflowState) => WorkflowState) => setState(fn);

  // Fetch available LLM providers on mount
  useEffect(() => {
    getLLMProviders().then((providers) => {
      setAvailableProviders(providers);
      const first = providers.find((p) => p.available);
      if (first) setLLMProvider(first.id as LLMProvider);
    }).catch(() => {});
  }, []);

  // ── Build the gold-standard CP14 pipeline from extraction ──
  const buildGoldStandardPipeline = useCallback((extraction: CP14Extraction) => {
    // 1. Create case model
    let case_ = createCP14Case(extraction);

    // 2. Run discrepancy analysis
    const discrepancies = analyzeCP14Discrepancies({ extraction });
    setDiscrepancyResult(discrepancies);

    // 3. Build evidence checklist
    const checklist = buildCP14EvidenceChecklist({
      extraction,
      discrepancies: discrepancies.discrepancies,
      findings: discrepancies.findings,
    });
    setEvidenceChecklist(checklist);

    // 4. Attach analysis to case
    case_ = setCP14CaseAnalysis(case_, {
      discrepancies: discrepancies.discrepancies,
      findings: discrepancies.findings,
      evidence: checklist.items,
    });

    // 5. Attach research
    const researchPack = getCP14ResearchPack();
    case_ = setCP14CaseResearch(case_, researchPack);

    // 6. Generate strategy
    const strategy = generateCP14Strategy({
      discrepancies: discrepancies.discrepancies,
      findings: discrepancies.findings,
      evidence: checklist.items,
      hasDeadline: !!(extraction.paymentDeadline ?? extraction.responseDeadline),
      extractionConfident: extraction.isCP14,
      installmentOption: extraction.installmentOption,
    });
    setCP14Strategy(strategy);
    case_ = setCP14CaseStrategy(case_, strategy);

    setCP14Case(case_);
  }, []);

  // ── Document upload and extraction ──
  const handleFileUpload = useCallback(async (file: File) => {
    update((s) => setProcessing(s, true));
    setExtractionError(null);

    try {
      // Security validation on the file itself
      const fileValidation = validateFilename(file.name);
      if (!fileValidation.valid) {
        setExtractionError(`File validation failed: ${fileValidation.errors.join(", ")}`);
        return;
      }
      const sizeValidation = validateFileSize(file.size);
      if (!sizeValidation.valid) {
        setExtractionError(sizeValidation.error ?? "File size validation failed");
        return;
      }
      const mimeValidation = validateMimeType(file.type);
      if (!mimeValidation.valid) {
        setExtractionError(mimeValidation.error ?? "File type not allowed");
        return;
      }

      // Read file as text (for now — PDF extraction would use pdf.js)
      let text = "";
      if (file.type === "application/pdf") {
        try {
          const buffer = await file.arrayBuffer();
          const decoder = new TextDecoder("latin1");
          const raw = decoder.decode(buffer);
          const textMatches = raw.match(/\(([^)]+)\)/g);
          if (textMatches) {
            text = textMatches.map(m => m.slice(1, -1)).join(" ");
          }
        } catch {
          text = "";
        }
      } else if (file.type.startsWith("image/")) {
        text = "";
      } else {
        text = await file.text();
      }

      const upload: DocumentUpload = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        rawText: text,
        uploadedAt: new Date().toISOString(),
      };

      update((s) => setUpload(s, upload));

      // Security check on extracted text
      if (text && text.length > 20) {
        const contentClassification = classifyContent(text);
        if (contentClassification.detectedInjectionPatterns.length > 0) {
          setSecurityWarning(`Security notice: ${contentClassification.detectedInjectionPatterns.length} potential prompt injection pattern(s) detected in document content. The content will be treated as DATA, not instructions.`);
        } else {
          setSecurityWarning(null);
        }
        const textValidation = validateTextInput(text);
        text = textValidation.sanitized;

        // Run CP14 extraction
        const extraction = extractCP14(text);
        setCP14Extraction(extraction);

        // Build gold-standard pipeline
        buildGoldStandardPipeline(extraction);

        const classification = classifyNoticeType(text);
        update((s) => setExtraction(s, {
          noticeType: classification.type,
          classificationConfidence: classification.confidence,
          facts: extraction.facts,
          deadlines: [],
          agency: "IRS",
          referenceNumber: extraction.noticeNumber ?? undefined,
          noticeDate: extraction.noticeDate ?? undefined,
          rawText: text,
          extractionConfidence: extraction.classificationConfidence,
        }));

        // Trigger AI analysis alongside local extraction
        handleAIAnalysis(text);
      }
    } catch (err) {
      setExtractionError(`Failed to process document: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      update((s) => setProcessing(s, false));
    }
  }, [update, buildGoldStandardPipeline]);

  const handlePasteText = useCallback((text: string) => {
    // Security validation on pasted text
    const contentClassification = classifyContent(text);
    if (contentClassification.detectedInjectionPatterns.length > 0) {
      setSecurityWarning(`Security notice: ${contentClassification.detectedInjectionPatterns.length} potential prompt injection pattern(s) detected in document content. The content will be treated as DATA, not instructions.`);
    } else {
      setSecurityWarning(null);
    }
    const textValidation = validateTextInput(text);
    const sanitizedText = textValidation.sanitized;

    const upload: DocumentUpload = {
      fileName: "Pasted text",
      fileSize: sanitizedText.length,
      fileType: "text/plain",
      rawText: sanitizedText,
      uploadedAt: new Date().toISOString(),
    };
    update((s) => setUpload(s, upload));

    const extraction = extractCP14(sanitizedText);
    handleAIAnalysis(sanitizedText);
    setCP14Extraction(extraction);

    // Build gold-standard pipeline
    buildGoldStandardPipeline(extraction);

    const classification = classifyNoticeType(sanitizedText);
    update((s) => setExtraction(s, {
      noticeType: classification.type,
      classificationConfidence: classification.confidence,
      facts: extraction.facts,
      deadlines: [],
      agency: "IRS",
      referenceNumber: extraction.noticeNumber ?? undefined,
      noticeDate: extraction.noticeDate ?? undefined,
      rawText: sanitizedText,
      extractionConfidence: extraction.classificationConfidence,
    }));
  }, [update, buildGoldStandardPipeline]);

  // ── AI document analysis ──
  const handleAIAnalysis = useCallback(async (text: string) => {
    if (!text || text.length < 20) return;
    setAIAnalysisLoading(true);
    setAIAnalysisError(null);
    try {
      const result = await analyzeDocumentWithAI({
        data: {
          documentText: text,
          workflowId: "cp14-response",
          provider: llmProvider ?? undefined,
        },
      });
      setAIAnalysis(result as AnalysisResult);
    } catch (err) {
      setAIAnalysisError(err instanceof Error ? err.message : "AI analysis failed.");
    } finally {
      setAIAnalysisLoading(false);
    }
  }, [llmProvider]);

  // ── AI draft generation ──
  const handleAIGenerateDraft = useCallback(async () => {
    if (!state.userFacts && !state.userObjective) {
      setAiDraftError("Please provide your facts and objective first.");
      return;
    }
    setAiDraftLoading(true);
    setAiDraftError(null);
    try {
      const result = await generateDraftWithAI({
        data: {
          workflowId: "cp14-response",
          workflowTitle: definition.title,
          documentText: state.upload?.rawText ?? "",
          analysis: {
            agency: "IRS",
            noticeType: cp14Extraction?.isCP14 ? "CP14" : null,
            referenceNumber: cp14Extraction?.noticeNumber ?? null,
            noticeDate: cp14Extraction?.noticeDate ?? null,
            responseDeadline: cp14Extraction?.responseDeadline ?? null,
            paymentDeadline: cp14Extraction?.paymentDeadline ?? null,
            amountOwed: cp14Extraction?.balanceDue ?? null,
            totalDue: cp14Extraction?.totalDue ?? null,
            taxYear: cp14Extraction?.taxYear ?? null,
            keyFacts: cp14Extraction?.facts?.map((f: { label: string; value: string }) => `${f.label}: ${f.value}`) ?? [],
            summary: aiAnalysis?.summary ?? "",
          },
          userFacts: state.userFacts,
          userObjective: state.userObjective,
          provider: llmProvider ?? undefined,
        },
      });
      const aiDraft = (result as { draft: string }).draft;
      update((s) => setDraft(s, aiDraft));

      // Run validation on the AI draft
      if (cp14Case && cp14Extraction) {
        let case_ = setCP14CaseUserInput(cp14Case, state.userFacts, state.userObjective);
        case_ = setCP14CaseDraft(case_, { content: aiDraft, wordCount: aiDraft.split(/\s+/).length, unresolvedPlaceholders: [] });
        const cp14Validation = validateCP14Draft(case_);
        case_ = setCP14CaseValidation(case_, cp14Validation);
        setCP14Case(case_);

        const allFindings = cp14Validation.allFindings.map(f => ({
          check: f.check,
          passed: f.passed,
          detail: f.detail,
          severity: f.severity === "block" ? "error" as const : f.severity,
        }));
        update((s) => setDraftValidation(s, {
          findings: allFindings,
          passed: cp14Validation.passed,
          errors: cp14Validation.errors + cp14Validation.blocks,
          warnings: cp14Validation.warnings,
        }));

        const provenance = buildDraftProvenance(aiDraft, state.extractedFacts, []);
        setDraftProvenance(provenance);
      } else {
        const validation = validateDraft(aiDraft, state.extractedFacts, definition, {
          expectedNoticeNumber: cp14Extraction?.noticeNumber ?? undefined,
          expectedTaxYear: cp14Extraction?.taxYear ?? undefined,
          expectedDeadline: cp14Extraction?.responseDeadline ?? undefined,
          expectedAmounts: [cp14Extraction?.balanceDue, cp14Extraction?.totalDue].filter(Boolean) as string[],
        });
        update((s) => setDraftValidation(s, validation));
        const provenance = buildDraftProvenance(aiDraft, state.extractedFacts, []);
        setDraftProvenance(provenance);
      }
    } catch (err) {
      setAiDraftError(err instanceof Error ? err.message : "AI draft generation failed.");
    } finally {
      setAiDraftLoading(false);
    }
  }, [state.userFacts, state.userObjective, state.upload, state.extractedFacts, cp14Extraction, cp14Case, llmProvider, definition, aiAnalysis, update]);

  // ── Draft generation (uses two-pass validation) ──
  const handleGenerateDraft = useCallback(() => {
    const draft = generateCP14Draft({
      noticeNumber: cp14Extraction?.noticeNumber ?? "",
      taxYear: cp14Extraction?.taxYear ?? null,
      noticeDate: cp14Extraction?.noticeDate ?? null,
      responseDeadline: cp14Extraction?.paymentDeadline ?? cp14Extraction?.responseDeadline ?? null,
      balanceDue: cp14Extraction?.balanceDue ?? null,
      totalDue: cp14Extraction?.totalDue ?? null,
      userFacts: state.userFacts,
      userObjective: state.userObjective,
    });

    update((s) => setDraft(s, draft));

    // Use two-pass CP14 validation if we have a case model
    if (cp14Case && cp14Extraction) {
      // Rebuild strategy with user facts/objective now available
      let case_ = setCP14CaseUserInput(cp14Case, state.userFacts, state.userObjective);
      if (discrepancyResult) {
        const strategy = generateCP14Strategy({
          discrepancies: discrepancyResult.discrepancies,
          findings: discrepancyResult.findings,
          evidence: evidenceChecklist?.items ?? [],
          userFacts: state.userFacts,
          userObjective: state.userObjective,
          hasDeadline: !!(cp14Extraction.paymentDeadline ?? cp14Extraction.responseDeadline),
          extractionConfident: cp14Extraction.isCP14,
          installmentOption: cp14Extraction.installmentOption,
        });
        setCP14Strategy(strategy);
        case_ = setCP14CaseStrategy(case_, strategy);
      }
      case_ = setCP14CaseDraft(case_, { content: draft, wordCount: draft.split(/\s+/).length, unresolvedPlaceholders: [] });

      // Run the two-pass validation
      const cp14Validation = validateCP14Draft(case_);
      case_ = setCP14CaseValidation(case_, cp14Validation);
      setCP14Case(case_);

      // Bridge CP14ValidationResult → DraftValidationResult for WorkflowState
      const allFindings = cp14Validation.allFindings.map(f => ({
        check: f.check,
        passed: f.passed,
        detail: f.detail,
        severity: f.severity === "block" ? "error" as const : f.severity,
      }));
      const bridgedValidation = {
        findings: allFindings,
        passed: cp14Validation.passed,
        errors: cp14Validation.errors + cp14Validation.blocks,
        warnings: cp14Validation.warnings,
      };
      update((s) => setDraftValidation(s, bridgedValidation));

      // Build draft provenance
      const provenance = buildDraftProvenance(draft, state.extractedFacts, []);
      setDraftProvenance(provenance);
    } else {
      // Fallback: generic validation
      const validation = validateDraft(draft, state.extractedFacts, definition, {
        expectedNoticeNumber: cp14Extraction?.noticeNumber ?? undefined,
        expectedTaxYear: cp14Extraction?.taxYear ?? undefined,
        expectedDeadline: cp14Extraction?.responseDeadline ?? undefined,
        expectedAmounts: [cp14Extraction?.balanceDue, cp14Extraction?.totalDue].filter(Boolean) as string[],
      });
      update((s) => setDraftValidation(s, validation));

      const provenance = buildDraftProvenance(draft, state.extractedFacts, []);
      setDraftProvenance(provenance);
    }
  }, [cp14Case, cp14Extraction, state.userFacts, state.userObjective, state.extractedFacts, definition, update, discrepancyResult, evidenceChecklist]);

  // ── Step navigation ──
  const canContinue = canAdvance(state, definition);

  const next = () => {
    if (state.phase === "draft" && !state.draft) {
      handleGenerateDraft();
    }
    if (state.phase === "checkout" || state.phase === "submitted") {
      return;
    }
    update((s) => {
        // When leaving the review phase, explicitly approve the workflow
        // This satisfies the runtime's approval gate before consequential steps
        const approved = state.phase === "review" ? approveWorkflow(s) : s;
        return advanceStep(approved, definition);
      });
  };

  const back = () => update((s) => retreatStep(s, definition));

  // ── Analysis helpers ──
  const contradictions = state.extraction ? detectContradictions(state.extractedFacts, state.evidence) : [];
  const missingInfo = state.extraction ? detectMissingInfo(state.extractedFacts, state.deadline ?? null, state.evidence) : [];
  const strategies = state.extraction ? recommendStrategies(state.extraction.noticeType) : [];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-2">
          <Link to="/" className="text-sm text-muted-foreground hover:text-stamp transition-colors">← Notice Respond</Link>
        </div>
        <h1 className="mb-6 font-serif text-3xl">{definition.title}</h1>

        <Stepper steps={steps} current={state.step} onStep={(i) => update((s) => goToStep(s, definition, i))} />

        <div className="mt-10 envelope-card p-6 md:p-10">
          {/* ── Step 0: Intro ── */}
          {state.phase === "intro" && (
            <div>
              <div className="postmark w-fit">1 · Start</div>
              <h2 className="mt-4 font-serif text-4xl">Respond to your CP14 notice</h2>
              <p className="mt-3 text-muted-foreground">
                A CP14 is a Balance Due notice from the IRS. It tells you that you have an unpaid balance on your tax account for a specific tax year, showing the tax amount plus any penalties and interest. This workflow helps you organize the notice, verify the balance, and prepare a response — whether you're paying, requesting an installment agreement, or disputing the amount.
              </p>
              <div className="mt-6 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-sm text-muted-foreground">
                <div className="font-mono text-xs uppercase tracking-widest text-stamp">Disclaimer</div>
                <p className="mt-2">{definition.ux?.disclaimerText ?? definition.disclaimer}</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {["Upload the CP14 notice", "Review extracted facts and balance due", "Add your facts and supporting records", "Generate and review the response draft", "Approve and mail with proof of delivery"].map((item, i) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-ink-soft">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-paper-deep font-mono text-xs text-muted-foreground">{i + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1: Document Upload ── */}
          {state.phase === "document" && (
            <div>
              <div className="postmark w-fit">2 · Upload</div>
              <h2 className="mt-4 font-serif text-3xl">Upload your CP14 notice</h2>
              <p className="mt-3 text-muted-foreground">Upload the CP14 notice PDF, or paste the notice text below. We'll extract key information for your review.</p>

              <label className="upload-zone mt-6 block cursor-pointer">
                <svg className="mx-auto text-muted-foreground" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                <span className="mt-3 block font-medium text-foreground">Upload CP14 notice</span>
                <span className="mt-1 block text-xs text-muted-foreground">PDF, JPG, or PNG · Text is extracted for your review</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </label>

              {state.isProcessing && (
                <div className="mt-4 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-stamp border-t-transparent" />
                    <span className="text-muted-foreground">Processing document…</span>
                  </div>
                </div>
              )}

              {extractionError && (
                <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                  {extractionError}
                </div>
              )}

              {securityWarning && (
                <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                  <span className="font-medium">⚠ Security:</span> {securityWarning}
                </div>
              )}

              {/* AI Provider Selector */}
              {availableProviders.length > 0 && (
                <div className="mt-6 border-t border-rule/60 pt-4">
                  <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">
                    AI Analysis Engine
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {availableProviders.map((provider) => (
                      <button
                        key={provider.id}
                        disabled={!provider.available}
                        onClick={() => setLLMProvider(provider.id)}
                        className={`rounded-lg border p-3 text-left transition-all ${
                          llmProvider === provider.id
                            ? "border-stamp bg-stamp/5 ring-1 ring-stamp"
                            : "border-rule hover:border-ink/20"
                        } ${!provider.available ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="text-sm font-medium">{provider.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {provider.available ? "Available" : "API key required"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis Result */}
              {aiAnalysis && (
                <div className="mt-4 rounded-lg border border-stamp/40 bg-stamp/5 p-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-stamp">
                    AI Analysis ({aiAnalysis.provider} · {aiAnalysis.model})
                  </div>
                  <p className="mt-2 text-sm text-foreground">{aiAnalysis.summary}</p>
                  {aiAnalysis.keyFacts.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {aiAnalysis.keyFacts.map((fact, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {fact}</li>
                      ))}
                    </ul>
                  )}
                  {aiAnalysis.recommendedActions.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-muted-foreground">Recommended actions:</div>
                      <ul className="mt-1 space-y-0.5">
                        {aiAnalysis.recommendedActions.map((action, i) => (
                          <li key={i} className="text-sm text-foreground">→ {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {aiAnalysisLoading && (
                <div className="mt-4 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-stamp border-t-transparent" />
                    <span className="text-muted-foreground">AI is analyzing the document…</span>
                  </div>
                </div>
              )}

              {aiAnalysisError && (
                <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  {aiAnalysisError}
                </div>
              )}

              <div className="mt-6 border-t border-rule/60 pt-4">
                <label className="input-label">Or paste notice text</label>
                <textarea
                  className="input-field mt-2 min-h-32 font-mono text-sm"
                  placeholder="Paste the text content of your CP14 notice here…"
                  onChange={(e) => {
                    if (e.target.value.length > 50) {
                      handlePasteText(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Extraction Review ── */}
          {state.phase === "extraction" && (
            <div>
              <div className="postmark w-fit">3 · Review</div>
              <h2 className="mt-4 font-serif text-3xl">Review extracted information</h2>
              <p className="mt-3 text-muted-foreground">We extracted the following from your notice. Verify each item — this information will be used to prepare your response.</p>

              {cp14Extraction && (
                <div className="mt-6 space-y-4">
                  {/* Classification */}
                  <div className="rounded-lg border border-rule/60 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Document Classification</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${cp14Extraction.isCP14 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {cp14Extraction.isCP14 ? "CP14 Confirmed" : "Not confirmed"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Confidence: {(cp14Extraction.classificationConfidence * 100).toFixed(0)}%</p>
                  </div>

                  {/* Security warning (persistent in extraction view) */}
                  {securityWarning && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                      <span className="font-medium">⚠ Security:</span> {securityWarning}
                    </div>
                  )}

                  {/* Warnings */}
                  {cp14Extraction.warnings.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="font-mono text-xs uppercase tracking-widest text-amber-700">Warnings</div>
                      <ul className="mt-2 space-y-1">
                        {cp14Extraction.warnings.map((w, i) => (
                          <li key={i} className="text-sm text-amber-800">⚠ {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Extracted Facts */}
                  {cp14Extraction.facts.length > 0 ? (
                    <div className="rounded-lg border border-rule/60 p-4">
                      <div className="font-mono text-xs uppercase tracking-widest text-stamp">Extracted Facts</div>
                      <dl className="mt-3 space-y-2">
                        {cp14Extraction.facts.map((fact) => (
                          <div key={fact.id} className="border-b border-rule/30 pb-2 last:border-0">
                            <div className="flex items-start justify-between gap-4">
                              <dt className="text-sm font-medium text-foreground">{fact.label}</dt>
                              <dd className="text-sm text-muted-foreground">{fact.value || "—"}</dd>
                            </div>
                            {fact.sourceExcerpt && (
                              <details className="mt-1">
                                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                  Source: "{fact.sourceExcerpt}" · Method: {fact.extractionMethod}
                                </summary>
                              </details>
                            )}
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-rule/60 p-4 text-sm text-muted-foreground">
                      No structured facts were extracted. You can enter facts manually in the next step.
                    </div>
                  )}

                  {/* CP14 Discrepancy Analysis */}
                  {discrepancyResult && discrepancyResult.discrepancies.length > 0 && (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                      <div className="font-mono text-xs uppercase tracking-widest text-destructive">Discrepancy Analysis</div>
                      <ul className="mt-2 space-y-2">
                        {discrepancyResult.discrepancies.map((d, i) => (
                          <li key={i} className="text-sm text-destructive">
                            <span className="font-medium">{d.type.replace(/_/g, " ")}:</span> {d.description}
                            {d.difference && <span className="ml-1">(difference: {d.difference})</span>}
                            <ul className="mt-1 ml-4 space-y-0.5 text-xs text-muted-foreground">
                              <li><strong>Evidence needed:</strong> {d.evidenceNeeded.join("; ")}</li>
                              <li><strong>Confidence:</strong> {d.confidence}</li>
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CP14 Findings */}
                  {discrepancyResult && discrepancyResult.findings.length > 0 && (
                    <div className="rounded-lg border border-rule/60 p-4">
                      <div className="font-mono text-xs uppercase tracking-widest text-stamp">Findings ({discrepancyResult.totalIssues} total)</div>
                      <ul className="mt-2 space-y-1">
                        {discrepancyResult.findings.map((f, i) => (
                          <li key={i} className="text-sm">
                            <span className={`font-medium ${f.severity === "critical" ? "text-destructive" : f.severity === "high" ? "text-amber-700" : "text-muted-foreground"}`}>
                              [{f.severity}]
                            </span>{" "}
                            <span className="text-foreground">{f.statement}</span>
                            {f.recommendedAction && (
                              <span className="block text-xs text-muted-foreground mt-0.5">→ {f.recommendedAction}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Evidence Checklist */}
                  {evidenceChecklist && evidenceChecklist.items.length > 0 && (
                    <div className="rounded-lg border border-rule/60 p-4">
                      <div className="font-mono text-xs uppercase tracking-widest text-stamp">Evidence Checklist</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Required: {evidenceChecklist.requiredCount} · Missing: {evidenceChecklist.missingCount} · Ready: {evidenceChecklist.ready ? "✓" : "✗"}
                      </div>
                      <ul className="mt-2 space-y-1">
                        {evidenceChecklist.items.map((item, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className={item.state === "missing" ? "text-amber-600" : item.state === "provided" ? "text-emerald-600" : "text-muted-foreground"}>
                              {item.state === "missing" ? "○" : "●"}
                            </span>
                            <div>
                              <span className="font-medium text-foreground">{item.label}</span>
                              <span className="ml-2 text-xs text-muted-foreground">({item.requirement})</span>
                              <p className="text-xs text-muted-foreground">{item.purpose}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Deadline Analysis */}
                  {cp14Case && (
                    <div className="rounded-lg border border-rule/60 p-4">
                      <div className="font-mono text-xs uppercase tracking-widest text-stamp">Deadline Analysis</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-foreground">
                          {cp14Case.deadline.parsed ?? "No deadline found"}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          cp14Case.deadline.certainty === "confirmed" ? "bg-emerald-50 text-emerald-700" :
                          cp14Case.deadline.certainty === "derived" ? "bg-amber-50 text-amber-700" :
                          cp14Case.deadline.certainty === "missing" ? "bg-red-50 text-red-700" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {cp14Case.deadline.certainty}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Source: {cp14Case.deadline.source}</p>
                    </div>
                  )}

                  {/* Contradictions and Missing Info */}
                  {contradictions.length > 0 && (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                      <div className="font-mono text-xs uppercase tracking-widest text-destructive">Contradictions</div>
                      <ul className="mt-2 space-y-1">
                        {contradictions.map((c, i) => (
                          <li key={i} className="text-sm text-destructive">⚠ {contradictionSummary([c])}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {missingInfo.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="font-mono text-xs uppercase tracking-widest text-amber-700">Missing Information</div>
                      <ul className="mt-2 space-y-1">
                        {missingInfo.slice(0, 5).map((m, i) => (
                          <li key={i} className="text-sm text-amber-800">• {m.label}: {m.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!cp14Extraction && !state.isProcessing && (
                <div className="mt-6 rounded-md border border-rule/60 p-4 text-sm text-muted-foreground">
                  No document has been processed yet. Go back to upload your CP14 notice.
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Facts ── */}
          {state.phase === "facts" && (
            <div>
              <div className="postmark w-fit">4 · Facts</div>
              <h2 className="mt-4 font-serif text-3xl">Add your facts</h2>
              <p className="mt-3 text-muted-foreground">Enter the facts that support your response. Only include information you can verify with your records.</p>
              <textarea
                className="input-field mt-6 min-h-48"
                value={state.userFacts}
                onChange={(e) => update((s) => setUserFacts(s, e.target.value))}
                placeholder="Example: I paid the balance of $X on [date] via [payment method]. The payment was processed and my account shows $0 balance. / I have an installment agreement (Form 9465) approved on [date] for $X/month. / The balance appears incorrect because I filed an amended return (1040-X) on [date] correcting the amount…"
              />
              <div className="mt-4 rounded-md border border-rule/70 bg-paper-deep/40 p-3 text-sm text-muted-foreground">
                <strong>Tip:</strong> Include specific amounts, dates, payment confirmations, and form numbers. Reference the documents you'll attach as evidence.
              </div>
            </div>
          )}

          {/* ── Step 4: Objective ── */}
          {state.phase === "objective" && (
            <div>
              <div className="postmark w-fit">5 · Objective</div>
              <h2 className="mt-4 font-serif text-3xl">What do you want the response to accomplish?</h2>
              <p className="mt-3 text-muted-foreground">State your objective clearly. This guides the response strategy.</p>

              {/* CP14-specific strategy (discrepancy-aware) */}
              {cp14Strategy && (
                <div className="mt-4 rounded-lg border border-rule/60 bg-card p-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-stamp">Response Strategy</div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-foreground">Position: {CP14_STRATEGY_POSITION_LABELS[cp14Strategy.position]}</span>
                    <span className="ml-2 text-xs text-muted-foreground">Confidence: {cp14Strategy.confidence}</span>
                  </div>
                  {cp14Strategy.issues.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-muted-foreground">Issues to address:</div>
                      <ul className="mt-1 space-y-0.5">
                        {cp14Strategy.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-foreground">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cp14Strategy.requestedActions.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-muted-foreground">Recommended actions:</div>
                      <ul className="mt-1 space-y-0.5">
                        {cp14Strategy.requestedActions.map((action, i) => (
                          <li key={i} className="text-sm text-foreground">• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cp14Strategy.riskFlags.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-amber-700">Risk flags:</div>
                      <ul className="mt-1 space-y-0.5">
                        {cp14Strategy.riskFlags.map((risk, i) => (
                          <li key={i} className="text-sm text-amber-800">⚠ {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={() => update((s) => setUserObjective(s, CP14_STRATEGY_POSITION_LABELS[cp14Strategy.position] + (cp14Strategy.requestedActions.length > 0 ? `: ${cp14Strategy.requestedActions[0]}` : "")))}
                    className="mt-3 rounded-full border border-rule px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    Use this strategy
                  </button>
                </div>
              )}

              {/* Generic strategy suggestions (fallback) */}
              {strategies.length > 0 && !cp14Strategy && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Suggested strategies based on the notice type</div>
                  {strategies.slice(0, 4).map((strat) => (
                    <button
                      key={strat.type}
                      onClick={() => update((s) => setUserObjective(s, STRATEGY_TYPE_LABELS[strat.type] + (strat.reason ? `: ${strat.reason}` : "")))}
                      className="block w-full rounded-lg border border-rule/60 bg-card p-3 text-left text-sm hover:border-stamp/40 transition-colors"
                    >
                      <span className="font-medium text-foreground">{STRATEGY_TYPE_LABELS[strat.type]}</span>
                      {strat.reason && <span className="mt-1 block text-xs text-muted-foreground">{strat.reason}</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Research sources */}
              {cp14Case?.research.sources && cp14Case.research.sources.length > 0 && (
                <div className="mt-4 rounded-lg border border-rule/60 p-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-stamp">Authoritative Sources</div>
                  <ul className="mt-2 space-y-1">
                    {cp14Case.research.sources.slice(0, 5).map((source, i) => (
                      <li key={i} className="text-sm">
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {source.title}
                        </a>
                        <span className="ml-1 text-xs text-muted-foreground">— {source.organization}</span>
                      </li>
                    ))}
                  </ul>
                  {cp14Case.research.knownFacts.length > 0 && (
                    <div className="mt-3 border-t border-rule/30 pt-2">
                      <div className="text-xs font-medium text-muted-foreground">Key facts from IRS sources:</div>
                      <ul className="mt-1 space-y-1">
                        {cp14Case.research.knownFacts.slice(0, 4).map((fact, i) => (
                          <li key={i} className="text-xs text-muted-foreground">
                            <span className="font-medium">"{fact.fact}"</span>
                            {fact.interpretation && <span className="block italic">{fact.interpretation}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <textarea
                className="input-field mt-6 min-h-40"
                value={state.userObjective}
                onChange={(e) => update((s) => setUserObjective(s, e.target.value))}
                placeholder="Example: I am paying the balance in full and have enclosed a check for the total amount due. / I am requesting an installment agreement because I cannot pay in full. / I am disputing the balance because I already paid it…"
              />
            </div>
          )}

          {/* ── Step 5: Draft ── */}
          {state.phase === "draft" && (
            <div>
              <div className="postmark w-fit">6 · Draft</div>
              <h2 className="mt-4 font-serif text-3xl">Your response letter</h2>
              <p className="mt-3 text-muted-foreground">Review every fact, name, date, and statement. This is editable — change anything. We've validated the draft against the extracted facts.</p>

              {state.draftValidation && !state.draftValidation.passed && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-amber-700">
                    Validation findings ({state.draftValidation.errors} errors, {state.draftValidation.warnings} warnings)
                  </div>
                  <ul className="mt-2 space-y-1">
                    {state.draftValidation.findings.filter((f) => !f.passed).map((f, i) => (
                      <li key={i} className={`text-sm ${f.severity === "error" ? "text-destructive" : "text-amber-800"}`}>
                        {f.severity === "error" ? "✗" : "⚠"} {f.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {state.draftValidation?.passed && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  ✓ Draft passed all validation checks.
                </div>
              )}

              <textarea
                className="input-field mt-6 min-h-72 font-mono text-sm leading-6"
                value={state.draft}
                onChange={(e) => update((s) => setDraft(s, e.target.value))}
              />

              {/* Draft provenance */}
              {draftProvenance && (
                <div className="mt-4 rounded-lg border border-rule/60 p-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-stamp">Draft Provenance</div>
                  <div className="mt-2 flex gap-4 text-xs">
                    <span className="text-emerald-600">✓ Supported: {draftProvenance.supported}</span>
                    <span className="text-amber-600">⚠ Unsupported: {draftProvenance.unsupported}</span>
                    <span className="text-destructive">✗ Blocking: {draftProvenance.blocking}</span>
                    <span className={draftProvenance.safeForApproval ? "text-emerald-600" : "text-destructive"}>
                      {draftProvenance.safeForApproval ? "✓ Safe for approval" : "✗ Not safe for approval"}
                    </span>
                  </div>
                  {draftProvenance.assertions.filter(a => a.support === "unsupported" || a.support === "placeholder").length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {draftProvenance.assertions.filter(a => a.support === "unsupported" || a.support === "placeholder").map((a, i) => (
                        <li key={i} className={`text-sm ${a.blocking ? "text-destructive" : "text-amber-700"}`}>
                          {a.blocking ? "✗" : "⚠"} {a.reason ?? a.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {aiDraftLoading && (
                <div className="mt-4 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-stamp border-t-transparent" />
                    <span className="text-muted-foreground">
                      AI is generating your response letter{llmProvider ? ` (${llmProvider})` : ""}…
                    </span>
                  </div>
                </div>
              )}

              {aiDraftError && (
                <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  {aiDraftError}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                {availableProviders.length > 0 && (
                  <button
                    onClick={handleAIGenerateDraft}
                    disabled={aiDraftLoading}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {aiDraftLoading ? "Generating…" : `Generate with AI${llmProvider ? ` (${llmProvider})` : ""}`}
                  </button>
                )}
                <button
                  onClick={handleGenerateDraft}
                  className="rounded-full border border-rule px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Regenerate template draft
                </button>
              </div>
            </div>
          )}

          {/* ── Step 6: Review ── */}
          {state.phase === "review" && (
            <div>
              <div className="postmark w-fit">7 · Review</div>
              <h2 className="mt-4 font-serif text-3xl">Review before anything is mailed</h2>
              <p className="mt-3 text-muted-foreground">Please confirm each item below.</p>
              <ReviewChecks
                items={definition.ux?.reviewChecks ?? []}
                checks={state.reviewChecks}
                setChecks={(fn) => update((s) => setReviewChecks(s, fn(state.reviewChecks)))}
              />
              {state.reviewChecks.every(Boolean) && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  ✓ All checks confirmed. You can proceed to the next step.
                </div>
              )}
            </div>
          )}

          {/* ── Step 7: Attachments ── */}
          {state.phase === "attachments" && (
            <div>
              <div className="postmark w-fit">8 · Documents</div>
              <h2 className="mt-4 font-serif text-3xl">Add supporting documents</h2>
              <p className="mt-3 text-muted-foreground">Attach any documents referenced in your response — payment confirmations, return transcripts, installment forms, prior correspondence, etc.</p>
              <label className="upload-zone mt-6 block cursor-pointer">
                <svg className="mx-auto text-muted-foreground" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                <span className="mt-3 block font-medium text-foreground">Add attachments</span>
                <span className="mt-1 block text-xs text-muted-foreground">Forms, receipts, evidence, prior correspondence</span>
                <input type="file" accept="application/pdf,image/jpeg,image/png" multiple className="sr-only" />
              </label>
              {evidenceChecklist && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Required evidence: {evidenceChecklist.items.filter(e => e.requirement === "required").map(e => e.label).join(", ")}
                </div>
              )}
            </div>
          )}

          {/* ── Step 8: Recipient ── */}
          {state.phase === "recipient" && (
            <div>
              <div className="postmark w-fit">9 · Recipient</div>
              <h2 className="mt-4 font-serif text-3xl">Where should we send it?</h2>
              <p className="mt-3 text-muted-foreground">Enter the IRS mailing address from the CP14 notice. The response or payment address should be printed on the notice.</p>
              {cp14Extraction?.responseAddress && (
                <div className="mt-4 rounded-md border border-rule/70 bg-paper-deep/40 p-3 text-sm text-muted-foreground">
                  <strong>Extracted response address:</strong> {cp14Extraction.responseAddress}
                </div>
              )}
              <RecipientForm
                recipient={state.mailing?.recipient ?? { name: "", org: "", address1: "", address2: "", city: "", state: "", zip: "" }}
                setRecipient={(fn) => update((s) => setMailing(s, {
                  ...s.mailing ?? { method: "certified", recipient: fn({ name: "", org: "", address1: "", address2: "", city: "", state: "", zip: "" }), status: "not_started" },
                  recipient: fn(s.mailing?.recipient ?? { name: "", org: "", address1: "", address2: "", city: "", state: "", zip: "" }),
                }))}
                orgPlaceholder="IRS — Department of the Treasury"
              />
            </div>
          )}

          {/* ── Step 9: Mailing ── */}
          {state.phase === "mailing" && (
            <div>
              <div className="postmark w-fit">10 · Mail</div>
              <h2 className="mt-4 font-serif text-3xl">Choose your mail type</h2>
              <p className="mt-3 text-muted-foreground">For IRS responses, Certified mail is recommended for proof of timely submission.</p>
              <MailOptions
                selected={state.mailing?.method ?? "certified"}
                onSelect={(id) => update((s) => setMailing(s, {
                  ...s.mailing ?? { recipient: { name: "", org: "", address1: "", address2: "", city: "", state: "", zip: "" }, status: "not_started" },
                  method: id,
                }))}
              />
            </div>
          )}

          {/* ── Step 10: Checkout + Done (MailingFunnel) ── */}
          {(state.phase === "checkout" || state.phase === "submitted") && (
            <MailingFunnel
              draft={state.draft}
              workflowId={definition.id}
              workflowTitle={definition.title}
              recipient={state.mailing?.recipient ?? null}
              extractionRef={cp14Extraction?.noticeNumber ?? null}
              taxYear={cp14Extraction?.taxYear ?? null}
              mailOptions={definition.ux?.mailOptions ?? MAIL_OPTIONS}
              disclaimer={definition.ux?.disclaimerText ?? definition.disclaimer}
              onMailingStateChange={(s) => {
                setMailingFunnelState(s);
                if (s.phase === "submitted") {
                  update((st) => setMailing(st, {
                    method: s.method,
                    recipient: s.recipient,
                    status: "submitted",
                    providerOrderId: s.providerOrderId ?? undefined,
                    trackingNumber: s.trackingNumber ?? undefined,
                  }));
                }
              }}
            />
          )}

          {/* ── Navigation ── */}
          {state.phase !== "checkout" && state.phase !== "submitted" && (
            <div className="mt-8 flex items-center justify-between">
              <button onClick={back} disabled={state.step === 0} className="rounded-full border border-rule px-5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors">
                ← Back
              </button>
              <button onClick={next} disabled={!canContinue} className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-40 transition-colors">
                {state.phase === "mailing" ? "Continue to checkout" : "Continue →"}
              </button>
            </div>
          )}
        </div>

        {/* FAQ section for SEO on intro step */}
        {state.phase === "intro" && definition.seo?.faq && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl">Frequently asked questions</h2>
            <div className="mt-6 space-y-4">
              {definition.seo.faq.map((item, i) => (
                <div key={i} className="rounded-xl border border-rule bg-card p-5">
                  <h3 className="font-medium text-foreground">{item.question}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">← All Notice Respond workflows</Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
