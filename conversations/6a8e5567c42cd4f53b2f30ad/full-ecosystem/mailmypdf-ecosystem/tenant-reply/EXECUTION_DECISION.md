# Execution Decision

Status: CATALOG / ARCHITECTURE DECISION

Do not build a standalone tenant-intelligence stack before the shared evidence/response boundary is proven.

## Intended workflow

Notice → secure ingest → extract dates/parties/requested action → provenance/timeline → evidence gaps → response strategy → draft → validation → human review → authorized mailing → tracking → proof.

## Ownership

- MailMyPDF Platform owns shared document, provenance, timeline, deadline, workflow, validation, fulfillment, tracking, and proof primitives.
- Tenant Reply owns tenant/landlord correspondence taxonomy and jurisdiction-specific workflow rules.
- FairProcess/FairProcessMaps concepts may inform evidence and timeline behavior but must not be copied as a parallel platform.

## Gate

Build only after shared capabilities are reusable and jurisdiction rules can be sourced and versioned. Never present legal conclusions as verified facts.
