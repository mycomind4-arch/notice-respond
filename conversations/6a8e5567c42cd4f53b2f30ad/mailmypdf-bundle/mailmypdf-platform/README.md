# MailMyPDF Platform

Reusable technology and infrastructure for the MailMyPDF product family.

## Mission

MailMyPDF Platform is the shared technical layer beneath MailMyPDF and its specialized verticals. It provides reusable primitives for document intelligence, evidence, timelines, AI orchestration, workflows, proof, fulfillment integration, UI, voice, security, and ecosystem commerce contracts.

The platform is **not a vertical application** and is not a dumping ground for domain-specific logic.

## Ecosystem account model

**MailMyPDF is the canonical account and identity layer for the entire ecosystem.** A user creates one MailMyPDF account and can access every enabled vertical with that identity.

- Basic Mail a PDF without a printer may remain anonymous.
- Rich AI, voice, research, document-intelligence, evidence, and specialized workflows require a MailMyPDF account.
- Free accounts receive limited workflow usage.
- Paid platform plans increase platform usage.
- Physical mailing is always a separate transactional charge.
- Verticals never create competing ecosystem accounts or billing tiers.
- Vertical application data remains isolated even though identity is centralized.

## Platform architecture

- **MailMyPDF:** canonical identity, accounts/organizations, billing, fulfillment, payments, mailing, tracking, and proof infrastructure.
- **MailMyPDF Platform:** reusable technology, contracts, agent runtime boundaries, QA primitives, and ecosystem architecture.
- **Verticals:** specialized domain intelligence, workflows, persistence, and user experiences.
- **Vertical Foundry:** researches opportunities, compiles specifications, dispatches specialized agents, evaluates quality, and hands approved builds to factory/deployment adapters.

## Vertical Foundry lifecycle

```text
RESEARCH → SELECT → SPECIFY → BUILD → QA → RED TEAM → VERIFY → DEPLOY → REGISTER
```

The Foundry is designed so that every generated vertical inherits the shared ecosystem identity, entitlement, usage, AI, document, evidence, voice, proof, and mailing contracts. Consequential actions such as production deployment, publishing, billing, account changes, access grants, deletion, and physical mailing remain explicitly gated by application policy/human approval.

The Foundry currently provides provider-neutral boundaries for:

- specialized agent/model routing
- deterministic stage planning
- research-to-spec compilation
- independent QA evaluation
- vertical repository/build creation
- Cloudflare Pages preview deployment
- ecosystem registration
- end-to-end stage orchestration

Provider credentials and production mutation authority remain outside the Foundry contracts.

## Development rules

- Prefer reusable primitives over duplicated implementations.
- Keep domain-specific rules in verticals unless demonstrably reusable.
- AI outputs must be structured, validated, provenance-aware, and reviewable.
- Uploaded documents are untrusted input.
- Consequential side effects require explicit authorization.
- Provider runtimes must not receive direct persistence/database access.
- Keep Python/ML/realtime runtimes behind explicit service boundaries rather than forcing them into Cloudflare Workers.
- Every shared capability should have tests and fixtures before broad consumption.
- Do not create vertical-specific identity or billing systems when the capability belongs to the MailMyPDF ecosystem.
- The original MailMyPDF repository remains outside autonomous vertical deployment/migration.
