# Ecosystem Cycle: Intelligence Foundation Complete

**Date:** 2026-08-15
**Cycle ID:** intelligence-foundation
**Mode:** SAFE_AUTONOMOUS

## BEFORE (Previous Cycle: Documents Complete)

| Metric | Value |
|---|---|
| Ecosystem Health | 4% |
| Platform Health | 2% |
| Implemented Capabilities | 2/14 (core, documents) |
| Intelligence State | Scaffolded (placeholder types, no tests) |
| Intelligence Tests | 0 |
| Total Tests | 151 (44 core + 80 documents + 27 orchestrator) |

## AFTER (This Cycle: Intelligence Foundation)

| Metric | Value | Change |
|---|---|---|
| Ecosystem Health | 4% | +0% (no vertical integration yet) |
| Platform Health | 3% | +1% (3/14 caps implemented) |
| Implemented Capabilities | 3/14 (core, documents, intelligence) | +1 |
| Intelligence State | Implemented (provenance, entity, fact, relationship) | Foundation complete |
| Intelligence Tests | 111 | +111 |
| Total Tests | 262 (44 + 80 + 111 + 27) | +111 |

## What Was Built

### Provenance (src/provenance.ts)
- 6 provenance levels: user_provided, document_extracted, external_source, rule_derived, ai_inferred, human_verified
- Strength ordering for conflict resolution
- Verification chain (only human_verified can promote)
- Source reference tracking (Document → SourceRef → Intelligence Object)
- Provenance is NEVER collapsed into confidence — they are independent dimensions

### Entity (src/entity.ts)
- Generic typed thing with open-ended type field (no vertical-specific entity types)
- Aliases, metadata, status (active/merged/deprecated)
- Stable identity across modifications
- Merge and deprecate operations
- Name matching (primary + aliases, case-insensitive)

### Fact (src/fact.ts)
- Subject + predicate + value + provenance
- Append-only history via supersession (old facts preserved, not destroyed)
- Dispute tracking (conflicting facts coexist)
- Retraction (preserved for audit, just marked)
- Conflict detection (same subject/predicate, different values)
- Status: active, superseded, retracted, disputed

### Relationship (src/relationship.ts)
- Directed, typed links between any intelligence objects
- Cross-type support (entity→fact, fact→fact, etc)
- BFS graph traversal with cycle detection and depth limits
- Duplicate detection with provenance-aware deduplication
- Retraction support

### Cross-Vertical Validation
- Appeal Mail: Person→submitted→Decision, Agency→issued→Decision, Decision→establishes→Deadline
- Immigration Mail: Agency→issued→Notice, Notice→concerns→Applicant, Notice→requires→Form
- Dispute Mail: Customer→disputes→Account, Bureau→reported→Account
- Design Gate: Zero vertical-specific branches in core source
- All three verticals use the same createEntity/createFact/createRelationship calls

### Serialization & Safety
- JSON round-trip tests for all primitives
- Traversal safety: 1000-node graph completes in <100ms
- maxDepth limits prevent infinite traversal

## Capability Status After This Cycle

| Capability | Status | Tests | Notes |
|---|---|---|---|
| Core Primitives | implemented (stable) | 44 | Branded types, Result, validation |
| Document Engine | implemented (stable) | 80 | Full lifecycle, security, versioning |
| Intelligence Primitives | implemented (unstable) | 111 | Foundation: provenance, entity, fact, relationship |
| AI Platform | planned | 0 | Depends on intelligence |
| Proof & Audit | planned | 0 | Depends on intelligence |
| Fulfillment Adapter | planned | 0 | |
| Design System | planned | 0 | Tokens exist, not a capability yet |
| Evidence Graph | not-started | 0 | Depends on intelligence (NOW READY) |
| Deadline Engine | not-started | 0 | Depends on intelligence (NOW READY) |
| Timeline Engine | not-started | 0 | Depends on intelligence (NOW READY) |
| Finding Engine | not-started | 0 | Depends on intelligence + evidence |
| Contradiction Detector | not-started | 0 | Depends on intelligence (NOW READY) |

## Key Architectural Decisions

1. **Provenance is first-class, not metadata.** Every intelligence object carries a ProvenanceRecord. This prevents downstream AI from losing the connection between claims and sources.

2. **Append-only history.** Facts are never deleted — they are superseded, disputed, or retracted. This preserves the full audit trail for legal/procedural analysis.

3. **Confidence ≠ Provenance.** Confidence (how sure) is independent from provenance (where from). An AI can be 95% confident about something extracted from a document, but the provenance records that it was AI-inferred, not document-extracted.

4. **No vertical-specific branches.** The same primitives work for appeal, immigration, dispute, and any future vertical. Entity types, fact predicates, and relationship types are all open-ended strings.

5. **Graph traversal without a graph database.** BFS traversal works in-memory on arrays of relationships. Cycle detection and depth limits prevent resource exhaustion.

## Next Capability Analysis

### Candidates (now that intelligence foundation is ready)

| Capability | Impact | Verticals | Duplication | Dependency Ready | Effort | Priority |
|---|---|---|---|---|---|---|
| Evidence Graph | 9 | 6 | 8.9 | YES | 7 | 6.9 |
| Deadline Engine | 6 | 4 | 9.7 | YES | 7 | 3.1 |
| Timeline Engine | 6 | 4 | 7.8 | YES | 7 | 3.1 |
| Contradiction Detector | 4.5 | 3 | 6.5 | YES | 7 | 1.7 |
| Finding Engine | 4.5 | 3 | 7.2 | NO (needs evidence) | 7 | 1.7 |

### Selection: Evidence Graph

Evidence Graph is the clear next choice:
- **Highest impact** (9) and **most verticals affected** (6)
- **Highest duplication score** (8.9) — eliminates the most duplicated code
- **Dependency is now ready** — builds directly on Fact, Relationship, Entity, SourceRef
- **Smallest useful capability that proves the graph has real value** — evidence linking is the core value proposition of the intelligence graph
- **Unlocks Finding Engine** — findings require evidence links

### Evidence Graph Scope (Minimal Viable)

1. **EvidenceItem**: A fact (claim) + source reference + relationship type (supports/contradicts/qualifies) + confidence + provenance
2. **EvidencePacket**: Collection of evidence items for a specific claim
3. **Evidence evaluation**: Compute overall support strength (weighted by confidence and provenance)
4. **Cross-vertical fixtures**: Appeal (evidence for appeal grounds), Immigration (evidence for RFE response), Dispute (evidence for dispute claim)

This naturally consumes: Documents (SourceRef), Entities, Facts, Relationships
And produces: Evidence items with full provenance that any vertical can use.
