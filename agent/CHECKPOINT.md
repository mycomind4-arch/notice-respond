# Checkpoint — CP2000 Workflow Complete

**Date:** 2026-08-18
**Status:** CP2000 workflow fully functional, IRS workflow migrated to runtime

## Completed

### Architecture
- ✅ Catalog-driven workflow architecture (`workflow-catalog.ts` is single source of truth)
- ✅ Workflow runtime state machine (`workflow-runtime.ts` — 308 lines)
- ✅ Draft validator (`draft-validator.ts` — 175 lines)
- ✅ `workflows.ts` is now a thin adapter re-exporting from catalog
- ✅ Notice-type classifier with specific-vs-generic priority

### CP2000 Workflow (Full)
- ✅ Domain logic: `cp2000.ts` — extraction, classification, draft generation (384 lines)
- ✅ Interactive route: `cp2000-response.tsx` — upload, extraction review, facts, draft + validation, review, mailing (638 lines)
- ✅ SEO landing page: `cp2000-seo.tsx` — FAQ, internal links
- ✅ 27 end-to-end tests: extraction, classification, draft, validation, state transitions

### IRS Workflow (Migrated)
- ✅ Migrated from inline state to catalog + runtime
- ✅ Preserved existing form-based UX (manual notice number/type/date entry)
- ✅ Added draft validation with real-time feedback
- ✅ Added upload zone with extractFromText auto-population

### Bug Fixes
- ✅ Classifier: specific IRS types now beat generic `irs_letter` (confidence boost + filtering)
- ✅ Income extraction: handle "You reported income of: $X" pattern
- ✅ Income extraction: require `$` sign for IRS amounts (avoid W-2 confusion)
- ✅ Draft template: section headers match validator expectations

### Documentation
- ✅ AGENTS.md updated with current architecture
- ✅ WORKFLOW_FACTORY.md — step-by-step guide for adding new notice types

## Stats
- **Tests:** 237 pass / 0 fail (up from 197)
- **Test files:** 67 (up from 52)
- **Build:** succeeds
- **Commits:** 5 on main

## Next Steps
1. Add CP14 workflow (balance due — similar to CP2000 but simpler)
2. Add CP504 workflow (intent to levy — urgency-driven)
3. Connect real PDF extraction (pdf.js is wired but needs testing with real notices)
4. Wire MailMyPDF API for actual mailing
5. Add more SEO landing pages for each notice type
6. Consider state tax assessment and court summons workflows
