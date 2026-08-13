import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileUp, ShieldAlert, CheckCircle2, Mail, PackageCheck, Stamp, CreditCard, Check, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { workflows } from "../../domain/workflows";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/workflows/court-summons")({
  head: () => ({ meta: [
    { title: "Respond to a Court Summons — Notice Respond" },
    { name: "description", content: "Prepare a written response to a court summons or complaint and file it by mail with proof of delivery." },
  ] }),
  component: CourtSummons,
});

const stepLabels = ["Start", "Summons", "Facts", "Objective", "Draft", "Review", "Attachments", "Recipient", "Mailing", "Checkout", "Done"];
const mailOptions = [
  { id: "first_class", label: "First-Class", price: "$3.99", desc: "3–5 business days · Tracking included", icon: Mail },
  { id: "certified", label: "Certified", price: "$8.99", desc: "Signature tracking · Proof of delivery", icon: PackageCheck },
  { id: "certified_rr", label: "Certified + Return Receipt", price: "$12.99", desc: "Signed return receipt card", icon: ShieldAlert },
  { id: "registered", label: "Registered", price: "$15.99", desc: "Highest security · Insured · Signature required", icon: Stamp },
];
const reviewChecks = [
  "I reviewed every factual statement in this draft.",
  "Case number, court name, and parties are correct.",
  "I reviewed the summons and any applicable court rules.",
  "I understand Notice Respond is not providing legal advice.",
];

function CourtSummons() {
  const definition = workflows["court-summons"];
  const [step, setStep] = useState(0);
  const [caseNumber, setCaseNumber] = useState("");
  const [courtName, setCourtName] = useState("");
  const [summonsDate, setSummonsDate] = useState("");
  const [responseDeadline, setResponseDeadline] = useState("");
  const [plaintiff, setPlaintiff] = useState("");
  const [defendant, setDefendant] = useState("");
  const [facts, setFacts] = useState("");
  const [objective, setObjective] = useState("");
  const [draft, setDraft] = useState("");
  const [checks, setChecks] = useState<boolean[]>(reviewChecks.map(() => false));
  const [mailType, setMailType] = useState("certified_rr");
  const [recipient, setRecipient] = useState({ name: "", org: "", address1: "", address2: "", city: "", state: "", zip: "" });

  const progress = useMemo(() => Math.round((step / (stepLabels.length - 1)) * 100), [step]);
  const allChecked = checks.every(Boolean);

  function generateDraft() {
    return `Re: Response to Summons
${courtName ? `Court: ${courtName}` : ""}
${caseNumber ? `Case No.: ${caseNumber}` : ""}
${plaintiff ? `Plaintiff: ${plaintiff}` : ""}
${defendant ? `Defendant: ${defendant}` : ""}
${summonsDate ? `Summons Date: ${summonsDate}` : ""}

Dear Clerk of the Court,

I am writing in response to the summons served on the above-referenced case. ${objective || "[Your objective will appear here.]"}

${facts || "[The facts you provided will appear here.]"}

I respectfully submit this response in accordance with the applicable rules of court.

Respectfully submitted,
[Your Name]`;
  }

  function canContinue() {
    switch (step) {
      case 1: return caseNumber.trim().length > 0;
      case 2: return facts.trim().length > 0;
      case 3: return objective.trim().length > 0;
      case 5: return allChecked;
      case 7: return recipient.name && recipient.address1 && recipient.city && recipient.state && recipient.zip;
      default: return true;
    }
  }

  function next() { if (step === 4 && !draft) setDraft(generateDraft()); setStep((s) => Math.min(s + 1, stepLabels.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  return (
    <main className="min-h-screen bg-cream">
      <SiteHeader />
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400"><span>Step {step + 1} of {stepLabels.length}</span><span>{progress}% complete</span></div>
            <div className="progress-track mt-2"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <div className="mt-3 hidden justify-between text-[11px] text-slate-300 sm:flex">{stepLabels.map((label, i) => (<span key={label} className={i <= step ? "font-semibold text-slate-700" : ""}>{label}</span>))}</div>
          </div>

          <div className="card p-6 md:p-10">
            {step === 0 && (
              <>
                <div className="eyebrow">Guided workflow</div>
                <h1 className="mt-3 text-3xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Respond to a court summons</h1>
                <p className="mt-4 leading-7 text-slate-400">We'll help you organize the summons, confirm the case details, prepare an editable draft, and move toward mailing. Nothing is sent until you review and approve it.</p>
                <div className="alert alert-warning mt-6"><ShieldAlert size={18} className="mb-2 shrink-0" />{definition.disclaimer}</div>
                <div className="alert alert-danger mt-4"><AlertTriangle size={16} className="inline mr-1" /> <strong>Critical:</strong> Court summonses have strict response deadlines — often 20–30 days. Missing the deadline can result in a default judgment against you. Note your deadline immediately.</div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">{["Upload or identify the summons", "Confirm case details and facts", "Review and edit the draft", "Choose mailing and send"].map((item, i) => (<div key={item} className="flex items-center gap-2 text-sm text-slate-500"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400">{i + 1}</span>{item}</div>))}</div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="eyebrow">1 · Upload / identify</div>
                <h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Start with the summons</h2>
                <p className="mt-3 text-slate-400">Upload the summons or identify the case details here.</p>
                <label className="upload-zone mt-7 block"><FileUp className="mx-auto text-slate-400" size={28} /><span className="mt-3 block font-semibold text-slate-500">Upload summons</span><span className="mt-1 block text-sm text-slate-300">PDF, JPG, or PNG</span><input type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" /></label>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div><label className="input-label">Case number *</label><input className="input-field" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} placeholder="123456789" /></div>
                  <div><label className="input-label">Court name</label><input className="input-field" value={courtName} onChange={(e) => setCourtName(e.target.value)} placeholder="Superior Court of California" /></div>
                  <div><label className="input-label">Plaintiff / Petitioner</label><input className="input-field" value={plaintiff} onChange={(e) => setPlaintiff(e.target.value)} /></div>
                  <div><label className="input-label">Defendant / Respondent</label><input className="input-field" value={defendant} onChange={(e) => setDefendant(e.target.value)} /></div>
                  <div><label className="input-label">Summons date</label><input type="date" className="input-field" value={summonsDate} onChange={(e) => setSummonsDate(e.target.value)} /></div>
                  <div><label className="input-label">Response deadline</label><input type="date" className="input-field" value={responseDeadline} onChange={(e) => setResponseDeadline(e.target.value)} /></div>
                </div>
              </>
            )}

            {step === 2 && (<><div className="eyebrow">2 · Your facts</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>What facts should the response address?</h2><p className="mt-3 text-slate-400">Use your own words. Only include information you can verify.</p><textarea className="input-field mt-6 min-h-48" value={facts} onChange={(e) => setFacts(e.target.value)} /><div className="alert alert-info mt-4"><strong>Tip:</strong> Reference specific paragraphs or claims from the complaint. State which allegations you admit, deny, or lack knowledge of.</div></>)}
            {step === 3 && (<><div className="eyebrow">3 · Your objective</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>What do you want the response to accomplish?</h2><p className="mt-3 text-slate-400">Describe the outcome you want.</p><textarea className="input-field mt-6 min-h-40" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Example: I want to file an answer denying the allegations and requesting a hearing." /></>)}
            {step === 4 && (<><div className="eyebrow">4 · Draft</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Prepare your response</h2><p className="mt-3 text-slate-400">Review every fact, name, date, and statement before sending.</p><textarea className="input-field mt-6 min-h-72 font-mono text-sm leading-6" value={draft} onChange={(e) => setDraft(e.target.value)} /><div className="alert alert-warning mt-4"><ShieldAlert size={16} className="shrink-0" /> Court filings have strict procedural requirements. This draft is not legal advice. Consult an attorney if you are unsure how to respond.</div></>)}
            {step === 5 && (<><div className="eyebrow">5 · Review</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Review before anything is mailed</h2><p className="mt-3 text-slate-400">Please confirm each item below.</p><div className="mt-6 space-y-3">{reviewChecks.map((item, i) => (<label key={item} className="check-card"><input type="checkbox" checked={checks[i]} onChange={(e) => setChecks((c) => c.map((v, j) => (j === i ? e.target.checked : v)))} />{item}</label>))}</div></>)}
            {step === 6 && (<><div className="eyebrow">6 · Attachments</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Add supporting documents</h2><p className="mt-3 text-slate-400">Attach any exhibits or supporting documents referenced in your response.</p><label className="upload-zone mt-6 block"><FileUp className="mx-auto text-slate-400" size={28} /><span className="mt-3 block font-semibold text-slate-500">Add attachments</span><span className="mt-1 block text-sm text-slate-300">PDF, JPG, or PNG</span><input type="file" accept="application/pdf,image/jpeg,image/png" multiple className="sr-only" /></label></>)}
            {step === 7 && (<><div className="eyebrow">7 · Recipient</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Where should we send it?</h2><p className="mt-3 text-slate-400">Enter the court clerk's mailing address.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label className="input-label">Recipient name *</label><input className="input-field" value={recipient.name} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })} placeholder="Clerk of the Court" /></div><div className="sm:col-span-2"><label className="input-label">Court name</label><input className="input-field" value={recipient.org} onChange={(e) => setRecipient({ ...recipient, org: e.target.value })} /></div><div className="sm:col-span-2"><label className="input-label">Address line 1 *</label><input className="input-field" value={recipient.address1} onChange={(e) => setRecipient({ ...recipient, address1: e.target.value })} placeholder="Street address" /></div><div className="sm:col-span-2"><label className="input-label">Address line 2</label><input className="input-field" value={recipient.address2} onChange={(e) => setRecipient({ ...recipient, address2: e.target.value })} /></div><div><label className="input-label">City *</label><input className="input-field" value={recipient.city} onChange={(e) => setRecipient({ ...recipient, city: e.target.value })} /></div><div><label className="input-label">State *</label><input className="input-field" value={recipient.state} onChange={(e) => setRecipient({ ...recipient, state: e.target.value })} /></div><div><label className="input-label">ZIP Code *</label><input className="input-field" value={recipient.zip} onChange={(e) => setRecipient({ ...recipient, zip: e.target.value })} /></div></div></>)}
            {step === 8 && (<><div className="eyebrow">8 · Mailing options</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Choose your mail type</h2><p className="mt-3 text-slate-400">For court filings, certified mail with return receipt is recommended for proof of timely filing.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{mailOptions.map(({ id, label, price, desc, icon: Icon }) => (<div key={id} className={`mail-option ${mailType === id ? "selected" : ""}`} onClick={() => setMailType(id)}><div className="flex items-start justify-between"><div className="flex items-center gap-3"><Icon size={20} className="text-slate-500" /><div><p className="font-semibold text-slate-700">{label}</p><p className="text-xs text-slate-400">{desc}</p></div></div><div className="text-right"><p className="text-lg font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{price}</p>{mailType === id && <Check size={16} className="ml-auto text-emerald-500" />}</div></div></div>))}</div></>)}
            {step === 9 && (<><div className="eyebrow">9 · Checkout</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Review and pay</h2><div className="mt-6 space-y-3"><div className="flex items-center justify-between rounded-lg border border-warm-border px-4 py-3 text-sm"><span className="text-slate-500">Mail type</span><span className="font-semibold text-slate-700">{mailOptions.find((m) => m.id === mailType)?.label}</span></div><div className="flex items-center justify-between rounded-lg border border-warm-border px-4 py-3 text-sm"><span className="text-slate-500">Recipient</span><span className="font-semibold text-slate-700">{recipient.name || "—"}</span></div><div className="flex items-center justify-between rounded-lg border border-warm-border px-4 py-3 text-sm"><span className="text-slate-500">Total</span><span className="text-lg font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{mailOptions.find((m) => m.id === mailType)?.price}</span></div></div><div className="alert alert-info mt-4"><CreditCard size={16} className="shrink-0" /> Secure checkout via Stripe is being connected.</div></>)}
            {step === 10 && (<div className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"><CheckCircle2 size={32} className="text-emerald-600" /></div><h2 className="mt-5 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Your mailing has been submitted</h2><p className="mt-3 text-slate-400">Your response is being prepared for mailing.</p><div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-warm-border px-4 py-3 text-sm"><PackageCheck size={16} className="text-emerald-500" /><span className="text-slate-500">Tracking number:</span><span className="font-mono font-semibold text-slate-700">— Pending —</span></div><div className="mt-8 flex justify-center gap-3"><Link to="/" className="btn-outline">Back to home</Link><Link to="/workflows/court-summons" className="btn-primary">Start another</Link></div></div>)}

            {step < 10 && (<div className="mt-8 flex items-center justify-between"><button onClick={back} disabled={step === 0} className="btn-ghost disabled:opacity-30"><ArrowLeft size={16} /> Back</button><button onClick={next} disabled={!canContinue()} className="btn-primary">{step === 9 ? "Pay and send" : "Continue"} <ArrowRight size={16} /></button></div>)}
          </div>
          <div className="mt-6 text-center"><Link to="/" className="text-sm text-slate-400 hover:text-emerald-600">← Back to Notice Respond</Link></div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
