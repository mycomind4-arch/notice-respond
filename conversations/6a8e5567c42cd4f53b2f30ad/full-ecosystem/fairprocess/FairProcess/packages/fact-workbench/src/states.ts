/**
 * Fact verification lifecycle states per product spec §8.5.
 *
 * Candidate facts move through a review pipeline. Only facts in the
 * "accepted" or "accepted_with_qualification" states may be designated
 * as controlling facts (and only controlling facts may feed the
 * deterministic policy engine).
 */
export const VerificationState = {
  PROPOSED: "proposed",
  ACCEPTED: "accepted",
  ACCEPTED_WITH_QUALIFICATION: "accepted_with_qualification",
  CORRECTED: "corrected",
  REJECTED: "rejected",
  CONTRADICTED: "contradicted",
  SUPERSEDED: "superseded",
  REQUIRES_ADDITIONAL_EVIDENCE: "requires_additional_evidence",
} as const;

export type VerificationStateValue =
  (typeof VerificationState)[keyof typeof VerificationState];

/**
 * Valid state transitions for fact verification.
 *
 * Design notes:
 *  - `proposed` is the initial state for all AI-extracted or manually
 *    entered candidate facts.
 *  - A reviewer can accept, accept with qualification, correct, reject,
 *    or mark as requiring more evidence.
 *  - `corrected` means the reviewer changed the value — the fact is
 *    still usable but the original proposed value is preserved in the
 *    review history.
 *  - `contradicted` means another fact contradicts this one; both remain
 *    visible but neither is controlling until resolved.
 *  - `superseded` means a newer version of this fact has replaced it.
 *  - `rejected` and `superseded` are terminal.
 *  - A reviewer can re-open `contradicted` or `requires_additional_evidence`
 *    back to `proposed` if new evidence arrives.
 */
export const FACT_TRANSITIONS: Readonly<
  Record<VerificationStateValue, readonly VerificationStateValue[]>
> = {
  [VerificationState.PROPOSED]: [
    VerificationState.ACCEPTED,
    VerificationState.ACCEPTED_WITH_QUALIFICATION,
    VerificationState.CORRECTED,
    VerificationState.REJECTED,
    VerificationState.CONTRADICTED,
    VerificationState.REQUIRES_ADDITIONAL_EVIDENCE,
    VerificationState.SUPERSEDED,
  ],
  [VerificationState.ACCEPTED]: [
    VerificationState.CORRECTED,
    VerificationState.REJECTED,
    VerificationState.CONTRADICTED,
    VerificationState.SUPERSEDED,
  ],
  [VerificationState.ACCEPTED_WITH_QUALIFICATION]: [
    VerificationState.ACCEPTED,
    VerificationState.CORRECTED,
    VerificationState.REJECTED,
    VerificationState.CONTRADICTED,
    VerificationState.SUPERSEDED,
  ],
  [VerificationState.CORRECTED]: [
    VerificationState.ACCEPTED,
    VerificationState.ACCEPTED_WITH_QUALIFICATION,
    VerificationState.REJECTED,
    VerificationState.CONTRADICTED,
    VerificationState.SUPERSEDED,
  ],
  [VerificationState.REJECTED]: [],
  [VerificationState.CONTRADICTED]: [
    VerificationState.PROPOSED,
    VerificationState.SUPERSEDED,
  ],
  [VerificationState.SUPERSEDED]: [],
  [VerificationState.REQUIRES_ADDITIONAL_EVIDENCE]: [
    VerificationState.PROPOSED,
    VerificationState.SUPERSEDED,
  ],
};

export function isValidFactTransition(
  from: VerificationStateValue,
  to: VerificationStateValue,
): boolean {
  const allowed = FACT_TRANSITIONS[from] ?? [];
  return allowed.includes(to);
}

export function getNextFactStates(
  current: VerificationStateValue,
): readonly VerificationStateValue[] {
  return FACT_TRANSITIONS[current] ?? [];
}
