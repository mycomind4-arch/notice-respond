import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { workflows } from "../../domain/workflows";
import { WorkflowShell, Success, UploadZone, ReviewChecks, MailOptions, RecipientForm, CheckoutStep, type StepDef } from "@/components/workflow-shell";

export const Route = createFileRoute("/workflows/agency-action")({
  head: () => ({ meta: [
    { rel: 'canonical', href: '/workflows/agency-action' },
    { title: "Respond to an Agency Action — Notice Respond" },
    { name: "description", content: "Prepare a written response to a regulatory agency notice, licensing board action, or FOIA determination." },
  ] }),
  component: AgencyAction,
});

const STEPS: StepDef[] = [
  { id: "intro", label: "Start" }, { id: "notice", label: "Notice" }, { id: "facts", label: "Facts" },
  { id: "objective", label: "Objective" }, { id: "draft", label: "Draft" }, { id: "review", label: "Review" },
  { id: "attachments", label: "Documents" }, { id: "recipient", label: "Recipient" },
  { id: "mailing", label: "Mail" }, { id: "checkout", label: "Checkout" }, { id: "done", label: "Done" },
];

const REVIEW_CHECKS = [
  "I reviewed every factual statement in this draft.",
  "Agency name, notice number, and reference numbers are correct.",
  "I reviewed the agency's instructions and response requirements.",
  "I understand Notice Respond is not providing legal advice.",
];

function AgencyAction() {
  const definition = workflows["agency-action"];
  const [step, setStep] = useState(0);
  const [agencyName, setAgencyName] = useState("");
  const [noticeType, setNoticeType] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [responseDeadline, setResponseDeadline] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [facts, setFacts] = useState("");
  const [objective, setObjective] = useState("");
  const [draft, setDraft] = useState("");
  const [checks, setChecks] = useState<boolean[]>(REVIEW_CHECKS.map(() => false));
  const [mailType, setMailType] = useState("certified");
  const [recipient, setRecipient] = useState({ name: "", org: "", address1: "", address2: "", city: "", state: "", zip: "" });
  const [done, setDone] = useState(false);
  const allChecked = checks.every(Boolean);

  function generateDraft() {
    return `Re: Response to Agency Notice
${agencyName ? `Agency: ${agencyName}` : ""}
${noticeType ? `Notice Type: ${noticeType}` : ""}
${referenceNumber ? `Reference: ${referenceNumber}` : ""}
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
      case 1: return agencyName.trim().length > 0;
      case 2: return facts.trim().length > 0;
      case 3: return objective.trim().length > 0;
      case 5: return allChecked;
      case 7: return !!(recipient.name && recipient.address1 && recipient.city && recipient.state && recipient.zip);
      default: return true;
    }
  }

  function next() {
    if (step === 4 && !draft) setDraft(generateDraft());
    if (step === STEPS.length - 1) { setDone(true); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  if (done) return <Success title="Your agency response has been submitted" href="/workflows/agency-action" />;

  return (
    <WorkflowShell title="Respond to an Agency Action" steps={STEPS} step={step} setStep={setStep} canContinue={canContinue()} onNext={next} onBack={() => setStep((s) => Math.max(s - 1, 0))}>
      {step === 0 && (
        <div>
          <div className="postmark w-fit">1 · Start</div>
          <h2 className="mt-4 font-serif text-4xl">Respond to an agency action</h2>
          <p className="mt-3 text-muted-foreground">Prepare a written response to a regulatory agency notice, licensing board action, or FOIA determination.</p>
          <div className="mt-6 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-sm text-muted-foreground"><div className="font-mono text-xs uppercase tracking-widest text-stamp">Disclaimer</div><p className="mt-2">{definition.disclaimer}</p></div>
        </div>
      )}
      {step === 1 && (
        <div>
          <div className="postmark w-fit">2 · Notice</div>
          <h2 className="mt-4 font-serif text-3xl">Start with the notice</h2>
          <UploadZone label="Upload agency notice" sublabel="PDF, JPG, or PNG" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div><label className="input-label">Agency name *</label><input className="input-field" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="State Board, EPA, FDA, etc." /></div>
            <div><label className="input-label">Notice type</label><input className="input-field" value={noticeType} onChange={(e) => setNoticeType(e.target.value)} placeholder="Code enforcement, licensing, FOIA, etc." /></div>
            <div><label className="input-label">Reference number</label><input className="input-field" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} /></div>
            <div><label className="input-label">Notice date</label><input type="date" className="input-field" value={noticeDate} onChange={(e) => setNoticeDate(e.target.value)} /></div>
            <div><label className="input-label">Response deadline</label><input type="date" className="input-field" value={responseDeadline} onChange={(e) => setResponseDeadline(e.target.value)} /></div>
          </div>
        </div>
      )}
      {step === 2 && (<div><div className="postmark w-fit">3 · Facts</div><h2 className="mt-4 font-serif text-3xl">What facts should the response address?</h2><p className="mt-3 text-muted-foreground">Use your own words. Only include information you can verify.</p><textarea className="input-field mt-6 min-h-48" value={facts} onChange={(e) => setFacts(e.target.value)} /></div>)}
      {step === 3 && (<div><div className="postmark w-fit">4 · Objective</div><h2 className="mt-4 font-serif text-3xl">What do you want to accomplish?</h2><textarea className="input-field mt-6 min-h-40" value={objective} onChange={(e) => setObjective(e.target.value)} /></div>)}
      {step === 4 && (<div><div className="postmark w-fit">5 · Draft</div><h2 className="mt-4 font-serif text-3xl">Your response letter</h2><p className="mt-3 text-muted-foreground">Review every fact. This is editable.</p><textarea className="input-field mt-6 min-h-72 font-mono text-sm leading-6" value={draft} onChange={(e) => setDraft(e.target.value)} /></div>)}
      {step === 5 && (<div><div className="postmark w-fit">6 · Review</div><h2 className="mt-4 font-serif text-3xl">Review before anything is mailed</h2><ReviewChecks items={REVIEW_CHECKS} checks={checks} setChecks={setChecks} /></div>)}
      {step === 6 && (<div><div className="postmark w-fit">7 · Documents</div><h2 className="mt-4 font-serif text-3xl">Add supporting documents</h2><UploadZone label="Add attachments" sublabel="Evidence, permits, prior correspondence" /></div>)}
      {step === 7 && (<div><div className="postmark w-fit">8 · Recipient</div><h2 className="mt-4 font-serif text-3xl">Where should we send it?</h2><RecipientForm recipient={recipient} setRecipient={setRecipient} orgPlaceholder={agencyName || "Agency name"} /></div>)}
      {step === 8 && (<div><div className="postmark w-fit">9 · Mail</div><h2 className="mt-4 font-serif text-3xl">Choose your mail type</h2><p className="mt-3 text-muted-foreground">For agency responses, Certified mail is recommended.</p><MailOptions selected={mailType} onSelect={setMailType} /></div>)}
      {step === 9 && <CheckoutStep mailType={mailType} recipient={recipient} />}
    </WorkflowShell>
  );
}
