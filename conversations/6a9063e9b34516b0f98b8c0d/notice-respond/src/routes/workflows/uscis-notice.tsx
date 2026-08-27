import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { workflows } from "../../domain/workflows";
import { WorkflowShell, Success, UploadZone, ReviewChecks, MailOptions, RecipientForm, CheckoutStep, type StepDef } from "@/components/workflow-shell";
import { createWorkflowHead } from "@/domain/enhanced-head";
import { useCombinedAnalysis } from "@/domain/use-combined-analysis";
import { LLMAnalysisPanel } from "@/components/llm-analysis-panel";
import { FAQSection } from "@/components/faq-section";
import { getWorkflowSEO } from "@/domain/workflow-seo";

export const Route = createFileRoute("/workflows/uscis-notice")({
  head: () => createWorkflowHead("uscis-notice"),
  component: uscisnotice,
});

const STEPS: StepDef[] = [
  { id: "intro", label: "Start" }, { id: "notice", label: "Notice" }, { id: "facts", label: "Facts" },
  { id: "objective", label: "Objective" }, { id: "draft", label: "Draft" }, { id: "review", label: "Review" },
  { id: "attachments", label: "Documents" }, { id: "recipient", label: "Recipient" },
  { id: "mailing", label: "Mail" }, { id: "checkout", label: "Checkout" }, { id: "done", label: "Done" },
];

const REVIEW_CHECKS = [
  "I reviewed every factual statement in this draft.",
  "Names, dates, notice numbers, and amounts are correct.",
  "I reviewed the uploaded notice and agency instructions.",
  "I understand Notice Respond is not providing legal advice.",
];

function uscisnotice() {
  const definition = workflows["uscis-notice"];
  const [step, setStep] = useState(0);
  const [agency, setAgency] = useState("");
  const [noticeNumber, setNoticeNumber] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [responseDeadline, setResponseDeadline] = useState("");
  const [facts, setFacts] = useState("");
  const [objective, setObjective] = useState("");
  const [draft, setDraft] = useState("");
  const [checks, setChecks] = useState<boolean[]>(REVIEW_CHECKS.map(() => false));
  const [mailType, setMailType] = useState("certified");
  const [recipient, setRecipient] = useState({ name: "", org: "", address1: "", address2: "", city: "", state: "", zip: "" });
  const [done, setDone] = useState(false);
  const allChecked = checks.every(Boolean);
  const llmAnalysis = useCombinedAnalysis("uscis-notice");

  function generateDraft() {
    return `Re: Response to Respond to a USCIS Notice
${agency ? `Agency: ${agency}` : ""}
${noticeNumber ? `Reference: ${noticeNumber}` : ""}
${noticeDate ? `Notice Date: ${noticeDate}` : ""}
${responseDeadline ? `Response Deadline: ${responseDeadline}` : ""}

Dear Sir or Madam,

I am writing in response to the notice referenced above. ${objective || "[Your objective will appear here.]"}

${facts || "[The facts you provided will appear here.]"}

Sincerely,
[Your Name]`;
  }

  function canContinue() {
    switch (step) {
      case 1: return agency.trim().length > 0 || noticeNumber.trim().length > 0;
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
            body: JSON.stringify({ workflowId: "uscis-notice", analysis: llmAnalysis.llmAnalysis, userFacts: facts, userObjective: objective }),
          });
          if (r.ok) {
            const d = await r.json();
            setDraft(d.draft);
          } else {
            setDraft(generateDraft());
          }
        } else {
          setDraft(generateDraft());
        }
      } catch (e) {
        setDraft(generateDraft());
      }
    }
    if (step === STEPS.length - 1) { setDone(true); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  if (done) return <Success title="Your response has been submitted" href="/workflows/uscis-notice" />;

  return (
    <WorkflowShell title="Respond to a USCIS Notice" steps={STEPS} step={step} setStep={setStep} canContinue={canContinue()} onNext={next} onBack={() => setStep((s) => Math.max(s - 1, 0))}>
      {step === 0 && (
        <div>
          <div className="postmark w-fit">1 · Start</div>
          <h2 className="mt-4 font-serif text-4xl">Respond to a USCIS Notice</h2>
          <p className="mt-3 text-muted-foreground">Keep the USCIS notice, deadline, receipt number, requested evidence, and response package organized in one workflow.</p>
          <div className="mt-6 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-sm text-muted-foreground">
            <div className="font-mono text-xs uppercase tracking-widest text-stamp">Disclaimer</div>
            <p className="mt-2">{definition?.disclaimer ?? "Immigration proceedings have strict deadlines and requirements. Notice Respond is not a law firm and does not provide legal or immigration advice."}</p>
          </div>
          {(() => { const seo = getWorkflowSEO("uscis-notice"); return seo ? <FAQSection faq={seo.faq} /> : null; })()}
        </div>
      )}
      {step === 1 && (
        <div>
          <div className="postmark w-fit">2 · Notice</div>
          <h2 className="mt-4 font-serif text-3xl">Start with the notice</h2>
          <label className="cursor-pointer block">
            <input type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              let text = ""; if (file.type === "text/plain") text = await file.text();
              await llmAnalysis.analyzeWithLLM(file, text);
            }} />
            <UploadZone label="Upload notice" sublabel="PDF, JPG, or PNG" />
          </label>
          {llmAnalysis.llmAnalysis && (
            <LLMAnalysisPanel analysis={llmAnalysis.llmAnalysis} provider={llmAnalysis.llmProvider} />
          )}
          {llmAnalysis.llmLoading && (
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary animate-pulse">✦ AI is analyzing your document…</div>
          )}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div><label className="input-label">Agency</label><input className="input-field" value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="USCIS" /></div>
            <div><label className="input-label">Notice / reference number</label><input className="input-field" value={noticeNumber} onChange={(e) => setNoticeNumber(e.target.value)} /></div>
            <div><label className="input-label">Notice date</label><input type="date" className="input-field" value={noticeDate} onChange={(e) => setNoticeDate(e.target.value)} /></div>
            <div><label className="input-label">Response deadline</label><input type="date" className="input-field" value={responseDeadline} onChange={(e) => setResponseDeadline(e.target.value)} /></div>
          </div>
        </div>
      )}
      {step === 2 && (<div><div className="postmark w-fit">3 · Facts</div><h2 className="mt-4 font-serif text-3xl">What facts should the response address?</h2><p className="mt-3 text-muted-foreground">Use your own words. Only include information you can verify.</p><textarea className="input-field mt-6 min-h-48" value={facts} onChange={(e) => setFacts(e.target.value)} placeholder="Enter the relevant facts..." /></div>)}
      {step === 3 && (<div><div className="postmark w-fit">4 · Objective</div><h2 className="mt-4 font-serif text-3xl">What do you want the response to accomplish?</h2><textarea className="input-field mt-6 min-h-40" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Describe the outcome you want..." /></div>)}
      {step === 4 && (
        <div>
          <div className="postmark w-fit">5 · Draft</div>
          <h2 className="mt-4 font-serif text-3xl">Your response letter</h2>
          <p className="mt-3 text-muted-foreground">Review every fact, name, date, and statement. This is editable.</p>
          <textarea className="input-field mt-6 min-h-72 font-mono text-sm leading-6" value={draft} onChange={(e) => setDraft(e.target.value)} />
          {llmAnalysis.llmAnalysis && (
            <button
              onClick={async () => {
                const r = await fetch("/api/workflows/draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workflowId: "uscis-notice", analysis: llmAnalysis.llmAnalysis, userFacts: facts, userObjective: objective }) });
                if (r.ok) { const d = await r.json(); setDraft(d.draft); }
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5"
            >✦ Regenerate with AI</button>
          )}
        </div>
      )}
      {step === 5 && (<div><div className="postmark w-fit">6 · Review</div><h2 className="mt-4 font-serif text-3xl">Review before anything is mailed</h2><p className="mt-3 text-muted-foreground">Please confirm each item below.</p><ReviewChecks items={REVIEW_CHECKS} checks={checks} setChecks={setChecks} /></div>)}
      {step === 6 && (<div><div className="postmark w-fit">7 · Documents</div><h2 className="mt-4 font-serif text-3xl">Add supporting documents</h2><p className="mt-3 text-muted-foreground">Attach any documents referenced in your response.</p><UploadZone label="Add attachments" sublabel="Evidence, records, correspondence" /></div>)}
      {step === 7 && (<div><div className="postmark w-fit">8 · Recipient</div><h2 className="mt-4 font-serif text-3xl">Where should we send it?</h2><p className="mt-3 text-muted-foreground">Enter the agency's mailing address.</p><RecipientForm recipient={recipient} setRecipient={setRecipient} orgPlaceholder={agency || "USCIS"} /></div>)}
      {step === 8 && (<div><div className="postmark w-fit">9 · Mail</div><h2 className="mt-4 font-serif text-3xl">Choose your mail type</h2><p className="mt-3 text-muted-foreground">Certified mail is recommended for proof of timely delivery.</p><MailOptions selected={mailType} onSelect={setMailType} /></div>)}
      {step === 9 && <CheckoutStep mailType={mailType} recipient={recipient} />}
    </WorkflowShell>
  );
}
