import { Link } from "@tanstack/react-router";
import { noticeRespondCatalog } from "@/domain/workflow-catalog";
import type { MasterWorkflowDefinition } from "@/domain/workflow-definition";
import { SectionHeader } from "@/components/ui-primitives";

export type NoticeWorkflow = {
  slug: string;
  route: string;
  title: string;
  searchIntent: string;
  category: string;
  description: string;
  bestFor: string;
  steps: string[];
  documents: string[];
  lifecycle?: string;
  canonicalPath?: string;
};

const SEO_ONLY_WORKFLOWS: NoticeWorkflow[] = [
  {
    slug: "government-notice",
    route: "/respond-to-a-government-notice",
    title: "Respond to a government notice",
    searchIntent: "respond to government notice",
    category: "General government",
    description: "Make sense of an official notice, organize the facts that matter, and prepare a clear response you can review before it is sent.",
    bestFor: "Official letters, requests for information, compliance notices, and general agency correspondence.",
    steps: ["Upload the notice", "Identify the important facts and dates", "Organize supporting records", "Review the response", "Mail and keep the proof"],
    documents: ["Notice or letter", "Attachments", "Supporting records", "Prior agency correspondence"],
  },
  {
    slug: "tax-notice",
    route: "/workflows/respond-to-a-tax-notice",
    title: "Respond to a tax notice",
    searchIntent: "respond to tax notice",
    category: "Tax notices",
    description: "Organize a tax notice around the stated issue, deadline, records, and response so nothing important gets lost in the paperwork.",
    bestFor: "Federal, state, or local tax notices that require clarification, documents, disagreement, or another written action.",
    steps: ["Upload the notice", "Capture the stated reason and deadline", "Gather the records that matter", "Review the response", "Prepare the mailing"],
    documents: ["Tax notice", "Returns or schedules", "Payment evidence", "Prior correspondence"],
  },
  {
    slug: "code-enforcement",
    route: "/workflows/respond-to-code-enforcement-notice",
    title: "Respond to a code enforcement notice",
    searchIntent: "respond to code enforcement notice",
    category: "Property & local government",
    description: "Turn a code enforcement notice into an organized response around the property, alleged issue, dates, evidence, and requested action.",
    bestFor: "Property owners and occupants dealing with municipal code, nuisance, inspection, or compliance notices.",
    steps: ["Upload the notice", "Capture property and case details", "Build the timeline", "Organize permits, photos, and records", "Review the response"],
    documents: ["Violation notice", "Inspection reports", "Permits", "Photos", "Property records", "Agency correspondence"],
  },
  {
    slug: "permit-correction",
    route: "/workflows/respond-to-a-permit-correction-notice",
    title: "Respond to a permit correction notice",
    searchIntent: "respond to permit correction notice",
    category: "Property & local government",
    description: "Work through permit corrections in a clean, traceable response so each requested item can be understood, supported, and reviewed.",
    bestFor: "Building, planning, zoning, inspection, and permit resubmission comments.",
    steps: ["Upload the correction notice", "Identify each requested change", "Match supporting plans or documents", "Review the response", "Prepare the resubmission"],
    documents: ["Correction notice", "Plans", "Permit application", "Inspection notes", "Supporting correspondence"],
  },
  {
    slug: "dmv-notice",
    route: "/workflows/respond-to-a-dmv-notice",
    title: "Respond to a DMV notice",
    searchIntent: "respond to DMV notice",
    category: "State agencies",
    description: "Keep the DMV notice, response date, supporting records, and final submission organized in one place.",
    bestFor: "License, registration, title, suspension, compliance, or other DMV correspondence.",
    steps: ["Upload the notice", "Identify the action and deadline", "Gather supporting records", "Review the response", "Keep the submission record"],
    documents: ["DMV notice", "License or registration records", "Proof of insurance", "Supporting correspondence"],
  },
  {
    slug: "ssa-notice",
    route: "/workflows/respond-to-an-ssa-notice",
    title: "Respond to an SSA notice",
    searchIntent: "respond to SSA notice",
    category: "Benefits & identity",
    description: "Understand the SSA notice, preserve the dates that matter, and prepare a factual response from the records you provide.",
    bestFor: "Social Security notices, requests for information, and administrative decisions that require action.",
    steps: ["Upload the notice", "Record the notice date and deadline", "Identify the stated reason or request", "Organize supporting records", "Review the response"],
    documents: ["SSA notice", "Benefit records", "Work or identity records when relevant", "Prior correspondence"],
  },
  {
    slug: "uscis-notice",
    route: "/workflows/respond-to-a-uscis-notice",
    title: "Respond to a USCIS notice",
    searchIntent: "respond to USCIS notice",
    category: "Immigration",
    description: "Keep the USCIS notice, receipt information, requested evidence, response draft, and submission details organized together.",
    bestFor: "Requests for Evidence, notices of intent, case correspondence, and other USCIS notices that require a response.",
    steps: ["Upload the notice", "Capture receipt or reference information", "Identify the exact request", "Organize supporting evidence", "Review the response package"],
    documents: ["USCIS notice", "Forms and filing copies", "Identity or status records", "Supporting evidence"],
  },
  {
    slug: "benefits-notice",
    route: "/workflows/respond-to-a-benefits-notice",
    title: "Respond to a benefits notice",
    searchIntent: "respond to benefits notice",
    category: "Benefits & identity",
    description: "Understand a benefits notice, organize the relevant records, and prepare a response or review request you can approve before sending.",
    bestFor: "Public benefits, eligibility, overpayment, review, and program-administration notices.",
    steps: ["Upload the notice", "Capture the decision and deadline", "Organize records for each issue", "Review the response", "Keep proof of submission"],
    documents: ["Benefits notice", "Eligibility records", "Payment statements", "Supporting correspondence"],
  },
];

function catalogToDirectoryEntry(def: MasterWorkflowDefinition): NoticeWorkflow | null {
  if (!def.directory) return null;
  return {
    slug: def.id,
    route: def.directory.seoRoute ?? def.searchIntent.canonicalPath,
    title: def.directory.seoTitle ?? def.title,
    searchIntent: def.searchIntent.primary,
    category: def.directory.category,
    description: def.directory.seoDescription ?? def.description,
    bestFor: def.directory.bestFor,
    steps: def.directory.steps,
    documents: def.directory.documents,
    lifecycle: def.lifecycle,
    canonicalPath: def.searchIntent.canonicalPath,
  };
}

function buildWorkflowList(): NoticeWorkflow[] {
  const entries: NoticeWorkflow[] = [];
  const seenSlugs = new Set<string>();
  for (const def of noticeRespondCatalog) {
    const entry = catalogToDirectoryEntry(def);
    if (entry) {
      entries.push(entry);
      seenSlugs.add(entry.slug);
    }
  }
  for (const entry of SEO_ONLY_WORKFLOWS) {
    if (!seenSlugs.has(entry.slug)) entries.push(entry);
  }
  return entries;
}

export const NOTICE_WORKFLOWS: NoticeWorkflow[] = buildWorkflowList();

export function workflowCategories() {
  const groups = new Map<string, NoticeWorkflow[]>();
  for (const workflow of NOTICE_WORKFLOWS) {
    const current = groups.get(workflow.category) ?? [];
    current.push(workflow);
    groups.set(workflow.category, current);
  }
  return Array.from(groups.entries()).map(([category, workflows]) => ({ category, workflows }));
}

const CARD_IMAGE = "https://media.base44.com/images/public/6a8bd310dfdf9ad92cf26415/06e033fed_generated_image.png";

export function WorkflowCard({ workflow }: { workflow: NoticeWorkflow }) {
  return (
    <Link to={workflow.route} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-rule/80 bg-card shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-ink/20 hover:shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/50">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-rule/60 bg-paper-deep">
        <img src={CARD_IMAGE} alt="" aria-hidden="true" className="h-full w-full object-cover saturate-[0.8] brightness-[0.9] transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
        <span className="absolute bottom-3 left-4 rounded-full border border-paper/30 bg-ink/65 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-paper backdrop-blur-sm">{workflow.category}</span>
        <span className="absolute bottom-3 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-paper/25 bg-ink/60 text-paper backdrop-blur-sm transition-transform duration-200 group-hover:translate-x-0.5">→</span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-serif text-[1.55rem] leading-[1.12] tracking-[-0.01em] text-foreground">{workflow.title}</h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{workflow.description}</p>
        <div className="mt-5 border-t border-rule/60 pt-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best for</div>
          <p className="mt-1.5 text-xs leading-5 text-ink-soft">{workflow.bestFor}</p>
        </div>
        <div className="mt-5 flex items-center justify-between text-sm font-medium">
          <span>View workflow</span>
          <span className="text-stamp transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}

export function WorkflowPage({ workflow }: { workflow: NoticeWorkflow }) {
  return (
    <div className="min-h-screen">
      <main>
        <section className="border-b border-rule/60 bg-paper-deep/20">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
            <Link to="/workflows" className="text-sm text-muted-foreground transition-colors hover:text-foreground">← All Notice Respond workflows</Link>
            <div className="mt-8 max-w-3xl">
              <div className="postmark w-fit">{workflow.category}</div>
              <h1 className="mt-5 font-serif text-4xl leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-6xl">{workflow.title}</h1>
              <p className="mt-5 text-base leading-7 text-ink-soft sm:text-lg">{workflow.description}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {workflow.canonicalPath && <Link to={workflow.canonicalPath} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper shadow-card transition-transform hover:-translate-y-0.5">Start this workflow <span aria-hidden="true">→</span></Link>}
                <Link to="/workflows/analyze" className="rounded-full border border-rule px-6 py-3 text-sm font-medium transition-colors hover:border-ink/30">Analyze a notice</Link>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-20 md:grid-cols-[1.2fr_.8fr]">
            <div>
              <SectionHeader eyebrow="What you'll do" title="A simple path, with the hard work handled underneath." />
              <div className="mt-6 space-y-3">
                {workflow.steps.map((step, index) => <div key={step} className="flex gap-4 rounded-xl border border-rule bg-card p-4"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-deep font-mono text-xs text-stamp">{String(index + 1).padStart(2, "0")}</div><div className="pt-1 text-sm leading-6 text-foreground">{step}</div></div>)}
              </div>
              <p className="mt-6 text-sm leading-6 text-muted-foreground">{workflow.bestFor}</p>
            </div>
            <aside className="rounded-2xl border border-rule bg-card p-6 shadow-card sm:p-7">
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Useful documents</div>
              <ul className="mt-4 space-y-3">{workflow.documents.map((document) => <li key={document} className="flex gap-3 text-sm leading-6"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stamp" /><span>{document}</span></li>)}</ul>
              <div className="mt-7 border-t border-rule/60 pt-6"><div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">What stays organized</div><p className="mt-3 text-sm leading-6 text-muted-foreground">The notice, important dates, supporting records, response draft, approval, and mailing/proof history.</p></div>
            </aside>
          </div>
        </section>
        <section className="border-y border-rule/60 bg-paper-deep/30">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
            <div className="postmark mx-auto w-fit">AI assistance, human approval</div>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl">You review the exact response before it goes anywhere.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Notice Respond can help extract information, organize evidence, surface issues, and prepare a draft. You remain in control of the final response and approval.</p>
            <div className="mt-6 flex justify-center gap-3">{workflow.canonicalPath && <Link to={workflow.canonicalPath} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper shadow-card transition-transform hover:-translate-y-0.5">Start this workflow <span aria-hidden="true">→</span></Link>}<Link to="/workflows" className="inline-flex rounded-full border border-rule px-6 py-3 text-sm font-medium transition-colors hover:border-ink/30">Browse workflows</Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}

export function WorkflowHead({ workflow }: { workflow: NoticeWorkflow }) {
  return { meta: [
    { title: `${workflow.title} | Notice Respond` },
    { name: "description", content: `${workflow.description} Learn what to gather, what to review, and how the response process works.` },
    { name: "robots", content: "index,follow" },
    { property: "og:title", content: `${workflow.title} | Notice Respond` },
    { property: "og:description", content: workflow.description },
    { property: "og:type", content: "website" },
  ]};
}

export function WorkflowStructuredData({ workflow }: { workflow: NoticeWorkflow }) {
  const data: Record<string, unknown> = { "@context": "https://schema.org", "@type": "WebPage", name: workflow.title, description: workflow.description, about: workflow.searchIntent, isPartOf: { "@type": "WebSite", name: "Notice Respond" } };
  if (workflow.canonicalPath) data["potentialAction"] = { "@type": "Action", name: "Start workflow", target: workflow.canonicalPath };
  return { type: "application/ld+json", children: JSON.stringify(data) };
}
