import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Stepper, MailOptions, RecipientForm, ReviewChecks, MAIL_OPTIONS } from "@/components/workflow-shell";
import { MailingFunnel, type MailingFunnelState } from "@/components/mailing-funnel";
import { getWorkflowById } from "@/domain/workflow-catalog";
import {
  createWorkflowState, advanceStep, retreatStep, goToStep, canAdvance,
  setUpload, setExtraction, setProcessing, setUserFacts, setUserObjective,
  setDraft, setDraftValidation, setReviewChecks, setMailing,
  type WorkflowState, type DocumentUpload,
} from "@/domain/workflow-runtime";
import { classifyNoticeType, NOTICE_TYPE_META } from "@/domain/notice-type";
import { extractCP523, generateCP523Draft, type CP523Extraction } from "@/domain/cp523";
import { validateDraft } from "@/domain/draft-validator";
import { recommendStrategies, STRATEGY_TYPE_LABELS } from "@/domain/strategy";
import { detectContradictions, contradictionSummary } from "@/domain/contradiction";
import { detectMissingInfo, missingInfoSummary } from "@/domain/missing-info";
// Security
import { classifyContent, validateTextInput, validateFilename, validateFileSize, validateMimeType } from "@/domain/security";
// Import the domain pack (registers with factory)
import "@/domain/cp523-packs";

export const Route = createFileRoute("/workflows/cp523-response")({
  head: () => {
    const def = getWorkflowById("cp523-response")!;
    return {
      meta: [
        { title: def.seo?.title ?? def.title + " — Notice Respond" },
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
  component: CP523Response,
});

function CP523Response() {
  const definition = getWorkflowById("cp523-response")!;
  const steps = definition.ux?.steps ?? [];
  const [state, setState] = useState<WorkflowState>(() => createWorkflowState(definition));
  const [cp523Extraction, setCP523Extraction] = useState<CP523Extraction | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mailingFunnelState, setMailingFunnelState] = useState<MailingFunnelState | null>(null);

  const update = (fn: (s: WorkflowState) => WorkflowState) => setState(fn);

  // ── Document upload and extraction ──
  const handleFileUpload = useCallback(async (file: File) => {
    update((s) => setProcessing(s, true));
    setExtractionError(null);

    try {
      const fileValidation = validateFilename(file.name);
      if (!fileValidation.valid) {
        setExtractionError("File validation failed: " + fileValidation.errors.join(", "));
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
        } catch { text = ""; }
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

      if (text && text.length > 20) {
        const contentClassification = classifyContent(text);
        if (contentClassification.detectedInjectionPatterns.length > 0) {
          setSecurityWarning("Security notice: " + contentClassification.detectedInjectionPatterns.length + " potential prompt injection pattern(s) detected. Content treated as DATA, not instructions.");
        } else {
          setSecurityWarning(null);
        }
        const textValidation = validateTextInput(text);
        text = textValidation.sanitized;

        const extraction = extractCP523(text);
        setCP523Extraction(extraction);

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
      }
    } catch (err) {
      setExtractionError("Failed to process document: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      update((s) => setProcessing(s, false));
    }
  }, [update]);

  const handlePasteText = useCallback((text: string) => {
    const contentClassification = classifyContent(text);
    if (contentClassification.detectedInjectionPatterns.length > 0) {
      setSecurityWarning("Security notice: " + contentClassification.detectedInjectionPatterns.length + " potential prompt injection pattern(s) detected. Content treated as DATA, not instructions.");
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

    const extraction = extractCP523(sanitizedText);
    setCP523Extraction(extraction);

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
  }, [update]);

  // ── Draft generation ──
  const handleGenerateDraft = useCallback(() => {
    const draft = generateCP523Draft({
      noticeNumber: cp523Extraction?.noticeNumber ?? "",
      taxYearsCovered: cp523Extraction?.taxYearsCovered ?? [],
      noticeDate: cp523Extraction?.noticeDate ?? null,
      responseDeadline: cp523Extraction?.responseDeadline ?? null,
      cdpHearingDeadline: cp523Extraction?.cdpHearingDeadline ?? null,
      terminationDate: cp523Extraction?.terminationDate ?? null,
      installmentAgreementNumber: cp523Extraction?.installmentAgreementNumber ?? null,
      defaultReason: cp523Extraction?.defaultReason ?? null,
      userFacts: state.userFacts,
      userObjective: state.userObjective,
    });

    update((s) => setDraft(s, draft));

    const validation = validateDraft(draft, state.extractedFacts, definition, {
      expectedNoticeNumber: cp523Extraction?.noticeNumber ?? undefined,
      expectedDeadline: cp523Extraction?.responseDeadline ?? undefined,
    });
    update((s) => setDraftValidation(s, validation));
  }, [cp523Extraction, state.userFacts, state.userObjective, state.extractedFacts, definition, update]);

  // ── Step navigation ──
  const canContinue = canAdvance(state, definition);

  const next = () => {
    if (state.phase === "draft" && !state.draft) {
      handleGenerateDraft();
    }
    if (state.phase === "checkout" || state.phase === "submitted") return;
    update((s) => advanceStep(s, definition));
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

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{definition.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{definition.description}</p>
        </div>

        {securityWarning && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
            {securityWarning}
          </div>
        )}

        <Stepper steps={steps} current={state.phase} />

        {/* Document upload */}
        {state.phase === "document" && (
          <div className="mt-6 space-y-4">
            <div
              className="rounded-lg border-2 border-dashed border-border p-8 text-center"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/*,text/plain"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <p className="text-sm text-muted-foreground">Click to upload your CP523 notice (PDF, image, or text)</p>
            </div>

            {state.processing && <p className="text-sm text-muted-foreground">Processing…</p>}
            {extractionError && <p className="text-sm text-red-600">{extractionError}</p>}

            {cp523Extraction && (
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <h3 className="font-semibold">Extracted Information</h3>
                {cp523Extraction.noticeNumber && <p className="text-sm">Notice: {cp523Extraction.noticeNumber}</p>}
                {cp523Extraction.noticeDate && <p className="text-sm">Date: {cp523Extraction.noticeDate}</p>}
                {cp523Extraction.balanceDue && <p className="text-sm">Balance Due: {cp523Extraction.balanceDue}</p>}
                {cp523Extraction.totalDue && <p className="text-sm">Total Due: {cp523Extraction.totalDue}</p>}
                {cp523Extraction.installmentAgreementNumber && <p className="text-sm">IA Number: {cp523Extraction.installmentAgreementNumber}</p>}
                {cp523Extraction.defaultReason && <p className="text-sm">Default Reason: {cp523Extraction.defaultReason}</p>}
                {cp523Extraction.terminationDate && <p className="text-sm">Termination Date: {cp523Extraction.terminationDate}</p>}
                {cp523Extraction.cdpRightsNotice && <p className="text-sm text-amber-600">CDP hearing rights detected</p>}
                {cp523Extraction.passportCertification && <p className="text-sm text-amber-600">Passport certification detected</p>}
                {cp523Extraction.warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {cp523Extraction.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-amber-600">{w}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <textarea
              className="w-full rounded-lg border p-3 text-sm"
              placeholder="Or paste the notice text here…"
              rows={5}
              onChange={(e) => {
                if (e.target.value.length > 50) handlePasteText(e.target.value);
              }}
            />
          </div>
        )}

        {/* Facts */}
        {state.phase === "facts" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Your Facts</h2>
            <p className="text-sm text-muted-foreground">What facts are relevant to your response? Include any payment history, installment agreement details, or corrections.</p>
            <textarea
              className="w-full rounded-lg border p-3 text-sm"
              rows={6}
              value={state.userFacts ?? ""}
              onChange={(e) => update((s) => setUserFacts(s, e.target.value))}
            />
          </div>
        )}

        {/* Objective */}
        {state.phase === "objective" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Your Objective</h2>
            <p className="text-sm text-muted-foreground">What do you want to achieve? (e.g., reinstate the installment agreement, request a CDP hearing, dispute the balance)</p>
            <textarea
              className="w-full rounded-lg border p-3 text-sm"
              rows={4}
              value={state.userObjective ?? ""}
              onChange={(e) => update((s) => setUserObjective(s, e.target.value))}
            />
          </div>
        )}

        {/* Draft */}
        {state.phase === "draft" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Response Draft</h2>
            {state.draft ? (
              <pre className="whitespace-pre-wrap rounded-lg border bg-card p-4 text-sm">{state.draft}</pre>
            ) : (
              <button onClick={handleGenerateDraft} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Generate Draft</button>
            )}
          </div>
        )}

        {/* Review */}
        {state.phase === "review" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Review</h2>
            <ReviewChecks
              checks={definition.ux?.reviewChecks ?? []}
              onChange={(checked) => update((s) => setReviewChecks(s, checked))}
            />
          </div>
        )}

        {/* Attachments / Recipient / Mailing / Checkout / Done */}
        {state.phase === "attachments" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Attachments</h2>
            <p className="text-sm text-muted-foreground">Attach supporting documents: installment agreement, payment records, tax returns, Form 433-F.</p>
          </div>
        )}
        {state.phase === "recipient" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Recipient</h2>
            <RecipientForm onChange={(recipient) => update((s) => setMailing(s, { recipient }))} />
          </div>
        )}
        {state.phase === "mailing" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Mail Options</h2>
            <MailOptions options={definition.ux?.mailOptions ?? MAIL_OPTIONS} onSelect={(option) => update((s) => setMailing(s, { mailOption: option }))} />
          </div>
        )}
        {state.phase === "checkout" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Checkout</h2>
            <MailingFunnel state={mailingFunnelState} onChange={setMailingFunnelState} />
          </div>
        )}
        {state.phase === "done" && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Complete</h2>
            <p className="text-sm text-muted-foreground">Your response has been prepared. Review and confirm before mailing.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button onClick={back} className="rounded-lg border px-4 py-2 text-sm">Back</button>
          <button onClick={next} disabled={!canContinue} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {state.phase === "done" ? "Finish" : "Continue"}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-xs text-muted-foreground">{definition.ux?.disclaimerText ?? definition.disclaimer}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
