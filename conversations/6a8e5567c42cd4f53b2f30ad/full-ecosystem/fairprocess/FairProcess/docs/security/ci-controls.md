# Continuous Integration and Repository Assurance

FairProcess treats CI as part of the evidentiary trust boundary. A green workflow means the maintained source, generated artifacts, database migrations, authorization rules, audit chain, workflow templates, and web prototype passed the controls below. It is not a legal certification or a production deployment approval.

## Required local commands

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm audit:dependencies
pnpm test
pnpm build
```

A PostgreSQL instance is also required for the migration and database-backed test stages.

## Static analysis

`pnpm lint` performs a clean workspace build, runs TypeScript no-emit checks for every maintained package, and runs `node --check` across maintained JavaScript, MJS, and CJS files under `apps/web`, `packages`, `scripts`, and `test`.

The repository intentionally avoids a second JavaScript parser dependency while the maintained application code is TypeScript plus small Node scripts. Adding a JavaScript framework or syntax that `node --check` cannot validate requires revisiting this decision.

## Compiled artifact contract

Package tests intentionally import compiled `dist` modules. Every compiled package therefore uses this build sequence:

```text
tsc -b tsconfig.json --clean && tsc -b tsconfig.json --force
```

Tests must start with `pnpm build` before invoking the Node test runner. `test/dist-contract.test.mjs` enforces both requirements. This prevents deleted or renamed source modules from surviving as stale JavaScript and being exercised accidentally.

TypeScript build metadata (`*.tsbuildinfo`) is ignored and must not be committed.

## Secret scanning

CI scans the complete checked-out Git history with the official Gitleaks container pinned to `v8.30.1`. Checkout uses full history (`fetch-depth: 0`). Findings are redacted in logs and fail the workflow.

There is no active repository-wide allowlist. A legitimate exception must:

1. identify the exact finding fingerprint or narrowly scoped path;
2. explain why the value is not a credential;
3. name the reviewer approving the exception;
4. include an expiration or review date; and
5. be recorded in this document in the **Active exceptions** section.

Disabling a detection rule globally merely to make CI pass is prohibited. A real exposed credential must be rotated even if it is later removed from the branch because Git history may retain it.

### Active exceptions

None.

## Dependency vulnerability policy

`pnpm audit:dependencies` runs:

```bash
pnpm audit --prod --audit-level high
```

High and critical advisories affecting production dependencies block CI. Moderate and low advisories do not block this gate, but must be reviewed during dependency maintenance.

An advisory exception is allowed only when no fixed version or safe replacement exists and the affected path is not reachable in the deployed FairProcess configuration. Every exception must record:

- CVE or GHSA identifier;
- affected package and dependency path;
- reachable/not-reachable analysis;
- compensating control;
- responsible owner;
- approval date; and
- expiration date no more than 90 days later.

No dependency advisory is currently allowlisted.

## Database lifecycle

CI starts PostgreSQL 17 and verifies:

1. all migrations apply from an empty database;
2. the latest migration rolls back;
3. the migration applies again after rollback.

This up → down → up sequence must remain before database-backed tests.

## Test coverage gates

The root test command includes package and repository tests covering:

- deterministic policy evaluation;
- recorder CSV import and report generation;
- PostgreSQL persistence and migration behavior;
- OIDC authentication and production identity failure behavior;
- tenant and role enforcement;
- tamper-evident audit-chain creation and independent verification;
- web-prototype build and safety assertions;
- n8n service-identity, webhook, and publication controls; and
- clean compiled-artifact enforcement.

A final workspace build runs after tests to verify that the repository remains buildable after every preceding stage.

## Failure evidence

When tests fail, CI uploads the bounded failing log as the `fairprocess-test-failure` artifact for three days. Secret findings must never be uploaded as unredacted artifacts.
