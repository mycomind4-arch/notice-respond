# Target Platform Architecture

**Date:** 2026-08-14

Package architecture for the MailMyPDF Platform, evaluated against the ecosystem audit.

---

## Package Families

### packages/core

- **Purpose:** Stable, dependency-light primitives shared across the entire platform.
- **Responsibilities:** Branded types, Result, typed errors, validation utilities, date/time utilities, configuration interfaces, logging interfaces, environment handling, confidence scoring, common domain type building blocks.
- **Public API:** `Brand<T,B>`, `PlatformId`, `createId()`, `Result<T,E>`, `ok()`, `err()`, `Confidence`, `confidence()`, `PlatformError` (typed error hierarchy), `validate()`, `ISODate` helpers, `Logger` interface, `Config` interface.
- **Dependencies:** None. Zero runtime dependencies.
- **Prohibited dependencies:** Everything.
- **Consumers:** Every other platform package, all verticals, small business.
- **Stability level:** Critical — breaking changes here break everything. Highest bar for changes.
- **Test strategy:** Unit tests for every function. 100% coverage target for utility functions.

### packages/documents

- **Purpose:** Reusable document abstraction with security boundaries.
- **Responsibilities:** Document lifecycle state machine, metadata model, provenance model, classification contract, security validation contract, extraction interface.
- **Public API:** `DocumentRecord`, `DocumentKind`, `DocumentStatus` (lifecycle), `DocumentProvenance`, `SourceRef`, `DocumentValidator` (interface), `DocumentExtractor` (interface), `validateDocument()`, `DocumentLifecycle` (state machine helpers).
- **Dependencies:** `@mailmypdf/core`
- **Prohibited dependencies:** Any UI framework, any AI provider, any storage provider, any database.
- **Consumers:** intelligence, ai, proof, all verticals.
- **Stability level:** High — documents are foundational.
- **Test strategy:** Unit tests for validation, state machine transitions, lifecycle. Property tests for MIME type validation. Security tests for malformed inputs.

### packages/intelligence

- **Purpose:** Reusable fact, evidence, contradiction, timeline, deadline, and finding primitives.
- **Responsibilities:** SourceRef model, provenance classification, fact model, evidence model, contradiction model, timeline model, deadline primitives, finding model.
- **Public API:** `SourceRef`, `ProvenanceType`, `Fact`, `FactStatus`, `Evidence`, `EvidenceRelation`, `EvidenceLink`, `Contradiction`, `ContradictionSeverity`, `TimelineEvent`, `EventStatus`, `EventCategory`, `Deadline`, `DeadlineRule`, `Finding`, `FindingType`, `FindingSeverity`, `Confidence`.
- **Dependencies:** `@mailmypdf/core`
- **Prohibited dependencies:** Any AI provider, any UI framework, any database, any external service.
- **Consumers:** ai (for AI output mapping), proof (for evidence chaining), all verticals, small business.
- **Stability level:** High — these are the domain building blocks.
- **Test strategy:** Unit tests for model construction, validation, status transitions. Property tests for contradiction detection interface. Schema validation tests.

### packages/ai

- **Purpose:** Standardized AI interface with structured output, validation, retries, and evaluation.
- **Responsibilities:** AI task contract, AI result contract, model routing interface, structured output validation, retry/fallback logic, evaluation framework, prompt registry interface, safety checks.
- **Public API:** `AiTask<I,O>`, `AiResult<O>`, `AiProvider` (interface), `ModelRouter` (interface), `AiValidator` (schema validation), `EvaluationFixture`, `EvaluationRunner`, `AiWarning`, `TokenUsage`.
- **Dependencies:** `@mailmypdf/core`, `@mailmypdf/intelligence` (for provenance on AI results)
- **Prohibited dependencies:** Any specific LLM SDK (Anthropic, OpenAI, etc.) — providers are injected. Any UI framework. Any database.
- **Consumers:** All verticals (for AI calls), small business (for skill evaluation).
- **Stability level:** Medium — AI contracts may evolve as the ecosystem matures.
- **Test strategy:** Unit tests for validation, retry logic, evaluation scoring. Mock provider tests. Evaluation regression tests with fixtures.

### packages/proof

- **Purpose:** Proof and audit event primitives.
- **Responsibilities:** Audit event model, proof artifact model, proof packet model, hash computation interface, verification interface.
- **Public API:** `AuditEvent`, `AuditEventType`, `AuditActor`, `ProofArtifact`, `ProofArtifactKind`, `ProofPacket`, `ProofPacketStatus`, `computeHash()` (interface), `verifyProof()` (interface).
- **Dependencies:** `@mailmypdf/core`
- **Prohibited dependencies:** Any UI framework, any database, any external service.
- **Consumers:** fulfillment (for proof integration), all verticals (for audit events), small business (for event logging).
- **Stability level:** High — proof integrity is critical.
- **Test strategy:** Unit tests for hash computation, packet construction, verification. Immutability tests. Tamper detection tests.

### packages/fulfillment

- **Purpose:** Clean adapter boundary to MailMyPDF fulfillment.
- **Responsibilities:** Fulfillment adapter interface, status normalization, idempotency contract, provider error types.
- **Public API:** `FulfillmentClient` (interface), `MailingRequest`, `MailingStatus`, `MailingStatusState`, `MailingClass`, `TrackingInfo`, `MailingIdempotencyKey`, `FulfillmentError`, `normalizeStatus()`, `mapMailingClass()`.
- **Dependencies:** `@mailmypdf/core`, `@mailmypdf/proof` (for proof packet retrieval)
- **Prohibited dependencies:** Any specific HTTP client (fetch is used directly). Any MailMyPDF-specific types leaked into the interface.
- **Consumers:** All verticals, small business.
- **Stability level:** High — verticals depend on this for mail submission.
- **Test strategy:** Unit tests for status normalization, idempotency key generation, error mapping. Contract tests against the interface. Mock MailMyPDF API tests.

### packages/design-system

- **Purpose:** MailMyPDF family design tokens.
- **Responsibilities:** Color tokens, typography scale, spacing, radius, shadows, borders, status colors, z-index, responsive breakpoints, semantic token mapping.
- **Public API:** `mailMyPdfTokens` (complete token set), `StatusColors`, `TypographyScale`, `SpacingScale`, `SemanticTokens`.
- **Dependencies:** None.
- **Prohibited dependencies:** React, any UI framework, any CSS-in-JS library.
- **Consumers:** All verticals, small business, MailMyPDF (optional).
- **Stability level:** Medium — design tokens evolve with the brand.
- **Test strategy:** Token consistency tests (all required tokens present), contrast ratio tests for status colors, token format validation.

---

## Packages NOT Created in v0.1

### packages/workflows

- **Status:** Deferred to v0.2.
- **Rationale:** Small Business has the only executable workflow engine. The platform should define the contract, but the directive says "only after the previous primitives are stable." No other vertical has a workflow engine to extract from.

### packages/agents

- **Status:** Deferred. Do not implement until platform primitives are ready (directive Phase 22).
- **Rationale:** Small Business has experimental agent infrastructure. Premature extraction risks building the wrong abstraction.

### packages/connectors

- **Status:** Deferred.
- **Rationale:** MailMyPDF's provider interfaces (Mail, Payment, Notification, Storage) are application-level, not platform. Small Business's CRM connectors are domain-specific. No connector justifies platform extraction yet.

### packages/ui

- **Status:** Deferred to v0.3+.
- **Rationale:** Reusable UI components depend on the domain models they render being stable first. Appeal's X-Ray, Timeline, and Stress Test views are candidates, but only after the intelligence package is production-grade.

---

## Dependency Graph (v0.1)

```
core          ← (no dependencies)
documents     ← core
intelligence  ← core
ai            ← core, intelligence
proof         ← core
fulfillment   ← core, proof
design-system ← (no dependencies)
```

No circular dependencies. No inter-package dependencies beyond what's shown. The graph is a DAG with core as the root.
