# Ecosystem Cycle: Evidence Graph Complete

**Date:** 2026-08-15
**Cycle ID:** evidence-graph-foundation
**Mode:** SAFE_AUTONOMOUS

## BEFORE (Previous Cycle: Intelligence Foundation)

| Metric | Value |
|---|---|
| Ecosystem Health | 4% |
| Platform Health | 3% (3/14 caps) |
| Implemented Capabilities | 3 (core, documents, intelligence) |
| Intelligence Tests | 111 |
| Total Tests | 262 |

## AFTER (This Cycle: Evidence Graph)

| Metric | Value | Change |
|---|---|---|
| Ecosystem Health | 5% | +1% |
| Platform Health | 3% (4/14 caps) | +1 cap |
| Implemented Capabilities | 4 (core, documents, intelligence, evidence-graph) | +1 |
| Intelligence Tests | 179 | +68 |
| Total Tests | 330 | +68 |

## What Was Built

### EvidenceItem
- Links a claim (Fact) to supporting/contradicting source material
- Evidence types: document, fact, entity, external
- Relations: supports, contradicts, qualifies, missing
- Full provenance preserved (same ProvenanceRecord system)
- Status: active, retracted, superseded (append-only history)
- Verification, retraction, and supersession operations
- No top-level sourceRefs — source references live in provenance (no duplication with SourceRef)

### EvidencePacket
- Groups evidence items for a single claim
- Max 500 items (resource safety)
- Query functions: supporting, contradicting, qualifying, missing
- Enforces structural invariant: all items for the same claim

### EvidenceEvaluation
- Deterministic, explainable scoring:
  netSupport = Σ (relationStrength × confidence × provenanceWeight)
- NOT a truth score — measures evidence quality and direction
- PROVENANCE_WEIGHT: human_verified=1.0, document_extracted=0.9, external_source=0.7, rule_derived=0.7, user_provided=0.5, ai_inferred=0.3
- AI evidence with high confidence (0.95) still only contributes 0.285 — properly untrusted
- isSupported requires netSupport > 0 AND no contradictions

### Cross-Vertical Validation (6 verticals)
- Appeal Mail: deadline evidence from denial letter, conflicting deadlines from different docs
- Immigration Mail: RFE evidence from USCIS notice, rule-derived deadline
- Dispute Mail: credit report contradiction, supporting bank statement
- Notice Respond: response deadline, missing evidence gap detection
- Small Business: contract terms, AI-inferred evidence (low trust)
- Debt Defense: debt validation, contradictory bank records
- Zero vertical-specific branches in core source

### Security
- AI evidence is not auto-trusted (provenance weight 0.3)
- Max evidence items enforced (500)
- Oversized metadata rejected
- Malformed relations rejected
- Invalid provenance rejected (ai_inferred requires modelId, etc.)

## Provenance Chain Verified
Document → SourceRef → Entity → Fact → Evidence → Relationship → Evaluation

Consumers can answer:
- "What evidence supports this fact?" → evidenceForClaim()
- "Where did this evidence originate?" → evidence.provenance.sourceRefs
- "Was it AI-extracted, human-verified, or directly sourced?" → evidence.provenance.level

## Conflicting Evidence
Both facts and their evidence coexist. System never auto-resolves which is true.
This enables the future Contradiction Engine.

## Next Capability Analysis

| Capability | Impact | Verticals | Deps Ready | Effort | Priority |
|---|---|---|---|---|---|
| Contradiction Detector | 4.5 | 3 | YES (Fact + Evidence) | Low | HIGH |
| Timeline Engine | 6 | 4 | YES (Fact + Entity) | Medium | 3.1 |
| Deadline Engine | 6 | 4 | YES (Fact + rules) | Medium | 3.1 |
| Finding Engine | 4.5 | 3 | YES (Evidence + Fact) | Medium | 1.7 |

### Selection: Contradiction Detector

- Already have `findConflictingFacts()` in Fact model
- Evidence already supports `contradicts` relation
- Formalizing contradictions is small effort with high value
- Directly uses Evidence (just built) to identify which evidence supports each side
- Creates the structure the Contradiction Engine needs without building the full engine
