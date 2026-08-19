# Next Action — Milestone 6: CP14 Factory Parity

**Date:** 2026-08-18
**Status:** Milestone 5 (CP2000 factory parity) COMPLETE. 742 tests pass.

## Current State

- CP2000 factory parity: COMPLETE (42/42 focused tests)
- Full regression: 742/742 pass
- Build: PASS
- Branch: main, synchronized with GitHub
- Commits: 2bf21179 (latest)

## Next Vertical: CP14

### Known issues to fix during CP14 parity

1. CP14 validation severity type mismatch — `cp14-validation.ts` uses `"block"` severity but `CP14ValidationFinding` type only allows `"error" | "warning" | "info"`. Same fix as CP2000: widen the type.

### Implementation steps (copy CP2000 pattern)

1. Inspect `src/domain/cp14*.ts` modules — identify extraction, validation, discrepancy, evidence, strategy, draft functions
2. Map existing capabilities into `ExecutableDomainPack` interface
3. Add only required type adapters (copy `toValidationFinding`, `toRuntimeDiscrepancy`, etc. from CP2000 adapter)
4. Register CP14 pack in `pack-registry.ts`
5. Add CP14 workflow to workflow catalog
6. Construct executable workflow through existing factory
7. Copy `tests/factory-cp2000-parity.test.mjs` structure → create `tests/factory-cp14-parity.test.mjs`
8. Run focused tests → fix failures → run full regression → build
9. Commit: `feat: complete CP14 executable factory parity`

### Do NOT

- Redesign the factory or executable-pack architecture
- Introduce generic refactors unless a failing test requires them
- Weaken validation to make the workflow complete
- Start implementing other verticals during CP14 parity

## Reference Implementation

- `src/domain/runtime/cp2000-executable-pack.ts` — the adapter to copy
- `tests/factory-cp2000-parity.test.mjs` — the parity test to copy
- `agent/CHECKPOINT.md` — full milestone 5 record
