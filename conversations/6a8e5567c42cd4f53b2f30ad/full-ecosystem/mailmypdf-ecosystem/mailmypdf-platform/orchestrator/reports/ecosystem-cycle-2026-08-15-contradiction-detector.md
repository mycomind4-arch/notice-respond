# Ecosystem Cycle: Contradiction Detector Complete

**Date:** 2026-08-15
**Cycle ID:** contradiction-detector
**Mode:** SAFE_AUTONOMOUS

## BEFORE (Previous Cycle: Evidence Graph)

| Metric | Value |
|---|---|
| Platform Health | 3% (4/14 caps) |
| Intelligence Tests | 179 |
| Total Tests | 330 |

## AFTER (This Cycle: Contradiction Detector)

| Metric | Value | Change |
|---|---|---|
| Platform Health | 4% (5/14 caps) | +1 cap |
| Intelligence Tests | 226 | +47 |
| Total Tests | 377 | +47 |

## What Was Built

### Contradiction Model
- **DetectionType**: CONFIRMED vs POTENTIAL — prevents false positives
  - Singular predicates (deadline, amount, date) → confirmed
  - Multi-valued predicates (address, phone, employer) → potential
  - Unknown predicates → potential (conservative default)
- **Severity**: critical, major, minor
- **ReviewStatus**: unreviewed, reviewed, resolved
- **Resolution**: factA_accepted, factB_accepted, both_preserved, both_rejected
- **Resource safety**: MAX_FACTS_FOR_DETECTION (1000), MAX_PAIRS_PER_GROUP (50)

### False Positive Safety
- `address=123 Main St` vs `address=456 Oak Ave` → POTENTIAL (might be historical change)
- `has_deadline=Sept 15` vs `has_deadline=Sept 20` → CONFIRMED (only one can be right)
- `address=123 Main St` vs `previous_address=456 Oak Ave` → NOT a contradiction (different predicates)

### Cross-Vertical Validation
- Appeal: conflicting deadlines (confirmed, critical)
- Immigration: conflicting filing dates (confirmed, critical)
- Dispute: conflicting debt amounts (confirmed, critical)
- Notice Respond: address conflict (potential, major) — correctly not false positive

### Full Provenance Chain
Document → SourceRef → Fact → Evidence → Contradiction
Consumers can trace both sides of a contradiction to their original documents.

## Capability Status

| Capability | Status | Tests |
|---|---|---|
| Core Primitives | implemented (stable) | 44 |
| Document Engine | implemented (stable) | 80 |
| Intelligence Foundation | implemented (unstable) | 78 |
| Evidence Graph | implemented (unstable) | 68 |
| Contradiction Detector | implemented (unstable) | 47 |
| **Total** | **5/14 caps** | **377** |

## Next Capability Analysis

The question: "What capability can now consume Documents + Intelligence + Evidence + Contradictions and produce meaningful value across the largest number of verticals?"

| Capability | Consumes | Produces | Verticals | Unlocks |
|---|---|---|---|---|
| **Findings** | Facts + Evidence + Contradictions + Entities | Derived conclusions with severity + provenance | 3 | Risk Analysis, Case Analysis |
| Timeline | Facts (dated) | Ordered events + gap detection | 4 | Deadlines |
| Deadlines | Facts + rules | Computed deadline dates | 4 | — |

**Findings is the highest-value next step:**
1. Directly consumes ALL primitives we just built
2. Produces the highest-level analytical output verticals need
3. appeal-mail has 8 finding types in xray.ts (828 lines) — high duplication
4. Unlocks Risk Analysis and Case Analysis
5. Without Findings, the intelligence stack produces raw data but no derived insights

Timeline and Deadlines are parallel capabilities that don't consume Evidence or Contradictions.
