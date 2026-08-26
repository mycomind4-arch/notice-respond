# Pre-existing Test Failures (as of 2026-08-26)

Not caused by `validateAppealDraft` wiring pass. Logged separately so they don't get lost.

## 1. Runner mismatch (vitest files run with `node --test`)
**Files:**
- `tests/gold/workflow-31-life-insurance-denial.test.ts`
- `tests/gold-standard/dental-insurance-appeal.test.ts`
- `tests/insurance-denial-letter-gold.test.ts`
- `tests/out-of-network-denial-gold.test.ts`
- `tests/workflow-26-medical-insurance-denial-gold.test.ts`
- `tests/workflow-28-prior-authorization-denial-gold.test.ts`
- `tests/workflows/dental-insurance-appeal-gold.test.ts`
- `tests/court-ruling-gold.test.ts`

**Error:** `TypeError: Cannot read properties of undefined (reading 'config')` from `@vitest/runner`
**Cause:** These are vitest test files (use `describe`/`it` from vitest) but were run with `node --import tsx --test` (wrong runner). When run with `npx vitest run`, most pass.
**Fix:** Run these with `npx vitest run` instead of `node --test`.

## 2. Pricing value drift
**Files:**
- `src/domain/medical-necessity-appeal-gold.test.ts` — `assert.ok(MEDICAL_NECESSITY_PRICING.supportingPagePrice > 0)` fails (value is 0 or undefined)
- `tests/administrative-decision-appeal-gold.test.ts` — expects `/32\.99/` in frontend route source, not found

**Cause:** Domain pricing definitions drifted from what tests expect.
**Fix:** Either update the pricing constants or update the test expectations.

## 3. Prompt string drift
**Files:**
- `src/domain/life-insurance-denial-certification.test.ts` — expects `workflow.workflowPrompt` to contain `"life-insurance denial"`, actual prompt uses different wording
- `src/domain/reconsideration-gold.test.ts` — expects a workflow property that is `undefined`

**Cause:** Workflow prompt text was updated but tests weren't updated to match.
**Fix:** Update test assertions to match current prompt text, or update prompts to match tests.
