# Reuse Matrix

**Date:** 2026-08-14

Cross-repository capability comparison to identify platform extraction candidates.

Legend:
- **A** — Existing best implementation (canonical)
- **B** — Duplicated implementation (same logic, copy-pasted)
- **C** — Partially reusable (similar concept, different implementation)
- **D** — Vertical-specific (not reusable)
- **E** — Platform candidate (should be extracted)
- **F** — Do not extract

---

## Capability Matrix

| Capability | MailMyPDF | Appeal | Immigration | Notice | Dispute | Small Business | Platform | Classification |
|---|---|---|---|---|---|---|---|---|
| **Authentication** | Supabase Auth (mature) | Supabase Auth | Supabase Auth | Route only | Route only | None | — | A, F |
| **Users** | user.functions.ts + profiles | Supabase users | Supabase users | None | None | None | — | A (MailMyPDF), F |
| **Organizations** | Organization model | None | None | None | None | businessId scoping | — | D, F |
| **Permissions** | Admin role checks | Auth-guarded routes | Auth-guarded routes | None | None | Capability permissions + approval roles | — | C, E (capability model) |
| **Documents** | Document (SHA-256, storage, source, pages) | Via extraction | DocumentAnalysis types | None | None | documentId refs only | DocumentRecord (thin) | E |
| **File upload** | Supabase Storage + pdf-validation.server.ts | Via MailMyPDF API | Supabase Storage | None | None | None | None | A (MailMyPDF), E (validation contract) |
| **Document extraction** | None (fulfillment only) | Pattern-matching engine (deterministic) | AI-based analysis | None | None | AI skill | None | C, E (contract is platform, impl is vertical) |
| **PDF generation** | pdf-lib | None | None | None | None | None | None | A, F |
| **OCR** | Not implemented | Not implemented | Not implemented | None | None | None | None | F (premature) |
| **AI calls** | ai-workflow.ts (Claude, retries, timeouts, config registry) | Server functions | api/analyze-document.ts | None | None | Skill-based | AiTask/AiProvider (thin) | E |
| **Structured AI** | JSON.parse with try/catch | Zod-validated domain models | DocumentAnalysis type | None | None | Capability output schemas | AiResult (thin) | E |
| **Prompt management** | VerticalAIConfig (system prompts per vertical) | Implicit in server fns | Implicit in API | None | None | Implicit in skills | None | E (registry is platform, prompts are vertical) |
| **Provenance** | CustodyChainEvent (hash-linked) | SourceRef + DecisionFact.source (3-level) | FactSource (4-level) | None | None | None | DocumentProvenance (thin) | E |
| **Facts** | None | DecisionFact (label, value, source, confidence) | ExtractedDate (label, value, source, confidence) | None | None | None | Fact (subject, predicate, value, confidence, sources) | E |
| **Evidence** | None | Evidence (6 types, EvidenceLink 3 relationships, hash, exhibit) | None | None | None | None | EvidenceLink (thin) | E (Appeal is canonical) |
| **Contradictions** | None | Contradiction schema + detectContradictions() | None | None | None | None | None | E (Appeal is only impl) |
| **Timeline** | CustodyChainEvent (fulfillment) | TimelineEvent (5 statuses, 8 categories, datePrecision, provenance) | ExtractedDate[] (flat) | None | None | activityTimeline.ts (simple) | TimelineEvent (thin) | E (Appeal is canonical) |
| **Deadlines** | LegalReference.responseWindowDays | Deadline (date, type, source, daysRemaining, appealInstructions) | RequestedAction.deadline | None | None | None | None | E (Appeal is richest) |
| **Notifications** | Resend adapter | None | None | None | None | None | None | A, F |
| **Workflows** | VerticalWorkflowState (15 states, static) | AppealStatus (6 states, static) | Workflow defs (3) | Workflow defs (4) | Workflow defs (4) | WorkflowEngine (triggers, conditions, actions) | None | C (SB has only executable engine) |
| **Scheduling** | Internal cron API routes | None | None | None | None | ScheduleEngine + postgres + Trigger.dev | None | A (MailMyPDF), D (SB) |
| **Approvals** | None | None | None | None | None | ApprovalEngine (pending/approved/rejected/cancelled) | None | E (SB is only impl) |
| **Mail creation** | MailService + Lob adapter | MailMyPDFProvider | MailMyPDFProvider (identical) | MailMyPDFProvider (identical) | MailMyPDFProvider (identical) | MailMyPDFClient (×2) | MailMyPdfFulfillmentClient (thin) | E (4× copy-pasted providers prove this) |
| **Mailing** | Lob (canonical) | Via MailMyPDF | Via MailMyPDF | Via MailMyPDF | Via MailMyPDF | Via MailMyPDF | None | A, F |
| **Tracking** | TrackingService (Lob webhooks) | None | None | None | None | trackingService.ts | None | A, F |
| **Proof** | ProofOfMailing (hash-linked custody chain, bundle SHA-256) | ProofPacket (hashes, tracking, delivery, sealed) | None | None | None | None | ProofPacket + AuditEvent (thin) | E |
| **Audit events** | AuditEvent (19 types, 7 actors, immutable) | Timeline events w/ provenance | None | None | None | eventLog + persistentEventLog | AuditEvent (4 actors, thin) | E (MailMyPDF is canonical) |
| **Payments** | Stripe (checkout, refunds, subscriptions, webhooks) | Stripe (checkout, webhook) | Stripe (checkout) | Stripe (checkout) | Stripe (checkout) | None | None | A, F |
| **Design system** | Tailwind 4 + shadcn/ui (50+ components) | Tailwind 4 + premium custom | Tailwind 4 + custom | Tailwind 4 + custom | Tailwind 4 + custom | Custom CSS | mailMyPdfTokens (minimal) | E (tokens are platform, components selective) |
| **Reusable UI** | 50+ shadcn/ui | X-Ray view, Stress Test view, Timeline view, Workflow wizard | None | Workflow shell | None | CommandCenter.tsx | None | C (Appeal's feature components most reusable) |
| **Agent capabilities** | VerticalAIConfig registry | None | None | None | None | Capability registry + intent planner + skills + policy | None | C, F for v0.1 (premature) |
| **Connectors** | Lob, Stripe, Resend, Supabase Storage (provider interfaces) | MailMyPDF API | MailMyPDF API | MailMyPDF API | MailMyPDF API | EspoCRM, Twenty, Trigger.dev, Temporal, n8n | None | C (MailMyPDF pattern is best; SB connectors are domain-specific) |
| **Status mapping** | mapLobStatusToOrderStatus | mapStatus() | mapStatus() (identical) | mapStatus() (identical) | mapStatus() (identical) | mapStatus() | None | E (4× duplicated, trivial to extract) |

---

## Extraction Recommendations

### Extract to Platform (E)

1. **Document model** — Unify MailMyPDF's Document + Platform's DocumentRecord into a canonical model with lifecycle states, security validation contract, and provenance.

2. **Provenance model** — Unify Appeal's SourceRef + 3-level source + Immigration's 4-level source into: USER_PROVIDED, EXTRACTED, INFERRED, VERIFIED, AI_SUGGESTED, EXTERNAL_SOURCE.

3. **Fact model** — Enhance platform's Fact with status, timestamps, conflicting values based on Appeal/Immigration patterns.

4. **Evidence model** — Extract Appeal's Evidence + EvidenceLink as canonical. Generalize types to be extensible.

5. **Contradiction model** — Extract Appeal's Contradiction + detectContradictions() pattern. Platform provides model + interface; verticals provide comparison logic.

6. **Timeline model** — Extract Appeal's TimelineEvent (5 integrity statuses, 8 categories, date precision, provenance) as canonical. Categories extensible.

7. **Deadline model** — Extract Appeal's Deadline as platform primitives. Separate date extraction from rule evaluation from calculation.

8. **Finding model** — Extract Appeal's XRay finding types. Extensible taxonomy.

9. **AI contract** — Unify MailMyPDF's AIWorkflow + Platform's AiTask into: task ID, input schema, model, structured output, schema validation, retries, confidence, provenance, token/cost, warnings.

10. **Fulfillment adapter** — Extract the 4 identical MailMyPDFProvider implementations into a platform adapter interface.

11. **Proof model** — Unify MailMyPDF's ProofOfMailing + Appeal's ProofPacket.

12. **Audit event model** — Extract MailMyPDF's AuditEvent (19 types, 7 actors) as canonical. Extensible taxonomy.

13. **Approval model** — Extract Small Business's ApprovalEngine as a platform primitive.

14. **Design tokens** — Expand into complete design foundation.

15. **Status mapping** — Extract the 4 duplicated mapStatus() functions.

### Do NOT Extract (F)

1. Authentication — Application infrastructure
2. Payment processing (Stripe) — MailMyPDF canonical
3. Mailing provider (Lob) — MailMyPDF canonical
4. Notifications (Resend) — MailMyPDF infrastructure
5. PDF generation (pdf-lib) — Fulfillment-specific
6. OCR — Not implemented anywhere
7. Agent runtime — Premature per directive
8. External schedulers (Temporal, Trigger.dev, n8n) — SB-specific
9. CRM integrations (EspoCRM, Twenty) — SB-specific
10. Vertical-specific domain logic — Stays in verticals

### Partially Reusable (C) — Evaluate Later

1. **Workflow engine** — Platform defines contract; execution stays vertical or in MailMyPDF
2. **Intent planning** — SB's pattern is interesting but premature
3. **Reusable UI components** — After platform domain models are stable
