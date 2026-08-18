# WORKFLOW_PROGRESS.md — Production Pipeline Status

**Last Updated:** 2026-08-18
**Total Workflows in Registry:** 47
**Total Workflows in Catalog (Production):** 8

## Status Table

| ID | Workflow | Engine | Vertical | Lifecycle | Tests | UI | Validation | Research | Deployment |
|----|----------|--------|----------|-----------|-------|-----|------------|----------|------------|
| cp2000-response | Respond to IRS CP2000 | document-action | notice-respond | AUTHORITY | 40+ | ✅ Full | ✅ Two-pass + blocking | ✅ 7 IRS sources | ✅ Production |
| cp14-response | Respond to IRS CP14 | document-action | notice-respond | AUTHORITY | 55 | ✅ Full | ✅ Authority gates | ✅ | ✅ Production |
| irs-notice | Respond to IRS Notice | document-action | notice-respond | FUNCTIONAL | ✅ | ✅ | ✅ Generic | — | ✅ Production |
| court-summons | Respond to Court Summons | document-action | notice-respond | FUNCTIONAL | ✅ | ✅ | ✅ Generic | — | ✅ Production |
| agency-action | Respond to Agency Action | document-action | notice-respond | FUNCTIONAL | ✅ | ✅ | ✅ Generic | — | ✅ Production |
| file-appeal | File an Appeal | appeal | notice-respond | FUNCTIONAL | ✅ | ✅ | ✅ Generic | — | ✅ Production |
| cp504-response | Respond to IRS CP504 (Intent to Levy) | document-action | notice-respond | FUNCTIONAL | ✅ 29 tests | ✅ Full | ✅ Generic | — | ✅ Production |
| transunion-dispute | Dispute TransUnion Credit Report | dispute | dispute-mail | FUNCTIONAL | ✅ 26 tests | ✅ Full | ✅ Generic | — | ✅ Production |

### Blueprint Workflows (in registry, not yet implemented)

| Phase | Workflows | Status |
|-------|-----------|--------|
| A — IRS/Tax | CP504, IRS penalty, IRS audit, IRS deficiency, IRS levy, state tax, tax assessment | BLUEPRINT |
| B — Credit/Dispute | ~~TransUnion~~, Experian, Equifax, credit report, hard inquiry, collection, medical collection, debt validation, debt collection, creditor | IN PROGRESS |
| C — Insurance | Claim denial, health, auto, home, roof, workers comp, disability, life, underpayment, reconsideration | BLUEPRINT |
| D — Records | Public records, FOIA, police, court, criminal, arrest, military, birth, marriage | BLUEPRINT |
| E — Immigration | I-797, I-797C, RFE, NOID, USCIS rejection, USCIS denial, evidence, biometrics, interview | BLUEPRINT |
| F — Benefits/Appeals | SSDI, SSI, Social Security, unemployment, Medicaid, SNAP, overpayment, eligibility, reconsideration, hearing | BLUEPRINT |
| G — Court/Formal | Court summons, civil, small claims, debt collection, hearing, admin action, admin appeal, complaint, formal demand | BLUEPRINT |
| H — Tenant | Eviction, pay-or-quit, cure-or-quit, unlawful detainer, lease termination, repair, habitability, mold, security deposit, rent increase, lease violation | BLUEPRINT |
| I — Code/Permit/Property | Code violation, enforcement, NOV, property violation, maintenance, nuisance, zoning, unpermitted, occupancy, safety, compliance, corrective, hearing, appeal, permit, building, plan review, inspection, deficiency | BLUEPRINT |

## Legend
- **BLUEPRINT:** Definition exists in registry, no implementation
- **FUNCTIONAL:** Route exists, extraction + draft + validation + mailing work
- **AUTHORITY:** Gold-standard: provenance, two-pass validation, blocking gates, evidence lifecycle, research, adversarial tests, e2e tests
