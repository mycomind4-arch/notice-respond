import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, FileCheck, Mail, PackageCheck, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/resources/$slug")({
  head: () => ({ meta: [
    { title: "Guides — Notice Respond" },
    { name: "description", content: "Guides for responding to government notices." },
  ] }),
  component: GuidePage,
});

function GuidePage() {
  const slug = Route.useParams().slug;

  const guides: Record<string, { title: string; category: string; readTime: string; content: React.ReactNode }> = {
    "understanding-irs-notices": { title: "Understanding IRS Notices: CP Letters Explained", category: "IRS Notices", readTime: "6 min", content: <IRSContent /> },
    "responding-to-court-summons": { title: "How to Respond to a Court Summons", category: "Court Responses", readTime: "5 min", content: <CourtContent /> },
    "certified-mail-for-deadlines": { title: "Why Certified Mail Matters for Deadline-Sensitive Responses", category: "Mailing", readTime: "4 min", content: <CertifiedMailContent /> },
  };

  const guide = guides[slug];
  if (!guide) {
    return (
      <main className="min-h-screen bg-cream">
        <SiteHeader />
        <div className="container py-20 text-center"><h1 className="text-2xl font-bold text-slate-700">Guide not found</h1><Link to="/resources" className="btn-outline mt-6">Back to resources</Link></div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <SiteHeader />
      <article>
        <section className="bg-white py-12 md:py-16 border-b border-warm-border">
          <div className="container max-w-2xl">
            <Link to="/resources" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-600"><ArrowLeft size={15} /> All guides</Link>
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-400"><span className="font-semibold text-emerald-600">{guide.category}</span><span className="flex items-center gap-1"><Clock size={12} /> {guide.readTime}</span></div>
            <h1 className="mt-3 text-3xl font-bold text-slate-700 md:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>{guide.title}</h1>
          </div>
        </section>
        <section className="py-10 md:py-14"><div className="container max-w-2xl prose-content">{guide.content}</div></section>
        <section style={{ background: "linear-gradient(135deg, #1e293b 0%, #131c2e 100%)" }} className="py-12">
          <div className="container max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>Ready to respond?</h2>
            <p className="mt-3 text-white/60">Start a guided workflow and get your response in the mail today.</p>
            <Link to="/workflows/irs-notice" className="btn-emerald mt-6">Start now</Link>
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}

function H2({ children }: { children: React.ReactNode }) { return <h2 className="mt-10 text-xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{children}</h2>; }
function P({ children }: { children: React.ReactNode }) { return <p className="mt-4 text-sm leading-7 text-slate-500">{children}</p>; }
function UL({ children }: { children: React.ReactNode }) { return <ul className="mt-4 space-y-2 pl-5 text-sm text-slate-500" style={{ listStyle: "disc" }}>{children}</ul>; }
function Callout({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "warning" | "success" }) {
  const cls = type === "warning" ? "alert alert-warning" : type === "success" ? "alert alert-success" : "alert alert-info";
  return <div className={`mt-6 ${cls}`}>{children}</div>;
}

function IRSContent() {
  return (
    <>
      <P>The IRS sends millions of notices each year. Understanding which one you received and what it means is the first step toward responding effectively.</P>
      <H2>Common IRS notice types</H2>
      <UL>
        <li><strong>CP14:</strong> Balance due — you owe taxes and need to pay or set up a payment plan</li>
        <li><strong>CP2000:</strong> Proposed adjustment — the IRS found a discrepancy between your return and reported income</li>
        <li><strong>CP501/CP503/CP504:</strong> Reminder/Intent to levy — escalating collection notices</li>
        <li><strong>LT11/LT1058:</strong> Final notice of intent to levy — serious collection action is imminent</li>
        <li><strong>CP90/CP244:</strong> Final notice of intent to levy and notice of your right to a hearing</li>
      </UL>
      <Callout type="warning"><AlertTriangle size={16} className="inline mr-1" /> <strong>Important:</strong> IRS notices have response deadlines — typically 30–90 days. Ignoring a notice can lead to escalating collection actions, liens, or levies.</Callout>
      <H2>How to read an IRS notice</H2>
      <P>Every IRS notice includes: a notice number (top right), your tax year, a response deadline, and instructions. The notice number tells you what type of action the IRS is taking.</P>
      <H2>Steps to respond</H2>
      <UL>
        <li>Read the entire notice carefully</li>
        <li>Note the response deadline immediately</li>
        <li>Gather supporting documentation</li>
        <li>Write a clear response letter addressing each item</li>
        <li>Mail certified with return receipt for proof of timely delivery</li>
      </UL>
      <Callout type="success"><PackageCheck size={16} className="inline mr-1" /> <strong>Tip:</strong> Certified mail with return receipt gives you a signed card back — physical proof that the IRS received your response.</Callout>
      <P className="text-xs text-slate-300 mt-8">This guide is for informational purposes only and does not constitute legal or tax advice.</P>
    </>
  );
}

function CourtContent() {
  return (
    <>
      <P>A court summons is a formal notice that you are being sued or required to appear in court. Responding properly and on time is critical — missing the deadline can result in a default judgment against you.</P>
      <H2>What a summons includes</H2>
      <UL>
        <li>The court name and case number</li>
        <li>The plaintiff (who is suing you) and defendant</li>
        <li>The deadline to respond (often 20–30 days)</li>
        <li>Instructions for how to respond</li>
      </UL>
      <Callout type="warning"><AlertTriangle size={16} className="inline mr-1" /> <strong>Critical:</strong> Missing the response deadline can result in a default judgment — meaning the court rules against you automatically.</Callout>
      <H2>Steps to respond</H2>
      <UL>
        <li>Read the summons and complaint carefully</li>
        <li>Note the response deadline immediately</li>
        <li>Prepare a written answer addressing each allegation</li>
        <li>File the answer with the court clerk by the deadline</li>
        <li>Mail certified with return receipt for proof of timely filing</li>
      </UL>
      <Callout><ShieldCheck size={16} className="inline mr-1" /> Court filings have strict procedural requirements. If you are unsure how to respond, consult a qualified attorney.</Callout>
      <P className="text-xs text-slate-300 mt-8">This guide is for informational purposes only and does not constitute legal advice.</P>
    </>
  );
}

function CertifiedMailContent() {
  return (
    <>
      <P>When responding to a government notice — whether an IRS letter, a court summons, or an agency action — proof that your response arrived on time can be just as important as the response itself.</P>
      <H2>What is certified mail?</H2>
      <P>Certified Mail is a USPS service that provides a tracking number and a delivery record. With the return receipt option, you also receive a signed card confirming who accepted the delivery.</P>
      <H2>Why it matters for deadline-sensitive responses</H2>
      <UL>
        <li><strong>Proof of timely submission:</strong> If an agency claims they didn't receive your response, your certified mail receipt proves otherwise</li>
        <li><strong>Delivery date confirmation:</strong> The USPS delivery record shows exactly when your letter arrived</li>
        <li><strong>Signature proof:</strong> With return receipt, you have a physical card showing who signed for the delivery</li>
      </UL>
      <Callout type="warning"><AlertTriangle size={16} className="inline mr-1" /> <strong>Don't rely on first-class mail alone</strong> for deadline-sensitive responses. While it includes tracking, it doesn't provide signature proof or a delivery record.</Callout>
      <P className="text-xs text-slate-300 mt-8">This guide is for informational purposes only and does not constitute legal advice.</P>
    </>
  );
}
