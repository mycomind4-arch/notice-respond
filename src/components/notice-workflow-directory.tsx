import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

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
};

export const NOTICE_WORKFLOWS: NoticeWorkflow[] = [
  {
    slug: "government-notice",
    route: "/workflows/respond-to-a-government-notice",
    title: "Respond to a government notice",
    searchIntent: "respond to government notice",
    category: "General government",
    description: "Turn an official notice into a clear response plan: identify what the agency is asking for, the dates that matter, the records you need, and the response you want to send.",
    bestFor: "Official letters, requests for information, compliance notices, and general agency correspondence.",
    steps: ["Upload the notice", "Extract the agency, reference number, dates, and requested action", "Organize supporting documents", "Prepare and review the response", "Mail and keep the proof"],
    documents: ["Notice or letter", "Attachments", "Supporting records", "Prior agency correspondence"],
  },
  {
    slug: "irs-notice",
    route: "/workflows/respond-to-an-irs-notice",
    title: "Respond to an IRS notice",
    searchIntent: "respond to IRS notice",
    category: "Tax notices",
    description: "Organize an IRS notice, response date, notice number, disputed facts, and supporting records before you send a written reply.",
    bestFor: "IRS notices and letters where the notice instructions call for a written response or supporting documentation.",
    steps: ["Identify the notice number and issue", "Capture the response date and mailing instructions", "Compare the notice with your records", "Prepare the response and attachments", "Send with a retained mailing record"],
    documents: ["IRS notice or letter", "Tax return excerpts", "Payment records", "Supporting statements or forms"],
  },
  {
    slug: "tax-notice",
    route: "/workflows/respond-to-a-tax-notice",
    title: "Respond to a tax notice",
    searchIntent: "respond to tax notice",
    category: "Tax notices",
    description: "Create a structured response to a tax authority notice without losing the notice deadline, reference number, or supporting evidence.",
    bestFor: "Federal, state, or local tax notices that require clarification, documents, disagreement, or another written action.",
    steps: ["Upload the notice", "Record the stated reason and deadline", "Collect the records that address the notice", "Draft a point-by-point response", "Review the mailing details"],
    documents: ["Tax notice", "Returns or schedules", "Payment evidence", "Prior correspondence"],
  },
  {
    slug: "code-enforcement",
    route: "/workflows/respond-to-code-enforcement-notice",
    title: "Respond to a code enforcement notice",
    searchIntent: "respond to code enforcement notice",
    category: "Property & local government",
    description: "Organize a code enforcement notice around the property, alleged violations, inspection dates, correction deadline, and evidence you want the agency to consider.",
    bestFor: "Property owners and occupants dealing with municipal code, nuisance, inspection, or compliance notices.",
    steps: ["Upload the notice", "Capture property and case details", "Build the notice timeline", "Attach permits, photos, records, or other evidence", "Prepare a response for review"],
    documents: ["Violation notice", "Inspection reports", "Permits", "Photos", "Property records", "Agency correspondence"],
  },
  {
    slug: "permit-correction",
    route: "/workflows/respond-to-a-permit-correction-notice",
    title: "Respond to a permit correction notice",
    searchIntent: "respond to permit correction notice",
    category: "Property & local government",
    description: "Turn permit or planning corrections into a tracked response so each requested change is understood, answered, and supported.",
    bestFor: "Building, planning, zoning, inspection, and permit resubmission comments.",
    steps: ["Upload the correction notice", "Extract each correction item", "Match each item to supporting plans or documents", "Draft a point-by-point response", "Prepare the resubmission package"],
    documents: ["Correction notice", "Plans", "Permit application", "Inspection notes", "Supporting correspondence"],
  },
  {
    slug: "dmv-notice",
    route: "/workflows/respond-to-a-dmv-notice",
    title: "Respond to a DMV notice",
    searchIntent: "respond to DMV notice",
    category: "State agencies",
    description: "Organize a DMV notice, identify the response or hearing date, and assemble the records needed for the written response.",
    bestFor: "License, registration, title, suspension, compliance, or other DMV correspondence.",
    steps: ["Upload the notice", "Identify the action and deadline", "Collect records that support your position", "Prepare the response", "Keep the submission and mailing record"],
    documents: ["DMV notice", "License or registration records", "Proof of insurance", "Supporting correspondence"],
  },
  {
    slug: "ssa-notice",
    route: "/workflows/respond-to-an-ssa-notice",
    title: "Respond to an SSA notice",
    searchIntent: "respond to SSA notice",
    category: "Benefits & identity",
    description: "Organize a Social Security notice, its deadline, stated decision or request, and the records you need for a written response or next review step.",
    bestFor: "Social Security notices, requests for information, and administrative decisions that require action.",
    steps: ["Upload the notice", "Record the notice date and response deadline", "Extract the stated reason or request", "Organize supporting evidence", "Prepare and review the response"],
    documents: ["SSA notice", "Medical or work records when relevant", "Benefit records", "Prior correspondence"],
  },
  {
    slug: "uscis-notice",
    route: "/workflows/respond-to-a-uscis-notice",
    title: "Respond to a USCIS notice",
    searchIntent: "respond to USCIS notice",
    category: "Immigration",
    description: "Keep the USCIS notice, deadline, receipt number, requested evidence, and response package organized in one workflow.",
    bestFor: "Requests for Evidence, notices of intent, case correspondence, and other USCIS notices that require a response.",
    steps: ["Upload the notice", "Capture receipt/reference information", "Identify the exact request", "Organize evidence and supporting documents", "Review the response package before submission"],
    documents: ["USCIS notice", "Forms and filing copies", "Identity or status records", "Supporting evidence"],
  },
  {
    slug: "benefits-notice",
    route: "/workflows/respond-to-a-benefits-notice",
    title: "Respond to a benefits notice",
    searchIntent: "respond to benefits notice",
    category: "Benefits & identity",
    description: "Understand a benefits notice, preserve the stated deadline, and prepare a factual response or request for review from your records.",
    bestFor: "Public benefits, eligibility, overpayment, review, and program-administration notices.",
    steps: ["Upload the notice", "Capture the decision and deadline", "Organize records for each issue", "Draft the response or review request", "Keep proof of what was submitted"],
    documents: ["Benefits notice", "Eligibility records", "Payment statements", "Supporting correspondence"],
  },
  {
    slug: "court-summons",
    route: "/workflows/respond-to-a-court-summons",
    title: "Respond to a court summons",
    searchIntent: "respond to court summons",
    category: "Court & formal actions",
    description: "Organize a summons, case number, service information, deadlines, and supporting documents so you can understand the required next step.",
    bestFor: "Civil summonses and other formal court papers where a response deadline is stated in the documents.",
    steps: ["Upload the summons", "Capture case and service information", "Identify the stated deadline", "Organize relevant documents", "Prepare the next step for professional review or filing"],
    documents: ["Summons", "Complaint or petition", "Court attachments", "Prior correspondence"],
  },
  {
    slug: "agency-action",
    route: "/workflows/respond-to-an-agency-action",
    title: "Respond to an agency action",
    searchIntent: "respond to agency action",
    category: "Court & formal actions",
    description: "Work through a formal agency action by organizing the decision, deadlines, evidence, and response path before drafting.",
    bestFor: "Administrative decisions, enforcement actions, compliance determinations, and formal agency correspondence.",
    steps: ["Upload the action", "Identify the agency decision and deadlines", "Build the supporting record", "Choose the response path", "Prepare the written submission"],
    documents: ["Agency decision", "Notice of action", "Supporting records", "Prior agency correspondence"],
  },
];

export function workflowCategories() {
  const groups = new Map<string, NoticeWorkflow[]>();
  for (const workflow of NOTICE_WORKFLOWS) {
    const current = groups.get(workflow.category) ?? [];
    current.push(workflow);
    groups.set(workflow.category, current);
  }
  return Array.from(groups.entries()).map(([category, workflows]) => ({ category, workflows }));
}

export function WorkflowCard({ workflow }: { workflow: NoticeWorkflow }) {
  return (
    <Link
      to={workflow.route}
      className="group flex h-full flex-col rounded-xl border border-rule bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full border border-rule bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {workflow.category}
        </span>
        <span className="text-muted-foreground transition-transform group-hover:translate-x-1">→</span>
      </div>
      <h3 className="mt-4 font-serif text-2xl leading-tight">{workflow.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{workflow.description}</p>
      <div className="mt-4 border-t border-rule/60 pt-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Search intent</div>
        <div className="mt-1 text-sm font-medium text-foreground">{workflow.searchIntent}</div>
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
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← All Notice Respond workflows</Link>
            <div className="mt-8 max-w-3xl">
              <div className="postmark w-fit">{workflow.category}</div>
              <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">{workflow.title}</h1>
              <p className="mt-5 text-base leading-7 text-ink-soft sm:text-lg">{workflow.description}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/dashboard" className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Start this workflow →</Link>
                <Link to="/workflows/analyze" className="rounded-full border border-rule px-6 py-3 text-sm font-medium">Analyze a notice</Link>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-20 md:grid-cols-[1.2fr_.8fr]">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-stamp">Workflow</div>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">What happens here</h2>
              <div className="mt-6 space-y-3">
                {workflow.steps.map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-xl border border-rule bg-card p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-deep font-mono text-xs text-stamp">{String(index + 1).padStart(2, "0")}</div>
                    <div className="pt-1 text-sm leading-6 text-foreground">{step}</div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm leading-6 text-muted-foreground">{workflow.bestFor}</p>
            </div>

            <aside className="rounded-2xl border border-rule bg-card p-6 sm:p-7">
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Bring these documents</div>
              <ul className="mt-4 space-y-3">
                {workflow.documents.map((document) => (
                  <li key={document} className="flex gap-3 text-sm leading-6">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stamp" />
                    <span>{document}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 border-t border-rule/60 pt-6">
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">What the system tracks</div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Notice date, response deadline, reference number, agency instructions, supporting documents, response status, and mailing/proof records.</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-y border-rule/60 bg-paper-deep/30">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
            <div className="postmark mx-auto w-fit">Ready when you are</div>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Start with the document you received.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Notice Respond helps organize the notice and response process. It is not a law firm and does not provide legal advice.</p>
            <Link to="/dashboard" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Start this workflow →</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export function WorkflowHead({ workflow }: { workflow: NoticeWorkflow }) {
  return {
    meta: [
      { title: `${workflow.title} | Notice Respond` },
      { name: "description", content: `${workflow.description} Organize documents, deadlines, and the written response in one workflow.` },
      { property: "og:title", content: `${workflow.title} | Notice Respond` },
      { property: "og:description", content: workflow.description },
      { property: "og:type", content: "website" },
    ],
  };
}

export function WorkflowStructuredData({ workflow }: { workflow: NoticeWorkflow }): ReactNode {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: workflow.title,
      description: workflow.description,
      about: workflow.searchIntent,
      isPartOf: { "@type": "WebSite", name: "Notice Respond" },
    }),
  };
}
