# Ecosystem Cycle: Finding Engine Complete

**Date:** 2026-08-15
**Cycle ID:** finding-engine
**Mode:** SAFE_AUTONOMOUS

## BEFORE (Previous Cycle: Contradiction Detector)

| Metric | Value |
|---|---|
| Platform Health | 4% (5/14 caps) |
| Intelligence Tests | 226 |
| Total Tests | 377 |

## AFTER (This Cycle: Finding Engine)

| Metric | Value | Change |
|---|---|---|
| Ecosystem Health | 6% | +1% |
| Platform Health | 5% (6/14 caps) | +1 cap |
| Intelligence Tests | 263 | +37 |
| Total Tests | 414 | +37 |

## What Was Built

### Finding Model
- **FindingType**: open-ended string — verticals define their own (date_conflict, missing_document, account_error, etc.)
- **Severity**: critical, major, minor, info
- **Status**: active, superseded, retracted
- **Derivation chain**: factIds, evidenceIds, contradictionIds, entityIds — full traceability
- **Verification**: human review required (AI-proposed findings are NOT authoritative)
- **Resource safety**: MAX_DERIVATION_REFS (50) per reference type

### AI Boundary
- AI may propose findings (provenance: ai_inferred, requires modelId)
- AI findings are NOT verified (verified=false)
- AI findings must NOT be established as authoritative
- Human review is required for verification

### Cross-Vertical Validation
- Appeal: date_conflict (critical) — from contradiction between facts
- Immigration: missing_document (major)
- Dispute: account_error (critical) — AI-proposed, untrusted
- Notice Respond: deadline_approaching (critical)
- Small Business: case_strength (info)

### Full Intelligence Stack
Document → SourceRef → Fact → Evidence → Contradiction → Finding
Consumers can trace a finding back to its source documents.

## Capability Status

| Capability | Status | Tests |
|---|---|---|
| Core Primitives | implemented (stable) | 44 |
| Document Engine | implemented (stable) | 80 |
| Intelligence Foundation | implemented (unstable) | 78 |
| Evidence Graph | implemented (unstable) | 68 |
| Contradiction Detector | implemented (unstable) | 47 |
| Finding Engine | implemented (unstable) | 37 |
| **Total** | **6/14 caps** | **414** |

## Next Capability Analysis

| Capability | Consumes | Verticals | Unlocks | Effort |
|---|---|---|---|---|
| Timeline Engine | Facts (dated) | 4 | Deadlines, Case Analysis | Medium |
| Deadline Engine | Facts + rules | 4 | — | Medium |
| Risk Analysis | Findings + Contradictions | 3 | Case Analysis | Low |

**Timeline Engine is the highest-value next step:**
1. Adds the temporal dimension the intelligence stack is missing
2. 4 verticals need it (highest count among remaining capabilities)
3. appeal-mail's timeline.ts is 901 lines — highest duplication
4. Enables Deadlines (deadlines derive from timeline events)
5. Enables Case Analysis (needs temporal context)
6. Events are facts with dates — natural extension of existing Fact model
