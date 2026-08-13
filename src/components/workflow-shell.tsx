import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export interface StepDef { id: string; label: string }

export interface MailOption {
  id: string;
  label: string;
  price: string;
  desc: string;
}

export const MAIL_OPTIONS: MailOption[] = [
  { id: "standard", label: "Standard", price: "$4.99", desc: "3–7 business days · Tracking included" },
  { id: "certified", label: "Certified", price: "$14.94", desc: "Delivery tracking + confirmation · 3–7 days" },
  { id: "registered", label: "Registered", price: "$32.49", desc: "Secure handling + tracking · 5–10 days" },
];

export function Stepper({ steps, current, onStep }: { steps: StepDef[]; current: number; onStep?: (i: number) => void }) {
  return (
    <ol className="flex items-center justify-between gap-1 overflow-x-auto">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.id} className="flex flex-1 shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onStep && i <= current && onStep(i)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] transition-colors ${
                active ? "border-stamp bg-stamp text-accent-foreground"
                  : done ? "border-ink bg-ink text-primary-foreground"
                    : "border-rule bg-card text-muted-foreground"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
            <span className={`text-xs ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            {i < steps.length - 1 && <span className="flex-1 border-t border-dashed border-rule" />}
          </li>
        );
      })}
    </ol>
  );
}

export function WorkflowShell({
  title,
  steps,
  step,
  setStep,
  canContinue,
  onNext,
  onBack,
  children,
  finalLabel = "Pay and send",
}: {
  title: string;
  steps: StepDef[];
  step: number;
  setStep: (fn: (s: number) => number) => void;
  canContinue: boolean;
  onNext: () => void;
  onBack: () => void;
  children: ReactNode;
  finalLabel?: string;
}) {
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-2">
          <Link to="/" className="text-sm text-muted-foreground hover:text-stamp transition-colors">← Notice Respond</Link>
        </div>
        <h1 className="mb-6 font-serif text-3xl">{title}</h1>

        <Stepper steps={steps} current={step} onStep={(i) => setStep(() => i)} />

        <div className="mt-10 envelope-card p-6 md:p-10">
          {children}

          <div className="mt-8 flex items-center justify-between">
            <button onClick={onBack} disabled={step === 0} className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30">
              ← Back
            </button>
            <button
              onClick={onNext}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5 disabled:opacity-30 disabled:transform-none disabled:shadow-none"
            >
              {isLast ? finalLabel : "Continue"} →
            </button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function Success({ title, href }: { title: string; href: string }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-32 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stamp/10">
          <svg className="h-8 w-8 text-stamp" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="mt-6 font-serif text-4xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">Your response is being prepared for mailing.</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-rule/60 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Tracking number:</span>
          <span className="font-mono font-medium text-foreground">— Pending —</span>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="inline-flex items-center rounded-full border border-input px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted">Back to home</Link>
          <Link to={href} className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-stamp">Start another</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function UploadZone({ label, sublabel }: { label: string; sublabel: string }) {
  return (
    <label className="upload-zone mt-6 block">
      <svg className="mx-auto text-muted-foreground" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
      <span className="mt-3 block font-medium text-foreground">{label}</span>
      <span className="mt-1 block text-xs text-muted-foreground">{sublabel}</span>
      <input type="file" accept="application/pdf,image/jpeg,image/png" multiple className="sr-only" />
    </label>
  );
}

export function MailOptions({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {MAIL_OPTIONS.map((opt) => (
        <div key={opt.id} className={`mail-option ${selected === opt.id ? "selected" : ""}`} onClick={() => onSelect(opt.id)}>
          <div className="flex items-start justify-between">
            <div><p className="font-medium text-foreground">{opt.label}</p><p className="text-xs text-muted-foreground">{opt.desc}</p></div>
            <div className="text-right">
              <p className="font-serif text-lg">{opt.price}</p>
              {selected === opt.id && <svg className="ml-auto h-4 w-4 text-stamp" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewChecks({ items, checks, setChecks }: { items: string[]; checks: boolean[]; setChecks: (fn: (c: boolean[]) => boolean[]) => void }) {
  return (
    <div className="mt-6 space-y-3">
      {items.map((item, i) => (
        <label key={item} className="check-card">
          <input type="checkbox" checked={checks[i]} onChange={(e) => setChecks((c) => c.map((v, j) => (j === i ? e.target.checked : v)))} />
          {item}
        </label>
      ))}
    </div>
  );
}

export function RecipientForm({ recipient, setRecipient, orgPlaceholder }: { recipient: any; setRecipient: (fn: (r: any) => any) => void; orgPlaceholder?: string }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><label className="input-label">Recipient name *</label><input className="input-field" value={recipient.name} onChange={(e) => setRecipient((r) => ({ ...r, name: e.target.value }))} /></div>
      <div className="sm:col-span-2"><label className="input-label">Organization</label><input className="input-field" value={recipient.org} onChange={(e) => setRecipient((r) => ({ ...r, org: e.target.value }))} placeholder={orgPlaceholder || "Organization"} /></div>
      <div className="sm:col-span-2"><label className="input-label">Address line 1 *</label><input className="input-field" value={recipient.address1} onChange={(e) => setRecipient((r) => ({ ...r, address1: e.target.value }))} /></div>
      <div className="sm:col-span-2"><label className="input-label">Address line 2</label><input className="input-field" value={recipient.address2} onChange={(e) => setRecipient((r) => ({ ...r, address2: e.target.value }))} /></div>
      <div><label className="input-label">City *</label><input className="input-field" value={recipient.city} onChange={(e) => setRecipient((r) => ({ ...r, city: e.target.value }))} /></div>
      <div><label className="input-label">State *</label><input className="input-field" value={recipient.state} onChange={(e) => setRecipient((r) => ({ ...r, state: e.target.value }))} /></div>
      <div><label className="input-label">ZIP Code *</label><input className="input-field" value={recipient.zip} onChange={(e) => setRecipient((r) => ({ ...r, zip: e.target.value }))} /></div>
    </div>
  );
}

export function CheckoutStep({ mailType, recipient }: { mailType: string; recipient: any }) {
  return (
    <div>
      <div className="postmark w-fit">Checkout</div>
      <h2 className="mt-4 font-serif text-3xl">Review and pay</h2>
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm"><span className="text-muted-foreground">Mail type</span><span className="font-medium text-foreground">{MAIL_OPTIONS.find((m) => m.id === mailType)?.label}</span></div>
        <div className="flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm"><span className="text-muted-foreground">Recipient</span><span className="font-medium text-foreground">{recipient.name || "—"}</span></div>
        <div className="flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm"><span className="text-muted-foreground">Total</span><span className="font-serif text-lg">{MAIL_OPTIONS.find((m) => m.id === mailType)?.price}</span></div>
      </div>
      <div className="mt-4 rounded-md border border-rule/70 bg-paper-deep/40 p-3 text-sm text-muted-foreground">Secure checkout via Stripe is being connected.</div>
    </div>
  );
}
