# MailMyPDF Gold-Standard Workflow Contract

## Purpose

This is the completion contract for every executable workflow in the MailMyPDF ecosystem. A workflow is not gold-standard because its landing page or UI is polished. It is gold-standard only when a real case can move through a traceable, validated, secure, human-reviewable path from source documents to authorized fulfillment and proof.

## Canonical pipeline

```text
SECURE INGEST
  -> CLASSIFY
  -> EXTRACT
  -> UNDERSTAND
  -> NORMALIZE FACTS + PROVENANCE
  -> TIMELINE / DEADLINES
  -> FIND ISSUES / DISCREPANCIES
  -> ORGANIZE EVIDENCE
  -> AUTHORITY / RESEARCH (when domain requires it)
  -> ASSESS STRENGTH / RISK
  -> STRATEGY
  -> DRAFT
  -> VALIDATE
  -> BLOCKING GATES
  -> HUMAN REVIEW
  -> AUTHORIZED MAIL
  -> TRACK
  -> PROVE / AUDIT
```

## Required capabilities

Every executable workflow must provide, directly or through approved shared platform capabilities:

1. Secure document intake and authorization.
2. Domain-aware classification.
3. Structured extraction from the actual source material.
4. Source provenance for material facts and findings.
5. Normalized case facts with explicit uncertainty.
6. Timeline and deadline handling where applicable.
7. Domain-specific issue, discrepancy, or requirement detection.
8. Evidence organization, sufficiency analysis, and traceability.
9. Authority/research grounding where the domain requires external rules or authorities.
10. Strength/risk assessment that distinguishes supported conclusions from uncertainty.
11. Case-specific strategy rather than generic advice.
12. Grounded document drafting.
13. Draft and case validation.
14. Blocking gates for unresolved critical requirements.
15. Human review before consequential action.
16. Authorized MailMyPDF fulfillment integration.
17. Real mailing/tracking state; never simulated success.
18. Durable proof/audit information using the ecosystem's approved infrastructure.
19. Tenant isolation, authorization, security, and audit controls.
20. Deterministic fixtures and regression tests covering the workflow contract.

## Grounding rules

- Never invent facts, evidence, dates, authorities, deadlines, recipients, or mailing outcomes.
- AI output is untrusted until validated against structured case data and source evidence.
- Every material finding should be traceable to one or more source documents or an explicitly identified authoritative source.
- Unknown is a valid state. Missing evidence must remain missing rather than being inferred into existence.
- A workflow must block or warn when a critical requirement cannot be satisfied safely.

## Executable vs catalog

A workflow catalog may contain the complete product universe. Catalog presence does not imply execution capability.

A workflow may enter the executable registry only when its declared capabilities have real implementations and the workflow's parity tests pass. Placeholder pages, generic LLM prompts, simulated results, or UI-only flows are not executable implementations.

## Domain adapter architecture

Verticals own domain intelligence. The platform owns reusable infrastructure.

```text
MailMyPDF Platform
  - documents
  - extraction contracts
  - provenance
  - evidence
  - contradictions
  - timelines
  - deadlines
  - risk
  - validation
  - security
  - audit
  - fulfillment/tracking/proof contracts

        +

Vertical domain adapter
  - domain classification
  - domain facts
  - domain rules/authority
  - domain issue detection
  - domain strategy
  - domain drafting requirements

        =

Executable workflow
```

Do not duplicate shared engines inside verticals unless the capability is genuinely domain-specific.

## Gold-standard test gate

A workflow is not complete until tests demonstrate:

- representative source-document ingestion
- extraction and normalization
- provenance
- domain findings
- evidence linkage
- timeline/deadline behavior where applicable
- strategy grounding
- draft grounding
- validation failures are caught
- critical unresolved requirements block appropriately
- authorization/security boundaries hold
- mailing success/failure paths are honest
- tracking/proof state is represented correctly
- regression behavior remains intact

## Reference standard

Notice Respond is the reference implementation for workflow depth and quality. Parity means equivalent completeness of the pipeline, not identical domain logic or UI.

## Definition of done

A workflow can be called **Gold Standard / Executable** only when all required capabilities are implemented, integrated, tested, and verified in the deployed product path. If a capability is unavailable, the workflow remains incomplete regardless of visual quality.
