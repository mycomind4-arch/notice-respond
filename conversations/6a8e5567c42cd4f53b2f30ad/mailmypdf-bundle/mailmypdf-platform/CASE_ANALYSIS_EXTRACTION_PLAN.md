# Case Analysis Extraction Plan

## Forensic Audit Summary

### Vertical Analysis Implementations

**Appeal Mail** (strongest):
- `xray.ts` — X-Ray: cross-document analysis finding issues, gaps, contradictions (deterministic)
- `stress-test.ts` — Adversarial analysis: ground attacks, weakest links, draft vulnerabilities (deterministic)
- `review.ts` — Readiness Review: 16 pass/warning/fail checks before mailing (deterministic)
- All deterministic — no AI required

**Immigration Mail**:
- `document-analysis.ts` — LLM-based structured extraction (OpenAI gpt-4o)
- `analyze-document.ts` — Server function calling OpenAI with system prompt
- `cases.ts` — Basic case CRUD with Supabase
- AI-dependent analysis pipeline

**Notice Respond**:
- Workflow definitions only (irs-notice, court-summons, agency-action, file-appeal)
- No analysis layer

**Dispute Mail**:
- Workflow definitions only (credit-report, debt-validation, billing-error, unauthorized-charge)
- No analysis layer

### Key Finding

All four verticals share identical workflow step patterns:
```
intro → document → facts → objective → draft → review → attachments → recipient → mailing → checkout → submitted
```

Appeal Mail has the strongest analysis layer (Readiness Review, Stress Test, X-Ray) that is
deterministic and synthesizes findings, evidence, and deadlines into actionable output.

The platform already has: Fact, Evidence, Finding, Contradiction, Timeline, Deadline, Risk.
What's MISSING is the synthesis layer that converts these into:
1. A structured case assessment
2. Recommended actions
3. Readiness/completeness checks

## Direction Comparison

### A. Case Analysis (SELECTED)
- Builds on 8 platform capabilities (Documents through Risk)
- Appeal Mail validates the concept (Readiness Review = Case Assessment)
- All verticals need it, none have a generic one
- Deterministic — no AI required
- Creates the bridge: Risk → Assessment → Recommended Actions
- Does NOT duplicate existing primitives — synthesizes them

### B. Action/Workflow Engine (DEFERRED)
- 4 verticals have identical workflow step definitions (massive duplication)
- But workflow execution is in the frontend (step navigation)
- The actual logic is simple (a list of steps)
- An actual engine (state machines, transitions, guards) is premature
- Wait for a second implementation with real state management

### C. AI Platform (DEFERRED)
- Only 1 vertical (immigration-mail) has AI integration
- The `@mailmypdf/ai` package already has the contract interfaces
- Premature extraction — only 1 consumer
- Appeal Mail proves analysis can be deterministic

## Selected Capability: Case Analysis

### Canonical CaseAssessment Model

```typescript
interface CaseAssessment {
  id: PlatformId;
  caseId: string;
  // Overall assessment
  overallStatus: CaseStatus;  // draft, in_review, ready, action_required, submitted, archived
  // Synthesized from the intelligence stack
  riskLevel: RiskLevel;       // from RiskAssessment
  // What's missing / what to do
  readiness: ReadinessResult;
  recommendedActions: readonly RecommendedAction[];
  // Summary
  summary: string;
  // Provenance
  assessedAt: string;
  provenance: ProvenanceRecord;
}
```

### CaseStatus

Not a workflow state machine — a high-level assessment:
- `draft` — early stage, not enough information
- `in_review` — has information, needs review
- `ready` — assessed and ready to proceed
- `action_required` — has critical issues requiring action
- `submitted` — has been submitted/mailed
- `archived` — completed

This is distinct from workflow steps. Workflow steps track WHERE the user is in
the process. CaseStatus tracks the ASSESSMENT of the case's readiness.

### RecommendedAction

```typescript
interface RecommendedAction {
  id: PlatformId;
  actionType: string;         // "address_deadline", "resolve_contradiction", "add_evidence", etc.
  priority: ActionPriority;   // critical, high, medium, low
  description: string;
  // Traceability to underlying intelligence
  relatedFactIds?: readonly PlatformId[];
  relatedFindingIds?: readonly PlatformId[];
  relatedContradictionIds?: readonly PlatformId[];
  relatedDeadlineRuleIds?: readonly string[];
  relatedEvidenceIds?: readonly PlatformId[];
  // What completing this action would achieve
  expectedOutcome: string;
  // Whether this action has been completed
  status: ActionStatus;       // pending, completed, dismissed
  provenance: ProvenanceRecord;
}
```

### ReadinessResult

```typescript
interface ReadinessCheck {
  id: string;
  label: string;
  description: string;
  status: "pass" | "warning" | "fail";
  detail?: string;
  // What to fix if not passing
  fixAction?: string;
}

interface ReadinessResult {
  score: number;              // 0-100
  checks: readonly ReadinessCheck[];
  issuesRequiringAttention: number;
  ready: boolean;            // score >= threshold && no fail checks
}
```

### Relationship to Existing Primitives

- **Risk**: CaseAssessment INCLUDES the RiskLevel from RiskAssessment
- **Findings**: RecommendedActions are DERIVED from unresolved findings
- **Contradictions**: RecommendedActions address unresolved contradictions
- **Deadlines**: RecommendedActions address missed/approaching deadlines
- **Evidence**: ReadinessChecks verify sufficient evidence coverage
- **Timeline**: ReadinessChecks verify timeline completeness

### What Case Assessment Adds (NOT duplicated)

1. **Recommended Actions** — "What should I do?" (new concept)
2. **Readiness Checks** — "Is this case ready to proceed?" (new concept)
3. **Case Status** — High-level assessment (new concept)
4. **Synthesis** — Single view of the entire intelligence stack (new concept)

### AI Boundaries

- Case Assessment computation is DETERMINISTIC
- AI may PROPOSE additional recommended actions, but they require human review
- AI may PROPOSE readiness checks, but deterministic checks take priority
- AI output is treated as proposed intelligence until validated

### Vertical Extension Points

Verticals configure the assessment through:
- Domain-specific readiness checks (registered as configuration)
- Domain-specific recommended action types (registered as configuration)
- Domain-specific case status transitions (configuration, not code)
- NO vertical-specific branches in the platform engine

### Migration Strategy

1. Appeal Mail: Readiness Review → platform ReadinessResult
2. Appeal Mail: Stress Test findings → platform RecommendedActions
3. Immigration Mail: AI analysis output → platform RecommendedActions (AI-proposed)
4. Notice Respond: Add assessment layer (currently has none)
5. Dispute Mail: Add assessment layer (currently has none)

### Implementation Effort

- CaseAssessment model: ~200 lines
- RecommendedAction model: ~150 lines
- ReadinessCheck model: ~100 lines
- Assessment computation: ~200 lines
- Tests: ~500 lines
- Total: ~1150 lines, estimated 1-2 hours

### Smallest Valuable Slice

Implement only:
1. CaseAssessment model (status, summary, readiness, recommended actions)
2. RecommendedAction model (with traceability)
3. ReadinessCheck model (with pass/warning/fail)
4. computeCaseAssessment function (deterministic, synthesizes the stack)
5. Tests

Do NOT implement:
- Full workflow state machine
- AI-proposed actions (yet)
- Case status transitions
- Frontend integration
