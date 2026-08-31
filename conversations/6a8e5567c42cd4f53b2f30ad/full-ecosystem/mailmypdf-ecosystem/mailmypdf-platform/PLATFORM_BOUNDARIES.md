# Platform Boundaries

**Date:** 2026-08-16

Explicit definition of what belongs where in the MailMyPDF ecosystem.

---

## The Four Layers

### 1. MailMyPDF Application (mailmypdf repo)

**Owns:** Canonical ecosystem identity, account/organization management, billing, fulfillment, mailing, tracking, and proof-of-service infrastructure.

**What belongs here:**
- MailMyPDF account authentication and sessions
- Organization identity and membership
- Ecosystem entitlement and platform-usage billing implementation
- Stripe checkout, subscriptions, usage purchases, refunds, and webhooks
- Physical mail provider integration (Lob adapter)
- Mailing checkout and transactional mailing charges
- Email notifications (Resend)
- PDF generation (pdf-lib)
- File storage (Supabase Storage adapter)
- Document upload API (`/v1/documents`)
- Communications API (`/v1/communications`)
- Tracking webhook handling (Lob webhooks)
- Proof-of-service custody chain and bundle generation
- Mail job state machine
- Address verification
- Rate limiting at the API gateway level
- Admin dashboard and analytics
- SEO landing pages and marketing site
- Vertical product modules (appeal-reply, benefits-appeal, etc.) — these are MailMyPDF's own product implementations, NOT the same as standalone vertical apps

**What does NOT belong here:**
- Reusable domain primitives (facts, evidence, timeline, deadlines) — that's the platform
- AI calling contracts — that's the platform
- Design tokens — that's the platform
- Vertical-specific domain logic — that belongs in the vertical repository

### 2. MailMyPDF Platform (mailmypdf-platform repo)

**Owns:** Reusable technology primitives and stable ecosystem contracts that multiple verticals consume.

**What belongs here:**

**Core primitives:**
- Branded types (PlatformId, Confidence)
- Result type (ok/err)
- Typed errors
- Validation utilities
- Date/time utilities
- Configuration interfaces
- Logging interfaces
- Environment handling
- Common domain type building blocks

**Document model:**
- Document lifecycle (UPLOADED → VALIDATING → PROCESSING → EXTRACTED → ANALYZED → READY → FAILED)
- Document metadata (filename, MIME type, size, hash, pages)
- Document provenance
- Document classification contract
- Security validation contract (max size, MIME types, forbidden content)
- Extraction interface (verticals implement the actual extraction)

**Intelligence primitives:**
- SourceRef model (document → page → locator)
- Provenance classification (USER_PROVIDED, EXTRACTED, INFERRED, VERIFIED, AI_SUGGESTED, EXTERNAL_SOURCE)
- Fact model (subject, predicate, value, source, confidence, provenance, status, timestamps, conflicting values)
- Evidence model (claim, supporting, contradicting, missing, source, relevance, confidence, provenance)
- Contradiction model (statement A vs statement B, sources, confidence, comparison method, severity, review status)
- Timeline model (event, date/time, type, description, source, provenance, confidence, status, date precision)
- Deadline primitives (event + rule = deadline, separated: date extraction / rule evaluation / calculation)
- Finding model (type, severity, confidence, title, explanation, source, evidence, recommended action)

**AI platform:**
- AI task contract (task ID, input schema, model, structured output, validation, retries, fallback)
- AI result contract (output, confidence, model, sources, warnings, token/cost metadata, provenance)
- Model routing interface (task → model selection based on accuracy/latency/cost/context)
- Evaluation framework (input → task → expected → actual → comparison → score → regression detection)

**Proof and audit:**
- Audit event model (timestamped, attributable, structured, queryable, immutable)
- Proof artifact model (artifact, hash, version, kind)
- Proof packet model (artifacts + events + subject + timestamp)

**Fulfillment boundary:**
- Fulfillment adapter interface (createMailing, getMailing, cancelMailing, getTracking, getProof)
- Status normalization utility (mapStatus)
- Idempotency contract
- Provider error types

**Ecosystem account and monetization contracts:**
- Canonical MailMyPDF identity contract
- Account/organization identity references
- Vertical registration contract
- Rich-workflow account requirement
- Anonymous basic-mailing boundary
- Workflow usage as the user-facing usage unit
- Free/paid entitlement contract
- Platform-usage charge contract
- Separate physical-mailing charge contract
- Ecosystem commerce invariants enforced by generated vertical architecture

**Advanced runtimes:**
- Provider-neutral document intelligence boundary
- Realtime voice and voice-client boundaries
- AI tool contracts and approval boundaries
- Capability/agent orchestration contracts as they become stable and reusable

**Design:**
- Design tokens (color, typography, spacing, radius, shadows, borders, status, z-index, breakpoints)
- Reusable UI component contracts (not implementations — verticals own their React components)

**What does NOT belong here:**
- Lob, Stripe, Resend, or Supabase SDK integrations
- Authentication implementation
- Payment processing implementation
- PDF generation
- Vertical-specific domain logic (appeal grounds, immigration document types, notice workflows)
- Vertical application databases
- External schedulers (Temporal, Trigger.dev, n8n)
- CRM integrations
- Vertical API routes or server functions

### 3. Vertical Applications (appeal-mail, immigration-mail, notice-respond, dispute-mail)

**Own:** Domain-specific intelligence, user experiences, and workflow definitions while consuming the shared MailMyPDF ecosystem identity and commerce contracts.

**What belongs here:**
- Domain schemas (appeal grounds, immigration document types, dispute categories, notice types)
- Domain-specific document types and classifications
- Domain-specific finding types
- Domain-specific workflow definitions
- Domain-specific AI prompts and skills
- Domain-specific extraction logic (pattern matching, AI prompts)
- Domain-specific deadline rules
- Domain-specific UI components and pages
- Domain-specific API routes
- Domain-specific persistence and database schema
- Domain-specific permissions and authorization rules
- Consumption of MailMyPDF identity/session context
- Consumption of shared platform usage/entitlement contracts
- MailMyPDF fulfillment integration through the platform boundary

**What does NOT belong here:**
- Generic document model (use platform)
- Generic fact/evidence/timeline/finding models (use platform)
- AI calling infrastructure (use platform)
- MailMyPDF API client implementation (use platform adapter)
- Status mapping logic (use platform utility)
- Design tokens (use platform)
- Competing user authentication systems
- Competing account systems
- Competing ecosystem-wide billing tiers

### 4. MailMyPDF Small Business (mailmypdf-smallbusiness)

**Owns:** Business-specific automation, CRM integration, and workflow execution.

**What belongs here:**
- Business correspondence workspace
- CRM integrations (EspoCRM, Twenty)
- Business workflow engine (Trigger.dev, scheduling)
- Business-specific agent skills
- Business-specific intent planning
- Business-specific schedule coordination
- Business CRM data store
- Command Center UI

**What should consume from platform:**
- Document model
- Fact/evidence/timeline/finding models
- AI contract
- Fulfillment adapter
- Proof/audit event model
- Account/entitlement contracts
- Design tokens

---

## Boundary Rules

1. **MailMyPDF is the canonical identity provider.** Every ecosystem vertical uses the same MailMyPDF account identity. No vertical creates a competing user/password system for ordinary ecosystem users.

2. **MailMyPDF owns authentication implementation.** The platform defines the provider-neutral contract; MailMyPDF implements identity, sessions, organizations, and account lifecycle.

3. **Rich workflows require a MailMyPDF account.** AI-rich, research-heavy, voice, evidence, agentic, and specialized vertical workflows cannot be anonymous.

4. **Basic MailMyPDF mailing may remain anonymous.** The simple upload/address/pay/send utility is intentionally the low-friction exception.

5. **Platform usage and mailing are separate monetization axes.** Increased AI/platform usage is paid through platform entitlements; physical mailing remains a separate transaction.

6. **A workflow is the default usage unit.** Internal model calls, OCR calls, retries, and tool calls must not silently multiply user-facing workflow consumption.

7. **Verticals import from the platform, not from each other.** If Appeal Mail and Immigration Mail need the same thing, it goes in the platform.

8. **The platform never imports from a vertical.** Dependencies flow from shared platform contracts into verticals.

9. **The platform never imports provider implementations from MailMyPDF.** It defines contracts; MailMyPDF owns implementations of authentication, billing, fulfillment, and external providers.

10. **Domain-specific logic never goes in the platform.** Appeal grounds, immigration document types, dispute categories, notice workflows, and similar domain rules stay in their verticals.

11. **AI prompts are vertical-specific.** The platform provides AI calling and evaluation contracts; verticals provide domain prompts and skills.

12. **The platform is framework-agnostic.** No React, no TanStack, no Vite in platform packages. Pure TypeScript contracts and reusable primitives.

13. **The platform does not own a database.** It defines contracts and models; MailMyPDF and verticals own their persistence.

14. **A capability must be useful to at least 2 verticals or be foundational infrastructure to justify platform inclusion.**

15. **Central identity does not mean shared application data.** Each vertical retains domain-data isolation and tenant isolation.

16. **The vertical factory must inherit these rules automatically.** Generated verticals must start with ecosystem identity, entitlement, usage, and mailing contracts rather than recreating them.

17. **The platform prioritizes stability over features.** Once a package is consumed by a production vertical, breaking changes require migration notes and regression coverage.

---

## Dependency Flow

```text
                        MAILMYPDF
              identity + billing + fulfillment
                           │
                           │ implements contracts
                           ▼
                    ┌─────────────┐
                    │  Platform   │
                    │ primitives  │
                    │ + contracts │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌──────────┐    ┌──────────┐    ┌──────────────┐
   │ Appeal   │    │ Notice   │    │ Code/other   │
   │ Mail     │    │ Respond  │    │ verticals    │
   └──────────┘    └──────────┘    └──────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                  domain data remains
                    isolated per app
```

MailMyPDF is the ecosystem identity and commerce authority. The Platform is the reusable technology and contract layer. Verticals are isolated domain applications that compose the platform and inherit the ecosystem account/usage/mailing model.
