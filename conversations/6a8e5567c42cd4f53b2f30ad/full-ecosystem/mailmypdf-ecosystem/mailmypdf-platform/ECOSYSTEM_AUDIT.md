# Ecosystem Audit

**Date:** 2026-08-14
**Scope:** MailMyPDF, Appeal Mail, Immigration Mail, Notice Respond, Dispute Mail, MailMyPDF Small Business, MailMyPDF Platform

---

## 1. MailMyPDF (mailmypdf)

**Role:** Canonical fulfillment, payment, mailing, tracking, and proof-of-service platform.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (React 19) + Vite + Nitro |
| Runtime | Node 22, deployed to Cloudflare Workers/Pages |
| Package manager | npm (bun.lock also present from Lovable era) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | Anthropic Claude (direct API via ai-workflow.ts) |
| Document processing | pdf-lib (PDF generation), pdf-validation.server.ts (security validation) |
| Payment | Stripe (checkout, webhooks, subscriptions) |
| Mailing | Lob (physical mail API) |
| Email | Resend |
| Scheduling | Internal API routes + cron |
| Analytics | Internal event tracking (analytics-events.ts) |
| Deployment | Cloudflare Pages/Workers |
| Tests | 28 test files (Node --test, .mjs) |
| CI | GitHub Actions (npm ci → npm test → npm run build) |

### Application Architecture

**Major modules:**

- `src/domain/` — Canonical domain models: MailJob, Document, Recipient, Address, Pricing, PaymentInfo, TrackingInfo, AuditEvent, ProofOfMailing, Organization, CustodyChain
- `src/services/` — Application services: DocumentService, PricingService, BillingService, MailService, StateMachineService, TrackingService, EventHistoryService
- `src/providers/` — Provider interfaces (MailProvider, PaymentProvider, NotificationProvider, StorageProvider) + concrete adapters (Lob, Stripe, Resend, Supabase Storage)
- `src/lib/` — Cross-cutting utilities: retry, rate-limit, sanitize, security-headers, pdf-validation, logger, audit-log, feature-flags
- `src/lib/proof-of-service/` — Full proof-of-service infrastructure: hashing, custody chains, proof bundles, communications, webhooks, rate-limiting, address verification, Lob bridge
- `src/verticals/` — Vertical registry and types: VerticalDefinition, AIWorkflow interface, VerticalWorkflowState
- `src/products/` — Product implementations: appeal-reply, benefits-appeal, claim-proof, debt-defense, notice-response, permit-reply, records-request, tenant-reply
- `src/routes/` — 60+ routes: pages, API endpoints, admin dashboard, auth, webhooks, SEO landing pages

**Domain model highlights:**

- `MailJob` is the central domain object with a 14-state state machine (draft → validated → payment_pending → payment_complete → queued → submitted → accepted → in_transit → delivered → completed → archived, plus failed/cancelled/refunded)
- `ProofOfMailing` contains a hash-linked custody chain
- `Document` model includes SHA-256 hash, storage path, source classification
- `AuditEvent` model: immutable, append-only, typed events with actor tracking

**API structure:**

- `/v1/documents` — upload, retrieve
- `/v1/communications` — create, get (used by verticals)
- `/v1/appeal-reply/*` — analyze, draft, mail
- `/v1/dispute-mail/*` — analyze, draft, finalize
- `/v1/notice-response/*` — analyze, draft
- `/v1/{vertical}/*` — per-vertical endpoints
- `/v1/verify/:trackingNumber` — tracking verification
- Internal: cleanup-drafts, health, process-scheduled, proof-processor, proof-webhook-retries, proof-window-expiry
- Webhooks: lob-webhook, payments/webhook

### Security

| Area | Implementation |
|---|---|
| Authentication | Supabase Auth (JWT-based) |
| Authorization | Role checks in admin routes, auth middleware |
| RLS | Supabase Row-Level Security on tables |
| Tenant isolation | Tenant ID scoping in proof-of-service queries |
| Secrets | Environment variables, config validation |
| File upload handling | pdf-validation.server.ts: max 10MB, max 10 pages, max 2500 indirect objects, forbidden tokens (/JavaScript, /Launch, /OpenAction, /EmbeddedFile, etc.), encrypted PDF rejection |
| Webhook verification | Lob webhook signature verification, Stripe webhook signature verification |
| Rate limiting | In-memory sliding window rate limiter (rateLimit function) |
| Prompt injection | Not explicitly addressed (AI output treated as text, not executed) |
| Audit logging | Dedicated audit-log module, immutable audit events |
| Security headers | security-headers.ts |
| Sanitization | sanitize.ts utility |
| Request ID | request-id.ts for traceability |

### Quality

- **Tests:** 28 test files covering admin dashboard, application services, checkout, config, domain models, feature flags, lob hardening, observability, order state machine, payment fulfillment, pricing, proof of service, rate limiting, security, stripe, upload retention, vertical pricing, vertical registry, webhooks
- **Technical debt:** Reverted commits suggest production instability (multiple "Revert" commits for production readiness fixes), dual package managers (npm + bun)
- **Duplicated code:** Vertical product modules (appeal-reply, benefits-appeal, etc.) each have their own claude.ts wrapper, following the same pattern but with domain-specific prompts
- **Production risks:** In-memory rate limiting (doesn't work in serverless/multi-instance), Supabase auth getSession() requires guarding, Cloudflare Workers bundling issues

---

## 2. Appeal Mail (appeal-mail)

**Role:** Appeal letter preparation vertical — the most mature vertical application.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (React 19) + Vite + Nitro |
| Package manager | npm |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | Anthropic Claude (via platform functions: xray-fn.ts, stress-test-fn.ts) |
| Document processing | pdfjs-dist (client-side PDF text extraction) + pattern-matching extraction engine |
| Payment | Stripe (checkout integration) |
| Mailing | MailMyPDF API (via platform/mailmypdf.ts) |
| Validation | Zod schemas throughout domain layer |
| Tests | None |
| CI | None |

### Application Architecture

**Major modules:**

- `src/domain/` — Rich domain model: Appeal, Decision, AppealGround, Evidence, Argument, ReadinessReview, AppealPacket, ProofPacket, Timeline, XRay, StressTest, Workflows
- `src/platform/` — Infrastructure: Supabase client, MailMyPDF API client, document extraction, text extraction, server functions (checkout, extract, stress-test, timeline, xray)
- `src/components/` — Feature components: workspace shell, workflow wizard, X-Ray view, Stress Test view, Timeline view
- `src/routes/` — Pages: dashboard, auth, pricing, resources, 4 workflow types (court-ruling, denied-claim, government-decision, reconsideration)

**Domain model highlights — most sophisticated in the ecosystem:**

- **Decision model:** DecisionType, DecisionFact (with source: extracted/user_provided/inferred), DecisionReason (with citedRule, confidence), Deadline (with source provenance, appealInstructions)
- **Evidence model:** 6 evidence types (document, excerpt, testimonial, photographic, record, correspondence), EvidenceLink (supports/contradicts/contextual), hash tracking, exhibit numbering
- **Timeline (Appeal Timeline™):** EventStatus (documented/user_reported/inferred/conflicting/unknown), EventCategory (8 types), datePrecision (day/month/year/unknown), source provenance per event
- **XRay (Appeal X-Ray™):** Cross-document analysis — 8 finding types (date_conflict, unaddressed_evidence, unsupported_conclusion, contradiction, procedural_issue, factual_discrepancy, missing_reference, strength), SourceRef with documentId/page/excerpt/offset, confidence scoring
- **Stress Test (Appeal Stress Test™):** Adversarial analysis — GroundAttack (challenge/whatWouldDefeat/evidenceNeeded: strong/moderate/weak), GroundStrengthProfile (score 0-100, StrengthComponent), assessment levels
- **Contradiction detection:** detectContradictions() function in argument.ts
- **Proof model:** ProofPacket with finalAppealHash, attachmentHashes, recipient details, mailing method, tracking, delivery confirmation, sealed timestamp

**Document extraction:**

- Deterministic pattern-matching engine (not AI) in document-extraction.ts
- Extracts: agency, reference number, decision date, deadline, decision type, appeal instructions, reasons, timeline chronology, facts
- Date patterns: Month DD YYYY, MM/DD/YYYY, YYYY-MM-DD
- Deadline keywords: "within N days", "by [date]", "no later than"
- Reference patterns: case/claim/reference/docket/matter/file numbers
- Agency patterns: organizational name extraction
- Confidence scoring based on number of fields extracted

**MailMyPDF integration:**

- MailMyPDFProvider class implements MailingProvider interface
- Creates communications via /v1/communications endpoint
- Gets status via /v1/communications/:id
- Maps MailMyPDF status → MailingStatus with 9 states
- Idempotency keys: `${workflowId}:${documentId}`

### Security

| Area | Implementation |
|---|---|
| Authentication | Supabase Auth |
| Authorization | Auth-guarded dashboard routes |
| Secrets | Environment variables (MAILMYPDF_API_URL, MAILMYPDF_API_KEY, SUPABASE_*) |
| File upload | Via MailMyPDF API (delegated) |
| Webhook verification | Stripe webhook handling |
| Rate limiting | Not implemented |
| Prompt injection | Not explicitly addressed |
| Audit logging | Not implemented (relies on MailMyPDF) |

### Quality

- **Tests:** None — significant gap
- **Technical debt:** No tests, no CI, client-side PDF text extraction (limited), no server-side document validation
- **Dead code:** Not assessed (no test coverage to identify)
- **Production risks:** Client-side PDF extraction can be bypassed, no rate limiting, no server-side upload validation, Stripe webhook handling without verification shown

---

## 3. Immigration Mail (immigration-mail)

**Role:** Immigration document analysis and response vertical.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (React 19) + Vite + Nitro |
| Package manager | npm |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | Anthropic Claude (via src/api/analyze-document.ts) |
| Document processing | text-extraction.ts (simple) |
| Payment | Stripe |
| Mailing | MailMyPDF API (platform/mailmypdf-provider.ts) |
| Tests | 1 file (workflows.test.mjs) |
| CI | None |

### Application Architecture

- `src/api/analyze-document.ts` — Server-side AI analysis endpoint
- `src/lib/document-analysis.ts` — Structured analysis types: DocumentType (12 types), Agency (USCIS/DOS/CBP/ICE/NVC/EOIR/SSA/DOL), AnalysisConfidence, ExtractedDate, RequestedAction, DocumentAnalysis with plain_english_explanation, what_it_means, what_to_do
- `src/lib/document-storage.ts` — Supabase storage abstraction
- `src/lib/text-extraction.ts` — PDF text extraction
- `src/domain/mailing.ts` — Mailing model (identical pattern to other verticals)
- `src/platform/mailmypdf-provider.ts` — MailMyPDF integration (identical pattern)
- `src/domain/workflows.ts` — 3 workflows: explanation-letter, respond-to-notice, supporting-documents

### Security

- Authentication: Supabase Auth
- Authorization: Auth-guarded routes
- Rate limiting: Not implemented
- File upload: Via Supabase Storage
- Audit logging: Not implemented

### Quality

- **Tests:** 1 file (workflows only) — minimal coverage
- **Technical debt:** Copy-pasted mailing model/provider from Appeal Mail (identical interface, different type names)
- **Production risks:** Minimal test coverage, no server-side document validation

---

## 4. Notice Respond (notice-respond)

**Role:** Notice response vertical — minimal scaffold.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (React 19) + Vite + Nitro |
| Package manager | npm |
| Database | None (no persistence layer) |
| Auth | Route exists but no backend |
| Mailing | MailMyPDF API (platform/mailmypdf-provider.ts) |
| Tests | None |
| CI | None |

### Application Architecture

- `src/domain/mailing.ts` — Identical MailingProvider pattern (copy-pasted from Appeal Mail)
- `src/domain/workflows.ts` — 4 workflows: agency-action, court-summons, file-appeal, irs-notice
- `src/platform/mailmypdf-provider.ts` — Identical MailMyPDF integration
- `src/components/workflow-shell.tsx` — UI shell
- No AI, no document extraction, no analysis

### Quality

- **Tests:** None
- **Technical debt:** Pure scaffold — copy-pasted mailing model, no intelligence, no document processing
- **Production risks:** Non-functional beyond basic UI

---

## 5. Dispute Mail (dispute-mail)

**Role:** Dispute letter vertical — minimal scaffold.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (React 19) + Vite + Nitro |
| Package manager | npm |
| Database | None |
| Mailing | MailMyPDF API (platform/mailmypdf-provider.ts) |
| Tests | None |
| CI | None |

### Application Architecture

- `src/domain/mailing.ts` — Identical MailingProvider pattern
- `src/domain/workflows.ts` — 4 workflows: billing-error, credit-report, debt-validation, unauthorized-charge
- `src/platform/mailmypdf-provider.ts` — Identical MailMyPDF integration
- No AI, no document extraction, no analysis

### Quality

- **Tests:** None
- **Technical debt:** Pure scaffold — copy-pasted from Appeal Mail pattern
- **Production risks:** Non-functional beyond basic UI

---

## 6. MailMyPDF Small Business (mailmypdf-smallbusiness)

**Role:** Business correspondence automation and CRM integration vertical.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | React + Vite (no SSR/TanStack Start) |
| Package manager | npm (all deps pinned to "latest" — unstable) |
| Database | PostgreSQL (via postgres in dependencies, postgresScheduleStore.ts) |
| AI | Agent with capability registry, intent planner, skill registry |
| Workflow engine | Trigger.dev (primary), Temporal (interface), n8n (webhook) |
| CRM integrations | EspoCRM, Twenty CRM |
| Mailing | MailMyPDF API (two client implementations) |
| Tests | None |
| CI | None |

### Application Architecture

**Major modules:**

- `src/ai/` — Agent infrastructure:
  - `capabilities.ts` — 6 capabilities (correspondence.draft, correspondence.analyze, mail.recommend_class, mail.create, mail.schedule, mail.request_approval) with permissions
  - `intentPlanner.ts` — Deterministic intent → capability → plan mapping
  - `skillRegistry.ts` — Skill registration and lookup
  - `skills/` — 3 skills: analyzeCorrespondence, draftCorrespondence, recommendMailClass
  - `agentPolicy.ts` — Policy enforcement
- `src/domain/` — Domain models:
  - `correspondenceWorkspace.ts` — Workspace model
  - `crm.ts` — CRM entities
  - `models.ts` — Shared models (MailClass, etc.)
  - `template.ts` — Versioned correspondence template model
  - `workflow.ts` — Workflow model with triggers, conditions, actions
- `src/services/` — 15 service files:
  - `approvalEngine.ts` — Approval request lifecycle (pending/approved/rejected/cancelled)
  - `scheduleEngine.ts` / `scheduler.ts` / `scheduleCoordinator.ts` / `scheduleStore.ts` / `postgresScheduleStore.ts` — Scheduling infrastructure
  - `workflowEngine.ts` / `workflow.ts` — Workflow execution
  - `mailExecutionService.ts` — Mail execution with MailMyPDF
  - `eventLog.ts` / `persistentEventLog.ts` — Event logging
  - `webhookProcessor.ts` — Webhook processing
  - `trackingService.ts` — Delivery tracking
  - `businessCorrespondence.ts` / `contactCorrespondence.ts` / `correspondenceComposer.ts` — Correspondence services
  - `crmStore.ts` — CRM data store
  - `executionStore.ts` — Execution state
  - `activityTimeline.ts` — Activity timeline
- `src/integrations/` — 5 integration adapters:
  - `espocrm.ts` — EspoCRM API
  - `n8n.ts` — n8n webhook
  - `temporal.ts` — Temporal HTTP provider (interface, not deployed)
  - `trigger.ts` — Trigger.dev schedule adapter
  - `twenty.ts` — Twenty CRM API

**Agent architecture:**

```
User Goal
  → IntentPlanner (deterministic)
  → Capabilities (from registry)
  → proposedSteps
  → requiresApproval check
  → Policy check (agentPolicy)
  → Skill execution
  → Mail execution (via MailMyPDF)
  → Tracking
  → Proof
```

**Workflow model:**

- Triggers: invoice.overdue, document.received, schedule.due, mail.delivered, manual
- Conditions: equals, not_equals, greater_than, less_than, contains, days_since
- Actions: draft, create_mailing, schedule, request_approval, notify

### Security

- **Approval engine:** Mail execution gated behind approval (canExecuteMail checks requiresApproval + status)
- **Capability permissions:** Each capability declares required permissions
- **Agent policy:** Policy enforcement before execution
- **Rate limiting:** Not implemented
- **Audit logging:** Event log (eventLog.ts, persistentEventLog.ts)
- **Secrets:** Environment variables (TRIGGER_SECRET_KEY, MAILMYPDF_API_KEY)

### Quality

- **Tests:** None
- **Technical debt:** All dependencies pinned to "latest" (unstable), two MailMyPDF client implementations (mailmypdf-api.ts + mailmypdfClient.ts — duplicated), Temporal integration is an unused interface, no TypeScript build config (tsc -b)
- **Production risks:** Unstable dependencies, no tests, no CI, no document security

---

## 7. MailMyPDF Platform (mailmypdf-platform)

**Role:** Reusable technology platform (the subject of this build directive).

### Current State

See `PLATFORM_CURRENT_STATE.md` for full details. Summary:

- 7 packages, 183 total lines of TypeScript
- Type-only scaffolding — zero implementations
- No tests, no CI, no lock file, never built
- Good architectural documentation (README, ARCHITECTURE, ROADMAP)
- Build issues: no outDir, no per-package tsconfig extends, no exports map

---

## Cross-Cutting Observations

### Shared Patterns Across Repositories

1. **Mailing model duplication:** `MailingProvider` interface + `MailingOrderDraft` + `MailingStatus` + `MailMyPDFProvider` class is copy-pasted across Appeal Mail, Immigration Mail, Notice Respond, and Dispute Mail — all nearly identical with minor naming variations

2. **MailMyPDF API client duplication:** Each vertical has its own `platform/mailmypdf.ts` with the same structure: getConfig(), request(), uploadDocument(), createCommunication(), getCommunication()

3. **Status mapping duplication:** `mapStatus()` and `mapMailType()` functions are duplicated across all 4 verticals with identical logic

4. **Supabase client pattern:** `getSupabaseServer()` / `getSupabaseClient()` duplicated across Appeal Mail and Immigration Mail

5. **Document extraction approaches differ:**
   - MailMyPDF: no extraction (fulfillment only)
   - Appeal Mail: sophisticated pattern-matching engine (deterministic)
   - Immigration Mail: AI-based analysis with structured output
   - Small Business: AI skills (analyzeCorrespondence)
   - Notice Respond / Dispute Mail: none

6. **AI calling convention differs:**
   - MailMyPDF: `ai-workflow.ts` with VerticalAIConfig registry, `createVerticalAIWorkflow()`, direct Claude API calls with retries
   - Appeal Mail: server functions (xray-fn.ts, stress-test-fn.ts) — Claude calls not visible in platform layer
   - Immigration Mail: `api/analyze-document.ts` — separate endpoint
   - Small Business: skill-based with capability registry

7. **Domain model maturity varies dramatically:**
   - Appeal Mail: rich domain model (11 domain files, Zod-validated, provenance tracking, contradiction detection)
   - Immigration Mail: moderate (document analysis types, workflow definitions)
   - Small Business: moderate (workflow, CRM, approval, scheduling)
   - Notice Respond / Dispute Mail: minimal (mailing only)
   - MailMyPDF: mature fulfillment domain (MailJob state machine, proof-of-service, audit events)

8. **Proof model exists in two places:**
   - MailMyPDF: `ProofOfMailing` with hash-linked custody chain (production, tested)
   - Appeal Mail: `ProofPacket` with hash + tracking + delivery confirmation (simpler, untested)

9. **Timeline model exists in two places:**
   - Appeal Mail: `TimelineEvent` with 5 integrity statuses, 8 categories, date precision, source provenance
   - MailMyPDF: `CustodyChainEvent` (simpler, fulfillment-focused)

10. **Evidence model exists in one place:**
    - Appeal Mail only: `Evidence` with 6 types, `EvidenceLink` with 3 relationships, hash tracking

### Security Gaps Across Ecosystem

| Gap | Affected |
|---|---|
| No rate limiting on vertical APIs | Appeal, Immigration, Notice, Dispute, Small Business |
| No server-side PDF validation | Appeal, Immigration, Notice, Dispute, Small Business |
| No prompt injection defenses | All repos using AI |
| No audit logging on verticals | Appeal, Immigration, Notice, Dispute, Small Business |
| No CI on verticals | Appeal, Immigration, Notice, Dispute, Small Business |
| No tests on most verticals | Appeal, Notice, Dispute, Small Business |
| Unstable dependencies | Small Business (all "latest") |
| In-memory rate limiting (doesn't scale) | MailMyPDF |

### Architecture Maturity by Repository

| Repository | Maturity | Key Strengths | Key Gaps |
|---|---|---|---|
| MailMyPDF | Production | Mature domain model, proof-of-service, provider abstraction, 28 tests, CI | In-memory rate limiting, reverted production fixes |
| Appeal Mail | Beta | Richest domain model, X-Ray, Stress Test, Timeline, Evidence, Contradiction detection | Zero tests, no CI, no server-side PDF validation |
| Immigration Mail | Beta | Structured document analysis, AI integration, Supabase persistence | Minimal tests, copy-pasted patterns |
| Small Business | Alpha | Agent architecture, capability registry, approval engine, workflow engine | Zero tests, unstable deps, duplicated clients, no CI |
| Notice Respond | Scaffold | Mailing integration | No AI, no documents, no persistence, no tests |
| Dispute Mail | Scaffold | Mailing integration | No AI, no documents, no persistence, no tests |
| Platform | Scaffold | Good architectural docs | Zero implementation, never built, no tests |
