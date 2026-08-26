# Tenant Reply

**Status: Planned vertical — do not build yet.**

## Product thesis

Help tenants and landlords turn notices, leases, correspondence, repair records, photos, and other documents into an organized, evidence-backed response workflow.

Core journey:

**Notice → Documents → Timeline → Evidence → Response → Review → Mail/Proof**

## Primary search intent

- respond to landlord notice
- tenant response letter
- security deposit dispute
- repair request letter
- rent dispute response
- landlord correspondence
- eviction notice response

SEO should target the user's situation, not generic "AI legal" terms.

## MVP

1. Upload notice/lease/supporting documents.
2. Extract dates, parties, property, requested action, and stated facts.
3. Build a source-linked timeline.
4. Organize evidence and identify missing information.
5. Draft a factual response for human review.
6. Hand off to MailMyPDF for delivery/proof.

## Reuse

Prefer shared document extraction, provenance, timeline, evidence, deadline, and response infrastructure from FairProcess/FairProcessMaps and the MailMyPDF platform. Do not duplicate those systems inside this vertical.

## Guardrails

Do not present legal conclusions as facts. Separate extracted facts, user assertions, and generated suggestions. Every important finding should link back to source material where possible.

## Future

Jurisdiction-specific workflows, repair/notice tracking, deposit accounting, records requests, and escalation support should come only after the MVP is functional.
