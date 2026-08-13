import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { workflows } from "../../domain/workflows";
import { WorkflowShell, Success, UploadZone, ReviewChecks, MailOptions, RecipientForm, CheckoutStep, MAIL_OPTIONS, type StepDef } from "@/components/workflow-shell";

export const Route = createFileRoute("/workflows/irs-notice")({
  head: () => ({ meta: [
    { title: "Respond to an IRS Notice — Notice Respond" },
    { name: "description", content: "Guided workflow to organize an IRS notice, prepare a written response, and mail it with proof of delivery." },
  ] }),
  component: IRSNotice,
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
  "I reviewed the uploaded notice and IRS instructions.",
  "I understand Notice Respond is not providing legal or tax advice.",
];

function IRSNotice() {
  const definition = workflows["irs-notice"];
  const [step, setStep] = useState(0);
  const [noticeNumber, setNoticeNumber] = useState("");
  const [noticeType, setNoticeType] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [responseDeadline, setResponseDeadline] = useState("");
  const [taxYear, setTaxYear] = useState("");
  const [facts, setFacts] = useState("");
  const [objective, setObjective] = useState("");
  const [draft, setDraft] = useState("");
  const [checks, setChecks] = useState<boolean[]>(REVIEW_CHECKS.map(() => false));
  const [mailType, setMailType] = useState("certified");
  const [recipient, setRecipient] = useState({ name: "", org: "", address1: "", address2: "", city: "", state: "", zip: "" });
  const [done, setDone] = useState(false);
  const allChecked = checks.every(Boolean);

  function generateDraft() {
    return `Re: Response to IRS Notice ${noticeNumber || "[Notice Number]"}
${noticeType ? `Notice Type: ${noticeType}` : ""}
${taxYear ? `Tax Year: ${taxYear}` : ""}
${noticeDate ? `Notice Date: ${noticeDate}` : ""}
${responseDeadline ? `Response Deadline: ${responseDeadline}` : ""}

Dear Sir or Madam,

I am writing in response to the notice referenced above. ${objective || "[Your objective will appear here.]"}

${facts || "[The facts you provided will appear here.]"}

Please find enclosed the requested information and documentation. I respectfully request that you consider this response in a timely manner.

Sincerely,
[Your Name]`;
  }

  function canContinue() {
    switch (step) {
      case 1: return noticeNumber.trim().length > 0;
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

  if (done) return <Success title="Your IRS response has been submitted" href="/workflows/irs-notice" />;

  return (
    <WorkflowShell title="Respond to an IRS Notice" steps={STEPS} step={step} setStep={setStep} canContinue={canContinue()} onNext={next} onBack={() => setStep((s) => Math.max(s - 1, 0))}>
      {step === 0 && (
        <div>
          <div className="postmark w-fit">1 · Start</div>
          <h2 className="mt-4 font-serif text-4xl">Respond to an IRS notice</h2>
          <p className="mt-3 text-muted-foreground">We'll help you organize the notice, confirm the information, prepare an editable draft, and move toward mailing. Nothing is sent until you review and approve it.</p>
          <div className="mt-6 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-sm text-muted-foreground">
            <div className="font-mono text-xs uppercase tracking-widest text-stamp">Disclaimer</div>
            <p className="mt-2">{definition.disclaimer}</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["Upload or identify the notice", "Confirm your facts and objective", "Review and edit the draft", "Choose mailing and send"].map((item, i) => (
              <div key={item} className="flex items-center gap-2 text-sm text-ink-soft">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-paper-deep font-mono text-xs text-muted-foreground">{i + 1}</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="postmark w-fit">2 · Notice</div>
          <h2 className="mt-4 font-serif text-3xl">Start with the notice</h2>
          <p className="mt-3 text-muted-foreground">Upload the IRS notice when document processing is connected, or identify it here so the workflow can begin.</p>
          <UploadZone label="Upload IRS notice" sublabel="PDF, JPG, or PNG · Secure storage" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div><label className="input-label">Notice number *</label><input className="input-field" value={noticeNumber} onChange={(e) => setNoticeNumber(e.target.value)} placeholder="CP2000, CP14, etc." /></div>
            <div><label className="input-label">Notice type</label><input className="input-field" value={noticeType} onChange={(e) => setNoticeType(e.target.value)} placeholder="Underreported income, balance due, etc." /></div>
            <div><label className="input-label">Notice date</label><input type="date" className="input-field" value={noticeDate} onChange={(e) => setNoticeDate(e.target.value)} /></div>
            <div><label className="input-label">Response deadline</label><input type="date" className="input-field" value={responseDeadline} onChange={(e) => setResponseDeadline(e.target.value)} /></div>
            <div><label className="input-label">Tax year</label><input className="input-field" value={taxYear} onChange={(e) => setTaxYear(e.target.value)} placeholder="2024" /></div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="postmark w-fit">3 · Facts</div>
          <h2 className="mt-4 font-serif text-3xl">What facts should the response address?</h2>
          <p className="mt-3 text-muted-foreground">Use your own words. Only include information you can verify.</p>
          <textarea className="input-field mt-6 min-h-48" value={facts} onChange={(e) => setFacts(e.target.value)} placeholder="Enter the relevant facts you want included in your response..." />
          <div className="mt-4 rounded-md border border-rule/70 bg-paper-deep/40 p-3 text-sm text-muted-foreground"><strong>Tip:</strong> Include dates, amounts, notice numbers, and specific requests from the IRS notice.</div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="postmark w-fit">4 · Objective</div>
          <h2 className="mt-4 font-serif text-3xl">What do you want the response to accomplish?</h2>
          <textarea className="input-field mt-6 min-h-40" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Example: I want to explain the discrepancy in my 2024 income reporting and provide corrected documentation..." />
        </div>
      )}

      {step === 4 && (
        <div>
          <div className="postmark w-fit">5 · Draft</div>
          <h2 className="mt-4 font-serif text-3xl">Your response letter</h2>
          <p className="mt-3 text-muted-foreground">Review every fact, name, date, and statement. This is editable — change anything.</p>
          <textarea className="input-field mt-6 min-h-72 font-mono text-sm leading-6" value={draft} onChange={(e) => setDraft(e.target.value)} />
        </div>
      )}

      {step === 5 && (
        <div>
          <div className="postmark w-fit">6 · Review</div>
          <h2 className="mt-4 font-serif text-3xl">Review before anything is mailed</h2>
          <p className="mt-3 text-muted-foreground">Please confirm each item below.</p>
          <ReviewChecks items={REVIEW_CHECKS} checks={checks} setChecks={setChecks} />
        </div>
      )}

      {step === 6 && (
        <div>
          <div className="postmark w-fit">7 · Documents</div>
          <h2 className="mt-4 font-serif text-3xl">Add supporting documents</h2>
          <p className="mt-3 text-muted-foreground">Attach any documents referenced in your response — forms, receipts, prior correspondence, etc.</p>
          <UploadZone label="Add attachments" sublabel="Forms, receipts, evidence, prior correspondence" />
        </div>
      )}

      {step === 7 && (
        <div>
          <div className="postmark w-fit">8 · Recipient</div>
          <h2 className="mt-4 font-serif text-3xl">Where should we send it?</h2>
          <p className="mt-3 text-muted-foreground">Enter the IRS mailing address from the notice.</p>
          <RecipientForm recipient={recipient} setRecipient={setRecipient} orgPlaceholder="IRS — Department of the Treasury" />
        </div>
      )}

      {step === 8 && (
        <div>
          <div className="postmark w-fit">9 · Mail</div>
          <h2 className="mt-4 font-serif text-3xl">Choose your mail type</h2>
          <p className="mt-3 text-muted-foreground">For IRS responses, Certified mail is recommended for proof of timely submission.</p>
          <MailOptions selected={mailType} onSelect={setMailType} />
        </div>
      )}

      {step === 9 && <CheckoutStep mailType={mailType} recipient={recipient} />}
    </WorkflowShell>
  );
}
