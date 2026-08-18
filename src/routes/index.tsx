import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NOTICE_WORKFLOWS, WorkflowCard, workflowCategories } from "@/components/notice-workflow-directory";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Notice Respond — Government Notice Response Workflows" },
      {
        name: "description",
        content: "Find the right workflow for an IRS notice, government letter, code enforcement notice, permit correction, DMV notice, SSA notice, USCIS notice, benefits notice, court summons, or agency action.",
      },
      { property: "og:title", content: "Notice Respond — Government Notice Response Workflows" },
      { property: "og:description", content: "A directory of specialized workflows for understanding, preparing, and documenting responses to official notices." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Notice Respond",
          description: "Specialized workflows for responding to official notices and government correspondence.",
          url: "/",
          hasPart: NOTICE_WORKFLOWS.map((workflow) => ({
            "@type": "WebPage",
            name: workflow.title,
            url: workflow.route,
            about: workflow.searchIntent,
          })),
        }),
      },
    ],
  }),
  component: DirectoryPage,
});

function DirectoryPage() {
  const groups = workflowCategories();

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main>
        <section className="border-b border-rule/60">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="postmark w-fit">Notice Respond</div>
                <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">Find the response workflow that matches your notice.</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg">
                  Notice Respond is a directory of specialized workflows for official notices. Pick the situation you are dealing with, review what information you need, and start from the documents you actually received.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link to="/workflows/analyze" className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">Analyze a notice →</Link>
                <Link to="/dashboard" className="rounded-full border border-rule px-5 py-3 text-sm font-medium">Open workspace</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-rule/60 bg-paper-deep/25">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <div className="grid gap-4 md:grid-cols-3">
              <DirectoryStat value={`${NOTICE_WORKFLOWS.length}`} label="specialized workflows" detail="Organized by notice type and user intent." />
              <DirectoryStat value="1" label="master workspace" detail="Documents, deadlines, drafting, and response history." />
              <DirectoryStat value="US" label="initial focus" detail="Built first around U.S. notices and correspondence." />
            </div>
          </div>
        </section>

        <section id="workflows">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
            <div className="mb-10 max-w-2xl">
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-stamp">Workflow directory</div>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Start with the problem, not the product name.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Each page below is built around a distinct search intent and notice situation. The links open a focused explanation and then hand off into the actual Notice Respond workflow.</p>
            </div>

            <div className="space-y-12">
              {groups.map((group) => (
                <section key={group.category}>
                  <div className="mb-5 flex items-center gap-3">
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{group.category}</h3>
                    <span className="h-px flex-1 bg-rule/60" />
                    <span className="font-mono text-xs text-muted-foreground">{group.workflows.length}</span>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {group.workflows.map((workflow) => <WorkflowCard key={workflow.slug} workflow={workflow} />)}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-rule/60 bg-paper-deep/30">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-3">
            <DirectoryPrinciple title="Understand" text="Start with the actual notice and extract the facts, dates, reference numbers, and requested action." />
            <DirectoryPrinciple title="Prepare" text="Organize the supporting documents and build a response you can review before sending." />
            <DirectoryPrinciple title="Prove" text="When the document is ready, keep the mailing, tracking, and proof record with the workflow." />
          </div>
        </section>

        <section className="border-t border-rule/60">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-20">
            <div className="postmark mx-auto w-fit">Not sure which workflow</div>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Upload the notice and start with analysis.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Notice Respond can help you identify the notice type and organize the next response step from the document itself.</p>
            <Link to="/workflows/analyze" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Analyze my notice →</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function DirectoryStat({ value, label, detail }: { value: string; label: string; detail: string }) {
  return (
    <div className="rounded-xl border border-rule bg-card p-5">
      <div className="font-serif text-3xl text-stamp">{value}</div>
      <div className="mt-1 text-sm font-semibold">{label}</div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}

function DirectoryPrinciple({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-rule bg-card p-6">
      <div className="font-mono text-xs text-stamp">{title}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
