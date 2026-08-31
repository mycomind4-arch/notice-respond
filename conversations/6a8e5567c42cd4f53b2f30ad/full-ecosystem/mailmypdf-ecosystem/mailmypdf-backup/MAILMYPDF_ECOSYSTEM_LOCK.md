# MailMyPDF Ecosystem Lock — Canonical Architecture

**Status: LOCKED**
**Canonical public host:** `https://mailmypdf.ai`
**Cross-repo source of truth:** `mailmypdf-platform`

This backup repository is archival and must preserve the same locked architecture reference as the active ecosystem.

## Frozen decisions

- One public ecosystem: `mailmypdf.ai`
- Gateway / Router fronts all public product routes.
- One global MailMyPDF navigation shell across products.
- One conceptual MailMyPDF Account across products.
- Mailing history is authenticated-only.
- Platform-authorized admin access is server-side and role-based.
- One ecosystem sitemap at `mailmypdf.ai/sitemap.xml`.
- `pages.dev` / `workers.dev` hosts are non-canonical deployment infrastructure or migration references.
- Future routes remain stable through gateway placeholders until connected to their implementation repo.

## 10 locked pipeline archetypes

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

## Mapping principle

Each workflow selects a primary pipeline plus domain adapters and optional specialist modules. Do not invent a bespoke pipeline when one of the ten archetypes fits.

All executable workflows ultimately satisfy the Gold Standard execution contract:

`SECURE INGEST -> CLASSIFY -> EXTRACT -> UNDERSTAND -> FACTS + PROVENANCE -> TIMELINE / DEADLINES -> ISSUES / DISCREPANCIES -> EVIDENCE -> AUTHORITY / RESEARCH WHEN REQUIRED -> STRENGTH / RISK -> STRATEGY -> DRAFT -> VALIDATE -> BLOCKING GATES -> HUMAN REVIEW -> AUTHORIZED MAIL -> TRACK -> PROVE / AUDIT`

The active platform repository contains the authoritative full contract and workflow manifest.

## Anti-fragmentation

Do not introduce a competing global navigation, identity model, SEO architecture, public domain, sitemap strategy or pipeline taxonomy.
