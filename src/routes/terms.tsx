import { createFileRoute } from "@tanstack/react-router";
import { FileText, ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [
    { title: "Terms of Service — Notice Respond" },
    { name: "description", content: "Terms of service for Notice Respond, including user responsibilities, payment, and limitations." },
  ] }),
  component: TermsPage,
});

const sections = [
  { title: "Acceptance of Terms", body: "By using Notice Respond, you agree to these Terms of Service. If you do not agree, do not use the service." },
  { title: "Description of Service", body: "Notice Respond provides guided workflows for preparing responses to government notices and physical mailing services via USPS." },
  { title: "Not Legal Advice", body: "Notice Respond is not a law firm, CPA firm, or government agency. We do not provide legal advice, legal representation, or tax advice. The AI assistant organizes information you provide but does not invent facts or draw legal conclusions. If you need legal advice, consult a qualified attorney." },
  { title: "User Responsibilities", body: "You are responsible for the accuracy of all information you provide. You must review every draft before approving it for mailing. You are responsible for verifying that the recipient address is correct and meeting all applicable deadlines." },
  { title: "Acceptable Use", body: "You agree not to use Notice Respond to send fraudulent, threatening, or harassing correspondence. You may not file documents you know to be false or misleading." },
  { title: "Payment & Refunds", body: "Payment is processed securely via Stripe before mailing. If your mailing has not been submitted for processing, you may request a full refund. Once a mailing is in process, refunds are not available." },
  { title: "Limitation of Liability", body: "Notice Respond is provided 'as is.' We are not liable for outcomes related to your correspondence, including denied claims, missed deadlines, or delivery failures beyond our control. Our liability is limited to the cost of the mailing service provided." },
  { title: "Contact", body: "For questions about these terms, contact us at support@noticerespond.app." },
];

function TermsPage() {
  return (
    <main className="min-h-screen bg-cream">
      <SiteHeader />
      <section className="bg-white py-16">
        <div className="container max-w-3xl">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100"><FileText size={20} className="text-slate-700" /></div><div><h1 className="text-3xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Terms of Service</h1><p className="text-sm text-slate-400">Last updated: August 2026</p></div></div>
          <div className="alert alert-warning mt-6"><ShieldAlert size={18} className="shrink-0" /><div><strong>Important:</strong> Notice Respond is not a law firm and does not provide legal advice.</div></div>
          <div className="mt-8 space-y-6">{sections.map((s) => (<div key={s.title}><h2 className="text-lg font-semibold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{s.title}</h2><p className="mt-2 text-sm leading-7 text-slate-400">{s.body}</p></div>))}</div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
