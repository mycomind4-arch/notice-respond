import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileUp, ShieldAlert, CheckCircle2, Mail, Clock, PackageCheck, Stamp, CreditCard, Check, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { workflows } from "../../domain/workflows";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/workflows/irs-notice")({
  head: () => ({
    meta: [
      { title: "Respond to an IRS Notice — Notice Respond" },
      { name: "description", content: "Guided workflow to organize an IRS notice, prepare a written response, and mail it with proof of delivery." },
    ],
  }),
  component: IRSNotice,
});

const stepLabels = ["Start", "Notice", "Facts", "Objective", "Draft", "Review", "Attachments", "Recipient", "Mailing", "Checkout", "Done"];

const mailOptions = [
  { id: "first_class", label: "First-Class", price: "$3.99", desc: "3–5 business days · Tracking included", icon: Mail },
  { id: "certified", label: "Certified", price: "$8.99", desc: "Signature tracking · Proof of delivery", icon: PackageCheck },
  { id: "certified_rr", label: "Certified + Return Receipt", price: "$12.99", desc: "Signed return receipt card", icon: ShieldAlert },
  { id: "registered", label: "Registered", price: "$15.99", desc: "Highest security · Insured · Signature required", icon: Stamp },
];

const reviewChecks = [
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
  const [checks, setChecks] = useState<boolean[]>(reviewChecks.map(() => false));
  const [mailType, setMailType] = useState("certified");
  const [recipient, setRecipient] = useState({ name: "", org: "", address1: "", address2: "", city: "", state: "", zip: "" });

  const progress = useMemo(() => Math.round((step / (stepLabels.length - 1)) * 100), [step]);
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
      case 7: return recipient.name && recipient.address1 && recipient.city && recipient.state && recipient.zip;
      default: return true;
    }
  }

  function next() {
    if (step === 4 && !draft) setDraft(generateDraft());
    setStep((s) => Math.min(s + 1, stepLabels.length - 1));
  }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  return (
    <main className="min-h-screen bg-cream">
      <SiteHeader />
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Step {step + 1} of {stepLabels.length}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="progress-track mt-2">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 hidden justify-between text-[11px] text-slate-300 sm:flex">
              {stepLabels.map((label, i) => (
                <span key={label} className={i <= step ? "font-semibold text-slate-700" : ""}>{label}</span>
              ))}
            </div>
          </div>

          <div className="card p-6 md:p-10">
            {step === 0 && (
              <>
                <div className="eyebrow">Guided workflow</div>
                <h1 className="mt-3 text-3xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Respond to an IRS notice</h1>
                <p className="mt-4 leading-7 text-slate-400">We'll help you organize the notice, confirm the information you provide, prepare an editable draft, and move toward mailing. Nothing is sent until you review and approve it.</p>
                <div className="alert alert-warning mt-6"><ShieldAlert size={18} className="mb-2 shrink-0" />{definition.disclaimer}</div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {["Upload or identify the notice", "Confirm your facts and objective", "Review and edit the draft", "Choose mailing and send"].map((item, i) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400">{i + 1}</span>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="alert alert-info mt-6">
                  <AlertTriangle size={16} className="inline mr-1" /> <strong>IRS notice deadlines:</strong> Most IRS notices give you 30–90 days to respond. Note your deadline immediately and plan to mail well before it expires.
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="eyebrow">1 · Upload / identify</div>
                <h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Start with the notice</h2>
                <p className="mt-3 text-slate-400">Upload the notice when document processing is connected, or identify it here so the workflow can begin.</p>
                <label className="upload-zone mt-7 block">
                  <FileUp className="mx-auto text-slate-400" size={28} />
                  <span className="mt-3 block font-semibold text-slate-500">Upload IRS notice</span>
                  <span className="mt-1 block text-sm text-slate-300">PDF, JPG, or PNG · Secure storage will be added</span>
                  <input type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" />
                </label>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="input-label">Notice number (e.g., CP2000) *</label>
                    <input className="input-field" value={noticeNumber} onChange={(e) => setNoticeNumber(e.target.value)} placeholder="CP2000, CP14, LT11, etc." />
                  </div>
                  <div>
                    <label className="input-label">Notice type</label>
                    <input className="input-field" value={noticeType} onChange={(e) => setNoticeType(e.target.value)} placeholder="Proposed adjustment, balance due, etc." />
                  </div>
                  <div>
                    <label className="input-label">Tax year</label>
                    <input className="input-field" value={taxYear} onChange={(e) => setTaxYear(e.target.value)} placeholder="2025" />
                  </div>
                  <div>
                    <label className="input-label">Notice date</label>
                    <input type="date" className="input-field" value={noticeDate} onChange={(e) => setNoticeDate(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="input-label">Response deadline</label>
                    <input type="date" className="input-field" value={responseDeadline} onChange={(e) => setResponseDeadline(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="eyebrow">2 · Your facts</div>
                <h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>What facts should the response address?</h2>
                <p className="mt-3 text-slate-400">Use your own words. The drafting assistant must not invent facts. Only include information you can verify.</p>
                <textarea className="input-field mt-6 min-h-48" value={facts} onChange={(e) => setFacts(e.target.value)} placeholder="Enter the relevant facts you want included in your response..." />
                <div className="alert alert-info mt-4"><strong>Tip:</strong> Include the tax year, amounts in question, and any documentation you have. Reference specific line items from the notice.</div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="eyebrow">3 · Your objective</div>
                <h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>What do you want the response to accomplish?</h2>
                <p className="mt-3 text-slate-400">Describe the outcome you want. This guides the tone and structure of the draft.</p>
                <textarea className="input-field mt-6 min-h-40" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Example: I want to provide documentation showing the income reported on the CP2000 is correct and no adjustment is needed." />
              </>
            )}

            {step === 4 && (
              <>
                <div className="eyebrow">4 · Draft</div>
                <h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Prepare your response</h2>
                <p className="mt-3 text-slate-400">This draft is a starting point based on the information you provided. Review every fact, name, date, and statement before sending.</p>
                <textarea className="input-field mt-6 min-h-72 font-mono text-sm leading-6" value={draft} onChange={(e) => setDraft(e.target.value)} />
                <div className="alert alert-warning mt-4"><ShieldAlert size={16} className="shrink-0" /> This draft was generated from your input. It is not legal or tax advice. Review and edit carefully before proceeding.</div>
              </>
            )}

            {step === 5 && (
              <>
                <div className="eyebrow">5 · Review</div>
                <h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Review before anything is mailed</h2>
                <p className="mt-3 text-slate-400">Please confirm each item below before proceeding.</p>
                <div className="mt-6 space-y-3">
                  {reviewChecks.map((item, i) => (
                    <label key={item} className="check-card">
                      <input type="checkbox" checked={checks[i]} onChange={(e) => setChecks((c) => c.map((v, j) => (j === i ? e.target.checked : v)))} />
                      {item}
                    </label>
                  ))}
                </div>
              </>
            )}

            {step === 6 && (
              <>
                <div className="eyebrow">6 · Attachments</div>
                <h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Add supporting documents</h2>
                <p className="mt-3 text-slate-400">Add only the documents you intend to send and verify that they match the notice instructions.</p>
                <label className="upload-zone mt-6 block">
                  <FileUp className="mx-auto text-slate-400" size={28} />
                  <span className="mt-3 block font-semibold text-slate-500">Add attachments</span>
                  <span className="mt-1 block text-sm text-slate-300">PDF, JPG, or PNG · Secure document storage coming soon</span>
                  <input type="file" accept="application/pdf,image/jpeg,image/png" multiple className="sr-only" />
                </label>
              </>
            )}

            {step === 7 && (
              <>
                <div className="eyebrow">7 · Recipient</div>
                <h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Where should we send it?</h2>
                <p className="mt-3 text-slate-400">Enter the mailing address from the IRS notice. This is typically found in the response instructions section.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2"><label className="input-label">Recipient name *</label><input className="input-field" value={recipient.name} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })} placeholder="IRS — [Campus Name]" /></div>
                  <div className="sm:col-span-2"><label className="input-label">Organization / Office</label><input className="input-field" value={recipient.org} onChange={(e) => setRecipient({ ...recipient, org: e.target.value })} placeholder="Optional" /></div>
                  <div className="sm:col-span-2"><label className="input-label">Address line 1 *</label><input className="input-field" value={recipient.address1} onChange={(e) => setRecipient({ ...recipient, address1: e.target.value })} placeholder="Street address" /></div>
                  <div className="sm:col-span-2"><label className="input-label">Address line 2</label><input className="input-field" value={recipient.address2} onChange={(e) => setRecipient({ ...recipient, address2: e.target.value })} placeholder="P.O. Box, suite, etc." /></div>
                  <div><label className="input-label">City *</label><input className="input-field" value={recipient.city} onChange={(e) => setRecipient({ ...recipient, city: e.target.value })} /></div>
                  <div><label className="input-label">State *</label><input className="input-field" value={recipient.state} onChange={(e) => setRecipient({ ...recipient, state: e.target.value })} placeholder="TX" /></div>
                  <div><label className="input-label">ZIP Code *</label><input className="input-field" value={recipient.zip} onChange={(e) => setRecipient({ ...recipient, zip: e.target.value })} placeholder="73301" /></div>
                </div>
              </>
            )}

            {step === 8 && (
              <>
                <div className="eyebrow">8 · Mailing options</div>
                <h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Choose your mail type</h2>
                <p className="mt-3 text-slate-400">For IRS responses, certified mail with return receipt is recommended for proof of timely delivery.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {mailOptions.map(({ id, label, price, desc, icon: Icon }) => (
                    <div key={id} className={`mail-option ${mailType === id ? "selected" : ""}`} onClick={() => setMailType(id)}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3"><Icon size={20} className="text-slate-500" /><div><p className="font-semibold text-slate-700">{label}</p><p className="text-xs text-slate-400">{desc}</p></div></div>
                        <div className="text-right"><p className="text-lg font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{price}</p>{mailType === id && <Check size={16} className="ml-auto text-emerald-500" />}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 9 && (
              <>
                <div className="eyebrow">9 · Checkout</div>
                <h2 className="mt-3 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Review and pay</h2>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-warm-border px-4 py-3 text-sm"><span className="text-slate-500">Mail type</span><span className="font-semibold text-slate-700">{mailOptions.find((m) => m.id === mailType)?.label}</span></div>
                  <div className="flex items-center justify-between rounded-lg border border-warm-border px-4 py-3 text-sm"><span className="text-slate-500">Recipient</span><span className="font-semibold text-slate-700">{recipient.name || "—"}</span></div>
                  <div className="flex items-center justify-between rounded-lg border border-warm-border px-4 py-3 text-sm"><span className="text-slate-500">Total</span><span className="text-lg font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{mailOptions.find((m) => m.id === mailType)?.price}</span></div>
                </div>
                <div className="alert alert-info mt-4"><CreditCard size={16} className="shrink-0" /> Secure checkout via Stripe is being connected.</div>
              </>
            )}

            {step === 10 && (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"><CheckCircle2 size={32} className="text-emerald-600" /></div>
                <h2 className="mt-5 text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Your mailing has been submitted</h2>
                <p className="mt-3 text-slate-400">Your response is being prepared for mailing. You'll receive a tracking number once it ships.</p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-warm-border px-4 py-3 text-sm"><PackageCheck size={16} className="text-emerald-500" /><span className="text-slate-500">Tracking number:</span><span className="font-mono font-semibold text-slate-700">— Pending —</span></div>
                <div className="mt-8 flex justify-center gap-3"><Link to="/" className="btn-outline">Back to home</Link><Link to="/workflows/irs-notice" className="btn-primary">Start another</Link></div>
              </div>
            )}

            {step < 10 && (
              <div className="mt-8 flex items-center justify-between">
                <button onClick={back} disabled={step === 0} className="btn-ghost disabled:opacity-30"><ArrowLeft size={16} /> Back</button>
                <button onClick={next} disabled={!canContinue()} className="btn-primary">{step === 9 ? "Pay and send" : "Continue"} <ArrowRight size={16} /></button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center"><Link to="/" className="text-sm text-slate-400 hover:text-emerald-600">← Back to Notice Respond</Link></div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
