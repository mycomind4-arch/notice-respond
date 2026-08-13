import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [
    { title: "FAQ — Notice Respond" },
    { name: "description", content: "Answers to common questions about Notice Respond: how it works, mailing, privacy, legal scope, and pricing." },
  ] }),
  component: FAQPage,
});

const categories = [
  { name: "Using Notice Respond", questions: [
    { q: "Is this legal advice?", a: "No. Notice Respond is a correspondence tool, not a law firm. We help you prepare and send documents — we do not provide legal advice, and the AI assistant never invents facts, deadlines, or legal conclusions. If you need legal guidance, consult a qualified attorney." },
    { q: "What types of notices can I respond to?", a: "IRS notices and letters, court summonses and complaints, regulatory agency actions, licensing board decisions, FOIA determinations, and appeals of denied claims or rulings." },
    { q: "How does the drafting work?", a: "You provide your facts and objective in your own words. The AI assistant organizes that information into a professional draft. Everything is editable, and the AI never invents facts or adds information you didn't provide." },
    { q: "Do I need to review the draft?", a: "Yes. Before anything is mailed, you must confirm a review checklist. You review every factual statement, verify names and dates, and approve the final document." },
    { q: "Can I edit the draft?", a: "Absolutely. The draft is fully editable. You can change any part of it — add paragraphs, fix wording, remove sections, or start over entirely." },
  ]},
  { name: "Mailing & Delivery", questions: [
    { q: "How does physical mail work?", a: "Your final document is printed, placed in a business envelope, and mailed via USPS. You never have to print, address, or stamp anything yourself." },
    { q: "How long does delivery take?", a: "First-class mail typically arrives in 3–5 business days. Certified and registered mail follow similar timelines with added tracking and proof features." },
    { q: "Can I track my letter?", a: "Yes. Every mailing includes a USPS tracking number. Certified mail adds signature tracking, and the return receipt option provides a signed card mailed back to you as physical proof of delivery." },
    { q: "What's proof of delivery?", a: "Certified mail includes a USPS delivery record showing the date and signature of the recipient. The return receipt option sends you the physical signed card as well." },
  ]},
  { name: "Privacy & Security", questions: [
    { q: "Is my data secure?", a: "All documents and personal information are stored with encryption. We never sell your data, share it with third parties for marketing, or use it for analytics beyond what's needed to operate the service." },
    { q: "Who sees my documents?", a: "Only you. Your documents are never shared with other users. Our mailing partner only receives the final document you approve for mailing." },
    { q: "Can I delete my data?", a: "Yes. You can request full deletion of your account and all associated data at any time." },
    { q: "Do you train AI on my data?", a: "No. We never use your documents, personal information, or correspondence content to train AI models." },
  ]},
  { name: "Legal & Scope", questions: [
    { q: "Is Notice Respond a law firm?", a: "No. Notice Respond is a document preparation and mailing service. We are not a law firm, CPA firm, government agency, or accredited representative. We do not provide legal advice, representation, or case strategy." },
    { q: "Can this replace an attorney?", a: "No. Notice Respond can help you prepare and send correspondence, but it cannot replace the guidance of a qualified attorney. If your situation involves complex legal questions, we strongly recommend consulting an attorney." },
    { q: "What if I need legal advice?", a: "Consult a qualified attorney. Notice Respond is a tool for correspondence — not a substitute for legal counsel." },
  ]},
];

function FAQPage() {
  return (
    <main className="min-h-screen bg-cream">
      <SiteHeader />
      <section className="bg-white py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow">Questions</div>
            <h1 className="mt-3 text-4xl font-bold text-slate-700 md:text-5xl" style={{ fontFamily: "var(--font-serif)" }}>Frequently asked questions</h1>
            <p className="mt-4 text-slate-400">Everything you need to know about how Notice Respond works.</p>
          </div>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container max-w-3xl">
          {categories.map((cat) => (
            <div key={cat.name} className="mb-10">
              <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>{cat.name}</h2>
              <div className="mt-4 space-y-3">
                {cat.questions.map((item) => (<FAQItem key={item.q} q={item.q} a={item.a} />))}
              </div>
            </div>
          ))}
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
