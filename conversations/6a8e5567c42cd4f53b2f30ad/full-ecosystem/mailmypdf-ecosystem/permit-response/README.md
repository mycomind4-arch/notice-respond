# Permit Response

**Status: Planned / architecture decision pending.**

## Product thesis

Help applicants respond to permit, planning, inspection, zoning, and correction correspondence by organizing the agency request, application record, supporting documents, deadlines, and response.

Core journey:

**Agency Comment/Notice → Application → Requirements → Evidence → Response → Resubmission → Proof**

## Primary search intent

- respond to permit correction notice
- permit denial response
- building permit correction response
- planning department response
- zoning application response
- inspection correction response

## MVP candidate

1. Upload agency correspondence and application documents.
2. Extract requested corrections, dates, reference numbers, and agency.
3. Organize requirements against supporting evidence.
4. Track response items and deadlines.
5. Draft a point-by-point response for review.
6. Send the approved response through MailMyPDF where appropriate.

## Critical architecture decision

Before building, determine whether this should remain a standalone vertical or become a Code Enforcement capability. It shares substantial property, jurisdiction, permit, inspection, evidence, and timeline infrastructure with Code Enforcement.

## Reuse

Prefer Code Enforcement/FairProcessMaps property and evidence infrastructure rather than duplicating it.

## Guardrails

Do not claim a permit will be approved or provide authoritative zoning/building-code conclusions without jurisdiction-specific authoritative sources.
