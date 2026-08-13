import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileCheck, Mail, ShieldCheck, Sparkles, Clock, PackageCheck, Lock, FileUp, ChevronDown, Send, Eye, Stamp, Quote } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({ component: HomePage });

const workflows = [
  { title: "Respond to an IRS Notice", description: "Organize an IRS notice or letter, prepare a written response, and mail it with proof of delivery.", icon: FileCheck, href: "/workflows/irs-notice" },
  { title: "Respond to a Court Summons", description: "Prepare a written response to a court summons or complaint and file it by mail.", icon: ShieldCheck, href: "/workflows/court-summons" },
  { title: "Respond to an Agency Action", description: "Prepare a written response to a regulatory agency notice, licensing board action, or FOIA determination.", icon: Mail, href: "/workflows/agency-action" },
  { title: "File an Appeal", description: "Prepare an appeal letter for a denied claim, decision, or ruling and mail it with proof of delivery.", icon: Sparkles, href: "/workflows/file-appeal" },
];

const features = [
  { icon: FileCheck, title: "Guided workflows", desc: "Start with the notice, not a blank page. Each workflow walks you through the steps from notice to mailed response." },
  { icon: Sparkles, title: "AI-assisted drafting", desc: "Organize your facts into a professional draft. Everything is editable. The AI never invents facts, deadlines, or legal conclusions." },
  { icon: Send, title: "Physical mail with tracking", desc: "Your response is printed, enveloped, and mailed via USPS. Track delivery and keep proof of service." },
  { icon: ShieldCheck, title: "Proof of delivery", desc: "Certified mail options include signature tracking and a return receipt card — your record that it arrived." },
  { icon: Lock, title: "Secure document handling", desc: "Documents are stored securely, never shared, and never used for marketing analytics. You can delete your data anytime." },
  { icon: Clock, title: "Deadline awareness", desc: "Every workflow prompts you to note the response deadline so nothing falls through the cracks." },
];

const steps = [
  { n: "01", title: "Identify", desc: "Upload or identify the notice you need to respond to." },
  { n: "02", title: "Prepare", desc: "Confirm your facts, let AI help organize the draft, and review every word." },
  { n: "03", title: "Send", desc: "Choose your mailing options — first-class, certified, or certified with return receipt." },
  { n: "04", title: "Prove", desc: "Track delivery and keep a permanent record of what you sent and when." },
];

const stats = [
  { value: "3–5", label: "Business day delivery" },
  { value: "$4.99", label: "Starting price per mailing" },
  { value: "100%", label: "You control the facts" },
  { value: "0", label: "Printers needed" },
];

const testimonials = [
  { quote: "I got an IRS CP2000 notice and had no idea what to do. Notice Respond walked me through organizing my response and mailed it certified. The tracking gave me peace of mind.", author: "James R.", role: "IRS Notice Response" },
  { quote: "The guided workflow made responding to my agency action so much clearer. I liked that I could edit everything and nothing was sent until I approved it.", author: "Linda M.", role: "Agency Action" },
  { quote: "Having a record of every mailing with tracking numbers in one place is exactly what I needed for my appeal. No more wondering if it arrived.", author: "Kevin T.", role: "Appeal Filing" },
];

const comparison = [
  { feature: "Guided workflows (not blank-page chat)", us: true, them: false },
  { feature: "AI never invents facts or legal conclusions", us: true, them: "varies" },
  { feature: "Physical mail with tracking", us: true, them: false },
  { feature: "Certified mail with return receipt", us: true, them: false },
  { feature: "Proof of delivery records", us: true, them: false },
  { feature: "Mailing history dashboard", us: true, them: false },
  { feature: "No printer or post office visit needed", us: true, them: "DIY" },
  { feature: "You review before anything is sent", us: true, them: "varies" },
];

const faqItems = [
  { q: "Is this legal advice?", a: "No. Notice Respond is a correspondence tool, not a law firm. We help you prepare and send documents — we do not provide legal advice, and AI never invents facts or legal conclusions." },
  { q: "What types of notices can I respond to?", a: "IRS notices and letters, court summonses and complaints, regulatory agency actions, licensing board decisions, FOIA determinations, and appeals of denied claims or rulings." },
  { q: "How does the mailing work?", a: "Your final document is printed, placed in an envelope, and mailed via USPS. You can choose first-class, certified, or certified with return receipt for proof of delivery." },
  { q: "Is my data secure?", a: "All documents are stored with encryption, never shared with third parties, and never used for marketing. You can request full deletion of your data at any time." },
  { q: "What does it cost?", a: "Costs start at $4.99 per mailing, including printing, paper, envelope, and postage. Certified starts at $14.94. No subscription required." },
];

function HomePage() {
  return (
    <main>
      <SiteHeader variant="transparent" />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e293b 0%, #131c2e 60%, #0d1421 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-12V8H14v28h14v-2H16V10h18v12h2zM16 12h12v6H16v-6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container relative py-20 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="badge badge-emerald mb-5" style={{ background: "rgba(16,185,129,.15)", color: "#34d399" }}>Respond with confidence</div>
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-serif)" }}>
                Respond to government notices without the stress.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
                Prepare professional responses to IRS notices, court summonses, agency actions, and appeals. Send physical mail with tracking and keep a record of what you sent.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/workflows/irs-notice" className="btn-emerald text-base">
                  Respond to a Notice <ArrowRight size={18} />
                </Link>
                <a href="#workflows" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">
                  See what you can do
                </a>
              </div>
              <p className="mt-5 text-sm text-white/50">Not a law firm. Not legal advice. You remain in control of the facts and final document.</p>
            </div>

            {/* Visual mockup */}
            <div className="relative hidden lg:block">
              <div className="card relative p-6 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-warm-border pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                    <ShieldCheck size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Your response workflow</p>
                    <p className="text-sm text-slate-400">From notice to mailing record</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { icon: FileUp, text: "Upload and review your notice", done: true },
                    { icon: FileCheck, text: "Organize the facts and objective", done: true },
                    { icon: Sparkles, text: "Draft and edit your response", done: true },
                    { icon: Send, text: "Choose mailing and keep the record", done: false },
                  ].map(({ icon: Icon, text, done }) => (
                    <div key={text} className="flex items-center gap-3 text-sm">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${done ? "bg-emerald-50" : "bg-gray-100"}`}>
                        <Icon size={15} className={done ? "text-emerald-600" : "text-gray-400"} />
                      </div>
                      <span className={done ? "text-slate-700" : "text-slate-400"}>{text}</span>
                      {done && <CheckCircle2 size={15} className="ml-auto text-emerald-500" />}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <PackageCheck size={16} className="text-emerald-500" />
                    <span>Tracking: USPS Certified</span>
                  </div>
                  <span className="badge badge-green">In transit</span>
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                <Stamp size={16} /> Proof of delivery
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-warm-border bg-white py-8">
        <div className="container grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{value}</p>
              <p className="mt-1 text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-warm-border bg-cream py-6">
        <div className="container flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-slate-400">
          {[
            { icon: Lock, text: "Bank-grade encryption" },
            { icon: PackageCheck, text: "USPS tracking included" },
            { icon: ShieldCheck, text: "Proof of delivery records" },
            { icon: Eye, text: "You review before anything is sent" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={16} className="text-emerald-500" /> {text}
            </div>
          ))}
        </div>
      </section>

      {/* Workflows */}
      <section id="workflows" className="bg-cream py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow">Start with the notice</div>
            <h2 className="mt-3 text-3xl font-bold text-slate-700 md:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>What are you responding to?</h2>
            <p className="mt-4 text-slate-400">Choose a guided starting point. Notice Respond is designed around government notice responses, not generic AI chat.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map(({ title, description, icon: Icon, href }) => (
              <Link key={title} to={href} className="card group p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <Icon size={24} className="text-slate-700" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  Start workflow <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="bg-white py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="eyebrow">The process</div>
            <h2 className="mt-3 text-3xl font-bold text-slate-700 md:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>How Notice Respond works</h2>
            <p className="mt-4 text-slate-400">From notice to delivered response in four clear steps. Nothing is sent until you review and approve it.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {steps.map(({ n, title, desc }, i) => (
              <div key={n} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-[2.2rem] top-12 hidden h-px w-[calc(100%-2rem)] bg-gradient-to-r from-warm-border to-transparent md:block" />
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700 text-white">
                  <span className="text-sm font-bold">{n}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section id="features" className="bg-cream py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="eyebrow">Why Notice Respond</div>
            <h2 className="mt-3 text-3xl font-bold text-slate-700 md:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>Built for important deadlines</h2>
            <p className="mt-4 text-slate-400">Everything you need to prepare, send, and prove your response to a government notice — in one place.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
                  <Icon size={22} className="text-emerald-600" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-white py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="text-center">
            <div className="eyebrow">The difference</div>
            <h2 className="mt-3 text-3xl font-bold text-slate-700 md:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>Notice Respond vs. doing it yourself</h2>
          </div>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-sm border border-warm-border rounded-xl overflow-hidden">
              <thead className="bg-slate-700 text-white">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold">Feature</th>
                  <th className="px-5 py-4 text-center font-semibold" style={{ fontFamily: "var(--font-serif)" }}>Notice Respond</th>
                  <th className="px-5 py-4 text-center font-semibold">DIY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {comparison.map(({ feature, us, them }) => (
                  <tr key={feature} className="hover:bg-cream/50">
                    <td className="px-5 py-3.5 text-slate-500 font-medium">{feature}</td>
                    <td className="px-5 py-3.5 text-center">
                      {us === true ? <CheckCircle2 size={18} className="mx-auto text-emerald-600" /> : <span className="text-slate-400">{us}</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {them === false ? <span className="text-slate-300">—</span> : <span className="text-slate-400">{them}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cream py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow">What people say</div>
            <h2 className="mt-3 text-3xl font-bold text-slate-700 md:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>Built for real responses</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.author} className="card p-6">
                <Quote size={24} className="text-emerald-200" />
                <p className="mt-3 text-sm leading-7 text-slate-500">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500" style={{ fontFamily: "var(--font-serif)" }}>
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">{t.author}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="bg-white py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow">Simple pricing</div>
            <h2 className="mt-3 text-3xl font-bold text-slate-700 md:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>Pay per mailing. No subscription.</h2>
            <p className="mt-4 text-slate-400">Prices include printing, paper, envelope, and postage.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {[
              { type: "Standard", price: "$4.99", desc: "3–7 business days, tracking included", icon: Mail },
              { type: "Certified", price: "$14.94", desc: "Delivery tracking + confirmation", icon: PackageCheck },
              { type: "Registered", price: "$32.49", desc: "Secure handling + tracking, insured", icon: Stamp, featured: true },
            ].map(({ type, price, desc, icon: Icon, featured }) => (
              <div key={type} className={`card p-6 text-center ${featured ? "ring-2 ring-emerald-400" : ""}`}>
                {featured && <div className="badge badge-emerald mb-3">Most popular</div>}
                <Icon size={28} className="mx-auto text-slate-700" />
                <h3 className="mt-4 font-semibold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{type}</h3>
                <p className="mt-2 text-3xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{price}</p>
                <p className="mt-2 text-xs text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/pricing" className="btn-outline">See full pricing <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section id="trust" className="bg-cream py-16 md:py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="card p-6">
              <Lock size={24} className="text-emerald-500" />
              <h2 className="mt-4 text-lg font-semibold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Your facts stay yours</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">AI assists with organization and drafting. It will never invent facts, deadlines, or legal conclusions. Your documents are encrypted and never shared.</p>
            </div>
            <div className="card p-6">
              <ShieldCheck size={24} className="text-emerald-500" />
              <h2 className="mt-4 text-lg font-semibold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Built for deadlines</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Every workflow prompts you to note the response deadline. Certified mail with return receipt gives you proof that your response was received on time.</p>
            </div>
            <div className="card p-6">
              <FileCheck size={24} className="text-emerald-500" />
              <h2 className="mt-4 text-lg font-semibold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Know what we're not</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Notice Respond is not a law firm, CPA firm, or government agency and does not provide legal or tax advice. If you need legal guidance, consult a qualified attorney.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section id="faq" className="bg-white py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="text-center">
            <div className="eyebrow">Questions</div>
            <h2 className="mt-3 text-3xl font-bold text-slate-700 md:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>Frequently asked</h2>
          </div>
          <div className="mt-10 space-y-3">
            {faqItems.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/faq" className="btn-outline">See all questions <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, #1e293b 0%, #131c2e 100%)" }} className="py-16 md:py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>Ready to respond?</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/60">Start a guided workflow, review your draft, and mail it — all in one place.</p>
          <Link to="/workflows/irs-notice" className="btn-emerald mt-8 text-base">Start now <ArrowRight size={18} /></Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button className="flex w-full items-center justify-between p-5 text-left" onClick={() => setOpen(!open)}>
        <span className="font-semibold text-slate-700">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm leading-6 text-slate-400">{a}</div>}
    </div>
  );
}
