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
import { extractCP14, generateCP14Draft, type CP14Extraction } from "@/domain/cp14";
import { validateDraft } from "@/domain/draft-validator";
import { recommendStrategies, STRATEGY_TYPE_LABELS } from "@/domain/strategy";
import { detectContradictions, contradictionSummary } from "@/domain/contradiction";
import { detectMissingInfo, missingInfoSummary } from "@/domain/missing-info";

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

  const update = (fn: (s: WorkflowState) => WorkflowState) => setState(fn);

  // ── Document upload and extraction ──
  const handleFileUpload = useCallback(async (file: File) => {
    update((s) => setProcessing(s, true));
    setExtractionError(null);
    
    try {
      // Read file as text (for now — PDF extraction would use pdf.js)
      let text = "";
      if (file.type === "application/pdf") {
        // For PDF, we need pdf.js or server extraction
        // For now, read as text if possible, otherwise show instructions
        try {
          const buffer = await file.arrayBuffer();
          // Simple PDF text extraction: look for text between BT and ET markers
          const decoder = new TextDecoder("latin1");
          const raw = decoder.decode(buffer);
          // Extract text from PDF streams (basic)
          const textMatches = raw.match(/\(([^)]+)\)/g);
          if (textMatches) {
            text = textMatches.map(m => m.slice(1, -1)).join(" ");
          }
        } catch {
          text = "";
        }
      } else if (file.type.startsWith("image/")) {
        text = ""; // Image OCR would go here
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
      
      // Run CP14 extraction
      if (text && text.length > 20) {
        const extraction = extractCP14(text);
        setCP14Extraction(extraction);
        
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
      setExtractionError(`Failed to process document: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      update((s) => setProcessing(s, false));
    }
  }, [update]);

  const handlePasteText = useCallback((text: string) => {
    const upload: DocumentUpload = {
      fileName: "Pasted text",
      fileSize: text.length,
      fileType: "text/plain",
      rawText: text,
      uploadedAt: new Date().toISOString(),
    };
    update((s) => setUpload(s, upload));
    
    const extraction = extractCP14(text);
    setCP14Extraction(extraction);
    
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
  }, [update]);

  // ── Draft generation ──
  const handleGenerateDraft = useCallback(() => {
    const draft = generateCP14Draft({
      noticeNumber: cp14Extraction?.noticeNumber ?? "",
      taxYear: cp14Extraction?.taxYear ?? null,
      noticeDate: cp14Extraction?.noticeDate ?? null,
      responseDeadline: cp14Extraction?.responseDeadline ?? null,
      balanceDue: cp14Extraction?.balanceDue ?? null,
      totalDue: cp14Extraction?.totalDue ?? null,
      userFacts: state.userFacts,
      userObjective: state.userObjective,
    });
    
    update((s) => setDraft(s, draft));
    
    // Run validation
    const validation = validateDraft(draft, state.extractedFacts, definition, {
      expectedNoticeNumber: cp14Extraction?.noticeNumber ?? undefined,
      expectedTaxYear: cp14Extraction?.taxYear ?? undefined,
      expectedDeadline: cp14Extraction?.responseDeadline ?? undefined,
      expectedAmounts: [cp14Extraction?.balanceDue, cp14Extraction?.totalDue].filter(Boolean) as string[],
    });
    update((s) => setDraftValidation(s, validation));
  }, [cp14Extraction, state.userFacts, state.userObjective, state.extractedFacts, definition, update]);

  // ── Step navigation ──
  const canContinue = canAdvance(state, definition);
  
  const next = () => {
    if (state.phase === "draft" && !state.draft) {
      handleGenerateDraft();
    }
    if (state.phase === "checkout" || state.phase === "submitted") {
      // MailingFunnel handles checkout and submission internally
      return;
    }
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
                          <div key={fact.id} className="flex items-start justify-between gap-4 border-b border-rule/30 pb-2 last:border-0">
                            <dt className="text-sm font-medium text-foreground">{fact.label}</dt>
                            <dd className="text-sm text-muted-foreground">{fact.value || "—"}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-rule/60 p-4 text-sm text-muted-foreground">
                      No structured facts were extracted. You can enter facts manually in the next step.
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
                placeholder="Example: I already paid this balance on [date] via [method]. The payment of $X was made for tax year [year]. I have enclosed the payment confirmation and bank statement…"
              />
              <div className="mt-4 rounded-md border border-rule/70 bg-paper-deep/40 p-3 text-sm text-muted-foreground">
                <strong>Tip:</strong> Include specific amounts, dates, payer names, and form numbers. Reference the documents you'll attach as evidence.
              </div>
            </div>
          )}

          {/* ── Step 4: Objective ── */}
          {state.phase === "objective" && (
            <div>
              <div className="postmark w-fit">5 · Objective</div>
              <h2 className="mt-4 font-serif text-3xl">What do you want the response to accomplish?</h2>
              <p className="mt-3 text-muted-foreground">State your objective clearly. This guides the response strategy.</p>
              
              {/* Strategy suggestions */}
              {strategies.length > 0 && (
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
              <button
                onClick={handleGenerateDraft}
                className="mt-4 rounded-full border border-rule px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Regenerate draft
              </button>
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
              <p className="mt-3 text-muted-foreground">Attach any documents referenced in your response — W-2s, 1099s, return transcripts, corrected forms, etc.</p>
              <label className="upload-zone mt-6 block cursor-pointer">
                <svg className="mx-auto text-muted-foreground" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                <span className="mt-3 block font-medium text-foreground">Add attachments</span>
                <span className="mt-1 block text-xs text-muted-foreground">Forms, receipts, evidence, prior correspondence</span>
                <input type="file" accept="application/pdf,image/jpeg,image/png" multiple className="sr-only" />
              </label>
              <div className="mt-4 text-sm text-muted-foreground">
                Required evidence: {definition.evidence.filter(e => e.required).map(e => e.label).join(", ")}
              </div>
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
              <button onClick={back} disabled={state.step === 0} className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30">
                ← Back
              </button>
              <button
                onClick={next}
                disabled={!canContinue}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5 disabled:opacity-30 disabled:transform-none disabled:shadow-none"
              >
                Continue →
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
