# Ecosystem Cycle: Timeline Engine Complete

**Date:** 2026-08-15
**Cycle ID:** timeline-engine
**Mode:** SAFE_AUTONOMOUS

## BEFORE (Previous Cycle: Finding Engine)

| Metric | Value |
|---|---|
| Platform Health | 5% (6/14 caps) |
| Intelligence Tests | 263 |
| Total Tests | 414 |

## AFTER (This Cycle: Timeline Engine)

| Metric | Value | Change |
|---|---|---|
| Ecosystem Health | 6% | +0% |
| Platform Health | 6% (7/14 caps) | +1 cap |
| Intelligence Tests | 325 | +62 |
| Total Tests | 476 | +62 |

## What Was Built

### Date Precision Model
- **exact**: precise date from a document
- **approximate**: "circa March 2026"
- **range**: "between March 15 and March 20" (date + dateEnd)
- **unknown**: no date available
- **inferred**: AI or rule inferred the date

### Source Integrity Model (orthogonal to precision)
- **documented**: extracted from a document
- **user_reported**: user entered
- **inferred**: AI or rule derived
- **conflicting**: sources disagree (links to Contradiction)
- **unknown**: source undetermined

### Event Identity / Deduplication
- Deterministic hash: caseId + eventType + date + dateEnd
- Description excluded (same event may be described differently)
- findDuplicateEvents groups potential duplicates, does NOT auto-merge
- Human review required for final deduplication

### Conflicting Dates
- Both events preserved — neither destroyed
- Events can link to Contradiction via contradictionId
- conflictingDates() returns groups of conflicting events

### Ordering
- Deterministic: ISO date comparison, ties broken by eventType
- Unknown dates go last in original order (not invented)
- Stable across repeated executions

### Resource Safety
- MAX_EVENTS_FOR_TIMELINE (500)
- MAX_DATE_LENGTH (30)
- detectGaps excludes unknown/inferred dates

## Capability Status

| Capability | Status | Tests |
|---|---|---|
| Core Primitives | implemented (stable) | 44 |
| Document Engine | implemented (stable) | 80 |
| Intelligence Foundation | implemented (unstable) | 78 |
| Evidence Graph | implemented (unstable) | 68 |
| Contradiction Detector | implemented (unstable) | 47 |
| Finding Engine | implemented (unstable) | 37 |
| Timeline Engine | implemented (unstable) | 62 |
| **Total** | **7/14 caps** | **476** |

## Next Capability Analysis

### Deadline Architecture Audit

Existing deadline logic across verticals:
- **appeal-mail**: timeline.ts (901 lines) has deadline calculation with 60-day rule, business-day calculations, source tracking, reliability assessment
- **immigration-mail**: document-analysis.ts has RFE response deadlines (87 days, 30 days)
- **dispute-mail**: No explicit deadline logic
- **notice-respond**: Response deadlines (30 days, 60 days)

Deadlines should be modeled as: Fact + Event + Rule + Temporal Constraint + Provenance, NOT as another independent subsystem.

The platform provides the machinery. Verticals provide the rules.
