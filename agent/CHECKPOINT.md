# Checkpoint — Milestone 5: CP2000 Factory Parity COMPLETE

**Date:** 2026-08-18
**Status:** CP2000 executable factory parity achieved. Generic pipeline proven.

## Milestone 5 — COMPLETE

### What was built

- `src/domain/runtime/cp2000-executable-pack.ts` — Executable adapter mapping CP2000 domain logic into `ExecutableDomainPack`
- `src/domain/runtime/factory-construction.ts` — Factory that constructs executable workflows from workflow definitions
- `tests/factory-cp2000-parity.test.mjs` — 42 parity tests covering pack resolution, extraction, validation, discrepancy, evidence, draft, factory construction, full pipeline, and negative cases

### What was fixed

- CP2000 `CP2000ValidationFinding.severity` widened to include `"block"` (in `cp2000-case.ts`)
- Runtime `ValidationFinding.severity` widened to include `"block"` (in `runtime/types.ts`)
- Adapter `toValidationFinding` parameter type aligned with widened severity
- Pipeline extension stages (`reviewBoundary`, `approvalBoundary`, `submissionBoundary`, `proofTrackingBoundary`, `provenance`, `analysis`) always report `skipped` even when pipeline is blocked — they are unimplemented framework extension points, not failed stages
- `setCaseAnalysis()` call corrected (2 args, not 4)
- `setCaseDraft()` call corrected (passes `ResponseDraft` object, not string)
- `WorkflowDefinition` → `MasterWorkflowDefinition` import fix in pipeline.ts and factory-construction.ts
- Type adapter mappings: `toRuntimeDiscrepancy()`, `toRuntimeEvidenceItem()`, `mapEvidenceState()`

### Correct behavior preserved

- Pipeline correctly blocks when requirement validation finds unresolved issues on auto-generated draft
- BLOCK never becomes approval
- Extension stages are `skipped`, not `blocked`

### Deferred intentionally

- `BaseExtraction.taxYear` generic refactor — re-extraction from raw text is acceptable
- Non-CP2000 `classificationConfidence` behavior — `isCP2000` flag is the discriminator
- CP14 `"block"` severity mismatch — known technical debt, same pattern as CP2000 fix

### Stats

- CP2000 focused parity tests: 42/42 pass
- Full regression suite: 742/742 pass
- Build: PASS
- Commits: 3 pushed to GitHub main (8d8c7245, 5196db90, 2bf21179)
- Branch: main, synchronized with origin

## Canonical vertical factory pattern

```text
existing vertical intelligence
        ↓
executable adapter
        ↓
type mappings
        ↓
factory
        ↓
parity tests
        ↓
full workflow pipeline
        ↓
regression suite
```

## Next: CP14 or next highest-priority vertical

- Reuse CP2000 factory/parity pattern — do not redesign architecture
- Known CP14 issue: CP14 validation severity also needs `"block"` (same fix as CP2000)
- Inspect target domain modules → map into ExecutableDomainPack → add type adapters → construct via factory → copy parity test structure → run focused + regression → stop when green
