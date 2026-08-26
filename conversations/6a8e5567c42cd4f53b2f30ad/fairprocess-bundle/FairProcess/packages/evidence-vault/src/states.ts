/**
 * Evidence lifecycle states per product spec §8.1.
 *
 * The vault manages an append-mostly state machine. Original files are
 * immutable once validated; supersession creates a new version, it does
 * not mutate the original.
 */
export const EvidenceState = {
  UPLOADED: "uploaded",
  QUARANTINED: "quarantined",
  VALIDATED: "validated",
  DUPLICATE: "duplicate",
  PROCESSING: "processing",
  PARSED: "parsed",
  REVIEW_REQUIRED: "review_required",
  ACCEPTED: "accepted",
  SUPERSEDED: "superseded",
  RESTRICTED: "restricted",
  ARCHIVED: "archived",
  DELETED_UNDER_POLICY: "deleted_under_policy",
} as const;

export type EvidenceStateValue =
  (typeof EvidenceState)[keyof typeof EvidenceState];

/**
 * Valid state transitions. Keys are the current state, values are the
 * set of states the evidence may transition to.
 *
 * Design notes:
 *  - `uploaded` is the initial state for all new evidence.
 *  - `quarantined` means malware scanning or MIME verification failed;
 *    a human can release it to `validated` or `deleted_under_policy`.
 *  - `duplicate` is terminal — a duplicate is never processed; it links
 *    to the original via a custody event.
 *  - `validated` flows into the processing pipeline.
 *  - `accepted` is the working state for evidence in active use.
 *  - `restricted` / `archived` / `deleted_under_policy` are
 *    retention-management states; `restricted` can be released back
 *    to `accepted` when a legal hold is lifted.
 */
export const EVIDENCE_TRANSITIONS: Readonly<
  Record<EvidenceStateValue, readonly EvidenceStateValue[]>
> = {
  [EvidenceState.UPLOADED]: [
    EvidenceState.QUARANTINED,
    EvidenceState.VALIDATED,
    EvidenceState.DUPLICATE,
    EvidenceState.DELETED_UNDER_POLICY,
  ],
  [EvidenceState.QUARANTINED]: [
    EvidenceState.VALIDATED,
    EvidenceState.DELETED_UNDER_POLICY,
  ],
  [EvidenceState.VALIDATED]: [
    EvidenceState.PROCESSING,
    EvidenceState.REVIEW_REQUIRED,
    EvidenceState.ACCEPTED,
    EvidenceState.RESTRICTED,
    EvidenceState.DELETED_UNDER_POLICY,
  ],
  [EvidenceState.DUPLICATE]: [],
  [EvidenceState.PROCESSING]: [
    EvidenceState.PARSED,
    EvidenceState.REVIEW_REQUIRED,
    EvidenceState.QUARANTINED,
  ],
  [EvidenceState.PARSED]: [
    EvidenceState.REVIEW_REQUIRED,
    EvidenceState.ACCEPTED,
    EvidenceState.RESTRICTED,
  ],
  [EvidenceState.REVIEW_REQUIRED]: [
    EvidenceState.ACCEPTED,
    EvidenceState.RESTRICTED,
    EvidenceState.DELETED_UNDER_POLICY,
  ],
  [EvidenceState.ACCEPTED]: [
    EvidenceState.SUPERSEDED,
    EvidenceState.RESTRICTED,
    EvidenceState.ARCHIVED,
    EvidenceState.DELETED_UNDER_POLICY,
  ],
  [EvidenceState.SUPERSEDED]: [],
  [EvidenceState.RESTRICTED]: [
    EvidenceState.ACCEPTED,
    EvidenceState.ARCHIVED,
    EvidenceState.DELETED_UNDER_POLICY,
  ],
  [EvidenceState.ARCHIVED]: [
    EvidenceState.DELETED_UNDER_POLICY,
  ],
  [EvidenceState.DELETED_UNDER_POLICY]: [],
};

export function isValidTransition(
  from: EvidenceStateValue,
  to: EvidenceStateValue,
): boolean {
  const allowed = EVIDENCE_TRANSITIONS[from] ?? [];
  return allowed.includes(to);
}

export function getNextStates(
  current: EvidenceStateValue,
): readonly EvidenceStateValue[] {
  return EVIDENCE_TRANSITIONS[current] ?? [];
}
