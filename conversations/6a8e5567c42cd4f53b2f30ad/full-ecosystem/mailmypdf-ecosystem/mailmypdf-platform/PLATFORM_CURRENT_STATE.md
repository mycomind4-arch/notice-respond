# Platform Current State

**Date:** 2026-08-14
**Branch:** main
**Commit:** 420ab5e (docs: add platform v0.1 roadmap)
**Total commits:** 21

---

## 1. Directory Structure

```
mailmypdf-platform/
├── package.json                 # root workspace manifest
├── pnpm-workspace.yaml           # pnpm workspace config
├── tsconfig.json                 # shared TypeScript config
├── README.md                     # project overview
├── ARCHITECTURE.md               # architecture document
├── docs/
│   └── ROADMAP.md                # versioned roadmap
└── packages/
    ├── core/                     # @mailmypdf/core
    │   ├── package.json
    │   └── src/index.ts
    ├── documents/                # @mailmypdf/documents
    │   ├── package.json
    │   └── src/index.ts
    ├── intelligence/             # @mailmypdf/intelligence
    │   ├── package.json
    │   └── src/index.ts
    ├── ai/                        # @mailmypdf/ai
    │   ├── package.json
    │   └── src/index.ts
    ├── proof/                     # @mailmypdf/proof
    │   ├── package.json
    │   └── src/index.ts
    ├── fulfillment/              # @mailmypdf/fulfillment
    │   ├── package.json
    │   └── src/index.ts
    └── design-system/            # @mailmypdf/design-system
        ├── package.json
        └── src/index.ts
```

## 2. Package Manager

- **pnpm 10.0.0** (declared in root `package.json`)
- Workspace configured via `pnpm-workspace.yaml` with `packages/*` glob
- No `pnpm-lock.yaml` present (dependencies never installed)

## 3. TypeScript Configuration

Shared root `tsconfig.json`:

| Option | Value |
|---|---|
| target | ES2022 |
| module | ESNext |
| moduleResolution | Bundler |
| strict | true |
| declaration | true |
| declarationMap | true |
| sourceMap | true |
| noUncheckedIndexedAccess | true |
| exactOptionalPropertyTypes | true |
| skipLibCheck | true |

No per-package tsconfig overrides. Each package relies on the root config implicitly (though no `extends` field is used — packages will fail to build standalone).

## 4. Build System

- Each package has `build: tsc` in its package.json
- Root orchestrates via `pnpm -r build`
- No bundler (no esbuild, rollup, vite, or tsup)
- No `outDir` configured — TypeScript will emit to `src/` by default (this is a bug)
- No `tsconfig.build.json` for excluding tests

## 5. Test System

- Each package declares `"test": "node --test"`
- **Zero test files exist**
- The Node.js built-in test runner is referenced but never used
- No test utilities, fixtures, or evaluation harnesses

## 6. Linting

- Each package uses `"lint": "tsc --noEmit"` (type-checking only)
- No ESLint, Biome, or other linter configured
- No `.eslintrc`, `biome.json`, or equivalent

## 7. Publishing Configuration

- Root package is `private: true` (not published)
- All sub-packages have `private: false` (intended for publishing)
- No `publishConfig`, `files`, or `exports` fields in any package
- No changesets, semantic-release, or version management tooling
- All packages at version `0.1.0`

## 8. CI/CD

- **None.** No `.github/workflows/`, no CI configuration of any kind.

## 9. Existing Contracts (Package Inventory)

### @mailmypdf/core (24 lines)

**Exports:**
- `Brand<T, B>` — branded type utility
- `PlatformId` — branded string type for IDs
- `createId(value: string): PlatformId` — ID factory
- `Result<T, E>` — discriminated union (ok/err)
- `ok(value)` / `err(error)` — Result constructors
- `Confidence` — branded number (0-1)
- `confidence(value: number): Confidence` — factory with validation

**Assessment:** Minimal but reasonable. Missing: typed errors, validation utilities, date/time helpers, environment handling, logging interfaces, configuration types.

### @mailmypdf/documents (22 lines)

**Exports:**
- `DocumentKind` — union of 8 kinds
- `DocumentProvenance` — source tracking interface
- `DocumentRecord` — flat document model

**Assessment:** Thin. Missing: document lifecycle states, validation interfaces, security boundaries, page-level metadata, classification contracts, processing state machine, MIME type validation, size limits, hash computation interface.

### @mailmypdf/intelligence (47 lines)

**Exports:**
- `SourceRef` — document reference with page/locator
- `Fact` — subject/predicate/value with confidence and sources
- `EvidenceRelation` — supports/contradicts/qualifies/missing
- `EvidenceLink` — claim-to-evidence relationship
- `TimelineEvent` — dated event with confidence and conflict flag
- `Finding` — typed finding with severity and recommended actions

**Assessment:** Good conceptual model but incomplete. Missing: provenance classification (USER_PROVIDED, EXTRACTED, INFERRED, etc.), contradiction detection framework, deadline engine, fact status/conflict tracking, evidence status, timeline event types, confidence scoring methodology.

### @mailmypdf/ai (21 lines)

**Exports:**
- `AiTask<I, O>` — task contract with input, output schema, metadata
- `AiResult<O>` — output with confidence, model, sources, warnings
- `AiProvider` — interface with `execute` method

**Assessment:** Bare interface. Missing: model routing, retries, fallback, token/cost metadata, prompt management, structured output validation, evaluation framework, safety checks, provenance on AI results.

### @mailmypdf/proof (26 lines)

**Exports:**
- `AuditEvent` — timestamped event with actor and metadata
- `ProofArtifact` — typed artifact with optional hash
- `ProofPacket` — collection of artifacts and events

**Assessment:** Basic structure. Missing: proof lifecycle, verification interface, relationship between artifacts, approval tracking, delivery confirmation, immutable event log semantics.

### @mailmypdf/fulfillment (23 lines)

**Exports:**
- `MailingClass` — standard/certified/registered
- `MailingRequest` — recipient + document + class + optional schedule
- `MailingStatus` — state machine with tracking
- `MailMyPdfFulfillmentClient` — createMailing + getMailing interface

**Assessment:** Adapter boundary only. Missing: cancelMailing, getTracking, getProof, idempotency, retries, webhook verification, status normalization, provider error types, attachment support.

### @mailmypdf/design-system (20 lines)

**Exports:**
- `mailMyPdfTokens` — typography, radius, spacing tokens

**Assessment:** Extremely minimal. Missing: color tokens, status colors, typography scale, shadows, borders, z-index, responsive breakpoints, semantic token mapping, dark mode.

## 10. Existing Documentation

| Document | Status |
|---|---|
| README.md | Good overview, covers mission, boundaries, v0.1 scope, development rules |
| ARCHITECTURE.md | System model, package boundaries, AI/evidence/timeline/proof architecture, dependency strategy |
| docs/ROADMAP.md | v0.1 through v1.0 roadmap, reasonable phasing |

## 11. Existing TODOs

No explicit TODOs in code. The roadmap implies all of v0.1 is pending implementation.

## 12. Incomplete Implementations

**Everything is incomplete.** All 7 packages contain only type definitions — zero runtime implementations:

- No validation logic
- No state machines
- No utility functions (beyond `createId` and `confidence`)
- No test harness
- No evaluation framework
- No security utilities
- No document processing
- No AI execution logic
- No proof verification
- No fulfillment adapter implementation

## 13. Dependency Graph

```
@mailmypdf/core          ← (no dependencies)
@mailmypdf/documents     ← core
@mailmypdf/intelligence  ← core
@mailmypdf/ai            ← core
@mailmypdf/proof         ← core
@mailmypdf/fulfillment   ← core
@mailmypdf/design-system ← (no dependencies)
```

All packages depend only on `@mailmypdf/core` or nothing. No inter-package dependencies between domain packages (e.g., intelligence doesn't depend on documents, proof doesn't depend on intelligence). This is overly flat — some dependencies are implied by the type contracts but not declared.

## 14. Build Issues

1. **No `outDir` in tsconfig** — `tsc` will emit `.js`/`.d.ts` files next to source files, not to `dist/`
2. **No per-package tsconfig** — packages don't extend root config (no `extends` field)
3. **No `exports` map** — consumers can't reliably import sub-paths
4. **Lock file missing** — `pnpm install` has never been run
5. **`node --test` with no test files** — test script will pass vacuously or error depending on Node version

## 15. Key Observations

1. The platform is a **type-only scaffold** — good conceptual design, zero implementation.
2. The architectural thinking in README.md and ARCHITECTURE.md is sound and aligns with the master directive.
3. The package boundaries are correct in spirit.
4. The `tsconfig.json` strictness settings are appropriate for infrastructure-grade code.
5. No branches exist — all work is on `main`.
6. Commit messages follow conventional commits pattern.
7. The platform has never been built or tested — there is no proof it compiles.
