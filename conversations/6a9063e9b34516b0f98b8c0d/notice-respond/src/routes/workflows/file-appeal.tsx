import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { workflows } from "../../domain/workflows";
import { WorkflowShell, Success, UploadZone, ReviewChecks, MailOptions, RecipientForm, CheckoutStep, type StepDef } from "@/components/workflow-shell";

import { createWorkflowHead } from "@/domain/enhanced-head";
import { useCombinedAnalysis } from "@/domain/use-combined-analysis";
import { LLMAnalysisPanel } from "@/components/llm-analysis-panel";
import { FAQSection } from "@/components/faq-section";
import { getWorkflowSEO } from "@/domain/workflow-seo";
export const Route = createFileRoute("/workflows/file-appeal")({
  head: () => ({ meta: [
    { rel: 'canonical', href: '/workflows/file-appeal' },
    { title: "File an Appeal — Notice Respond" },
    { name: "description", content: "Prepare an appeal letter for a denied claim, decision, or ruling and mail it with proof of delivery." },
  ] }),
  component: FileAppeal,
});

const STEPS: StepDef[] = [
  { id: "intro", label: "Start" }, { id: "notice", label: "Notice" }, { id: "facts", label: "Facts" },
  { id: "objective", label: "Objective" }, { id: "draft", label: "Draft" }, { id: "review", label: "Review" },
  { id: "attachments", label: "Documents" }, { id: "recipient", label: "Recipient" },
  { id: "mailing", label: "Mail" }, { id: "checkout", label: "Checkout" }, { id: "done", label: "Done" },
];

const REVIEW_CHECKS = [
  "I reviewed every factual statement in this draft.",
  "Case number, decision date, and appeal deadline are correct.",
  "I reviewed the appeal instructions from the agency or court.",
  "I understand Notice Respond is not providing legal advice.",
];

function FileAppeal() {
  const definition = workflows["file-appeal"];
  const [step, setStep] = useState(0);
  const [appealingTo, setAppealingTo] = useState("");
  const [decisionDate, setDecisionDate] = useState("");
  const [appealDeadline, setAppealDeadline] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [originalDecision, setOriginalDecision] = useState("");
  const [facts, setFacts] = useState("");
  const [objective, setObjective] = useState("");
  const [draft, setDraft] = useState("");
  const [checks, setChecks] = useState<boolean[]>(REVIEW_CHECKS.map(() => false));
  const [mailType, setMailType] = useState("certified");
  const [recipient, setRecipient] = useState({ name: "", org: "", address1: "", address2: "", city: "", state: "", zip: "" });
  const [done, setDone] = useState(false);
  const llmAnalysis = useCombinedAnalysis("file-appeal");
  const allChecked = checks.every(Boolean);

  function generateDraft() {
    return `Re: Appeal of Decision
${appealingTo ? `Appealing to: ${appealingTo}` : ""}
${caseNumber ? `Case No.: ${caseNumber}` : ""}
${decisionDate ? `Decision Date: ${decisionDate}` : ""}
${appealDeadline ? `Appeal Deadline: ${appealDeadline}` : ""}

Dear Sir or Madam,

I am writing to appeal the decision referenced above. ${objective || "[Your objective will appear here.]"}

${originalDecision ? `Original Decision: ${originalDecision}` : ""}

${facts || "[The facts you provided will appear here.]"}

Sincerely,
[Your Name]`;
  }

  function canContinue() {
    switch (step) {
      case 1: return appealingTo.trim().length > 0;
      case 2: return facts.trim().length > 0;
      case 3: return objective.trim().length > 0;
      case 5: return allChecked;
      case 7: return !!(recipient.name && recipient.address1 && recipient.city && recipient.state && recipient.zip);
      default: return true;
    }
  }

  async function next() {
    if (step === 4 && !draft) {
      try {
        if (llmAnalysis.llmAnalysis) {
          const r = await fetch("/api/workflows/draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workflowId: "file-appeal", analysis: llmAnalysis.llmAnalysis, userFacts: facts, userObjective: objective }),
          });
          if (r.ok) { const d = await r.json(); setDraft(d.draft); } else { setDraft(generateDraft()); }
        } else { setDraft(generateDraft()); }
      } catch (e) { setDraft(generateDraft()); }
    }
    if (step === STEPS.length - 1) { setDone(true); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  if (done) return <Success title="Your appeal has been submitted" href="/workflows/file-appeal" />;

  return (
    <WorkflowShell title="File an Appeal" steps={STEPS} step={step} setStep={setStep} canContinue={canContinue()} onNext={next} onBack={() => setStep((s) => Math.max(s - 1, 0))}>
      {step === 0 && (
        <div>
          <div className="postmark w-fit">1 · Start</div>
          <h2 className="mt-4 font-serif text-4xl">File an appeal</h2>
          <p className="mt-3 text-muted-foreground">Prepare an appeal letter for a denied claim, decision, or ruling and mail it with proof of delivery.</p>
          <div className="mt-6 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-sm text-muted-foreground"><div className="font-mono text-xs uppercase tracking-widest text-stamp">Disclaimer</div><p className="mt-2">{definition.disclaimer}</p></div>
        </div>
      )}
      {step === 1 && (
        <div>

          {llmAnalysis.llmAnalysis && (
            <LLMAnalysisPanel analysis={llmAnalysis.llmAnalysis} provider={llmAnalysis.llmProvider} />
          )}
          {llmAnalysis.llmLoading && (
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary animate-pulse">✦ AI is analyzing your document…</div>
          )}
          <div className="postmark w-fit">2 · Notice</div>
          <h2 className="mt-4 font-serif text-3xl">Start with the decision</h2>
          <label className="cursor-pointer block">
            <input type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              let text = ""; if (file.type === "text/plain") text = await file.text();
              await llmAnalysis.analyzeWithLLM(file, text);
            }} />
            <UploadZone label="Upload decision letter" sublabel="PDF, JPG, or PNG" />
          </label>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div><label className="input-label">Appealing to *</label><input className="input-field" value={appealingTo} onChange={(e) => setAppealingTo(e.target.value)} placeholder="Agency, board, or court" /></div>
            <div><label className="input-label">Case number</label><input className="input-field" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} /></div>
            <div><label className="input-label">Decision date</label><input type="date" className="input-field" value={decisionDate} onChange={(e) => setDecisionDate(e.target.value)} /></div>
            <div><label className="input-label">Appeal deadline</label><input type="date" className="input-field" value={appealDeadline} onChange={(e) => setAppealDeadline(e.target.value)} /></div>
            <div className="sm:col-span-2"><label className="input-label">Original decision (summary)</label><input className="input-field" value={originalDecision} onChange={(e) => setOriginalDecision(e.target.value)} placeholder="Briefly describe what was decided" /></div>
          </div>
        </div>
      )}
      {step === 2 && (<div><div className="postmark w-fit">3 · Facts</div><h2 className="mt-4 font-serif text-3xl">What facts should the appeal include?</h2><textarea className="input-field mt-6 min-h-48" value={facts} onChange={(e) => setFacts(e.target.value)} /></div>)}
      {step === 3 && (<div><div className="postmark w-fit">4 · Objective</div><h2 className="mt-4 font-serif text-3xl">What do you want the appeal to accomplish?</h2><textarea className="input-field mt-6 min-h-40" value={objective} onChange={(e) => setObjective(e.target.value)} /></div>)}
      {step === 4 && (<div><div className="postmark w-fit">5 · Draft</div><h2 className="mt-4 font-serif text-3xl">Your appeal letter</h2><p className="mt-3 text-muted-foreground">Review every fact. This is editable.</p><textarea className="input-field mt-6 min-h-72 font-mono text-sm leading-6" value={draft} onChange={(e) => setDraft(e.target.value)} /></div>)}
      {step === 5 && (<div><div className="postmark w-fit">6 · Review</div><h2 className="mt-4 font-serif text-3xl">Review before anything is mailed</h2><ReviewChecks items={REVIEW_CHECKS} checks={checks} setChecks={setChecks} /></div>)}
      {step === 6 && (<div><div className="postmark w-fit">7 · Documents</div><h2 className="mt-4 font-serif text-3xl">Add supporting documents</h2><UploadZone label="Add attachments" sublabel="Evidence, prior filings, documentation" /></div>)}
      {step === 7 && (<div><div className="postmark w-fit">8 · Recipient</div><h2 className="mt-4 font-serif text-3xl">Where should we send it?</h2><RecipientForm recipient={recipient} setRecipient={setRecipient} orgPlaceholder={appealingTo || "Organization"} /></div>)}
      {step === 8 && (<div><div className="postmark w-fit">9 · Mail</div><h2 className="mt-4 font-serif text-3xl">Choose your mail type</h2><p className="mt-3 text-muted-foreground">For appeals, Certified mail is recommended for proof of timely filing.</p><MailOptions selected={mailType} onSelect={setMailType} /></div>)}
      {step === 9 && <CheckoutStep mailType={mailType} recipient={recipient} />}
    </WorkflowShell>
  );
}
