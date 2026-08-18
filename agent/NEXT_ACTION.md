# Next Action — P2 Gaps + Generalize

**Priority:** High
**Effort:** Medium

## Immediate: P2 Gaps for CP2000 Authority

1. **P2-8: Show research sources** — Display `getCP2000ResearchPack()` sources in extraction or objective phase (7 verified IRS.gov sources)
2. **P2-9: Show draft provenance** — Call `buildDraftProvenance()` and display assertion-to-fact mapping in draft phase
3. **P2-12: Show fact source excerpts** — Add expandable source excerpt per fact in extraction review
4. **P2-13: Route-level security tests** — Test that malicious input is classified/rejected

## After P2: Generalize Gold Standard

5. Extract shared platform capabilities:
   - Deadline engine (deadline.ts) → shared
   - Evidence lifecycle (evidence.ts) → shared
   - Contradiction engine (contradiction.ts) → shared
   - Finding model (finding.ts) → shared
   - Source provenance (source-provenance.ts) → shared
   - Draft provenance (draft-provenance.ts) → shared
   - Validation framework → shared (generalize cp2000-validation.ts pattern)

6. Make workflow factory runtime-connected:
   - Call `constructWorkflow()` at route initialization
   - Use domain packs from factory
   - Validate workflow readiness at startup

7. Build Phase A workflows (IRS/Tax):
   - CP504 (intent to levy)
   - IRS penalty notice
   - IRS audit notice
   - IRS notice of deficiency
   - IRS levy notice

## Reference
- CURRENT_STATE.md — full architecture audit
- docs/CP2000_GAP_MATRIX.md — original gap analysis (P0-P2 now fixed)
- src/domain/cp2000-validation.ts — two-pass validation (now connected)
- src/domain/cp2000-discrepancy.ts — discrepancy analysis (now connected)
- src/domain/cp2000-evidence.ts — evidence checklist (now connected)
- src/domain/cp2000-strategy.ts — CP2000 strategy (now connected)
