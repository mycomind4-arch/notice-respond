# FairProcess

FairProcess is an AI-assisted procedural-integrity platform for residents,
advocates, attorneys, auditors, and local governments.

The first product is a **Recordation Integrity Engine** for code-enforcement
cases. It organizes source documents, extracts verifiable facts, applies
versioned procedural rules, matches recorder results, and produces a neutral
report identifying records that are present, not located, premature, or in
need of human review.

FairProcess does not decide whether a person violated the law, declare that an
agency acted illegally, or replace legal advice. AI may extract facts and draft
communications. Deterministic policy code evaluates procedural checkpoints,
and a human authorizes consequential findings or communications.

## Capabilities

- Preserve uploaded documents with hashes and source-page references.
- Track APNs, case numbers, service dates, recorder instruments, and outcomes.
- Evaluate recordation checkpoints using versioned, reviewable policy data.
- Track public-records requests, delivery evidence, correspondence, and status.
- Export a reproducible case timeline and procedural-integrity report.
- Record the AI version, policy version, source evidence, and human approval
  behind every published finding.
- OIDC-authenticated REST API with tenant and role enforcement.
- PostgreSQL database with append-only, SHA-256-linked audit events.
- n8n workflow templates using authenticated service identities.

## Repository map

```text
packages/case-model/       Shared case, evidence, and records-request types
packages/policy-engine/    Deterministic recordation evaluation
packages/audit-engine/     Case + recorder import and report generation
packages/database/         PostgreSQL schema, migrations, identity, and audit log
packages/api-server/       Fastify REST API and OIDC authorization
policies/humboldt/         Versioned Humboldt policy data
n8n-workflows/             Authenticated n8n workflow templates
docs/                      Product, architecture, security, and source documentation
```

## Development

Requirements: Node.js 22 or newer and pnpm 11.

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm audit:dependencies
pnpm test
pnpm build
```

Package tests intentionally exercise freshly compiled `dist` artifacts. Every
compiled package performs a clean TypeScript build before tests so deleted or
renamed source files cannot survive as stale JavaScript.

See [`docs/security/ci-controls.md`](docs/security/ci-controls.md) for the
secret-scanning version, dependency-vulnerability threshold, exception policy,
migration lifecycle, and complete CI coverage map.

## Database setup

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/fairprocess"
pnpm --filter @fairprocess/database migrate
```

See [`packages/database/README.md`](packages/database/README.md) for schema,
migration, deployment, and audit-trail documentation.

## API server

The API fails closed unless an OIDC issuer and audience are configured.

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/fairprocess"
export OIDC_ISSUER="https://identity.example.com"
export OIDC_AUDIENCE="fairprocess-api"
export CORS_ORIGIN="http://localhost:3000"

pnpm --filter @fairprocess/api-server start
```

Users must be explicitly provisioned into a tenant and assigned one or more
roles. See [`packages/api-server/README.md`](packages/api-server/README.md) for
the provisioning command, endpoint reference, and authorization model.

## n8n workflows

Import the JSON files from `n8n-workflows/` into your n8n instance:

1. **Case Audit Pipeline** — authenticated webhook-triggered audit run
2. **Scheduled Recorder Polling** — authenticated daily audits for one tenant
3. **Evidence Intake** — authenticated metadata registration and deduplication
4. **Authorized Report Distribution** — publishes only previously authorized reports

See [`n8n-workflows/README.md`](n8n-workflows/README.md) for service-identity and
webhook-security requirements.

## Generate an integrity report (CLI)

Prepare a case JSON document using `docs/audit-input.md`, export recorder search
results into the documented CSV format, then run:

```bash
pnpm run case-audit -- --case /secure/path/case.json \
  --recorder /secure/path/recorder.csv \
  --policy policies/humboldt/hcc-352.recordation.json \
  --out-dir /secure/path/report
```

The command writes `integrity-report.json` and `integrity-report.md`. Input and
output paths should be outside this repository when they contain personal or
case-specific information.

## Safety boundary

FairProcess is evidence-management and workflow software, not a law firm. Legal
rules must be reviewed by a qualified human before they are activated for a
jurisdiction. A missing search result is reported as **not located**, never as
proof that a record does not exist or that misconduct occurred.
