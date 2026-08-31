# API Server

Fastify REST API for FairProcess case management, evidence metadata, audit runs,
and report review.

## Authentication model

Every route except `GET /health` and `GET /api` requires an OIDC access token:

```http
Authorization: Bearer <access-token>
```

The API verifies RS256 JWT signatures through the provider's OIDC discovery and
JWKS endpoints. It validates issuer, audience, expiration, not-before time, key
identifier, and signature. The token's issuer and subject are then resolved to a
provisioned FairProcess user.

Tenant and actor identity come only from the verified, provisioned user record.
Client-supplied `x-tenant-id` and `x-actor-id` headers are ignored and are never
used as an internal identity bridge.

## Quick start

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/fairprocess"
export OIDC_ISSUER="https://identity.example.com"
export OIDC_AUDIENCE="fairprocess-api"
# Optional when discovery is unavailable:
# export OIDC_JWKS_URI="https://identity.example.com/.well-known/jwks.json"

# Explicit allowlist. An empty value disables browser CORS.
export CORS_ORIGIN="http://localhost:3000"

# Required only for policy creation and activation. Use the tenant ID assigned
# to the qualified policy-governance team.
export POLICY_GOVERNANCE_TENANT_ID="policy-governance"

pnpm build
pnpm --filter @fairprocess/database migrate
pnpm --filter @fairprocess/api-server start
```

The server listens on `http://localhost:3001` by default.

## Provision a user

The identity provider authenticates the person; FairProcess still requires an
explicit tenant membership and role assignment.

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/fairprocess"
export TENANT_ID="tenant-1"
export OIDC_ISSUER="https://identity.example.com"
export OIDC_SUBJECT="provider-subject-value"
export USER_EMAIL="analyst@example.com"
export USER_DISPLAY_NAME="Example Analyst"
export ROLE_NAMES="analyst"

pnpm --filter @fairprocess/database provision-user
```

`ROLE_NAMES` accepts a comma-separated list. Default roles are created for every
tenant:

- `resident`
- `case_contributor`
- `analyst`
- `advocate`
- `attorney_reviewer`
- `auditor`
- `agency_reviewer`
- `policy_editor`
- `policy_approver`
- `tenant_administrator`
- `system_administrator`
- `read_only_observer`

The database prevents assigning a role from one tenant to a user in another.

## Authorization

Routes require explicit permissions such as:

- `case:read`, `case:write`
- `evidence:read`, `evidence:write`
- `audit:read`, `audit:run`
- `report:read`, `report:authorize`, `report:publish`
- `policy:read`, `policy:write`, `policy:activate`
- `records:read`, `records:write`
- `correspondence:write`, `correspondence:authorize`

Case-scoped routes verify case ownership before the handler executes. A case ID
from another tenant returns `404` rather than revealing that the object exists.

### Policy governance

Policy bundles are a shared, versioned legal-rule catalog. Authorized tenants
may read the catalog, but mutation is additionally restricted to the tenant ID
configured in `POLICY_GOVERNANCE_TENANT_ID`.

This restriction applies after ordinary permission checks and also applies to
wildcard administrators. A user therefore needs both:

1. `policy:write` or `policy:activate`; and
2. membership in the configured governance tenant.

When `POLICY_GOVERNANCE_TENANT_ID` is missing or blank, policy creation and
activation fail closed with `403 policy_governance_not_configured`. Other API
workflows remain available.

## Endpoints

### Identity

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/me` | Return the authenticated user, tenant, roles, and permissions |

### Cases

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/cases` | List cases for the authenticated tenant |
| `POST` | `/api/cases` | Create a case in the authenticated tenant |
| `GET` | `/api/cases/:id` | Get case details |
| `POST` | `/api/cases/:id/expectations` | Add an instrument expectation |
| `POST` | `/api/cases/:id/recorder-csv` | Import recorder CSV data |
| `POST` | `/api/cases/:id/audit` | Run an audit and generate a report |
| `POST` | `/api/cases/:id/evidence` | Register evidence metadata |
| `GET` | `/api/cases/:id/audit-trail` | Get the case audit trail |

### Reports

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/reports/:id` | Get a report as JSON |
| `GET` | `/api/reports/:id/markdown` | Get report markdown |
| `POST` | `/api/reports/:id/authorize` | Record human review |
| `POST` | `/api/reports/:id/publish` | Publish an authorized report |

### Policies

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/policies` | List shared policy bundles |
| `POST` | `/api/policies` | Create a bundle from the governance tenant |
| `GET` | `/api/policies/:id` | Get a shared policy bundle |
| `PATCH` | `/api/policies/:id/activate` | Activate a bundle from the governance tenant |

### Records requests and correspondence

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/records-requests` | List tenant records requests |
| `POST` | `/api/records-requests` | Create a records request |
| `PATCH` | `/api/records-requests/:id` | Update a records request |
| `POST` | `/api/cases/:id/correspondence` | Draft correspondence |
| `POST` | `/api/correspondence/:id/authorize` | Authorize correspondence |

### Audit

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/audit/verify-chain` | Verify the tenant audit chain |

## Example

```bash
export FAIRPROCESS_TOKEN="<OIDC access token>"

curl -X POST http://localhost:3001/api/cases \
  -H "Authorization: Bearer $FAIRPROCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "case-001",
    "jurisdiction": "Humboldt County, California",
    "asOf": "2026-07-17",
    "apns": ["000-000-000-000"]
  }'
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `OIDC_ISSUER` | — | Exact trusted OIDC issuer |
| `OIDC_AUDIENCE` | — | Allowed audience or comma-separated audiences |
| `OIDC_JWKS_URI` | discovery | Optional explicit JWKS endpoint |
| `POLICY_GOVERNANCE_TENANT_ID` | disabled | Tenant allowed to create and activate shared policy bundles |
| `PORT` | `3001` | API port |
| `HOST` | `0.0.0.0` | Bind address |
| `CORS_ORIGIN` | disabled | Comma-separated browser origin allowlist |
| `RUTH_SUPABASE_URL` | — | Supabase project URL for Ruth Solv Flow integration |
| `RUTH_SERVICE_ROLE_KEY` | — | Supabase service role key for Ruth Solv Flow integration |

## AI integration

The API server can optionally connect to the FairProcess AI Worker
(`packages/ai-worker`) for fact extraction, correspondence drafting, and
report summarization.

### Configuration

```bash
export AI_WORKER_URL="https://fairprocess-ai.YOUR-SUBDOMAIN.workers.dev"
export AI_WORKER_KEY="shared-secret-api-key"
```

When both environment variables are set, the `AiClient` is available. When
not set, AI-dependent features gracefully degrade (endpoints return 503).

### AI-assisted endpoints (future)

When the AI worker is connected, these endpoints gain AI capabilities:

- `POST /api/cases/:id/evidence` — triggers fact extraction, stores results as
  candidate facts with `extractionMethod: "model_extraction"`
- `POST /api/cases/:id/correspondence` — optionally drafts correspondence via AI
  before storing, recording `aiVersion` and `promptVersion`
- `POST /api/cases/:id/audit` — generates a report summary alongside the report
