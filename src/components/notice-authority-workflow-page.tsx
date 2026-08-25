import { Link } from "@tanstack/react-router";
import { getWorkflowById } from "@/domain/workflow-catalog";
import type { NoticeWorkflow } from "@/components/notice-workflow-directory";
import { SectionHeader } from "@/components/ui-primitives";

export function AuthorityWorkflowPage({ workflow }: { workflow: NoticeWorkflow }) {
  const definition = getWorkflowById(workflow.slug);
  const faqs = definition?.seo?.faq ?? [
    {
      question: `What is ${workflow.title.toLowerCase()}?`,
      answer: workflow.description,
    },
    {
      question: "What should I gather before starting?",
      answer: `Start with the complete notice or correspondence, the identifiers and dates shown on it, the supporting records relevant to the issue, and the submission instructions provided by the issuing agency or court. The exact documents depend on the notice.`,
    },
    {
      question: "What should I review before sending a response?",
      answer: "Review the notice, factual statements, dates, reference numbers, attachments, recipient information, and the exact response draft. Notice Respond is a document and mailing tool and does not provide legal advice.",
    },
    {
      question: "How does the mailing step work?",
      answer: "After the required workflow and approval steps are complete, the response can be sent through MailMyPDF. The selected mailing service can provide tracking and a retained mailing record.",
    },
  ];

  const related = getRelated(workflow);

  return (
    <main className="min-h-screen">
      <section className="border-b border-rule/60 bg-paper-deep/20">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link to="/">Notice Respond</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link to="/workflows">Workflows</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-ink" aria-current="page">{workflow.title}</li>
            </ol>
          </nav>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_.72fr] lg:items-start">
            <div className="max-w-3xl">
              <div className="postmark w-fit">{workflow.category}</div>
              <h1 className="mt-5 font-serif text-4xl leading-[1.08] sm:text-5xl md:text-6xl">{workflow.title}</h1>
              <p className="mt-5 text-base leading-7 text-ink-soft sm:text-lg">{workflow.description}</p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Search intent: <span className="font-medium text-ink">{workflow.searchIntent}</span>
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to={workflow.canonicalPath ?? workflow.route} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper shadow-card hover:-translate-y-0.5 transition-transform">
                  Start this workflow <span aria-hidden="true">→</span>
                </Link>
                <Link to="/workflows" className="inline-flex items-center rounded-full border border-rule bg-card px-6 py-3.5 text-sm font-medium hover:border-ink/30">
                  Browse all workflows
                </Link>
              </div>
            </div>
            <aside className="border border-rule bg-card p-6 sm:p-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Best for</div>
              <p className="mt-3 text-sm leading-6">{workflow.bestFor}</p>
              <div className="mt-6 border-t border-rule/60 pt-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Workflow path</div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Identify → Understand → Prepare → Review → Send → Document</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <SectionHeader eyebrow="Overview" title={`When ${workflow.title.toLowerCase()} is the right starting point`} />
              <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
                This page is designed for people who have already received the type of notice or correspondence described above and need to understand what it says, organize the relevant information, and prepare the next written step. It is not a substitute for the issuing agency's instructions, court rules, or professional advice where those are needed.
              </p>
              <div className="mt-8 space-y-5">
                <AuthorityBullet title="Start with the source document" text="Use the actual notice, letter, determination, summons, or other document as the source for identifiers, dates, instructions, and the requested action." />
                <AuthorityBullet title="Separate facts from interpretation" text="Keep document-extracted facts and user-provided facts distinct from AI suggestions or unresolved assumptions." />
                <AuthorityBullet title="Build the response around the real issue" text="A strong response should address the notice's actual request rather than adding generic language that does not answer the underlying issue." />
              </div>
            </div>
            <aside className="border border-rule bg-paper p-6 sm:p-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">When not to rely on this page alone</div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>When the notice gives requirements that differ from the general workflow guidance.</li>
                <li>When a deadline or procedural rule is unclear or jurisdiction-specific.</li>
                <li>When you need legal, tax, immigration, financial, or other professional advice.</li>
                <li>When the document is outside the workflow's supported scope.</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-y border-rule/60 bg-paper-deep/20">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <SectionHeader eyebrow="Prepare" title="What to gather before you start" subtitle="The exact requirements vary by notice. Begin with the material that lets the workflow stay grounded in the document and your records." />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflow.documents.map((document) => (
              <div key={document} className="border border-rule bg-card p-5">
                <h2 className="font-serif text-xl">{document}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Use the version that actually applies to the notice, case, account, property, or agency matter involved.</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <PreparationCard title="Identifiers" text="Notice numbers, case numbers, receipt numbers, account references, property identifiers, or other identifiers shown on the source document." />
            <PreparationCard title="Dates" text="Notice date, stated response date, hearing date, filing date, or other dates explicitly provided by the document." />
            <PreparationCard title="Supporting records" text="Documents that confirm, explain, contradict, or otherwise support the facts you want to communicate." />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <SectionHeader eyebrow="Process" title="How the workflow works" />
              <div className="mt-7 space-y-3">
                {workflow.steps.map((step, index) => (
                  <div key={step} className="flex gap-4 border-b border-rule py-4">
                    <span className="font-mono text-xs text-stamp">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-sm leading-6">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionHeader eyebrow="What gets checked" title="The response should stay tied to the record" />
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <CheckCard title="Notice details" text="Type, agency, identifiers, stated action, and instructions." />
                <CheckCard title="Dates" text="Explicit dates and deadline sources, without silently inventing missing timing." />
                <CheckCard title="Requirements" text="What the notice asks you to provide, answer, sign, attach, or submit." />
                <CheckCard title="Evidence" text="Which supporting records exist, which are missing, and what each record supports." />
                <CheckCard title="Draft quality" text="Factual grounding, requested issues, recipient information, and document consistency." />
                <CheckCard title="Submission readiness" text="Approval, required information, mailing details, and available proof." />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-rule/60 bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <div className="postmark w-fit border-paper/20 text-paper/60">Review before sending</div>
            <h2 className="mt-5 font-serif text-3xl sm:text-4xl">The system assists. You review the important decisions.</h2>
            <p className="mt-4 text-sm leading-6 text-paper/70 sm:text-base">
              Review the source document, factual statements, dates, reference numbers, supporting evidence, recipient information, attachments, and the exact response draft before approval. AI suggestions should remain distinguishable from the facts that came from you or the document.
            </p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DarkCheck text="Facts trace back to source material." />
            <DarkCheck text="Uncertain information stays visible." />
            <DarkCheck text="The exact draft is the object of approval." />
            <DarkCheck text="Mailing and proof remain separate from drafting." />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <SectionHeader eyebrow="Common failure modes" title="What can make a response weaker" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <FailureCard title="Missing the actual request" text="A response can be detailed but still fail to address the specific action or information requested by the notice." />
            <FailureCard title="Using unsupported facts" text="Do not add dates, amounts, events, identifiers, or conclusions that are not supported by the record or clearly provided by the user." />
            <FailureCard title="Overlooking submission instructions" text="The source document may specify the recipient, format, attachments, method, or other instructions. Those controls the response workflow." />
            <FailureCard title="Treating a draft as final" text="The final mailing should reflect the exact version the user reviewed and approved, not an earlier draft or an AI suggestion." />
          </div>
        </div>
      </section>

      <section className="border-y border-rule/60 bg-paper-deep/20">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
          <SectionHeader eyebrow="FAQ" title={`Frequently asked questions about ${workflow.title.toLowerCase()}`} />
          <div className="mt-8 divide-y divide-rule border-y border-rule">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="cursor-pointer list-none pr-8 font-serif text-xl">
                  {faq.question}
                  <span className="float-right text-muted-foreground transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_.9fr]">
            <div>
              <SectionHeader eyebrow="Related workflows" title="Other notices you may encounter" />
              <div className="mt-7 space-y-1">
                {related.map((item) => (
                  <Link key={item.slug} to={item.route} className="group flex items-center justify-between border-b border-rule py-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{item.category}</div>
                      <div className="mt-1 font-serif text-xl">{item.title}</div>
                    </div>
                    <span className="text-sm text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </div>
            <aside className="border border-rule bg-card p-6 sm:p-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Mailing, tracking, and proof</div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Once the workflow requirements are satisfied and the user approves the exact draft, the response can move into the MailMyPDF fulfillment flow. The mailing record and available tracking/proof remain separate from the content analysis itself.
              </p>
              <Link to="/workflows" className="mt-6 inline-flex text-sm font-semibold text-ink underline decoration-rule underline-offset-4 hover:decoration-ink">Return to all workflows →</Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-t border-rule/60">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <div className="postmark mx-auto w-fit">Ready to begin</div>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Start with the document you received.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Notice Respond helps organize the notice, supporting evidence, response draft, review, and mailing record. It does not replace professional legal, tax, immigration, financial, or other specialized advice.
          </p>
          <Link to={workflow.canonicalPath ?? workflow.route} className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper shadow-card hover:-translate-y-0.5 transition-transform">Start this workflow →</Link>
        </div>
      </section>
    </main>
  );
}

function getRelated(workflow: NoticeWorkflow): NoticeWorkflow[] {
  return [
    ...requireNotice(workflow.category),
  ].filter((item) => item.slug !== workflow.slug).slice(0, 4);
}

function requireNotice(category: string): NoticeWorkflow[] {
  // Kept isolated so the page remains a pure public-content component.
  // Runtime routing still comes from the canonical directory list.
  return [];
}

function AuthorityBullet({ title, text }: { title: string; text: string }) {
  return <div className="border-l-2 border-stamp pl-4"><h3 className="font-serif text-xl">{title}</h3><p className="mt-1.5 text-sm leading-6 text-muted-foreground">{text}</p></div>;
}

function PreparationCard({ title, text }: { title: string; text: string }) {
  return <div className="border border-rule bg-card p-5"><h3 className="font-serif text-xl">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>;
}

function CheckCard({ title, text }: { title: string; text: string }) {
  return <div className="border border-rule p-5"><h3 className="font-serif text-lg">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>;
}

function DarkCheck({ text }: { text: string }) {
  return <div className="border border-paper/10 bg-paper/5 p-4 text-sm leading-6 text-paper/80">{text}</div>;
}

function FailureCard({ title, text }: { title: string; text: string }) {
  return <div className="border border-rule bg-card p-5"><h3 className="font-serif text-xl">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>;
}

export function AuthorityWorkflowHead({ workflow }: { workflow: NoticeWorkflow }) {
  const definition = getWorkflowById(workflow.slug);
  return {
    meta: [
      { title: definition?.seo?.title ?? `${workflow.title} | Notice Respond` },
      { name: "description", content: definition?.seo?.description ?? workflow.description },
      { property: "og:title", content: definition?.seo?.openGraph?.title ?? workflow.title },
      { property: "og:description", content: definition?.seo?.openGraph?.description ?? workflow.description },
      { property: "og:type", content: "website" },
    ],
  };
}

export function AuthorityWorkflowStructuredData({ workflow }: { workflow: NoticeWorkflow }) {
  const definition = getWorkflowById(workflow.slug);
  const faqs = definition?.seo?.faq ?? [];
  const origin = "https://notice-respond.pages.dev";
  const url = `${origin}${workflow.route}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": url,
      name: workflow.title,
      description: definition?.seo?.description ?? workflow.description,
      url,
      about: workflow.searchIntent,
      isPartOf: { "@type": "WebSite", name: "Notice Respond", url: origin },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Notice Respond", item: origin },
        { "@type": "ListItem", position: 2, name: "Workflows", item: `${origin}/workflows` },
        { "@type": "ListItem", position: 3, name: workflow.title, item: url },
      ],
    },
  ];
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }
  return { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) };
}
