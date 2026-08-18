# Notice Respond — Agent Guide

## What This Repo Is
Notice Respond is a MailMyPDF vertical for responding to government and administrative notices.
Users upload a notice, the system analyzes it, helps them understand what's being demanded,
identifies deadlines, surfaces evidence and contradictions, and prepares a professional response
that can be mailed with proof of delivery.

## Constraints
- Do NOT touch `mailmypdf-platform` repo.
- Do NOT use sub-agents.
- Work ONLY in this repository (`notice-respond`).
- Use `appeal-mail` as a sophistication benchmark but do NOT copy its code blindly.
- Notice-specific domain knowledge stays in Notice Respond, not in shared platform code.

## Tech Stack
- Vite + React + TanStack Router + TanStack Start
- Cloudflare Pages (Nitro preset)
- Zod for schema validation
- pdf.js for client-side PDF text extraction
- MailMyPDF API for physical mailing

## Build Commands
- `npm run dev` — dev server
- `npm run build` — production build
- `npm test` — run tests (`node --test tests/*.test.mjs`)
- `npm run verify:launch` — tests + build

## Architecture
```
src/
  domain/          — Notice-specific domain models and intelligence
    notice.ts              — Central Notice object with facts, deadlines, analysis
    notice-type.ts         — Notice classification and notice-type taxonomy
    fact.ts                — Extracted facts with provenance
    deadline.ts            — Deadline intelligence
    evidence.ts            — Evidence model with exhibit indexing
    finding.ts             — Analysis findings (contradictions, gaps, issues)
    readiness.ts           — Case readiness assessment
    strategy.ts            — Response strategy options
    response.ts            — Response generation
    proof.ts               — Proof packet for mailed response
    workflow-definition.ts — Universal master-workflow contract
    workflow-catalog.ts    — Notice Respond workflow catalog
    workflows.ts           — Legacy runtime workflow definitions during migration
    mailing.ts             — Mailing types
  platform/        — Platform adapters and server functions
    notice-extraction.ts   — Pattern-based extraction from notice text
    text-extraction.ts     — Client-side PDF/image text extraction
    extract-fn.ts          — Server function for extraction
  components/      — Shared UI components
  routes/          — Page routes
    workflows/     — Interactive workflow pages
tests/             — Test files
agent/             — Agent recovery state
```

## Workflow Factory Rules
- Every workflow owns a coherent search-intent cluster, not just a keyword landing page.
- A workflow definition is the future source of truth for SEO metadata, document inputs, deadlines, requirements, evidence, analysis, drafting, submission, and proof.
- `blueprint` means planned/incomplete; `functional` means usable with the current product; `authority` means the full quality gate has been validated.
- Do not label an unfinished workflow authority-grade.
- Migrate existing routes incrementally; do not break working workflows merely to adopt the new definition contract.
- See `docs/WORKFLOW_FACTORY.md` for the full model.

## Recovery Files
- `agent/CHECKPOINT.md` — Last completed milestone
- `agent/NEXT_ACTION.md` — What to do next
- `agent/SESSION_STATE.json` — Machine-readable state
