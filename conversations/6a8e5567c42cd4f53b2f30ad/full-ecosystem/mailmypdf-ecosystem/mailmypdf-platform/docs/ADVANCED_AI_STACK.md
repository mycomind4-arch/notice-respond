# Advanced AI / Voice / Document Stack

## Purpose

The platform now defines provider-neutral boundaries for advanced document intelligence and realtime voice. Provider runtimes stay outside the core domain packages so verticals share one security, ownership, case, evidence, and tool architecture.

## Document intelligence

**Docling** is the preferred external document engine for layout-aware PDF/DOCX/HTML extraction, OCR, tables, reading order, and structured document representations. The Docling codebase is MIT licensed; individual model licenses must still be reviewed before production use.

Integration boundary:

`@mailmypdf/document-intelligence` -> HTTPS Docling service -> validated `ExtractedDocument` -> `@mailmypdf/documents` provenance/evidence pipeline.

Docling must run as a separate Python/container service. It must not be embedded in Cloudflare Workers. The adapter enforces HTTPS, bounded request time, and response schema validation.

## Realtime voice

**LiveKit Agents for Node.js** is the preferred server-side realtime voice runtime. It provides programmable realtime participants, tool calling, interruptions, and multimodal voice-agent infrastructure.

The Platform voice package deliberately exposes provider-neutral contracts. LiveKit receives access only to the Platform tool registry; it never receives direct database access.

Recommended provider packages are pinned at the 1.6.x line during initial integration:

- `@livekit/agents`
- `@livekit/agents-plugin-openai`
- `@livekit/agents-plugin-silero`

Provider dependencies are optional peer dependencies so the core platform remains buildable without realtime infrastructure installed.

## Pipecat

**Pipecat** remains a second supported voice/multimodal transport and pipeline option. The browser-side integration uses `@pipecat-ai/client-js`. Pipecat's Python server runtime remains external to the TypeScript monorepo, just like Docling.

This lets the ecosystem choose LiveKit or Pipecat per deployment without changing the Platform's voice tool contract.

## AI tool safety

Voice and AI providers may invoke Platform tools, never arbitrary persistence operations.

Tools must be:

- owner/case scoped
- explicitly typed
- auditable
- idempotent where appropriate
- marked as requiring approval when consequential

Sending mail, spending money, deleting evidence, submitting a filing, or changing durable case state must require explicit user approval.

## Deployment topology

```text
Vertical UI
   |
   +--> Platform AI / Voice contracts
             |
             +--> LiveKit Node Agent service
             |
             +--> Pipecat Python agent service
             |
             +--> Docling Python document service
             |
             +--> Platform tools / case / evidence / timeline
```

Cloudflare Workers remain the edge/application boundary. Python ML runtimes and persistent realtime agent processes are deployed as separate services.

## Licensing

- Docling: MIT code license; review model licenses separately.
- Pipecat: BSD-2-Clause.
- Pipecat browser packages: BSD-2-Clause.
- LiveKit Agents Node packages: Apache-2.0.

Do not vendor third-party source into the Platform repository unless a specific dependency requires it and its license/attribution obligations have been reviewed.

## Current integration status

The Platform contracts and adapters are committed in this branch. The external runtimes still require deployment-specific configuration, credentials, and service hosting before they can execute production voice/document workloads.
