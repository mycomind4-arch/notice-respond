import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NOTICE_WORKFLOWS, workflowCategories } from "@/components/notice-workflow-directory";

export const Route = createFileRoute("/workflows/")({
  head: () => ({
    meta: [
      { title: "Notice Response Workflows — Official Notice Types | Notice Respond" },
      {
        name: "description",
        content:
          "Browse specialized workflows for responding to IRS notices, court summonses, agency actions, USCIS notices, benefits notices, property notices, and other formal correspondence.",
      },
      { property: "og:title", content: "Notice Response Workflows — Notice Respond" },
      {
        property: "og:description",
        content:
          "Find the Notice Respond workflow that matches the notice or official correspondence you received.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://notice-respond.pages.dev/workflows" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Notice Response Workflows",
          description: "Specialized workflows for understanding and responding to official notices and government correspondence.",
          url: "https://notice-respond.pages.dev/workflows",
          isPartOf: { "@type": "WebSite", name: "Notice Respond", url: "https://notice-respond.pages.dev/" },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: NOTICE_WORKFLOWS.map((workflow, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: workflow.title,
              url: `https://notice-respond.pages.dev${workflow.route}`,
            })),
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Notice Respond", item: "https://notice-respond.pages.dev/" },
            { "@type": "ListItem", position: 2, name: "Workflows", item: "https://notice-respond.pages.dev/workflows" },
          ],
        }),
      },
    ],
  }),
  component: WorkflowsDirectory,
});

function WorkflowsDirectory() {
  const groups = workflowCategories();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-rule/60 bg-paper-deep/20">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="postmark w-fit">Notice Respond · Workflow Library</div>
            <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
              Notice response workflows for the situation in front of you.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-ink-soft sm:text-lg">
              This directory brings together specialized workflows for official notices and formal correspondence. Browse by notice category, compare the information each workflow is designed to organize, and open the authority page for the situation that best matches the document you received.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/workflows/analyze" className="inline-flex rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper shadow-card hover:-translate-y-0.5">
                Analyze my notice
              </Link>
              <Link to="/" className="inline-flex rounded-full border border-rule bg-card px-6 py-3.5 text-sm font-medium hover:border-ink/30">
                About Notice Respond
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-rule/60">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <a
                  key={group.category}
                  href={`#${slugify(group.category)}`}
                  className="rounded-full border border-rule bg-card px-3.5 py-2 text-xs font-medium transition-colors hover:border-ink/30"
                >
                  {group.category}
                  <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">{group.workflows.length}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-18">
            <div className="max-w-3xl">
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-stamp">How to use the directory</div>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Choose the workflow by the notice or problem, not by the software feature.</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
                Each workflow page is intended to answer the questions a person has before they start: what the notice is, what information matters, what documents may be useful, what the response process looks like, and what Notice Respond can help organize. The actual application route is separate from the public authority page so the search page can stay focused on the user's information need.
              </p>
            </div>

            <div className="mt-12 space-y-16">
              {groups.map((group) => (
                <section key={group.category} id={slugify(group.category)} className="scroll-mt-24">
                  <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-4">
                    <div>
                      <div className="font-mono text-xs uppercase tracking-[0.18em] text-stamp">Workflow category</div>
                      <h2 className="mt-2 font-serif text-3xl sm:text-4xl">{group.category}</h2>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{group.workflows.length} workflow{group.workflows.length === 1 ? "" : "s"}</span>
                  </div>

                  <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                    {categoryDescription(group.category)}
                  </p>

                  <div className="mt-7">
                    {group.workflows.map((workflow, index) => (
                      <WorkflowDirectoryEntry key={workflow.slug} workflow={workflow} featured={index === 0} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-rule/60 bg-paper-deep/20">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="max-w-3xl">
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-stamp">Choosing a workflow</div>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Start with the document you actually received.</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
                When you are unsure where a notice belongs, use the notice itself as the source of truth. Look for the issuing agency, notice or case number, subject, dates, stated action, and response instructions. The workflow that best matches those details is usually a stronger starting point than a general category label.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <GuidePoint title="1. Identify the notice" text="Find the agency or issuing body, the notice type or identifier, and the action the document says is required." />
              <GuidePoint title="2. Check the dates" text="Separate dates printed on the notice from dates you infer. The document should remain the source for notice-specific deadlines." />
              <GuidePoint title="3. Gather the record" text="Keep the notice, attachments, relevant supporting documents, and any earlier correspondence connected to the matter." />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-stamp">Directory FAQ</div>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Frequently asked questions about notice response workflows</h2>
            <div className="mt-8 divide-y divide-rule border-y border-rule">
              {[
                ["What is a notice response workflow?", "A notice response workflow is a structured process for understanding a particular kind of official notice, organizing the relevant facts and documents, preparing a response, reviewing it, and completing the required submission or mailing steps."],
                ["How do I choose the right Notice Respond workflow?", "Match the workflow to the notice type, issuing agency, and action described in the document. When those details are unclear, start with notice analysis and use the directory to compare the closest supported situations."],
                ["Are all workflows the same once I start?", "No. The underlying product model is consistent, but the information to extract, documents to gather, requirements to check, and response strategy can differ substantially by notice type."],
                ["Can I browse without creating a matter first?", "Yes. The workflow directory and individual authority pages are designed for public discovery. Starting the actual workflow moves you into the application experience."],
                ["Does the workflow page give legal advice?", "No. Public workflow pages explain the notice situation and the supported document process. Notice Respond does not replace an attorney, tax professional, immigration professional, or other qualified adviser when one is appropriate."],
              ].map(([question, answer]) => (
                <div key={question} className="py-6">
                  <h3 className="font-serif text-xl">{question}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-rule/60">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <div className="postmark mx-auto w-fit">Need help identifying the notice?</div>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Start with the document, then choose the workflow.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Notice Respond can begin with the notice itself and help organize the next supported step before you commit to a specific response workflow.
            </p>
            <Link to="/workflows/analyze" className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper shadow-card hover:-translate-y-0.5">
              Analyze my notice →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function WorkflowDirectoryEntry({ workflow, featured }: { workflow: (typeof NOTICE_WORKFLOWS)[number]; featured: boolean }) {
  if (featured) {
    return (
      <article className="border-b border-rule py-7 md:grid md:grid-cols-[1fr_auto] md:gap-8 md:items-center">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Featured workflow · {workflow.category}</div>
          <h3 className="mt-2 font-serif text-2xl sm:text-3xl">{workflow.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{workflow.description}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Best for</div>
              <p className="mt-1 text-xs leading-5 text-ink-soft">{workflow.bestFor}</p>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Typical preparation</div>
              <p className="mt-1 text-xs leading-5 text-ink-soft">{workflow.documents.slice(0, 3).join(" · ")}</p>
            </div>
          </div>
        </div>
        <Link to={workflow.route} className="mt-6 inline-flex h-fit rounded-full border border-rule px-5 py-3 text-sm font-medium hover:border-ink/30 md:mt-0">
          View workflow →
        </Link>
      </article>
    );
  }

  return (
    <article className="group border-b border-rule/70 py-5 md:grid md:grid-cols-[minmax(0,1fr)_minmax(180px,.45fr)_auto] md:gap-6 md:items-center">
      <div>
        <h3 className="font-serif text-xl leading-tight transition-transform group-hover:translate-x-0.5">{workflow.title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{workflow.description}</p>
      </div>
      <div className="mt-3 md:mt-0">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Best for</div>
        <p className="mt-1 text-xs leading-5 text-ink-soft">{workflow.bestFor}</p>
      </div>
      <Link to={workflow.route} className="mt-4 text-sm font-medium text-muted-foreground hover:text-ink md:mt-0">
        View →
      </Link>
    </article>
  );
}

function GuidePoint({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-rule pt-5">
      <h3 className="font-serif text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function categoryDescription(category: string) {
  const descriptions: Record<string, string> = {
    "Tax notices": "Notices and letters from tax authorities where the document may ask for payment, information, clarification, documentation, or another written response.",
    "Court": "Formal court documents where the notice, summons, deadline, filing instructions, and supporting records need to be organized before action.",
    "Courts": "Formal court documents where the notice, summons, deadline, filing instructions, and supporting records need to be organized before action.",
    "Property & local government": "Property, inspection, code, permit, and local-government notices where dates, property identifiers, correction requests, and supporting documents can matter.",
    "State agencies": "State agency correspondence involving licensing, registration, administrative decisions, compliance actions, or requests for information.",
    "Benefits & identity": "Benefits and identity-related notices that may involve eligibility, overpayment, requests for records, or a decision that requires review.",
    "Immigration": "USCIS and immigration-related notices where receipt numbers, requested evidence, deadlines, and supporting documents must be carefully organized.",
    "General government": "Official government correspondence that does not fit a narrower notice family but still calls for a structured understanding and written response.",
  };
  return descriptions[category] ?? "Specialized notice-response workflows organized around a particular notice type, issuing agency, and user intent.";
}
