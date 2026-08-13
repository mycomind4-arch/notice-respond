import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileUp, ShieldAlert, CheckCircle2, Mail, PackageCheck, Stamp, CreditCard, Check, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { workflows } from "../../domain/workflows";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/workflows/file-appeal")({
  head: () => ({ meta: [
    { title: "File an Appeal — Notice Respond" },
    { name: "description", content: "Prepare an appeal letter for a denied claim, decision, or ruling and mail it with proof of delivery." },
  ] }),
  component: FileAppeal,
});

const stepLabels = ["Start", "Decision", "Facts", "Objective", "Draft", "Review", "Attachments", "Recipient", "Mailing", "Checkout", "Done"];
const mailOptions = [
  { id: "standard", label: "Standard", price: "$4.99", desc: "3–7 business days · Tracking included", icon: Mail },
  { id: "certified", label: "Certified", price: "$14.94", desc: "Delivery tracking + confirmation · 3–7 days", icon: PackageCheck },
  { id: "registered", label: "Registered", price: "$32.49", desc: "Secure handling + tracking · 5–10 days", icon: Stamp },
];
const reviewChecks = [
  "I reviewed every factual statement in this appeal.",
  "Decision date, reference numbers, and grounds for appeal are correct.",
  "I reviewed the appeal instructions from the agency or court.",
  "I understand Notice Respond is not providing legal advice.",
];

function FileAppeal() {
  const definition = workflows["file-appeal"];
  const [step, setStep] = useState(0);
  const [agencyName, setAgencyName] = useState("");
  const [decisionDate, setDecisionDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [appealDeadline, setAppealDeadline] = useState("");
  const [grounds, setGrounds] = useState("");
  const [facts, setFacts] = useState("");
  const [objective, setObjective] = useState("");
  const [draft, setDraft] = useState("");
  const [checks, setChecks] = useState<boolean[]>(reviewChecks.map(() => false));
  const [mailType, setMailType] = useState("certified");
  const [recipient, setRecipient] = useState({ name: "", org: "", address1: "", address2: "", city: "", state: "", zip: "" });

  const progress = useMemo(() => Math.round((step / (stepLabels.length - 1)) * 100), [step]);
  const allChecked = checks.every(Boolean);

  function generateDraft() {
    return `Re: Notice of Appeal
${agencyName ? `Agency / Body: ${agencyName}` : ""}
${referenceNumber ? `Reference No.: ${referenceNumber}` : ""}
${decisionDate ? `Decision Date: ${decisionDate}` : ""}
${appealDeadline ? `Appeal Deadline: ${appealDeadline}` : ""}

Dear Sir or Madam,

I am writing to appeal the decision referenced above. ${objective || "[Your objective will appear here.]"}

${grounds ? `Grounds for appeal: ${grounds}` : ""}

${facts || "[The facts you provided will appear here.]"}

I respectfully request that this appeal be considered and that a review of the decision be conducted.

Sincerely,
[Your Name]`;
  }

  function canContinue() {
    switch (step) {
      case 1: return agencyName.trim().length > 0;
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
            {step === 0 && (<><div className="eyebrow">Guided workflow</div><h1 className="mt-3 text-3xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>File an appeal</h1><p className="mt-4 leading-7 text-slate-400">We'll help you organize the decision being appealed, state your grounds, prepare an editable draft, and move toward mailing.</p><div className="alert alert-warning mt-6"><ShieldAlert size={18} className="mb-2 shrink-0" />{definition.disclaimer}</div><div className="alert alert-danger mt-4"><AlertTriangle size={16} className="inline mr-1" /> <strong>Appeal deadlines:</strong> Appeals often have very short deadlines — sometimes as few as 10–30 days. Note your deadline immediately.</div><div className="mt-6 grid gap-3 sm:grid-cols-2">{["Identify the decision being appealed", "State your grounds and facts", "Review and edit the draft", "Choose mailing and send"].map((item, i) => (<div key={item} className="flex items-center gap-2 text-sm text-slate-500"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400">{i + 1}</span>{item}</div>))}</div></>)}

            {step === 1 && (<><div className="eyebrow">1 · The decision</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>What decision are you appealing?</h2><p className="mt-3 text-slate-400">Upload the decision or identify the key details here.</p><label className="upload-zone mt-7 block"><FileUp className="mx-auto text-slate-400" size={28} /><span className="mt-3 block font-semibold text-slate-500">Upload decision letter</span><span className="mt-1 block text-sm text-slate-300">PDF, JPG, or PNG</span><input type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" /></label><div className="mt-6 grid gap-4 sm:grid-cols-2"><div><label className="input-label">Agency / body that issued the decision *</label><input className="input-field" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="e.g., Social Security Administration, IRS Appeals" /></div><div><label className="input-label">Reference / case number</label><input className="input-field" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} /></div><div><label className="input-label">Decision date</label><input type="date" className="input-field" value={decisionDate} onChange={(e) => setDecisionDate(e.target.value)} /></div><div><label className="input-label">Appeal deadline</label><input type="date" className="input-field" value={appealDeadline} onChange={(e) => setAppealDeadline(e.target.value)} /></div><div className="sm:col-span-2"><label className="input-label">Grounds for appeal</label><input className="input-field" value={grounds} onChange={(e) => setGrounds(e.target.value)} placeholder="e.g., The decision was based on incorrect information" /></div></div></>)}

            {step === 2 && (<><div className="eyebrow">2 · Your facts</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>What facts support your appeal?</h2><p className="mt-3 text-slate-400">Use your own words. Only include information you can verify.</p><textarea className="input-field mt-6 min-h-48" value={facts} onChange={(e) => setFacts(e.target.value)} /><div className="alert alert-info mt-4"><strong>Tip:</strong> Include specific dates, reference numbers, and evidence. Explain why the decision should be reversed or modified.</div></>)}
            {step === 3 && (<><div className="eyebrow">3 · Your objective</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>What outcome do you want?</h2><textarea className="input-field mt-6 min-h-40" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Example: I want the decision reversed and my claim approved based on the evidence enclosed." /></>)}
            {step === 4 && (<><div className="eyebrow">4 · Draft</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Prepare your appeal</h2><p className="mt-3 text-slate-400">Review every fact, name, date, and statement before sending.</p><textarea className="input-field mt-6 min-h-72 font-mono text-sm leading-6" value={draft} onChange={(e) => setDraft(e.target.value)} /><div className="alert alert-warning mt-4"><ShieldAlert size={16} className="shrink-0" /> This draft was generated from your input. It is not legal advice. Review and edit carefully.</div></>)}
            {step === 5 && (<><div className="eyebrow">5 · Review</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Review before anything is mailed</h2><p className="mt-3 text-slate-400">Please confirm each item below.</p><div className="mt-6 space-y-3">{reviewChecks.map((item, i) => (<label key={item} className="check-card"><input type="checkbox" checked={checks[i]} onChange={(e) => setChecks((c) => c.map((v, j) => (j === i ? e.target.checked : v)))} />{item}</label>))}</div></>)}
            {step === 6 && (<><div className="eyebrow">6 · Attachments</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Add supporting documents</h2><p className="mt-3 text-slate-400">Attach any evidence or supporting documents for your appeal.</p><label className="upload-zone mt-6 block"><FileUp className="mx-auto text-slate-400" size={28} /><span className="mt-3 block font-semibold text-slate-500">Add attachments</span><span className="mt-1 block text-sm text-slate-300">PDF, JPG, or PNG</span><input type="file" accept="application/pdf,image/jpeg,image/png" multiple className="sr-only" /></label></>)}
            {step === 7 && (<><div className="eyebrow">7 · Recipient</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Where should we send it?</h2><p className="mt-3 text-slate-400">Enter the appeal submission address from the decision letter.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label className="input-label">Recipient name *</label><input className="input-field" value={recipient.name} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })} placeholder="Office of Appeals" /></div><div className="sm:col-span-2"><label className="input-label">Organization</label><input className="input-field" value={recipient.org} onChange={(e) => setRecipient({ ...recipient, org: e.target.value })} /></div><div className="sm:col-span-2"><label className="input-label">Address line 1 *</label><input className="input-field" value={recipient.address1} onChange={(e) => setRecipient({ ...recipient, address1: e.target.value })} /></div><div className="sm:col-span-2"><label className="input-label">Address line 2</label><input className="input-field" value={recipient.address2} onChange={(e) => setRecipient({ ...recipient, address2: e.target.value })} /></div><div><label className="input-label">City *</label><input className="input-field" value={recipient.city} onChange={(e) => setRecipient({ ...recipient, city: e.target.value })} /></div><div><label className="input-label">State *</label><input className="input-field" value={recipient.state} onChange={(e) => setRecipient({ ...recipient, state: e.target.value })} /></div><div><label className="input-label">ZIP Code *</label><input className="input-field" value={recipient.zip} onChange={(e) => setRecipient({ ...recipient, zip: e.target.value })} /></div></div></>)}
            {step === 8 && (<><div className="eyebrow">8 · Mailing options</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Choose your mail type</h2><p className="mt-3 text-slate-400">For appeals, certified mail with return receipt is strongly recommended for proof of timely submission.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{mailOptions.map(({ id, label, price, desc, icon: Icon }) => (<div key={id} className={`mail-option ${mailType === id ? "selected" : ""}`} onClick={() => setMailType(id)}><div className="flex items-start justify-between"><div className="flex items-center gap-3"><Icon size={20} className="text-slate-500" /><div><p className="font-semibold text-slate-700">{label}</p><p className="text-xs text-slate-400">{desc}</p></div></div><div className="text-right"><p className="text-lg font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{price}</p>{mailType === id && <Check size={16} className="ml-auto text-emerald-500" />}</div></div></div>))}</div></>)}
            {step === 9 && (<><div className="eyebrow">9 · Checkout</div><h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Review and pay</h2><div className="mt-6 space-y-3"><div className="flex items-center justify-between rounded-lg border border-warm-border px-4 py-3 text-sm"><span className="text-slate-500">Mail type</span><span className="font-semibold text-slate-700">{mailOptions.find((m) => m.id === mailType)?.label}</span></div><div className="flex items-center justify-between rounded-lg border border-warm-border px-4 py-3 text-sm"><span className="text-slate-500">Recipient</span><span className="font-semibold text-slate-700">{recipient.name || "—"}</span></div><div className="flex items-center justify-between rounded-lg border border-warm-border px-4 py-3 text-sm"><span className="text-slate-500">Total</span><span className="text-lg font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{mailOptions.find((m) => m.id === mailType)?.price}</span></div></div><div className="alert alert-info mt-4"><CreditCard size={16} className="shrink-0" /> Secure checkout via Stripe is being connected.</div></>)}
            {step === 10 && (<div className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"><CheckCircle2 size={32} className="text-emerald-600" /></div><h2 className="mt-5 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Your appeal has been submitted</h2><p className="mt-3 text-slate-400">Your appeal is being prepared for mailing.</p><div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-warm-border px-4 py-3 text-sm"><PackageCheck size={16} className="text-emerald-500" /><span className="text-slate-500">Tracking number:</span><span className="font-mono font-semibold text-slate-700">— Pending —</span></div><div className="mt-8 flex justify-center gap-3"><Link to="/" className="btn-outline">Back to home</Link><Link to="/workflows/file-appeal" className="btn-primary">Start another</Link></div></div>)}

            {step < 10 && (<div className="mt-8 flex items-center justify-between"><button onClick={back} disabled={step === 0} className="btn-ghost disabled:opacity-30"><ArrowLeft size={16} /> Back</button><button onClick={next} disabled={!canContinue()} className="btn-primary">{step === 9 ? "Pay and send" : "Continue"} <ArrowRight size={16} /></button></div>)}
          </div>
          <div className="mt-6 text-center"><Link to="/" className="text-sm text-slate-400 hover:text-emerald-600">← Back to Notice Respond</Link></div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
