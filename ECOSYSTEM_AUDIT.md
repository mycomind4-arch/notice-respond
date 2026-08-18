# Ecosystem Architecture Map

**Date:** 2026-08-18
**Audited by:** Elara (Superagent)

## Existing Repositories

| Repo | Type | Status | Role |
|---|---|---|---|
| notice-respond | vertical | live | Workflow factory + notice response workflows |
| mailmypdf | core | production | Mailing, tracking, proof, payments, fulfillment |
| mailmypdf-platform | platform | development | Shared packages (many thin/planned) |
| fairprocessmaps | data | live | Jurisdiction/property intelligence |
| code-enforcement | vertical | scaffolded | Code enforcement vertical (new) |
| immigration-mail | vertical | live | Immigration document processing |
| certified-mail-from-pdf | vertical | live | Certified mail product |
| appeal-mail | vertical | live | Appeal letter generation |
| dispute-mail | vertical | live | Dispute letter generation |

## Reusable Capabilities Already Implemented

### notice-respond (canonical workflow infrastructure)
- `workflow-definition.ts` — MasterWorkflowDefinition interface (search, documents, deadlines, requirements, evidence, analysis, drafting, submission, quality gate, SEO, UX, directory)
- `workflow-catalog.ts` — 6 workflow definitions (irs-notice, court-summons, agency-action, file-appeal, cp2000-response, cp14-response)
- `workflow-runtime.ts` — Generic state machine with phases, extraction, facts, deadlines, evidence, draft validation, mailing state
- `cp2000.ts` — CP2000 extraction engine (classification + extraction)
- `cp14.ts` — CP14 extraction engine
- `cp14-gates.ts` — 8 authority gates for CP14
- `fact.ts` — NoticeFact with provenance (sourceExcerpt, extractionMethod, confidence)
- `evidence.ts` — Evidence model with relationships, types, verification status
- `contradiction.ts` — Contradiction detection (date, amount, name, evidence conflicts)
- `deadline.ts` — Deadline model with certainty levels
- `missing-info.ts` — Missing info detection with severity and impact
- `draft-validator.ts` — Draft validation (required sections, factual claims, requirement coverage)
- `strategy.ts` — Response strategy generation
- `next-action.ts` — Next action recommendation
- `versioning.ts` — Workflow versioning
- `quality.ts` — Quality assessment
- `readiness.ts` — Readiness checks
- `audit.ts` — Audit trail
- `mailing.ts` — Mailing state and options
- MailingFunnel component (recipient, method, checkout, tracking)
- Workflow shell component (reusable across workflows)

### mailmypdf (canonical fulfillment infrastructure)
- MailService + Lob adapter (actual mailing)
- TrackingService (Lob webhooks)
- ProofOfMailing (hash-linked custody chain)
- Stripe payments (checkout, refunds, subscriptions)
- Document handling (SHA-256, storage, security validation)
- Verticals registry (dispute-mail, gov-reply, appeal-reply, etc.)
- Products: appeal-reply, debt-defense, notice-response, records-request, tenant-reply, permit-reply, claim-proof, benefits-appeal

### mailmypdf-platform (shared packages — mostly thin/planned)
- packages/intelligence — Provenance, Entity, Fact, Evidence, Timeline, Contradiction, Deadline, Finding, Risk (implemented but unstable)
- packages/vertical-foundry — Full factory system with 80+ files (agent dispatch, build pipeline, QA, deployment, scoring — mostly theoretical)
- packages/core, documents, ai, proof, fulfillment, design-system — thin index.ts files

### fairprocessmaps
- Backend with jurisdiction/property intelligence
- Frontend with geographic capabilities
- Database with property data

## Architecture Decision: Where the Workflow Factory Lives

**notice-respond** owns the Workflow Factory because:
1. It already has the canonical WorkflowDefinition + WorkflowCatalog + WorkflowRuntime
2. It has real, tested domain modules (facts, evidence, contradictions, deadlines, etc.)
3. It has a working deployed app on Cloudflare Pages
4. It has passing tests (340 tests)
5. It has the MailingFunnel integration

The Workflow Factory extends notice-respond's existing system to support:
- Multiple engine types (document→action, dispute, records, appeal, jurisdictional)
- Workflow master registry with priority scoring
- Engine specialization via domain packs
- Extensible to hundreds of workflows via configuration, not code duplication

## What NOT to Rebuild
- MasterWorkflowDefinition (exists, extend it)
- WorkflowCatalog (exists, extend it)
- WorkflowRuntime (exists, keep it)
- Fact/Evidence/Contradiction/Deadline modules (exist, keep them)
- MailingFunnel (exists, improve UX)
- Test infrastructure (exists, extend it)
- Cloudflare deployment (exists, keep it)

## What to Add
- Engine type in WorkflowDefinition
- Engine registry (5 engines: document→action, dispute, records, appeal, jurisdictional)
- Workflow master registry with all workflow families
- Priority/opportunity scoring model
- Domain pack registry for engine specialization
