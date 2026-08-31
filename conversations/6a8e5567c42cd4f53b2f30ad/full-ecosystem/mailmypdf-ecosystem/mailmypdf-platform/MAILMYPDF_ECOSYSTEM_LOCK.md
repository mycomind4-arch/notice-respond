# MailMyPDF Ecosystem Lock — Canonical Architecture

**Status: LOCKED**
**Canonical public host:** `https://mailmypdf.ai`
**Canonical source of cross-repo truth:** `mailmypdf-platform`

This file is a cross-repository architecture contract. Product-specific implementation may evolve, but teams/agents MUST NOT invent competing global navigation, authentication, SEO, routing, or pipeline architectures.

## 1. Public Architecture

```text
mailmypdf.ai
    |
 Gateway / Router
    |
 +-------------------+-------------------+
 |                   |                   |
Core App        Vertical Apps        Platform APIs
mailmypdf       appeal-mail          mailmypdf-platform
                notice-respond
                immigration-mail
                dispute-mail
                mailmypdf-smallbusiness
```

Repositories remain separate for development and deployment. The public product is one ecosystem.

Legacy `pages.dev` / `workers.dev` hosts are deployment infrastructure or migration references, never the long-term public brand.

## 2. Global Navigation — LOCKED

Every public product uses the shared MailMyPDF global shell:

`MailMyPDF` · `Products` · `How It Works` · `Resources` · `Pricing` · `Account` · `Start Mailing`

Anonymous account state: `Sign In`
Authenticated customer state: `Dashboard` · `Mailing History` · `Account`
Platform-authorized admin state: `Admin`

Verticals may add a product-specific secondary navigation, but MUST NOT replace or fork the global shell.

## 3. Identity / Authentication — LOCKED

There is one conceptual identity: **MailMyPDF Account**.

Rules:
- One customer identity across the ecosystem.
- Mailing history requires authentication.
- Guest order lookup is a narrow recovery feature, not general history.
- Admin access is determined by server-side platform authorization; browser metadata alone is never sufficient.
- Login, logout, recovery, session handling, and account UX follow the platform contract.
- Product repos consume the shared identity contract; they must not invent incompatible account models.

## 4. SEO / Canonical URL Strategy — LOCKED

All public SEO value consolidates under `mailmypdf.ai`.

Core:
- `/`
- `/send`
- `/write`
- `/templates`
- `/ecosystem`
- `/how-it-works`
- `/resources`
- `/pricing`

Product families:
- `/appeal/*`
- `/notice/*`
- `/immigration/*`
- `/dispute/*`
- `/business/*`
- `/records/*`
- `/tenant/*`
- `/permit/*`
- `/benefits/*`
- `/claim/*`
- `/govreply/*`
- `/future/*`

Every public URL uses a canonical `mailmypdf.ai` URL. Product repos do not publish alternate Pages hostnames as SEO canonicals.

Prelaunch indexing remains disabled until the owner's launch switch is enabled. Placeholder routes may exist and be internally linkable before launch.

The ecosystem has one sitemap authority at `mailmypdf.ai/sitemap.xml`; vertical route inventories feed it.

## 5. Gateway / Placeholder Rules — LOCKED

Gateway precedence:
1. Exact implemented route.
2. Connected vertical route.
3. Stable placeholder route.

Every future route must exist before its full implementation is connected. Placeholders must:
- have a stable canonical URL,
- use the shared global navigation,
- show the correct product family,
- show correct auth state,
- never claim unfinished functionality is live,
- link back to the product family and `/send`.

## 6. Pipeline Architecture — LOCKED

There are **10 core pipeline archetypes**. Workflows select a primary pipeline plus domain adapters and optional specialist modules. Do NOT create one bespoke pipeline per workflow unless a real architectural boundary requires it.

### P01 — Core Mail / Correspondence
Simple letters, PDFs, templates, routine correspondence, direct mailing, tracking and proof.

### P02 — Notice / Official Response
Government notices, agency requests, formal notices, CP2000/IRS-style responses.

### P03 — Appeal / Reconsideration
Denials, adverse decisions, reconsiderations, appeal packages, stress testing and readiness.

### P04 — Court / Formal Proceeding
Court summonses, formal court papers, procedural response packages and filing-oriented workflows.

### P05 — Immigration Evidence / Response
Immigration notices, evidence submissions, explanation letters, agency-specific document handling.

### P06 — Dispute / Investigation
Debt, collections, credit reporting, billing, unauthorized charges, evidence disputes, follow-ups and escalations.

### P07 — Business Automation
Triggered business correspondence with risk classification, approval policy, scheduling, execution and audit.

### P08 — Records / Information Request
Records requests, public-records/information requests, custodians, scope, deadlines, document production and proof.

### P09 — Regulatory / Permit / Rights Response
Permits, licensing, regulatory deficiencies, housing/tenant formal responses, agency correction and compliance workflows.

### P10 — Claim / Proof / Evidence Package
Claims where provenance, evidence organization, chronology, custody and proof are first-class requirements.

## 7. Canonical Gold Standard Execution Contract

Every executable workflow must support, directly or through shared platform capabilities:

`SECURE INGEST`
→ `CLASSIFY`
→ `EXTRACT`
→ `UNDERSTAND`
→ `FACTS + PROVENANCE`
→ `TIMELINE / DEADLINES`
→ `ISSUES / DISCREPANCIES`
→ `EVIDENCE`
→ `AUTHORITY / RESEARCH when required`
→ `STRENGTH / RISK`
→ `STRATEGY`
→ `DRAFT`
→ `VALIDATE`
→ `BLOCKING GATES`
→ `HUMAN REVIEW`
→ `AUTHORIZED MAIL`
→ `TRACK`
→ `PROVE / AUDIT`

A catalog entry is not proof of execution. A workflow is executable only when real implementations, integration, security boundaries, deterministic tests, and deployed-path verification exist.

Unknown is a valid state. AI output is untrusted until grounded and validated.

## 8. Workflow → Primary Pipeline Manifest

### MailMyPDF Core
- Mail a PDF → P01
- Write a Letter → P01
- Send a Letter → P01
- Templates → P01
- Future Self → P01
- Proof of Mailing / Service → P01 + proof/audit modules

### Appeal Mail
- Denied Claim → P03
- Government Decision → P03
- Reconsideration → P03
- Insurance Claim Denial → P03
- Insurance Denial Letter → P03
- Insurance Coverage Denial → P03
- Medical Insurance Denial → P03
- Medical Necessity Denial → P03
- Prior Authorization Denial → P03
- Out-of-Network Denial → P03
- Dental Insurance Appeal → P03
- Car Insurance Appeal → P03
- Life Insurance Denial → P03
- Claim Denial Letter → P03
- SSDI Denial → P03
- SSI Denial → P03
- Social Security Denial → P03
- Medicaid Denial → P03
- Unemployment Denial → P03
- EDD Denial → P03
- Financial Aid Appeal → P03
- SAP Appeal → P03
- Financial Aid Suspension Appeal → P03
- Financial Aid Reinstatement → P03
- Financial Aid Special Circumstances → P03
- Scholarship Appeal → P03
- FAFSA Appeal → P03
- License Suspension Appeal → P09 + P03
- Driver's License Suspension → P09 + P03
- License Revocation Appeal → P09 + P03
- DMV Suspension Appeal → P09 + P03
- Registration Suspension Appeal → P09 + P03

### Notice Respond
- IRS Notice → P02
- CP2000 Response → P02
- Agency Action → P02
- Court Summons → P04
- File an Appeal → P03

### Immigration Mail
- Respond to a Notice → P05
- Supporting Documents → P05
- Explanation Letter → P05

### Dispute Mail
- Debt Collection Dispute → P06
- Collection Agency Dispute → P06
- Debt Dispute → P06
- Debt Validation → P06
- Credit Report Error → P06
- Credit Report Collections → P06
- Hard Inquiry → P06
- Charge-Off Reporting → P06
- Medical Collections → P06
- Student Loan Account → P06
- Credit Card Billing Error → P06
- Unauthorized Charge → P06
- Billing Error → P06
- Subscription Charge → P06
- Service Contract → P06
- Insurance Billing / Payment → P06
- Follow-Up With No Response → P06
- Escalate Unresolved Dispute → P06
- Collection Communication Request → P06

### Small Business Mail
- Payment Reminder → P07
- Payment Demand → P07
- Contract Renewal → P07
- Compliance Notice → P07
- Customer Dispute Response → P07

### Future Product Families
- Records Request → P08
- Tenant Reply → P09 (evidence-heavy variants may add P10)
- Permit Reply → P09
- Benefits Appeal → P03
- Claim Proof → P10
- GovReply → P02 (evidence-heavy variants may add P10)

## 9. Domain Adapter Rule — LOCKED

Verticals own domain intelligence:
- classification
- domain facts
- domain rules and authorities
- issue/requirement detection
- domain strategy
- domain drafting requirements

Platform owns reusable infrastructure:
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
- fulfillment
- tracking
- proof

Pattern:

`Pipeline Archetype + Domain Adapter + Specialist Modules = Executable Workflow`

## 10. Workflow Authority Pages — LOCKED

Every workflow gets one permanent public page under its product family. The page is both an authority hub and the entry point to execution.

Every workflow page reserves these layers:

1. Overview / intent match
2. When to use it
3. When not to use it
4. Official rules, authorities, and source library
5. Deadlines and timing
6. Documents to gather
7. Information to confirm
8. Evidence checklist
9. How the workflow works
10. Issues and requirements checked
11. Common mistakes and failure modes
12. Representative scenarios
13. Practical checklists
14. Templates and tools
15. Workflow-specific FAQ
16. Glossary
17. Related workflows
18. Execution CTA
19. Mailing, tracking, and proof
20. Source freshness / last reviewed

Authority pages must use current source verification for legal, tax, medical, regulatory, court, immigration, financial-aid, or other high-stakes claims. No page may invent authorities, deadlines, eligibility rules, recipients, or outcomes.

A workflow page has its own maturity state separate from workflow execution:
`placeholder → authority-draft → source-verified → workflow-wired → gold → production-verified`.

Prelaunch indexing stays disabled even when authority pages and workflow routes exist. Placeholder pages must never imply unfinished execution.

## 11. Anti-Fragmentation Rules

Agents and maintainers MUST NOT:
- create another global navigation model,
- create another public canonical domain,
- create an independent ecosystem sitemap strategy,
- create a separate customer identity concept,
- expose authenticated history publicly,
- invent a new pipeline when an existing archetype fits,
- duplicate platform engines inside verticals,
- mark a placeholder executable,
- claim mailing success without real provider state,
- silently change stable public route structures,
- create a workflow page without the authority-page contract.

Any proposed exception must be documented in `mailmypdf-platform` before implementation.

## 12. Definition of Done

A workflow may be labeled **Gold Standard / Executable** only after its pipeline, domain adapter, dependencies, security/authorization, tests, mailing/tracking/proof path, authority page source grounding, and deployed verification all pass.

This contract is locked so future agents inherit the architecture instead of redesigning it.