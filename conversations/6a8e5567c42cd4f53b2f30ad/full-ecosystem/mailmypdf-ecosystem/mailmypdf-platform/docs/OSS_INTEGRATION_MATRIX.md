# OSS Integration Matrix

This document records the external open-source projects selected to close capability gaps without replacing the platform's domain model.

## Selected projects

| Gap | Candidate | Decision | Integration boundary |
|---|---|---|---|
| Durable/long-running agent execution | `triggerdotdev/trigger.dev` | Primary candidate | Agent runtime / workflow adapter |
| Durable workflow ceiling / enterprise alternative | `temporalio/temporal` | Reference architecture, not immediate dependency | Workflow execution boundary |
| PDF/document parsing and layout | `docling-project/docling` + `docling-serve` | Primary document engine | Existing `DocumentIntelligenceProvider` |
| Document MCP tooling | `docling-project/docling-mcp` | Evaluate after document engine | MCP tool registry |
| Evidence-backed agent memory | `klarlabs-studio/mnemos` | Research/selective adoption | Case memory, not replacement for intelligence |

## Repositories

- https://github.com/triggerdotdev/trigger.dev
- https://github.com/temporalio/temporal
- https://github.com/docling-project/docling
- https://github.com/docling-project/docling-serve
- https://github.com/docling-project/docling-mcp
- https://github.com/klarlabs-studio/mnemos

## Rules

1. Do not replace the platform's Facts/Evidence/Findings/Provenance/Timeline/Deadline/Risk model with an external framework.
2. External projects must sit behind platform-owned interfaces.
3. Prefer adapters over vendor-specific types leaking into domain packages.
4. No new dependency is added until its license, security posture, runtime requirements, and operational fit are reviewed.
5. Trigger.dev is the first implementation target for durable execution because the existing runtime is TypeScript-first and the platform already models agent tasks.
6. Temporal remains a future option if enterprise durability requirements exceed the Trigger integration.
7. Docling should remain behind the existing document-intelligence contract.
8. Memory systems are additive: the platform's evidence/provenance graph remains authoritative.

## Yellow-button sequence

1. Durable execution adapter
2. Tool/action registry with permissions, risk and approval metadata
3. Human approval pause/resume
4. Persistent run state and recovery
5. Scheduled follow-up/resume
6. Document extraction hardening through Docling
7. Agent memory snapshots/retrieval
8. End-to-end provenance from input through action and outcome
9. Full case-resolution integration test

## Current status

The first change on this branch adds platform-owned durable execution and tool contracts. It intentionally does not couple the core runtime directly to Trigger.dev yet; the external dependency will be introduced only after the adapter contract is proven against the current runtime and lockfile.
