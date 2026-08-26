# Third-party notices

The current foundation has no runtime third-party dependencies beyond Node.js.
Development uses TypeScript and Node's built-in test runner.

Planned integrations must be reviewed before adoption:

| Project | Intended role | License reviewed |
| --- | --- | --- |
| AccessForge | File intake, reports, and human-review patterns | Owner-controlled; MIT upstream |
| Docling | Local OCR and structured document parsing | MIT |
| Open Policy Agent | Policy-as-code service when rules outgrow this package | Apache-2.0 |
| Supabase | PostgreSQL, authentication, storage, and row-level security | Apache-2.0 |
| Playwright | Permitted public-record portal adapters and E2E tests | Apache-2.0 |
| Temporal | Durable workflows and timers | MIT |
| docassemble | Guided interviews and document assembly | MIT |
| Langfuse | Self-hosted AI tracing and evaluation | MIT core; enterprise directories excluded |

GPL or AGPL projects must remain separately deployed services unless a specific
license review approves another arrangement.
