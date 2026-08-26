# CI and Type-Safety Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen FairProcess repository assurance without changing product behavior, policy rules, or the human-review boundary.

**Architecture:** Retain the existing `IsoDate` boundary in case-model while preserving runtime date validation for untrusted policy and audit inputs. Make every TypeScript package clean compiler-managed outputs before compiling, enforce the build/test contract with a root regression test, and extend CI with repository-wide static checks, pinned secret scanning, dependency auditing, the PostgreSQL migration lifecycle, existing security tests, and a final clean build.

**Tech Stack:** Node.js 22, TypeScript 5.9, pnpm 11.7, Node test runner, PostgreSQL 17, Gitleaks 8.30.1, GitHub Actions.

## Global Constraints

- No new UI.
- No new policy rules.
- No deployment-provider selection.
- No change to the human-review or legal-safety boundary.
- Dependency exceptions require an advisory identifier, rationale, owner, and expiration date.
- Secret-scan exceptions require a narrow fingerprint or path-specific justification; broad rule disabling is prohibited.

---

### Task 1: Date-only boundary review

**Files:**
- Review: `packages/case-model/src/index.ts`
- Review: `packages/policy-engine/src/index.ts`
- Review: `packages/audit-engine/src/index.ts`

**Interfaces:**
- Preserves: `IsoDate` for date-only values in the shared case-model contract.
- Preserves: runtime validation for untrusted strings entering policy and audit parsers.

- [x] Confirm case-model already uses `IsoDate` where compile-time guarantees improve consumer contracts.
- [x] Confirm policy and audit inputs require runtime validation because JSON, CSV, and API values are untrusted strings.
- [x] Avoid a new package dependency or circular coupling solely to rename validated parser inputs.

### Task 2: Clean build and dist-test contract

**Files:**
- Modify: `tsconfig.json`
- Create: `test/dist-contract.test.mjs`
- Modify: every compiled `packages/*/package.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces: compiler-managed clean builds using `tsc -b --clean` followed by a forced build.
- Produces: a regression test that fails if a testable package stops rebuilding clean artifacts before tests.

- [x] Enable TypeScript build mode across package configurations.
- [x] Make every compiled package clean and force-build compiler outputs.
- [x] Add the regression test covering compiled and testable packages.
- [x] Ignore TypeScript build metadata.
- [ ] Run package and root tests in CI.

### Task 3: Repository-wide static and security controls

**Files:**
- Create: `scripts/lint-javascript.mjs`
- Create: `.gitleaks.toml`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: `pnpm lint`, `pnpm audit:dependencies`, and a pinned Gitleaks CI step.

- [x] Add recursive JavaScript syntax validation while TypeScript remains covered by workspace typechecking.
- [x] Add a production-dependency audit that blocks high and critical advisories.
- [x] Add full-history Gitleaks scanning with version 8.30.1.
- [x] Preserve migration up/down/up, authentication, tenant, audit-chain, web, n8n, test, and final-build gates.

### Task 4: Documentation and verification

**Files:**
- Create: `docs/security/ci-controls.md`
- Modify: `README.md`

**Interfaces:**
- Produces: documented thresholds, exception lifecycle, test artifact contract, and CI coverage map.

- [x] Document each control and its failure policy.
- [x] Link the controls from the root README.
- [ ] Open a pull request tied to issue #9.
- [ ] Require a successful CI run before merge and close issue #9 only after the merged-main run is successful.
