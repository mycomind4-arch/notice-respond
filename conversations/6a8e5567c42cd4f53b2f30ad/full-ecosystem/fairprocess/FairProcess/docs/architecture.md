# Architecture

## Trust boundaries

1. **Evidence intake** preserves the original file and calculates its hash.
2. **Document extraction** proposes structured facts with page-level sources.
3. **Human verification** accepts, corrects, or rejects consequential facts.
4. **Policy evaluation** applies a versioned deterministic rule to verified
   inputs.
5. **Record matching** compares the expected instrument with recorder data.
6. **Report authorization** requires a named human before publication or send.

The resident evidence vault and a future agency workflow must remain separate
tenants. Cross-party exchange should use explicit, signed case packages rather
than shared mutable records.

## Planned components

| Component | Initial implementation | Later scale path |
| --- | --- | --- |
| Web and API | Nuxt/Node patterns harvested from AccessForge | Separate resident and agency portals |
| Database | PostgreSQL/Supabase | County-controlled deployment option |
| Document parsing | Docling worker, local by default | Isolated worker pool |
| Rules | Versioned TypeScript policy package | OPA service and signed policy bundles |
| Workflows | PostgreSQL jobs and explicit state transitions | Temporal durable workflows |
| Audit | Append-only PostgreSQL events with SHA-256 linking | Exportable signed audit bundles |
| Public portals | Manual CSV/document import | Playwright adapters where permitted |
| AI observability | Structured internal events | Self-hosted Langfuse |

## Evidence event minimum

Every consequential event should record the tenant, case, actor, timestamp,
action, source hashes, prior event hash, policy version, extraction version,
result, and any human authorization.

