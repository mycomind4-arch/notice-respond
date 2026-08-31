# MailMyPDF Workflow Authority Page Contract

**Status: LOCKED**

Every public workflow page is both an authority hub for its subject and the entry point to the executable workflow. A page is not complete because it has a title, marketing copy, or a form.

## Required page layers

1. **Hero / intent match**
   - exact workflow title
   - plain-English outcome
   - primary action
   - concise qualification/disclaimer
   - canonical URL

2. **What this workflow is**
   - what the problem/request/decision is
   - who it is for
   - what MailMyPDF does and does not do
   - adjacent situations that belong in another workflow

3. **When to use it / when not to use it**
   - triggering documents/events
   - common eligibility/fit conditions
   - disqualifiers and escalation conditions

4. **Official rules, authorities, and source library**
   - authoritative government/issuer/court/contract sources relevant to the workflow
   - source title, publisher, URL, publication/update date when available
   - quoted claims must be traceable to source material
   - legal/tax/regulated claims require current-source verification before publication

5. **Deadlines and timing**
   - source-specific deadlines
   - how to locate the controlling date
   - what to do when the source does not provide enough information
   - never invent a deadline

6. **Documents and information needed**
   - required source documents
   - optional supporting documents
   - identifiers to locate/extract
   - recipient information
   - case/reference numbers

7. **Evidence and preparation checklist**
   - facts to confirm
   - evidence to gather
   - missing-information checklist
   - document naming/organization guidance

8. **How the workflow works**
   - pipeline stages expressed in user language
   - what the system analyzes
   - what the user reviews
   - what causes a blocking gate
   - how mailing/tracking/proof works

9. **Decision / issue framework**
   - common issue categories
   - discrepancies or requirements the workflow checks
   - supported vs unknown states
   - no fabricated conclusions

10. **Common mistakes and failure modes**
    - frequent omissions
    - deadline mistakes
    - recipient/address mistakes
    - evidence gaps
    - misleading assumptions

11. **Examples / scenarios**
    - representative scenarios
    - before/after preparation examples where safe
    - never present invented facts as real cases

12. **Templates / checklists / tools**
    - downloadable or interactive checklist
    - relevant templates
    - evidence worksheet
    - deadline worksheet
    - source-document checklist

13. **FAQ**
    - workflow-specific questions
    - concise answers grounded in source material
    - escalate uncertain/high-stakes questions to the appropriate professional or authority

14. **Glossary**
    - workflow-specific terminology
    - abbreviations and identifiers

15. **Related workflows**
    - neighboring workflows
    - next-step workflows
    - follow-up/escalation workflows
    - product-family links

16. **Execution CTA**
    - start/analyze/upload action
    - sign-in/account state when the action requires a user account
    - clear transition from learning to doing

17. **Mailing / proof section**
    - available mail classes
    - real tracking behavior
    - what proof is retained
    - no simulated delivery claims

18. **Editorial / freshness metadata**
    - last reviewed date
    - source review date
    - responsible product/domain owner
    - evidence/source update notes

## Structured page data

Each workflow page must have a machine-readable content manifest containing:

- workflow ID
- vertical
- pipeline
- adapters
- canonical path
- primary query/intent
- secondary intents
- title/meta description
- summary
- when-to-use
- when-not-to-use
- document checklist
- information checklist
- deadline model
- requirements
- evidence model
- issue categories
- authority/source library
- common mistakes
- scenarios
- FAQs
- glossary
- related workflow IDs
- CTA labels/targets
- disclaimers
- last-reviewed metadata
- maturity state

## SEO requirements

- Canonical URL must be under `https://mailmypdf.ai`.
- One primary search intent per workflow page.
- Secondary intents must map to sections, FAQs, supporting pages, or sibling workflows rather than keyword stuffing.
- Structured data must match the actual page.
- Internal links must connect the workflow to its vertical, related workflows, resources, and core mailing path.
- Prelaunch indexing remains disabled until the launch switch is enabled.

## Authority standard

A workflow page should aim to be the most useful single starting point for understanding that workflow, while remaining factual and appropriately bounded. Authority comes from accurate source grounding, comprehensive practical guidance, clear limitations, useful tools, and a trustworthy executable path—not from unsupported claims or keyword volume.

## Completion states

- `placeholder`: route exists; page contract is reserved; no authority claims beyond the placeholder.
- `authority-draft`: structure and substantive content exist but source review is incomplete.
- `source-verified`: current sources and claims have been reviewed.
- `workflow-wired`: executable workflow is connected.
- `gold`: workflow and page satisfy Gold Standard requirements.
- `production-verified`: deployed route, workflow, auth, mailing, tracking, proof, and page behavior have been verified.

A page must not claim `source-verified`, `gold`, or `production-verified` without evidence.