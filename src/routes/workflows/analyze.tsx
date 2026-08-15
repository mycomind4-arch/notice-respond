import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NarrationButton, DictationInput, VoiceBadge } from "@/components/voice-controls";
import { extractFromText } from "@/platform/notice-extraction";
import { classifyNoticeType, NOTICE_TYPE_META } from "@/domain/notice-type";
import { computeDeadlineDate, daysUntil, deadlineUrgency, URGENCY_META, createDeadline } from "@/domain/deadline";
import { createFact } from "@/domain/fact";
import { createEvidence } from "@/domain/evidence";
import { runReadinessReview } from "@/domain/readiness";
import { recommendStrategies, STRATEGY_TYPE_LABELS } from "@/domain/strategy";
import { generateResponseDraft } from "@/domain/response";
import { createCase, updateCase, primaryDeadline, inferProgress, type NoticeCase } from "@/domain/notice";
import {
  buildAnalysisNarration,
  buildDeadlineNarration,
  buildWalkthroughNarration,
  buildStrategyNarration,
  type WalkthroughStep,
} from "@/domain/voice";
import {
  NarrationController,
  loadVoiceSettings,
  type NarrationState,
} from "@/platform/speech";

export const Route = createFileRoute("/workflows/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze a Notice — Notice Respond" },
      { name: "description", content: "Upload or paste a notice. Get instant analysis with voice narration, deadline tracking, and response drafting." },
    ],
  }),
  component: AnalyzeNotice,
});

type Phase = "input" | "analysis" | "strategy" | "draft";

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  { stepNumber: 1, title: "Input the Notice", description: "Paste the notice text or upload a document to begin analysis.", isCurrent: true, isComplete: false },
  { stepNumber: 2, title: "Review Analysis", description: "The system extracts facts, identifies deadlines, and assesses case readiness.", isCurrent: false, isComplete: false },
  { stepNumber: 3, title: "Choose a Strategy", description: "Select from recommended response strategies based on the analysis.", isCurrent: false, isComplete: false },
  { stepNumber: 4, title: "Generate Response", description: "Review and edit the generated response letter, then proceed to mailing.", isCurrent: false, isComplete: false },
];

function AnalyzeNotice() {
  const [phase, setPhase] = useState<Phase>("input");
  const [noticeText, setNoticeText] = useState("");
  const [userObjective, setUserObjective] = useState("");
  const [userFacts, setUserFacts] = useState("");
  const [selectedStrategyIdx, setSelectedStrategyIdx] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [autoNarrated, setAutoNarrating] = useState(false);

  const caseRef = useRef<NoticeCase | null>(null);

  // Run analysis
  const analysis = useMemo(() => {
    if (!noticeText.trim()) return null;

    const extraction = extractFromText(noticeText);
    const classification = classifyNoticeType(noticeText);
    const deadline = extraction.deadlines[0]?.deadline || createDeadline({ type: "response", certainty: "missing" });
    const dUntil = deadline.date ? daysUntil(deadline.date) : null;
    const urgency = deadline.date ? deadlineUrgency(deadline.date) : "unknown";

    const confirmedFacts = extraction.facts.filter((f) => f.userConfirmed || f.confidence === "high");

    const readiness = runReadinessReview({
      noticeType: classification.type,
      noticeDate: extraction.noticeDate || undefined,
      agency: extraction.agency || undefined,
      referenceNumber: extraction.referenceNumber || undefined,
      deadline,
      facts: extraction.facts,
      evidence: [],
      findings: [],
      draft: "",
      recipient: { name: "", address1: "", city: "", state: "", zip: "" },
      hasSignature: false,
    });

    const strategies = recommendStrategies({
      noticeType: classification.type,
      hasDeadline: !!deadline.date,
      deadlineExpired: urgency === "expired",
      hasContradictions: false,
      hasUnsupportedAllegations: false,
      hasEvidence: false,
      hasMissingInformation: readiness.issuesRequiringAttention > 3,
      hasProceduralIssues: false,
      hasPaymentDemand: !!extraction.amountOwed,
      hasAppealRights: !!extraction.appealRights,
      factConfidence: extraction.extractionConfidence > 0.7 ? "high" : "medium",
    });

    const noticeCase = createCase("analyze");
    caseRef.current = updateCase(noticeCase, {
      type: classification.type,
      typeConfidence: classification.confidence,
      category: NOTICE_TYPE_META[classification.type]?.category || "other",
      agency: extraction.agency || undefined,
      referenceNumber: extraction.referenceNumber || undefined,
      noticeDate: extraction.noticeDate || undefined,
      facts: extraction.facts,
      deadlines: extraction.deadlines.map((d) => d.deadline),
      strategies,
      readinessScore: readiness.score,
      readinessState: readiness.state as any,
    });

    return { extraction, classification, deadline, dUntil, urgency, confirmedFacts, readiness, strategies };
  }, [noticeText]);

  // Voice narration scripts
  const analysisNarration = useMemo(() => {
    if (!analysis) return null;
    return buildAnalysisNarration({
      noticeType: analysis.classification.type,
      noticeTypeLabel: NOTICE_TYPE_META[analysis.classification.type]?.label,
      agency: analysis.extraction.agency || undefined,
      referenceNumber: analysis.extraction.referenceNumber || undefined,
      noticeDate: analysis.extraction.noticeDate || undefined,
      deadlineDate: analysis.deadline.date,
      deadlineUrgency: analysis.urgency,
      deadlineUrgencyLabel: URGENCY_META[analysis.urgency]?.label,
      factCount: analysis.extraction.facts.length,
      confirmedFactCount: analysis.confirmedFacts.length,
      evidenceCount: 0,
      findingCount: analysis.readiness.issuesRequiringAttention,
      readinessState: analysis.readiness.state,
      readinessScore: analysis.readiness.score,
      strategyCount: analysis.strategies.length,
    });
  }, [analysis]);

  const deadlineNarration = useMemo(() => {
    if (!analysis?.deadline.date) return null;
    return buildDeadlineNarration(
      analysis.deadline.date,
      analysis.dUntil,
      URGENCY_META[analysis.urgency]?.label || "Unknown",
    );
  }, [analysis]);

  // Auto-narrate on phase change
  useEffect(() => {
    if (phase === "analysis" && analysis && !autoNarrated) {
      setAutoNarrating(true);
      // Browser speech synthesis requires user interaction; this will only work
      // if the user clicked a button to reach this phase
    }
  }, [phase, analysis, autoNarrated]);

  const handleAnalyze = useCallback(() => {
    if (!noticeText.trim()) return;
    setPhase("analysis");
  }, [noticeText]);

  const handleSelectStrategy = useCallback((idx: number) => {
    setSelectedStrategyIdx(idx);
    setPhase("draft");
  }, []);

  // Draft generation
  const draft = useMemo(() => {
    if (!analysis || selectedStrategyIdx === null || !analysis.strategies[selectedStrategyIdx]) return null;
    return generateResponseDraft({
      agency: analysis.extraction.agency || undefined,
      referenceNumber: analysis.extraction.referenceNumber || undefined,
      noticeDate: analysis.extraction.noticeDate || undefined,
      facts: analysis.extraction.facts,
      deadline: analysis.deadline,
      selectedStrategy: analysis.strategies[selectedStrategyIdx],
      userObjective: userObjective || undefined,
      userFacts: userFacts || undefined,
      hasSignature: true,
    });
  }, [analysis, selectedStrategyIdx, userObjective, userFacts]);

  const walkthrough = useMemo(() => {
    return WALKTHROUGH_STEPS.map((s, i) => ({
      ...s,
      isCurrent:
        (phase === "input" && i === 0) ||
        (phase === "analysis" && i === 1) ||
        (phase === "strategy" && i === 2) ||
        (phase === "draft" && i === 3),
      isComplete:
        (phase === "analysis" && i === 0) ||
        (phase === "strategy" && i < 2) ||
        (phase === "draft" && i < 3),
    }));
  }, [phase]);

  const walkthroughNarration = useMemo(() => buildWalkthroughNarration(walkthrough), [walkthrough]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="postmark w-fit">Analyze</div>
              <VoiceBadge active={true} />
            </div>
            <h1 className="mt-3 font-serif text-4xl">Notice Analysis Studio</h1>
            <p className="mt-1 text-sm text-muted-foreground">Paste or upload a notice. Get instant analysis with voice narration.</p>
          </div>
          <NarrationButton script={walkthroughNarration} label="Walkthrough" />
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: phase === "input" ? "10%" : phase === "analysis" ? "40%" : phase === "strategy" ? "70%" : "95%" }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            {walkthrough.map((s) => (
              <span key={s.stepNumber} className={s.isCurrent ? "font-medium text-stamp" : s.isComplete ? "text-emerald-700" : ""}>
                {s.stepNumber}. {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Phase: Input */}
        {phase === "input" && (
          <div className="mt-8 space-y-6">
            <div className="envelope-card p-6">
              <h2 className="font-serif text-2xl mb-4">Paste the notice text</h2>
              <DictationInput
                value={noticeText}
                onChange={setNoticeText}
                field="noticeText"
                label="Notice content"
                placeholder="Paste the full text of the notice here, or use the microphone to dictate it..."
                multiline
                rows={10}
              />
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={!noticeText.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.055-.75.095m.75-.099a48.05 48.05 0 0 1 9 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5" />
                  </svg>
                  Analyze Notice
                </button>
                <span className="text-xs text-muted-foreground">
                  Or try a sample:{" "}
                  <button
                    className="text-stamp underline hover:no-underline"
                    onClick={() => setNoticeText(SAMPLE_NOTICE)}
                  >
                    Load IRS CP2000 sample
                  </button>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Phase: Analysis */}
        {phase === "analysis" && analysis && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Analysis Results</h2>
              <div className="flex items-center gap-3">
                <NarrationButton script={analysisNarration} label="Listen to summary" />
                {deadlineNarration && <NarrationButton script={deadlineNarration} label="Deadline alert" compact />}
              </div>
            </div>

            {/* Notice type badge */}
            <div className="envelope-card p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Notice Type</div>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-serif text-2xl">{NOTICE_TYPE_META[analysis.classification.type]?.label || "Unknown"}</span>
                <span className="rounded-full bg-stamp/10 px-2 py-0.5 text-xs font-mono text-stamp">
                  {Math.round(analysis.classification.confidence * 100)}% confidence
                </span>
              </div>
              {NOTICE_TYPE_META[analysis.classification.type]?.description && (
                <p className="mt-2 text-sm text-muted-foreground">{NOTICE_TYPE_META[analysis.classification.type].description}</p>
              )}
            </div>

            {/* Deadline card */}
            {analysis.deadline.date && (
              <div className={`envelope-card p-5 border-l-4 ${analysis.urgency === "expired" || analysis.urgency === "critical" ? "border-l-red-500" : analysis.urgency === "urgent" ? "border-l-amber-500" : "border-l-stamp"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Response Deadline</div>
                    <div className="mt-1 font-serif text-2xl">{analysis.deadline.date}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${URGENCY_META[analysis.urgency]?.color === "red" ? "text-red-600" : URGENCY_META[analysis.urgency]?.color === "amber" ? "text-amber-600" : "text-stamp"}`}>
                      {URGENCY_META[analysis.urgency]?.label}
                    </div>
                    {analysis.dUntil !== null && (
                      <div className="text-xs text-muted-foreground">
                        {analysis.dUntil < 0 ? `${Math.abs(analysis.dUntil)} days ago` : `${analysis.dUntil} days remaining`}
                      </div>
                    )}
                  </div>
                </div>
                <NarrationButton script={deadlineNarration} label="Listen to deadline info" compact />
              </div>
            )}

            {/* Extracted facts */}
            {analysis.extraction.facts.length > 0 && (
              <div className="envelope-card p-5">
                <h3 className="font-serif text-lg mb-3">Extracted Facts</h3>
                <div className="space-y-2">
                  {analysis.extraction.facts.map((fact) => (
                    <div key={fact.id} className="flex items-start justify-between border-b border-rule/40 pb-2 last:border-0">
                      <div>
                        <span className="text-sm font-medium text-ink">{fact.label}</span>
                        <p className="text-sm text-ink-soft">{fact.value}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-mono ${
                        fact.confidence === "high" ? "bg-emerald-100 text-emerald-700" :
                        fact.confidence === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {fact.confidence}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Readiness */}
            <div className="envelope-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-lg">Case Readiness</h3>
                <span className="font-mono text-2xl">{analysis.readiness.score}<span className="text-sm text-muted-foreground">/100</span></span>
              </div>
              <div className="progress-track mb-3">
                <div className="progress-fill" style={{ width: `${analysis.readiness.score}%` }} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  analysis.readiness.state === "ready" ? "bg-emerald-100 text-emerald-700" :
                  analysis.readiness.state === "blocked" ? "bg-red-100 text-red-700" :
                  analysis.readiness.state === "incomplete" ? "bg-amber-100 text-amber-700" :
                  "bg-stamp/10 text-stamp"
                }`}>
                  {analysis.readiness.state.replace("_", " ")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {analysis.readiness.issuesRequiringAttention} issues · {analysis.readiness.blockingIssues} blocking
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPhase("strategy")}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5"
              >
                View Strategies ({analysis.strategies.length})
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <button onClick={() => setPhase("input")} className="text-sm text-muted-foreground hover:text-foreground">
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Phase: Strategy */}
        {phase === "strategy" && analysis && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Response Strategies</h2>
              <NarrationButton script={null} label="" />
            </div>
            <p className="text-sm text-muted-foreground">
              Based on the analysis, here are recommended approaches. These are options, not legal advice.
            </p>

            {analysis.strategies.map((strategy, idx) => {
              const stratNarration = buildStrategyNarration({
                label: STRATEGY_TYPE_LABELS[strategy.type],
                description: strategy.description,
                reason: strategy.reason,
                confidence: strategy.confidence,
                risks: strategy.risks,
                prerequisites: strategy.prerequisites,
              });
              return (
                <div key={strategy.id} className="envelope-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg">{STRATEGY_TYPE_LABELS[strategy.type]}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-mono ${
                          strategy.confidence === "high" ? "bg-emerald-100 text-emerald-700" :
                          strategy.confidence === "medium" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {strategy.confidence} confidence
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-ink-soft">{strategy.description}</p>
                      {strategy.reason && <p className="mt-2 text-xs text-muted-foreground">{strategy.reason}</p>}
                      {strategy.risks.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-red-600">Risks:</span>
                          <ul className="mt-1 space-y-0.5">
                            {strategy.risks.map((risk, i) => (
                              <li key={i} className="text-xs text-muted-foreground">• {risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <NarrationButton script={stratNarration} label="Listen" compact />
                      <button
                        onClick={() => handleSelectStrategy(idx)}
                        className="rounded-full border border-stamp px-4 py-1.5 text-xs font-medium text-stamp transition-colors hover:bg-stamp hover:text-accent-foreground"
                      >
                        Select →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <button onClick={() => setPhase("analysis")} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to analysis
            </button>
          </div>
        )}

        {/* Phase: Draft */}
        {phase === "draft" && draft && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Your Response Draft</h2>
              <NarrationButton
                script={{
                  id: "draft-narration",
                  mode: "narration",
                  title: "Response Draft",
                  segments: [{ id: "1", text: draft.content, role: "body" as const, priority: "normal" as const, pauseAfter: 400 }],
                  totalWords: draft.wordCount,
                  estimatedSeconds: Math.ceil(draft.wordCount / 2.5),
                  createdAt: new Date().toISOString(),
                }}
                label="Listen to draft"
              />
            </div>

            {/* User inputs */}
            <div className="envelope-card p-5 space-y-4">
              <DictationInput
                value={userObjective}
                onChange={setUserObjective}
                field="objective"
                label="Your objective (what you want the response to accomplish)"
                placeholder="Example: Explain the income discrepancy and provide corrected documentation..."
                multiline
                rows={2}
              />
              <DictationInput
                value={userFacts}
                onChange={setUserFacts}
                field="facts"
                label="Additional facts from your records"
                placeholder="Enter any facts you want included that weren't extracted from the notice..."
                multiline
                rows={3}
              />
            </div>

            {/* Draft content */}
            <div className="envelope-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {draft.wordCount} words · {draft.unresolvedPlaceholders.length} placeholders
                </div>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-6 text-ink">
                {draft.content}
              </pre>
            </div>

            {/* Placeholder warnings */}
            {draft.unresolvedPlaceholders.length > 0 && (
              <div className="rounded-md border border-amber-300/50 bg-amber-50/50 p-4">
                <h4 className="text-sm font-medium text-amber-700">Unresolved items ({draft.unresolvedPlaceholders.length})</h4>
                <ul className="mt-2 space-y-1">
                  {draft.unresolvedPlaceholders.map((p, i) => (
                    <li key={i} className="text-xs text-amber-600">
                      • [{p.placeholder}] — {p.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Link
                to="/workflows/irs-notice"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5"
              >
                Continue to Mailing →
              </Link>
              <button onClick={() => setPhase("strategy")} className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to strategies
              </button>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

const SAMPLE_NOTICE = `Internal Revenue Service
CP2000 Notice of Underreported Income
Notice Number: CP2000-2024-12345-A
Date: July 15, 2026

Dear Taxpayer,

We are proposing changes to your 2024 tax return based on information received from third parties.

The income reported on your tax return does not match the income reported to us by employers and other payers.

Amount due: $3,847.00
You must respond by September 15, 2026.

If you agree with the changes, sign and return the response form with your payment.
If you disagree, provide a written explanation with supporting documentation.

You have the right to appeal this determination.

Sincerely,
IRS Automated Underreporter Operations`;
