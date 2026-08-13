import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck, Sparkles, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Notice Respond" },
    { name: "description", content: "Notice Respond helps people prepare and send responses to government notices with guided workflows, AI-assisted drafting, and physical mail with tracking." },
  ] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen bg-cream">
      <SiteHeader />
      <section style={{ background: "linear-gradient(135deg, #1e293b 0%, #131c2e 100%)" }} className="py-16 md:py-24">
        <div className="container max-w-2xl text-center">
          <div className="badge badge-emerald mb-4" style={{ background: "rgba(16,185,129,.15)", color: "#34d399" }}>About Notice Respond</div>
          <h1 className="text-4xl font-bold text-white md:text-5xl" style={{ fontFamily: "var(--font-serif)" }}>Government notices, made manageable.</h1>
          <p className="mt-5 text-lg leading-8 text-white/60">We believe everyone deserves access to clear, professional tools for responding to government notices — without confusion, without guesswork, and without a printer.</p>
        </div>
      </section>
      <section className="py-16 md:py-20">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Our mission</h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">Government notices — IRS letters, court summonses, agency actions — come with deadlines and pressure. For many people, the hardest part isn't the content. It's the logistics: understanding what the notice says, organizing a response, writing a professional letter, printing it, and mailing it with proof of delivery.</p>
          <p className="mt-3 text-sm leading-7 text-slate-400">Notice Respond was built to solve that. We provide guided workflows that walk you through every step, AI that helps organize your facts into a draft (but never invents them), and physical mail delivery with tracking and proof — all from your phone or computer.</p>
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>What we believe</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="card p-5"><Sparkles size={22} className="text-emerald-500" /><h3 className="mt-3 font-semibold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Clarity over complexity</h3><p className="mt-2 text-sm text-slate-400">Notice response tools should be easy to use, even for people who've never sent certified mail before.</p></div>
            <div className="card p-5"><ShieldCheck size={22} className="text-emerald-500" /><h3 className="mt-3 font-semibold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Your facts stay yours</h3><p className="mt-2 text-sm text-slate-400">AI assists but never invents. You review everything before it's sent. Your data is private.</p></div>
            <div className="card p-5"><Mail size={22} className="text-emerald-500" /><h3 className="mt-3 font-semibold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Physical mail matters</h3><p className="mt-2 text-sm text-slate-400">Some responses need to be physical — with tracking and proof. We handle that end to end.</p></div>
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Powered by MailMyPDF</h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">Notice Respond is a standalone product built on the MailMyPDF mailing platform. MailMyPDF handles the physical fulfillment — printing, enveloping, USPS delivery, tracking, and proof of delivery.</p>
          <div className="mt-6 flex items-center gap-4 rounded-xl border border-warm-border bg-white p-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100"><FileCheck size={22} className="text-slate-700" /></div><div><p className="font-semibold text-slate-700">MailMyPDF</p><p className="text-sm text-slate-400">The mailing infrastructure behind Notice Respond</p></div></div>
        </div>
      </section>
      <section style={{ background: "linear-gradient(135deg, #1e293b 0%, #131c2e 100%)" }} className="py-16">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>Ready to respond?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/60">Prepare and send your response today.</p>
          <Link to="/workflows/irs-notice" className="btn-emerald mt-6 text-base">Start a workflow <ArrowRight size={18} /></Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
