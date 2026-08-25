import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NOTICE_WORKFLOWS, WorkflowCard } from "@/components/notice-workflow-directory";

const SITE_ORIGIN = "https://notice-respond.pages.dev";
const HERO_IMAGE = "https://media.base44.com/images/public/6a8bd310dfdf9ad92cf26415/06e033fed_generated_image.png";
const FEATURED_SLUGS = ["irs-notice", "cp14-response", "cp2000-response", "code-enforcement", "court-summons", "agency-action"];

function featuredWorkflows() {
  const bySlug = new Map(NOTICE_WORKFLOWS.map((workflow) => [workflow.slug, workflow]));
  return FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean).slice(0, 6);
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Notice Respond — Respond to government notices with confidence" },
      { name: "description", content: "Understand a government notice, organize the facts and evidence that matter, prepare a response, and send it through MailMyPDF with tracking and proof." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: SITE_ORIGIN + "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = featuredWorkflows();
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-rule/60">
          <div className="absolute inset-0">
            <img src={HERO_IMAGE} alt="Organized official correspondence and supporting records" className="h-full w-full object-cover" loading="eager" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/88 to-paper/35" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 md:py-36">
            <div className="max-w-2xl">
              <div className="postmark w-fit">Notice Respond · MailMyPDF</div>
              <h1 className="mt-6 font-serif text-4xl leading-[1.06] tracking-[-0.025em] sm:text-5xl md:text-6xl">A government notice is easier to handle when everything is organized.</h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">Upload the notice. Notice Respond helps identify the important facts, dates, documents, and response path. AI handles the heavy lifting while you stay in control of the final response.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/workflows/analyze" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper shadow-card transition-transform hover:-translate-y-0.5">Start a Response <span aria-hidden="true">→</span></Link>
                <Link to="/workflows" className="inline-flex items-center gap-2 rounded-full border border-rule bg-card px-6 py-3.5 text-sm font-medium transition-colors hover:border-ink/30">Find your notice</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-rule/60 bg-paper-deep/20">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-3">
            {[
              ["Understand", "Upload the notice and let the system organize the important facts and dates."],
              ["Prepare", "AI helps organize evidence and prepare a clear response. You review the result."],
              ["Send & prove", "Approve the exact response, mail through MailMyPDF, and keep the delivery record."],
            ].map(([title, text]) => <div key={title} className="rounded-2xl border border-rule bg-card p-6 shadow-card"><h2 className="font-serif text-2xl">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
            <div className="flex items-end justify-between gap-6">
              <div><div className="postmark w-fit">Popular workflows</div><h2 className="mt-4 font-serif text-3xl sm:text-4xl">Start with a common situation.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">These are some of the workflows people are most likely to need. The complete directory is searchable and built to grow.</p></div>
              <Link to="/workflows" className="hidden shrink-0 rounded-full border border-rule px-5 py-3 text-sm font-medium sm:inline-flex">View all workflows →</Link>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{featured.map((workflow) => workflow ? <WorkflowCard key={workflow.slug} workflow={workflow} /> : null)}</div>
            <div className="mt-8 sm:hidden"><Link to="/workflows" className="inline-flex rounded-full border border-rule px-5 py-3 text-sm font-medium">View all workflows →</Link></div>
          </div>
        </section>

        <section className="border-y border-rule/60 bg-ink text-paper">
          <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-18">
            <div className="postmark mx-auto w-fit border-paper/20 text-stamp">AI assistance. Human approval.</div>
            <h2 className="mt-5 font-serif text-3xl sm:text-4xl">The technology can be complicated. Your experience shouldn't be.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-paper/70 sm:text-base">Notice Respond can extract information from the notice, organize evidence, identify missing pieces, and prepare a draft. It does not make the final decision for you. You approve the exact response before mailing.</p>
            <Link to="/how-it-works" className="mt-7 inline-flex rounded-full border border-paper/25 px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-paper/10">See how it works →</Link>
          </div>
        </section>

        <section className="border-b border-rule/60">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-18">
            <div className="postmark mx-auto w-fit">Not sure where to start?</div>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Upload the notice and start with analysis.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">You do not need to know the workflow name. Start with the document or describe what happened.</p>
            <Link to="/workflows/analyze" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper shadow-card">Analyze my notice →</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
