# Production Green Acceptance Matrix

This document is the source of truth for the post-architecture hardening pass.

A capability is **GREEN** only when implementation exists, the package builds, tests cover the behavior, and the integration boundary is explicit. External services remain **CONFIGURED** only after real credentials/endpoints are supplied and a live smoke test succeeds.

| Step | Capability | Acceptance |
|---|---|---|
| 01 | Repository truth | Current architecture docs match packages and runtime boundaries |
| 02 | Reproducible build | CI uses the committed lockfile and fails on dependency drift |
| 03 | Runtime contracts | Agent, durable run, tool, approval, memory, routing, telemetry contracts compile |
| 04 | Durable execution | Run state/checkpoints have persistence interfaces and restart semantics |
| 05 | Approval | Pending/approved/rejected/expired/cancelled transitions are explicit |
| 06 | Case agent | Case tasks are planned and gated before action |
| 07 | Intelligence tools | Existing intelligence engines are exposed without duplicated logic |
| 08 | MCP | MCP is an adapter/transport concern, not a domain dependency |
| 09 | Memory | Case memory is evidence-backed and supports supersession |
| 10 | Model routing | Provider selection is policy/capability/health aware |
| 11 | Telemetry | Run/task/model/tool/approval/action events share correlation IDs |
| 12 | Fulfillment | Actions are governed, idempotent, and produce proof references |
| 13 | E2E | Success and blocked/failure paths are both tested |
| 14 | Security | Authorization, scope, size limits, and secret redaction are enforced |
| 15 | Final audit | No undocumented yellow/red capability remains |

## External configuration gates

These are intentionally separate from source-code green status:

- Trigger.dev endpoint/credentials
- Docling endpoint/credentials
- model provider credentials
- concrete MCP transport/server deployment
- fulfillment provider credentials
- production telemetry sink

A deployment must not claim these are live until a smoke test records the actual service response.
