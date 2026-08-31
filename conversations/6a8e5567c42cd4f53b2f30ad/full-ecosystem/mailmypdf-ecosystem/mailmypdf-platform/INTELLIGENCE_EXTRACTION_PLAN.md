# INTELLIGENCE EXTRACTION PLAN

## 1. Current Implementations

### appeal-mail (MOST SOPHISTICATED — 2,435+ lines of intelligence code)

**xray.ts** (828 lines): Cross-document analysis with 8 finding types:
- date_conflict, unaddressed_evidence, unsupported_conclusion, contradiction, procedural_issue, factual_discrepancy, missing_reference, strength
- Uses SourceRef for provenance (documentId, documentName, page, excerpt, offset)
- Evidence gap detection with severity and suggested evidence types
- Appeal map visualization (decision → reason → weakness → fact → evidence → ground → outcome)

**timeline.ts** (901 lines): Full timeline reconstruction:
- Event extraction with date patterns (US + ISO formats)
- 5 integrity statuses: documented, user_reported, inferred, conflicting, unknown
- 8 event categories: application, submission, correspondence, hearing, decision, deadline, agency_action, user_action
- Conflict detection (same event, different dates across documents)
- Gap detection (periods with no documented events)
- Deadline calculation with source tracking and reliability assessment

**stress-test.ts** (706 lines): Adversarial analysis:
- Ground attacks (how decision-maker could counter each ground)
- Strength profiles per ground (0-100 score with components)
- Weakest link identification
- Assessment sensitivity (what would change the conclusion)
- Draft vulnerabilities (exaggeration, unsupported_claim, factual_error, missing_qualifier, contradiction)

**decision.ts**: Facts with confidence + source, reasons with cited rules, deadline schema, timeline events, issues.

**evidence.ts**: Typed evidence (document/excerpt/testimonial/photographic/record/correspondence) with links to grounds (supports/contradicts/contextual).

**ground.ts**: Appeal grounds with 8 types (factual_error, procedural_error, legal_error, new_evidence, insufficient_weight, misapplied_rule, contradictory_finding, incomplete_review).

**document-extraction.ts**: Pattern-matching extraction for dates, deadlines, reference numbers, agencies, decision types, appeal instructions, reasons.

### immigration-mail (MODERATE — ~200 lines)

**document-analysis.ts**: Structured analysis with:
- 12 document types (RFE, NOID, biometrics, interview, rejection, approval, denial, etc.)
- 9 agencies (USCIS, DOS, CBP, ICE, NVC, EOIR, SSA, DOL)
- Extracted dates with source tracking (document/user/inferred/unknown)
- Requested actions with deadlines
- Plain English explanation

**analyze-document.ts**: Server-side LLM analysis with structured JSON output.

### dispute-mail (BASIC — ~100 lines)

**workflows.ts**: 4 workflow types, each with document/facts/draft steps. No intelligence extraction — relies on manual user input.

### notice-respond (BASIC — ~80 lines)

**workflows.ts**: Similar to dispute-mail. No intelligence extraction.

### mailmypdf-smallbusiness (MODERATE — ~150 lines)

**ai/skills/analyzeCorrespondence.ts**: Pattern-matching extraction for deadlines, amounts, requested actions from correspondence text.

### mailmypdf (CORE — ~50 lines)

Domain models with LegalReference (citation, description, responseWindowDays). No intelligence extraction.

## 2. Duplicate Implementations

| Concept | appeal-mail | immigration | dispute | notice | small-biz |
|---------|-------------|-------------|---------|--------|-----------|
| Fact | DecisionFact | ExtractedDate | — | — | amounts/deadlines/actions |
| Source tracking | SourceRef | FactSource | — | — | — |
| Date extraction | 2 implementations (extraction.ts + timeline.ts) | — | — | — | inline regex |
| Deadline | DeadlineCalculation | response_deadline | disclaimer text | — | inline regex |
| Evidence | Evidence + EvidenceLink | — | — | — | — |
| Finding | XRayFinding (8 types) | — | — | — | — |
| Conflict | TimelineConflict + DecisionIssue | — | — | — | — |
| Timeline | TimelineEvent (5 statuses, 8 categories) | — | — | — | — |
| Strength/weakness | StressTestResult | — | — | — | — |
| Pattern extraction | document-extraction.ts (6 extractors) | LLM-based | — | — | inline regex |

## 3. Best Existing Implementations

| Criterion | Winner | Why |
|-----------|--------|-----|
| Strongest | appeal-mail xray.ts | 8 finding types, provenance, evidence gaps |
| Most complete | appeal-mail (all 6 files) | Full intelligence stack: facts→evidence→findings→timeline→conflicts→deadlines |
| Safest | appeal-mail | SourceRef on every finding, confidence levels, status tracking |
| Most reusable | appeal-mail SourceRef | Simple, generic, no vertical-specific assumptions |
| Best tested | None | No vertical has intelligence tests |

## 4. Common Domain Concepts

Extracted across all verticals:

1. **Fact** — A single piece of information extracted from a document (label, value, confidence, source)
2. **Evidence** — A document or excerpt that supports or contradicts a claim
3. **Finding** — A cross-document analysis result (conflict, gap, strength, issue)
4. **Timeline Event** — A dated occurrence with integrity status and source documents
5. **Conflict** — A contradiction between two sources about the same claim
6. **Deadline** — A computed date with source tracking and reliability assessment
7. **Source Reference** — A pointer to a specific location in a document (already in @mailmypdf/documents)
8. **Provenance Level** — How the information was obtained (extracted, user_provided, inferred, AI_inferred, rule_derived, human_verified)
9. **Entity** — A named thing mentioned in documents (agency, person, case number)
10. **Relationship** — A typed link between any intelligence objects

## 5. Proposed Canonical Data Model

```
DOCUMENT (from @mailmypdf/documents)
    │
    ├── contains → Fact
    ├── supports → Evidence
    ├── mentions → Entity
    └── establishes → Event

Entity
    │
    └── related_to → Entity

Fact
    │
    ├── supported_by → Evidence
    └── conflicts_with → Fact

Event
    │
    └── related_to → Entity

Finding
    │
    ├── derived_from → Fact
    ├── supported_by → Evidence
    └── concerns → Entity
```

### Core Types

```typescript
// Provenance Level — how information was obtained
type ProvenanceLevel =
  | "user_provided"
  | "document_extracted"
  | "external_source"
  | "rule_derived"
  | "ai_inferred"
  | "human_verified";

// Entity — a named thing mentioned in documents
interface Entity {
  id: PlatformId;
  type: string;       // "agency", "person", "case_number", "address", etc.
  name: string;
  aliases?: string[];
  sourceRefs: SourceRef[];
  provenance: ProvenanceLevel;
  confidence: Confidence;
  createdAt: string;
  updatedAt: string;
}

// Fact — a single piece of information
interface Fact {
  id: PlatformId;
  label: string;       // "Decision Date", "Agency Name", "Deadline"
  value: string;       // "2026-01-15", "USCIS", "30 days"
  sourceRefs: SourceRef[];
  provenance: ProvenanceLevel;
  confidence: Confidence;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Evidence — a document or excerpt that supports/contradicts
interface Evidence {
  id: PlatformId;
  type: EvidenceType;  // "document", "excerpt", "testimonial", "record", etc.
  label: string;
  documentId?: PlatformId;
  excerpt?: string;
  pageRef?: string;
  hash?: string;
  sourceRefs: SourceRef[];
  provenance: ProvenanceLevel;
  createdAt: string;
}

// Relationship — typed link between any intelligence objects
interface Relationship {
  id: PlatformId;
  fromType: "entity" | "fact" | "evidence" | "finding" | "event" | "deadline";
  fromId: PlatformId;
  toType: "entity" | "fact" | "evidence" | "finding" | "event" | "deadline";
  toId: PlatformId;
  type: RelationshipType;
  note?: string;
  provenance: ProvenanceLevel;
  createdAt: string;
}

// Finding — cross-document analysis result
interface Finding {
  id: PlatformId;
  type: FindingType;   // "date_conflict", "contradiction", "gap", "strength", etc.
  title: string;
  description: string;
  whyItMatters: string;
  sourceRefs: SourceRef[];
  claims: { source: SourceRef; text: string }[];
  confidence: Confidence;
  status: "confirmed" | "needs_review" | "dismissed" | "used";
  provenance: ProvenanceLevel;
  createdAt: string;
}

// Timeline Event
interface TimelineEvent {
  id: PlatformId;
  date: string;
  datePrecision: "day" | "month" | "year" | "unknown";
  description: string;
  category: string;
  status: "documented" | "user_reported" | "inferred" | "conflicting" | "unknown";
  sourceRefs: SourceRef[];
  isDeadline: boolean;
  provenance: ProvenanceLevel;
  createdAt: string;
}

// Deadline
interface Deadline {
  id: PlatformId;
  date: string | null;
  source: ProvenanceLevel;
  sourceRef?: SourceRef;
  daysRemaining: number | null;
  hasPassed: boolean;
  isReliable: boolean;
  warning?: string;
  createdAt: string;
}
```

## 6. Proposed Package Boundaries

**Option B (chosen): Single `@mailmypdf/intelligence` package**

```
@mailmypdf/intelligence
├── src/
│   ├── provenance.ts    — ProvenanceLevel, provenance utilities
│   ├── entity.ts        — Entity model, createEntity, validateEntity
│   ├── fact.ts          — Fact model, createFact, validateFact
│   ├── evidence.ts      — Evidence model, EvidenceType, createEvidence
│   ├── relationship.ts  — Relationship model, RelationshipType, createRelationship
│   ├── finding.ts       — Finding model, FindingType, createFinding
│   ├── timeline.ts      — TimelineEvent model, createTimelineEvent
│   ├── conflict.ts      — Conflict model (extends Finding)
│   ├── deadline.ts      — Deadline model, calculateDeadline
│   └── index.ts         — Re-exports
├── tests/
│   ├── entity.test.ts
│   ├── fact.test.ts
│   ├── evidence.test.ts
│   ├── relationship.test.ts
│   ├── finding.test.ts
│   └── provenance.test.ts
└── package.json
```

## 7. API Boundaries

The package exports:
- Types: Entity, Fact, Evidence, Finding, TimelineEvent, Conflict, Deadline, Relationship
- Enums: ProvenanceLevel, EvidenceType, FindingType, RelationshipType
- Factories: createEntity, createFact, createEvidence, createFinding, createTimelineEvent, createDeadline, createRelationship
- Validators: validateEntity, validateFact, validateEvidence, validateFinding
- Utilities: calculateDaysRemaining, isReliableDeadline

Verticals implement:
- Extractors (pattern matching or LLM-based) that produce platform types
- Vertical-specific analysis (appeal grounds, immigration document types)
- UI components that consume platform types

## 8. Vertical Extension Points

Verticals extend by:
1. Defining vertical-specific FindingType values (appeal: `unaddressed_evidence`, immigration: `missing_form`)
2. Defining vertical-specific Entity types (immigration: `USCIS`, appeal: `decision_maker`)
3. Defining vertical-specific Relationship types (appeal: `evidence_for_ground`)
4. Implementing extractors that return platform Fact/Evidence/Finding objects

The platform never imports vertical-specific types. Verticals import platform types.

## 9. Migration Strategy

1. **Phase 1**: Build @mailmypdf/intelligence with Entity, Fact, Relationship, Provenance (first slice)
2. **Phase 2**: Add Evidence, Finding
3. **Phase 3**: Add TimelineEvent, Conflict, Deadline
4. **Phase 4**: Migrate appeal-mail to use @mailmypdf/intelligence types
5. **Phase 5**: Migrate immigration-mail
6. **Phase 6**: Migrate other verticals

Each phase is independently testable and committable. No big-bang migration.

## 10. Testing Strategy

- Unit tests for every type (creation, validation, invalid inputs)
- Provenance tests (every object records its source)
- Relationship tests (typed links, invalid references)
- Cross-vertical validation tests (same model represents appeal, immigration, dispute examples)
- Security tests (AI-inferred objects cannot be promoted to verified without explicit action)

## 11. Security Considerations

- AI-inferred objects must carry `provenance: "ai_inferred"` and cannot be auto-promoted
- All objects are untrusted until verified (verified: false by default)
- SourceRefs must point to real documents (validated at application layer)
- Confidence is separate from provenance (low confidence + human_verified is valid)
- No intelligence object can modify a document — intelligence is read-only over documents

## 12. Provenance Strategy

Every intelligence object answers:
- "What do we know?" → The value/content
- "Where did we get it?" → SourceRefs[]
- "Which document supports it?" → SourceRefs point to DocumentRecord
- "Which page?" → SourceRef.page
- "Was it extracted or inferred?" → ProvenanceLevel
- "Which model produced it?" → Provenance metadata (for AI-inferred)
- "When was it produced?" → createdAt
- "Has it been verified?" → verified: boolean
- "Is there conflicting evidence?" → Relationship with type "conflicts_with"

ProvenanceLevel is NEVER collapsed into a confidence score. They are independent dimensions:
- Provenance = WHERE it came from
- Confidence = HOW SURE we are
- Verified = WHETHER a human confirmed it

## 13. AI Integration Strategy

AI may:
- Extract facts from documents (provenance: "ai_inferred")
- Classify documents (provenance: "ai_inferred")
- Identify possible relationships (provenance: "ai_inferred")
- Identify potential contradictions (provenance: "ai_inferred")
- Propose findings (provenance: "ai_inferred")

AI must NOT:
- Establish authoritative facts (verified must be false for AI output)
- Modify documents
- Create evidence without source references
- Override human-verified information

AI output flow:
```
AI extraction
  → structured schema (platform types)
  → validation (package contracts)
  → provenance assignment (always "ai_inferred")
  → confidence assignment
  → stored as unverified
  → human review (optional)
  → verification (verified: true, provenance: "human_verified")
```

The intelligence layer is usable WITHOUT an LLM for all deterministic operations (relationship creation, deadline calculation, conflict detection).

## 14. Backwards Compatibility Strategy

- @mailmypdf/documents already exports SourceRef — intelligence package re-exports it
- appeal-mail's existing SourceRef, Confidence, and status types are structurally compatible
- Migration is type-by-type: replace vertical-specific types with platform imports
- No runtime changes needed — types are erased at runtime
- Verticals can adopt incrementally (mix platform and local types during transition)
