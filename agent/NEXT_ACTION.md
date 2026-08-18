# Next Action — Add CP14 Workflow

**Priority:** High
**Effort:** Medium (CP2000 provides a template)

## Task
Add the CP14 (Balance Due) workflow as the next notice type. This is simpler than CP2000 — it's about acknowledging a balance due and either paying or setting up a payment plan.

## Steps

1. **Classification:** Add `irs_cp14` patterns to `notice-type.ts` (already exists — verify patterns)
2. **Domain logic:** Create `src/domain/cp14.ts` with:
   - `extractCP14(text)` — extract notice number, balance due, due date, tax year
   - `generateCP14Draft(params)` — response letter (acknowledge balance, state payment or dispute)
3. **Catalog entry:** Add `cp14-response` to `workflow-catalog.ts`
4. **Route:** Create `src/routes/workflows/cp14-response.tsx` using the runtime
5. **SEO page:** Create `src/routes/workflows/cp14-seo.tsx`
6. **Tests:** Create `tests/cp14.test.mjs` (follow CP2000 test structure)
7. **Verify:** `npm test && npm run build`

## Reference
- Follow the WORKFLOW_FACTORY.md guide
- CP2000 workflow (`cp2000.ts`, `cp2000-response.tsx`) is the template
- CP14 is simpler: no income mismatch, just balance due + payment/dispute decision
