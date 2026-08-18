# Next Action — Continue Workflow Production

**Date:** 2026-08-18
**Status:** CP504 complete (functional), CP2000 + CP14 at authority level

## Completed
- CP2000: AUTHORITY (all P0-P2 gaps fixed, gold-standard pipeline connected)
- CP14: AUTHORITY (existing, with authority gates)
- CP504: FUNCTIONAL (extraction + draft + security + validation + mailing)
- Tests: 525 pass / 0 fail
- Build: succeeds
- Commits: 10 pushed to GitHub main

## Next Priority Workflows

### Phase A — IRS/Tax (continued)
1. IRS audit notice — moderate complexity, high CPC (~$13)
2. IRS notice of deficiency — high value, 30-day deadline
3. IRS levy notice (LT11/FTB 4919) — similar to CP504

### Phase B — Credit/Dispute (high search demand)
4. TransUnion dispute — 12,100 MSV, high demand
5. Experian dispute — 8,100 MSV
6. Equifax dispute — strong demand
7. Credit report error dispute — 6,600 MSV
8. Debt collection dispute — 1,300 MSV, $9 CPC

### Generalization Tasks
- Extract shared extraction pattern (notice type → extraction → facts → draft → validation)
- Create a workflow factory that auto-generates routes from definitions
- Generalize the CP2000 two-pass validation to work with any document type

## Reference
- CURRENT_STATE.md — architecture audit
- WORKFLOW_PROGRESS.md — workflow status table
- src/domain/cp504.ts — newest workflow domain logic
- src/routes/workflows/cp504-response.tsx — newest production route
