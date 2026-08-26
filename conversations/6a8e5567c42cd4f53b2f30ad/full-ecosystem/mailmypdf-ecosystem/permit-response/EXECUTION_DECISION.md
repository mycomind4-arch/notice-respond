# Execution Decision

Status: CATALOG / ARCHITECTURE DECISION

Do not build a parallel permit intelligence stack yet.

## Intended workflow

Agency correspondence → extract requirements → provenance → deadline → evidence mapping → point-by-point response → validation → human review → authorized mailing → tracking → proof.

## Ownership

- Code Enforcement owns property/jurisdiction/permit/inspection intelligence where the capability is shared.
- MailMyPDF Platform owns generic document, provenance, workflow, validation, fulfillment, tracking, and proof primitives.
- Permit Response owns permit-correction and resubmission-specific rules and UX.

## Gate

Move to executable implementation only after the shared Code Enforcement boundary is confirmed reusable. Never claim permit approval or authoritative code conclusions without jurisdiction-specific sources.
