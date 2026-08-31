# Findings Extraction Plan

**Date:** 2026-08-15
**Status:** Planning

## 1. Current Implementations

### appeal-mail (STRONGEST — 828 lines in xray.ts)

**XRayFinding** with 8 finding types:
- `date_conflict` — two documents specify different dates for the same event
- `unaddressed_evidence` — evidence exists that wasn't considered in the decision
- `unsupported_conclusion` — conclusion lacks supporting evidence
- `contradiction` — facts within the document contradict each other
- `procedural_issue` — procedural error in the process
- `factual_discrepancy` — facts don't match known records
- `missing_reference` — required reference is missing
- `strength` — identifies a strong point in the case

**Key features:**
- SourceRef on every finding (documentId, page, excerpt)
- Confidence levels
- Status tracking
- Evidence gap detection with severity
- Appeal map visualization (decision → reason → weakness → fact → evidence → ground → outcome)

### immigration-mail (MODERATE — ~100 lines)

**document-analysis.ts** has structured analysis with:
- 12 document types (RFE, NOID, biometrics, interview, etc.)
- Extracted dates with source tracking
- Requested actions with deadlines
- Plain English explanation

No explicit "finding" concept — analysis is embedded in document analysis.

### dispute-mail, notice-respond, small-business, debt-defense

No finding/analysis implementations. Would benefit from adding findings.

## 2. Duplicate Implementations

| Concept | appeal-mail | immigration | others |
|---------|-------------|-------------|--------|
| Finding | XRayFinding (8 types) | implicit (analysis) | none |
| Source tracking | SourceRef | FactSource | none |
| Severity | finding.severity | — | none |
| Status | finding.status | — | none |

## 3. Best Existing Implementation

**appeal-mail xray.ts** is the strongest:
- 8 finding types cover the main analytical categories
- SourceRef on every finding (provenance preserved)
- Confidence levels and status tracking
- Evidence gap detection

## 4. Common Domain Concepts

Across all verticals, a "Finding" represents:
1. **A derived conclusion** — not raw data, but an interpretation
2. **Based on facts** — derived from what we know
3. **Supported by evidence** — backed by source material
4. **Affected by contradictions** — may be weakened by conflicting information
5. **Concerns entities** — about specific people, organizations, accounts
6. **Has severity** — some findings are critical, others are informational
7. **Needs provenance** — where did this finding come from? AI or human?
8. **Needs verification** — AI-proposed findings need human review

## 5. Proposed Canonical Data Model

```typescript
interface Finding extends IntelligenceObject {
  readonly findingType: string;           // open-ended — verticals define types
  readonly severity: FindingSeverity;      // critical, major, minor, info
  readonly status: FindingStatus;         // active, superseded, retracted
  readonly factIds: readonly PlatformId[];     // facts this finding derives from
  readonly evidenceIds: readonly PlatformId[];  // evidence supporting this finding
  readonly contradictionIds: readonly PlatformId[]; // contradictions affecting it
  readonly entityIds: readonly PlatformId[];    // entities this finding concerns
  readonly explanation?: string;           // human-readable summary
  readonly recommendedAction?: string;     // suggested next step
  readonly supersededBy?: PlatformId;     // if superseded
}
```

### Finding Severity
- `critical` — directly affects case outcome (e.g., missed deadline)
- `major` — needs resolution before proceeding (e.g., factual discrepancy)
- `minor` — note for the record (e.g., missing reference)
- `info` — informational strength or observation

## 6. Proposed Package Boundaries

Findings live in `@mailmypdf/intelligence` (same package as Fact, Evidence, Contradiction). They are a higher-level intelligence primitive that consumes the lower-level ones.

No separate package — Findings are tightly coupled to Facts, Evidence, and Contradictions.

## 7. API Boundaries

Public API (from index.ts):
- `createFinding`, `validateFinding`, `verifyFinding`
- `supersedeFinding`, `retractFinding`
- `findingsForEntity`, `findingsForFact`
- `criticalFindings`, `unresolvedFindings`

## 8. Vertical Extension Points

Finding types are open-ended strings. Verticals define their own:
- Appeal Mail: `date_conflict`, `unaddressed_evidence`, `unsupported_conclusion`, etc.
- Immigration: `missing_document`, `deadline_approaching`, `eligibility_issue`
- Dispute: `account_error`, `unverifiable_claim`, `statute_violation`

The platform NEVER validates against a fixed list of finding types.

## 9. Migration Strategy

1. Implement platform Finding model
2. Map appeal-mail's XRayFinding to platform Finding:
   - XRayFinding.type → Finding.findingType
   - XRayFinding.severity → Finding.severity (may need mapping)
   - XRayFinding.sourceRefs → Finding.provenance.sourceRefs
   - XRayFinding.confidence → Finding.confidence
3. Other verticals ADD findings using platform model

## 10. Testing Strategy

- Unit tests: create, validate, verify, supersede, retract
- Serialization: JSON round-trip
- Cross-vertical: appeal, immigration, dispute, notice scenarios
- Design gate: no vertical-specific branches
- Security: AI findings are untrusted, oversized fields rejected

## 11. Security Considerations

- AI-proposed findings have ai_inferred provenance (weight 0.3) — NOT authoritative
- Finding type is length-limited (prevents injection)
- Explanation is length-limited
- Entity/fact/evidence/contradiction IDs are validated
- Max derivation references (prevent resource exhaustion)

## 12. Provenance Strategy

Every Finding has:
- Provenance (how the finding was produced: AI, rule, human)
- Source references (which documents)
- Derivation references (which facts, evidence, contradictions)
- Confidence (how sure)
- Verified (whether a human confirmed it)

A consumer can answer: "What facts support this finding? What evidence? What contradictions affect it?"

## 13. AI Integration Strategy

AI may:
- Propose findings (provenance: ai_inferred, requires modelId)
- Suggest finding types
- Generate explanations (length-limited, not authoritative)

AI must NOT:
- Establish findings as authoritative
- Set verified=true
- Override human resolution

AI output flows through:
AI → structured schema → validation → provenance (ai_inferred) → confidence → human review → stored result

## 14. Backwards Compatibility Strategy

The Finding model is additive — no existing code breaks. appeal-mail can continue using XRayFinding while gradually migrating to platform Finding.
