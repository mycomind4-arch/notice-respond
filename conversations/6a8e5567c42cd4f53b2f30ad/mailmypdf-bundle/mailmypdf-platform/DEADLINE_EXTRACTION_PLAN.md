# Deadline Extraction Plan

**Date:** 2026-08-15
**Status:** Planning

## 1. Current Implementations

### appeal-mail (STRONGEST — DeadlineCalculation in timeline.ts)

Deadline computation with:
- 60-day appeal deadline from notice date
- Business-day calculations (excludes weekends)
- Source tracking and reliability assessment
- Deadline type: response_deadline, filing_deadline
- Deadline status: pending, expired, missed

### immigration-mail (MODERATE)

- RFE response deadline: 87 days
- NOID response deadline: 30 days
- Biometrics appointment deadline: variable
- Deadlines embedded in document analysis, not separate

### dispute-mail (NONE)

- No deadline logic — relies on user input

### notice-respond (NONE)

- No deadline logic — relies on user input

### mailmypdf-smallbusiness (BASIC)

- Inline regex extraction for deadlines from correspondence
- No computation — just extraction

### mailmypdf-core

- LegalReference with responseWindowDays
- No computation engine

## 2. Architecture Decision

### Deadlines should NOT be a separate subsystem

Deadlines are best modeled as:

```
Fact (has_deadline = 2026-09-15)
  + TimelineEvent (deadline_expires on 2026-09-15, inferred)
  + Rule (60-day appeal deadline from notice date)
  + TemporalConstraint (must respond by N days from event X)
  + Provenance (rule_derived, ruleId = "60-day-appeal-rule")
```

This avoids creating a competing truth system. Deadlines are facts + rules + temporal constraints.

### Platform vs. Vertical boundary

**Platform provides:**
- TemporalConstraint primitive (event X + N days = deadline Y)
- DeadlineRule (name, description, trigger event, duration, calendar type)
- DeadlineCalculator (computes deadline from trigger + rule)
- Calendar types: calendar-day, business-day
- Holiday calendar interface (vertical provides holidays)

**Vertical provides:**
- Jurisdiction-specific rules (60-day appeal, 30-day response, 87-day RFE)
- Holiday calendars (federal holidays, court holidays)
- Business-day definitions (which days count)
- Domain-specific interpretation (what counts as "filing", what extends a deadline)

## 3. Proposed Data Model

```typescript
interface TemporalConstraint {
  /** The event that triggers the deadline */
  triggerEventType: string;
  /** Number of days from the trigger event */
  days: number;
  /** Calendar type: calendar days or business days */
  calendarType: "calendar" | "business";
  /** Optional holiday calendar ID (vertical-specific) */
  holidayCalendarId?: string;
}

interface DeadlineRule {
  id: string;
  name: string;
  description: string;
  /** The trigger event that starts the clock */
  triggerEventType: string;
  /** Duration from trigger */
  duration: TemporalConstraint;
  /** The resulting deadline event type */
  deadlineEventType: string;
  /** Who defined this rule (vertical/jurisdiction) */
  authority: string;
  /** Rule version */
  version: string;
  /** Provenance */
  provenance: ProvenanceRecord;
}

interface DeadlineResult {
  /** The computed deadline date */
  date: string;
  /** The rule that produced this deadline */
  ruleId: string;
  /** The trigger event that started the clock */
  triggerEventId: PlatformId;
  /** The trigger date */
  triggerDate: string;
  /** Whether any holidays were excluded */
  holidaysExcluded: number;
  /** The temporal constraint applied */
  constraint: TemporalConstraint;
  /** Provenance (rule_derived) */
  provenance: ProvenanceRecord;
}
```

## 4. API Boundaries

Public API (from intelligence index.ts):
- `createTemporalConstraint`, `validateTemporalConstraint`
- `createDeadlineRule`, `validateDeadlineRule`
- `computeDeadline` — computes a deadline from a trigger event + rule
- `computeAllDeadlines` — computes all applicable deadlines for a timeline

## 5. Testing Strategy

- Unit tests: constraint creation, validation, rule creation
- Computation tests: calendar days, business days, with holidays
- Cross-vertical: appeal (60-day), immigration (87-day RFE), notice (30-day)
- Design gate: no vertical-specific branches in computation
- Provenance: every computed deadline traces to its rule and trigger event

## 6. Holiday Calendar Interface

The platform defines a `HolidayCalendar` interface. Verticals provide implementations:

```typescript
interface HolidayCalendar {
  id: string;
  isHoliday(date: string): boolean;
  holidaysInRange(start: string, end: string): string[];
}
```

The platform does NOT hardcode US federal holidays. That's a vertical concern.

## 7. Rule Versioning

Rules are versioned. When a statute changes, a new rule version is created. Old deadlines computed under old rules retain their provenance. This preserves the audit trail.

## 8. Auditability

Every computed deadline can answer:
- What rule produced this deadline?
- What event triggered it?
- What was the trigger date?
- How many days were added?
- Were any holidays excluded?
- What calendar type was used?
- When was the rule defined?
- What version of the rule was applied?

## 9. Implementation Plan

1. Implement TemporalConstraint primitive
2. Implement DeadlineRule with provenance
3. Implement DeadlineCalculator (calendar + business days)
4. Implement HolidayCalendar interface (no concrete calendars)
5. Implement DeadlineResult with full provenance
6. Write tests including cross-vertical validation
7. No vertical-specific logic in the platform

## 10. Migration Strategy

- appeal-mail: DeadlineCalculation → DeadlineRule + DeadlineResult
- immigration: inline deadlines → DeadlineRule + DeadlineResult
- Other verticals: add rules using platform model

## 11. Critical Architectural Boundary

```
Platform:
  Event + Date + Temporal Constraint + Rule Evaluation + Provenance

Vertical:
  Jurisdiction + Statute/Policy + Rule Definition + Domain-specific interpretation
```

This keeps MailMyPDF Platform reusable beyond legal/government mail.
