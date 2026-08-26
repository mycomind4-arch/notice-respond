# Evidence Migration Plan

**Date:** 2026-08-15
**Status:** Planning (no migrations executed yet)

## Current State

The platform now has `@mailmypdf/intelligence` with a provenance-aware Evidence model:
- `EvidenceItem`: claim + source + relation (supports/contradicts/qualifies/missing) + provenance
- `EvidencePacket`: grouping for a single claim with max 500 items
- `EvidenceEvaluation`: deterministic, explainable scoring (NOT truth)
- Full provenance chain: Document → SourceRef → Entity → Fact → Evidence → Relationship

## Vertical Evidence Implementations

### 1. appeal-mail (STRONGEST — ~400 lines of evidence code)

**Current implementation:** `evidence.ts` with typed evidence:
- EvidenceType: document, excerpt, testimonial, photographic, record, correspondence
- EvidenceLink: links evidence to appeal grounds (supports/contradicts/contextual)
- Used by `xray.ts` for cross-document analysis
- SourceRef for provenance on every evidence item

**Duplicated functionality:**
- EvidenceItem concept (claim + source + relation) — fully duplicated
- EvidenceLink (supports/contradicts) — maps to EvidenceRelation
- Evidence types (document/excerpt/testimonial/etc.) — maps to evidenceType + explanation

**Migration complexity:** MEDIUM
- appeal-mail has 6 evidence types vs platform's 4 (document/fact/entity/external)
- Need to map "excerpt" → evidenceType="document" with excerpt in SourceRef
- Need to map "testimonial"/"photographic"/"record"/"correspondence" → evidenceType="external" or expand types
- EvidenceLink "contextual" doesn't map to platform's 4 relations — may need to add "contextual" relation

**Expected benefit:** Eliminates ~400 lines of duplicate code, unifies with Fact/Relationship/Provenance
**Risks:** appeal-mail's evidence types are richer; may need to extend platform model
**Recommended order:** FIRST — strongest implementation, best test of platform model

### 2. immigration-mail (MODERATE — ~50 lines of evidence-adjacent code)

**Current implementation:** `document-analysis.ts` has extracted dates with source tracking but no explicit evidence model. Dates are facts with source tracking (document/user/inferred/unknown).

**Duplicated functionality:**
- Source tracking on facts (FactSource) — partially overlaps with Evidence
- No explicit evidence linking

**Migration complexity:** LOW
- Map FactSource to provenance levels (document → document_extracted, user → user_provided, inferred → ai_inferred)
- Add evidence items for extracted dates (linking facts to source documents)

**Expected benefit:** Unified provenance, enables evidence evaluation
**Risks:** Low — mostly additive
**Recommended order:** SECOND — low risk, quick win

### 3. dispute-mail (BASIC — no evidence code)

**Current implementation:** No intelligence extraction. Relies on manual user input via workflows.

**Migration complexity:** LOW (additive)
- No existing evidence code to migrate
- Would ADD evidence support using platform model

**Expected benefit:** Enables evidence tracking for disputes
**Risks:** None — purely additive
**Recommended order:** THIRD — easy addition

### 4. notice-respond (BASIC — no evidence code)

**Current implementation:** Similar to dispute-mail. No intelligence extraction.

**Migration complexity:** LOW (additive)
**Expected benefit:** Enables evidence tracking for notice responses
**Risks:** None
**Recommended order:** FOURTH — easy addition

### 5. mailmypdf-smallbusiness (MODERATE — ~50 lines)

**Current implementation:** `ai/skills/analyzeCorrespondence.ts` extracts deadlines, amounts, requested actions with inline regex. No explicit evidence model.

**Migration complexity:** LOW
- Extracted facts would get Evidence items linking them to source documents
- Pattern-matching extraction → document_extracted provenance

**Expected benefit:** Structured evidence tracking for business correspondence
**Risks:** Low
**Recommended order:** FIFTH

### 6. debt-defense (BASIC — no evidence code yet)

**Current implementation:** No evidence code.

**Migration complexity:** LOW (additive)
**Recommended order:** SIXTH

## Key Architectural Decision: Evidence Types

appeal-mail has 6 evidence types (document, excerpt, testimonial, photographic, record, correspondence).
Platform has 4 (document, fact, entity, external).

**Recommendation:** Expand platform evidence types to include:
- "excerpt" → maps to document with excerpt field (already in SourceRef)
- "testimonial" → maps to entity (a person's testimony)
- "photographic" → maps to document (image document)
- "record" → maps to document (official record)
- "correspondence" → maps to document (letter/email)

This can be handled by mapping in the vertical layer, not by expanding the platform model.
The platform's 4 types (document/fact/entity/external) are sufficient as categories.
The specific sub-type can be stored in evidence.explanation or metadata.

## Migration Priority

1. **appeal-mail** — strongest implementation, best validation of platform model
2. **immigration-mail** — quick win, low risk
3. **dispute-mail** — additive, enables new capability
4. **notice-respond** — additive
5. **mailmypdf-smallbusiness** — additive with existing extraction
6. **debt-defense** — additive

## Recommendation

Do NOT migrate immediately. First implement the Contradiction Detector (which builds on Evidence), then migrate appeal-mail as the first vertical integration. This validates the full intelligence stack (Fact → Evidence → Contradiction) before committing to a migration path.
