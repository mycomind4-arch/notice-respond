# Database Backend

PostgreSQL/Supabase schema with migration runner, identity tables, query helpers, and a tenant-wide tamper-evident audit chain.

## Quick Start

```bash
# Set your database connection
export DATABASE_URL="postgresql://user:pass@localhost:5432/fairprocess"

# Run migrations
pnpm --filter @fairprocess/database migrate

# Check migration status
pnpm --filter @fairprocess/database migrate:status

# Rollback
pnpm --filter @fairprocess/database migrate:down
```

## Schema Overview

| Table | Purpose |
|---|---|
| `tenants` | Multi-tenant isolation (resident, advocate, agency) |
| `users` | Provisioned OIDC identities assigned to one tenant |
| `roles` / `user_roles` | Tenant-scoped permissions and role assignments |
| `cases` | Core case records with jurisdiction and status |
| `case_apns` | APN numbers per case (normalized, deduplicated) |
| `evidence_documents` | Uploaded-document metadata and SHA-256 hashes |
| `verified_facts` | AI-extracted facts with human verification tracking |
| `recorder_instruments` | Imported recorder data (from CSV or API) |
| `recorder_searches` | Search metadata (scope, source, limitations) |
| `policy_bundles` | Versioned policy rules with activation status |
| `instrument_expectations` | What instruments should be recorded per case |
| `integrity_reports` | Generated reports with authorization workflow |
| `public_records_requests` | CPRA/PRA request tracking |
| `correspondence` | AI-drafted, human-authorized communications |
| `audit_events` | Append-only, versioned tenant audit events |

## Tamper-Evident Audit Chain

Migration 005 upgrades new audit events to chain version 2. Existing rows are preserved as chain version 1 without rewriting their historical hashes. Legacy hashes cannot be recomputed because the original implementation hashed a timestamp that it did not persist, so verification reports them explicitly as legacy and unverifiable.

Every v2 tenant chain begins with an `audit_chain_initialized` genesis event. New events contain:

- tenant, optional case, actor, and action;
- a monotonically increasing tenant sequence number;
- one persisted `occurred_at` timestamp included in the hash;
- source hashes, policy version, extraction version, result, and human authorization;
- the prior v2 event hash;
- canonicalization version `fairprocess-audit-v1`;
- a SHA-256 hash calculated from every field above plus the event ID.

Nested JSON object keys are sorted deterministically before hashing, while array order is preserved. The verifier reads stored fields and independently recomputes every v2 hash rather than trusting the value written by the application.

### Append guarantees

`recordAuditEvent()` appends inside one PostgreSQL transaction. It acquires a per-tenant advisory transaction lock, initializes a missing genesis event, reads the current tenant chain head, allocates the next sequence, calculates the canonical hash, inserts the event, and commits. Unique partial indexes on tenant sequence and event hash provide a second defense against forks and duplicates.

Migration 005 also installs a database trigger that rejects normal `UPDATE` and `DELETE` operations against `audit_events`. Rollback removes the trigger before deleting v2 rows and restoring the legacy schema shape.

### Verification statuses

`verifyAuditChain()` returns a top-level `valid` boolean plus one of:

- `valid`
- `valid_with_legacy_prefix`
- `legacy_unverifiable`
- `invalid_hash`
- `invalid_link`
- `invalid_sequence`
- `invalid_genesis`
- `unsupported_canonicalization_version`

Invalid results include the first broken event and expected/actual values where available.

This system is **tamper-evident**, not tamper-proof. A PostgreSQL superuser can disable triggers or alter data outside normal application controls. Production hardening should add immutable backups and periodic externally signed or anchored tenant chain heads.

## Views

- `case_dashboard` — aggregated case summary with evidence counts,
  fact counts, recorder instruments, expectations, and latest report status.

## Supabase Deployment

The schema is PostgreSQL-compatible. Apply every migration in order using the migration runner rather than running only the initial schema:

```bash
export DATABASE_URL="postgresql://..."
pnpm --filter @fairprocess/database migrate
```

The runner also creates missing v2 genesis events for tenants that existed before migration 005. New tenants receive a genesis event on their first audit append.

## Multi-Tenancy

All tenant-owned data includes `tenant_id`. The authenticated API derives tenant identity from the provisioned OIDC principal and applies tenant filtering and case-ownership checks. Tenants can be:

- `resident` — individual preserving their own records
- `advocate` — attorney or consultant managing cases
- `agency` — government body managing enforcement cases
