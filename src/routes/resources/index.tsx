import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/resources/")({
  head: () => ({ meta: [
    { title: "Resources & Guides — Notice Respond" },
    { name: "description", content: "Guides for responding to government notices: IRS notices, court summonses, agency actions, and appeals." },
  ] }),
  component: ResourcesIndex,
});

const guides = [
  { slug: "understanding-irs-notices", title: "Understanding IRS Notices: CP Letters Explained", excerpt: "The IRS sends dozens of notice types. Here's what the most common ones mean and how to respond.", readTime: "6 min", category: "IRS Notices", icon: "📋" },
  { slug: "responding-to-court-summons", title: "How to Respond to a Court Summons", excerpt: "A court summons demands a timely response. Here's what to know about deadlines, formats, and proof of filing.", readTime: "5 min", category: "Court Responses", icon: "⚖️" },
  { slug: "certified-mail-for-deadlines", title: "Why Certified Mail Matters for Deadline-Sensitive Responses", excerpt: "When you're responding to a government notice, proof of timely delivery can be critical.", readTime: "4 min", category: "Mailing", icon: "📮" },
];

function ResourcesIndex() {
  return (
    <main className="min-h-screen bg-cream">
      <SiteHeader />
      <section className="bg-white py-16 md:py-20 border-b border-warm-border">
        <div className="container max-w-2xl">
          <div className="eyebrow">Resources</div>
          <h1 className="mt-3 text-4xl font-bold text-slate-700 md:text-5xl" style={{ fontFamily: "var(--font-serif)" }}>Guides for your responses</h1>
          <p className="mt-4 text-slate-400">Practical, plain-language guides about responding to government notices. Not legal advice — written to help you understand the process.</p>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <div className="grid gap-5">
            {guides.map((guide) => (
              <Link key={guide.slug} to="/resources/$slug" params={{ slug: guide.slug }} className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">{guide.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 text-xs text-slate-400"><span className="font-semibold text-emerald-600">{guide.category}</span><span className="flex items-center gap-1"><Clock size={12} /> {guide.readTime}</span></div>
                    <h2 className="mt-2 text-xl font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors" style={{ fontFamily: "var(--font-serif)" }}>{guide.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{guide.excerpt}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">Read guide <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 rounded-xl border border-dashed border-warm-border bg-white p-6 text-center"><BookOpen size={24} className="mx-auto text-slate-300" /><p className="mt-3 text-sm text-slate-400">More guides are being written. Have a topic you'd like covered? Let us know at <span className="font-semibold text-emerald-600">support@noticerespond.app</span>.</p></div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
