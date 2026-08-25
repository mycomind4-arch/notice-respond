import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NOTICE_WORKFLOWS } from "@/components/notice-workflow-directory";
import { SectionHeader } from "@/components/ui-primitives";

const SITE_ORIGIN = "https://notice-respond.pages.dev";

const FEATURED_WORKFLOW_SLUGS = [
  "irs-notice",
  "cp14-response",
  "cp2000-response",
  "court-summons",
  "code-enforcement",
  "uscis-notice",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Notice Respond — Respond to Official Notices with a Documented Process" },
      {
        name: "description",
        content:
          "Understand official notices, organize the facts and evidence that matter, prepare a response for review, and mail it with a documented record through Notice Respond.",
      },
      { property: "og:title", content: "Notice Respond — Respond to Official Notices with a Documented Process" },
      {
        property: "og:description",
        content:
          "Understand the notice, prepare the response, review the exact draft, and mail it with tracking and proof through MailMyPDF.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Notice Respond · MailMyPDF" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: SITE_ORIGIN + "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Notice Respond",
          description: "Specialized workflows for understanding and responding to official notices and government correspondence.",
          url: SITE_ORIGIN,
          brand: { "@type": "Brand", name: "MailMyPDF" },
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_ORIGIN}/workflows?query={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = FEATURED_WORKFLOW_SLUGS.map((slug) => NOTICE_WORKFLOWS.find((workflow) => workflow.slug === slug)).filter(
    (workflow): workflow is (typeof NOTICE_WORKFLOWS)[number] => Boolean(workflow),
  );

  const fallbackFeatured = featured.length >= 4 ? featured : NOTICE_WORKFLOWS.slice(0, 6);

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main>
        <section className="border-b border-rule/60">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
            <div className="max-w-3xl">
              <div className="postmark w-fit">Notice Respond · MailMyPDF</div>
              <h1 className="mt-6 font-serif text-4xl leading-[1.08] sm:text-5xl md:text-6xl">
                Respond to official notices with a clear, documented process.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg">
                Start with the notice you received. Identify the agency, dates, reference numbers, requested action, and supporting evidence that matter. Prepare a professional response for review, approve the exact draft, and send it through MailMyPDF with tracking and proof.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/workflows/analyze"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper shadow-card transition-transform hover:-translate-y-0.5"
                >
                  Start with your notice
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  to="/workflows"
                  className="inline-flex items-center gap-2 rounded-full border border-rule bg-card px-6 py-3.5 text-sm font-medium transition-colors hover:border-ink/30"
                >
                  Explore workflows
                </Link>
              </div>
            </div>

            <div className="relative min-h-[360px] overflow-hidden border border-rule bg-ink p-7 text-paper shadow-premium sm:min-h-[430px] sm:p-9">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,.10),transparent_30%),linear-gradient(145deg,#171717,#2b2b2b)]" aria-hidden="true" />
              <div className="relative flex h-full min-h-[300px] flex-col justify-between sm:min-h-[370px]">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">Document-first workflow</div>
                  <div className="mt-7 max-w-md font-serif text-3xl leading-tight sm:text-4xl">The notice is the starting point. The record of your response is the finish.</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["01", "Identify", "Notice type, agency, dates, reference numbers"],
                    ["02", "Understand", "Requested action, requirements, evidence gaps"],
                    ["03", "Review", "Your facts, documents, and exact response draft"],
                    ["04", "Send & Prove", "Mailing, tracking, and retained proof"],
                  ].map(([number, title, text]) => (
                    <div key={number} className="border border-paper/10 bg-paper/5 p-4 backdrop-blur-sm">
                      <div className="font-mono text-xs text-stamp">{number}</div>
                      <div className="mt-2 text-sm font-semibold">{title}</div>
                      <div className="mt-1 text-xs leading-5 text-paper/60">{text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-rule/60 bg-paper-deep/20">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="grid gap-8 md:grid-cols-4">
              <Pillar title="Understand" text="Read the notice as the source material and separate extracted facts from inference." />
              <Pillar title="Prepare" text="Organize evidence, documents, dates, and the response objective before drafting." />
              <Pillar title="Review" text="Keep the important decisions with you and review the exact response before approval." />
              <Pillar title="Document" text="Preserve the mailing, tracking, and proof record after the response is sent." />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionHeader
              eyebrow="Official notices"
              title="What kind of notice are you dealing with?"
              subtitle="Notice Respond is organized around the situations people actually search for: tax notices, court documents, agency actions, immigration notices, benefits correspondence, property notices, and other formal communications that require a documented response."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                ["Tax notices", "IRS notices, CP notices, deficiency notices, levy notices, and other tax correspondence."],
                ["Court notices", "Summonses, civil court documents, and other formal court correspondence that may require action."],
                ["Immigration notices", "USCIS requests, notices, and case correspondence where documents and deadlines need careful organization."],
                ["Agency actions", "Government and administrative notices that ask for information, documentation, correction, or another response."],
                ["Benefits notices", "Social Security and public-benefit notices involving eligibility, overpayment, review, or requested information."],
                ["Property & local government", "Code enforcement, permit, zoning, inspection, and other property-related notices."],
              ].map(([title, text]) => (
                <div key={title} className="border-b border-rule py-5 sm:py-6">
                  <h2 className="font-serif text-2xl">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/workflows" className="text-sm font-semibold text-ink underline decoration-rule underline-offset-4 hover:decoration-ink">
                Browse all Notice Respond workflows →
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-rule/60 bg-paper-deep/20">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionHeader
              eyebrow="The process"
              title="From the notice you received to the response you can document."
              subtitle="The product is built around a repeatable process rather than a blank form. The exact workflow depends on the notice type and what the notice asks you to do."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <ProcessStep number="01" title="Identify" text="Upload or provide the notice and capture the notice type, agency, reference information, dates, and instructions." />
              <ProcessStep number="02" title="Understand" text="Organize the requested action, deadlines, requirements, evidence, and questions that need attention." />
              <ProcessStep number="03" title="Prepare & review" text="Build the response from the case documents, then review the facts, attachments, recipient, and exact draft before approval." />
              <ProcessStep number="04" title="Mail & prove" text="Complete the required fulfillment steps, send through MailMyPDF, and retain the mailing and tracking record." />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionHeader
              eyebrow="Start with the notice"
              title="A little preparation can make a response much easier to organize."
              subtitle="The information that matters depends on the notice, but these are common inputs that help the workflow stay grounded in the document and your records."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                ["The notice itself", "Keep the complete document, including attachments, page numbers, instructions, and any mailing information."],
                ["Key dates", "Notice date, stated response date, hearing date, filing date, or other dates explicitly shown in the document."],
                ["Reference information", "Notice numbers, case numbers, account references, receipt numbers, property identifiers, or other document identifiers."],
                ["Supporting records", "Documents that help explain, answer, confirm, or challenge the issue raised by the notice."],
                ["Your objective", "Know what you want the agency or recipient to understand, correct, review, or do after receiving the response."],
                ["Recipient instructions", "Use the address, department, portal, or other submission instructions actually provided by the notice or verified source."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border border-rule bg-card p-5">
                  <h2 className="font-serif text-xl">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-rule/60 bg-ink text-paper">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-[1.05fr_.95fr] md:items-start">
            <div>
              <div className="postmark w-fit border-paper/20 text-paper/60">After you respond</div>
              <h2 className="mt-5 font-serif text-3xl sm:text-4xl">The response is not the end of the record.</h2>
              <p className="mt-5 max-w-xl text-sm leading-6 text-paper/70 sm:text-base">
                A formal response may involve follow-up correspondence, additional documents, clarification, review, or a later decision. Notice Respond is designed to keep the original notice, the response process, and the mailing record connected instead of treating the outgoing letter as an isolated document.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DarkPoint title="Submitted" text="Keep a record of what was approved and sent." />
              <DarkPoint title="Tracked" text="Use the selected mailing service and available tracking information." />
              <DarkPoint title="Received" text="Preserve the delivery or proof information available through the mailing service." />
              <DarkPoint title="Follow-up ready" text="Keep the matter organized for later correspondence or review." />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionHeader
              eyebrow="Featured workflows"
              title="Start with the notice type you recognize."
              subtitle="These are representative entry points. The full workflow library lives on the dedicated directory so this page can stay focused on the broader Notice Respond topic."
            />
            <div className="mt-10 space-y-3">
              {fallbackFeatured.map((workflow, index) => (
                <Link
                  key={workflow.slug}
                  to={workflow.route}
                  className="group grid gap-4 border-b border-rule py-6 transition-colors hover:bg-paper-deep/20 md:grid-cols-[auto_1fr_auto] md:items-center md:px-4"
                >
                  <div className="font-mono text-xs text-stamp">0{index + 1}</div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{workflow.category}</div>
                    <h2 className="mt-1 font-serif text-2xl leading-tight">{workflow.title}</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{workflow.description}</p>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground transition-transform group-hover:translate-x-1">View workflow →</div>
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/workflows" className="inline-flex rounded-full border border-rule px-5 py-3 text-sm font-medium hover:border-ink/30">
                Explore the full workflow library
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-rule/60 bg-paper-deep/20">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionHeader
              eyebrow="Why Notice Respond"
              title="The system organizes and assists. You remain responsible for the important decisions."
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <TrustColumn title="Source-first" text="The notice and the case documents are the foundation. Extracted facts should be distinguishable from assumptions or suggestions." />
              <TrustColumn title="Review-first" text="You review the response, the evidence, the recipient, and the exact draft before the mailing workflow can be completed." />
              <TrustColumn title="Proof-oriented" text="The product connects the prepared response with the mailing and tracking record instead of treating mailing as an afterthought." />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionHeader
              eyebrow="Common questions"
              title="Questions people have before responding to an official notice"
            />
            <div className="mt-8 divide-y divide-rule border-y border-rule">
              {[
                ["What should I do when I receive an official notice?", "Start by preserving the complete notice and identifying the issuing agency, the stated action, the dates or deadlines shown on the document, and any instructions for responding. The appropriate next step depends on the specific notice."],
                ["Can Notice Respond tell me what the notice means?", "It can organize the notice, extract relevant information, and provide workflow guidance based on the document and supported notice type. It does not replace legal, tax, immigration, or other professional advice."],
                ["What documents should I include with a response?", "That depends on what the notice asks for and what you are responding about. Notice Respond is designed to help organize the supporting records connected to the matter before the response is approved."],
                ["Can I review the response before it is mailed?", "Yes. The workflow is designed around user review and approval of the exact response draft before mailing, subject to the application's required checks."],
                ["Does paying for mailing automatically authorize the response to be sent?", "No. Payment and authorization are distinct parts of the workflow. Mailing remains subject to the required approval and fulfillment checks."],
                ["Is Notice Respond a law firm or tax professional?", "No. Notice Respond is a document and correspondence tool. It does not provide legal or tax advice and does not replace a qualified professional when one is appropriate."],
              ].map(([question, answer]) => (
                <div key={question} className="py-6">
                  <h2 className="font-serif text-xl">{question}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-rule/60">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <div className="postmark mx-auto w-fit">Start with the document</div>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Ready to understand the notice and plan the response?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Upload or provide the notice, then work through the supported process for the type of correspondence you received.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/workflows/analyze" className="inline-flex rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper shadow-card hover:-translate-y-0.5">
                Start with your notice →
              </Link>
              <Link to="/workflows" className="inline-flex rounded-full border border-rule px-6 py-3 text-sm font-medium hover:border-ink/30">
                Explore workflows
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Pillar({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-stamp">{title}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function ProcessStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="border-t border-rule pt-5">
      <div className="font-mono text-xs text-stamp">{number}</div>
      <h2 className="mt-2 font-serif text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function DarkPoint({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-paper/10 bg-paper/5 p-5">
      <div className="font-serif text-xl">{title}</div>
      <p className="mt-2 text-sm leading-6 text-paper/60">{text}</p>
    </div>
  );
}

function TrustColumn({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-rule bg-card p-6">
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
