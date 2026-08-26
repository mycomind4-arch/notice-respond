# Security

FairProcess is intended to process sensitive legal, property, health, and
identity information. Do not place real case documents or personal data in this
repository, test fixtures, issues, pull requests, or CI logs.

## Baseline requirements

- Private evidence storage with tenant-scoped authorization.
- Encryption in transit and at rest.
- Append-only audit events for evidence access and consequential actions.
- File-type, size, and malware validation before document processing.
- No model training on customer evidence by default.
- Redaction before sending data to any externally hosted model.
- Human authorization before sending communications or publishing findings.
- Documented retention and deletion controls.

Security reports should be disclosed privately to the repository owner rather
than opened as public issues.

