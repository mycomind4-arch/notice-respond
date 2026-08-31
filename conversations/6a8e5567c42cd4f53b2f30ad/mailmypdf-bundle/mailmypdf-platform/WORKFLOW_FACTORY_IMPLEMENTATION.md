# MailMyPDF Workflow Factory — Implementation Contract

**Status: LOCKED / BUILDING**

The ecosystem is implemented as a factory, not as one bespoke pipeline per workflow.

## Architecture

`Pipeline Archetype + Domain Adapter(s) + Shared Capabilities + Workflow Manifest + Fixtures = Executable Workflow`

## Pipeline archetypes

P01 Core Mail / Correspondence
P02 Notice / Official Response
P03 Appeal / Reconsideration
P04 Court / Formal Proceeding
P05 Immigration Evidence / Response
P06 Dispute / Investigation
P07 Business Automation
P08 Records / Information Request
P09 Regulatory / Permit / Rights Response
P10 Claim / Proof / Evidence Package

## Domain adapters

Government, Tax, Insurance, Healthcare, Benefits, Education, Credit/Debt, Consumer Billing, Immigration, Housing, DMV/Licensing, Permits/Regulatory, Court Procedure, Records, Small Business.

## Build order

1. Platform capabilities and shared engines.
2. Pipeline registry and executable composition contract.
3. Adapter registry and compatibility matrix.
4. Workflow manifest and maturity registry.
5. Gold-standard fixture/test factory.
6. P02 Notice / Official Response reference implementation.
7. P03 Appeal / Reconsideration reference implementation.
8. P06 Dispute / Investigation reference implementation.
9. Remaining pipeline archetypes.
10. Domain adapters.
11. Workflow manifests for every current workflow.
12. Gold certification of every workflow.
13. Gateway route graph and placeholder coverage.
14. Deployment and live-path verification.

## Maturity states

`catalog -> placeholder -> wired -> executable -> gold -> production-verified`

No workflow may skip directly to `gold` or `production-verified` without executable capability evidence and deterministic tests.

## Non-negotiable rules

- Do not duplicate shared platform engines inside vertical repos.
- Do not create a new pipeline when an existing archetype fits.
- A workflow may compose secondary pipeline modules when a domain requires it.
- Consequential action always requires explicit human review and authorization.
- AI output is untrusted until grounded and validated.
- Unknown and missing evidence remain explicit states.
- Mailing success must reflect real provider state.
- Proof and audit state must be durable.
- SEO and route completion are independent from execution maturity.
