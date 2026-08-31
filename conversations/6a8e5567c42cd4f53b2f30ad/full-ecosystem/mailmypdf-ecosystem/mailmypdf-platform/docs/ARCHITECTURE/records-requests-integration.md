# Records Requests integration contract

Records Requests is expected to consume the reusable platform packages once they are released. The vertical should not fork platform intelligence, workflow lifecycle, proof, or fulfillment implementations.

## Platform packages

- `@mailmypdf/core` — shared primitives and contracts
- `@mailmypdf/documents` — document contracts/rendering infrastructure
- `@mailmypdf/intelligence` — facts, provenance, evidence, findings, timelines, deadlines, risk, contradictions
- `@mailmypdf/workflows` — workflow lifecycle and Gold Standard contracts
- `@mailmypdf/proof` — proof artifacts, packets, and audit contracts
- `@mailmypdf/fulfillment` — MailMyPDF fulfillment contracts

## Records domain

The vertical owns:

- agency and custodian modeling
- record categories and request construction
- jurisdiction-specific policy packs
- search strategy
- records-production classification
- withholding/redaction analysis
- missing/partial production findings
- records-specific escalation and follow-up strategy
- Code Enforcement and future records-domain workflows

## Migration rule

A compatibility adapter is temporary. Once a platform package is released and consumed by Records Requests, delete the corresponding local duplicate rather than maintaining two sources of truth.
