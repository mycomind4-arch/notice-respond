import { randomUUID } from "node:crypto";
import {
  VerificationState,
  isValidFactTransition,
  type VerificationStateValue,
} from "./states.js";

/**
 * Fact types — the kind of data a fact represents.
 * Per spec §8.5, these include dates, parties, APNs, instrument numbers,
 * monetary amounts, and other procedural data points.
 */
export type FactType =
  | "service_date"
  | "finality_date"
  | "appeal_deadline"
  | "hearing_date"
  | "instrument_number"
  | "apn"
  | "owner_identity"
  | "monetary_amount"
  | "case_number"
  | "party_name"
  | "address"
  | "document_date"
  | "recorded_date"
  | "property_description"
  | "violation_description"
  | "penalty_amount"
  | "other";

/**
 * Data type for the fact value.
 */
export type DataType = "string" | "date" | "apn" | "number" | "boolean";

/**
 * Extraction method per spec §8.5.
 */
export type ExtractionMethod = "manual" | "ocr" | "native_text" | "api_import" | "model_extraction";

/**
 * A source reference linking a fact to its evidence.
 * Per spec §8.5: source document, source page, bounding box or text
 * location, supporting excerpt.
 */
export interface FactSource {
  documentId: string;
  page?: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  textLocation?: { startOffset: number; endOffset: number };
  excerpt: string;
  extractionMethod: ExtractionMethod;
  modelVersion?: string;
  promptVersion?: string;
  confidence: number;
}

/**
 * A candidate fact — the central data structure of the workbench.
 * Per spec §8.5, each candidate fact must contain:
 * fact type, proposed value, normalized value, source document, source
 * page, bounding box/text location, supporting excerpt, extraction
 * method, model version, prompt version, confidence score,
 * contradictory candidates, verification state, reviewer, review
 * timestamp, reviewer note.
 */
export interface CandidateFact {
  id: string;
  tenantId: string;
  caseId: string;
  factType: FactType;
  dataType: DataType;
  proposedValue: string;
  normalizedValue: string;
  currentValue: string;
  sources: FactSource[];
  verificationState: VerificationStateValue;
  confidence: number;
  contradictoryFactIds: string[];
  reviewer: string | null;
  reviewedAt: string | null;
  reviewerNote: string | null;
  isControlling: boolean;
  supersededBy: string | null;
  modelVersion: string | null;
  promptVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * A fact review — an immutable record of a reviewer action.
 * Per spec §8.5, reviewer actions include: accept, reject, edit, add
 * source, mark ambiguous, request another document, create a
 * discrepancy, escalate to legal review, designate as controlling
 * fact, remove controlling status.
 */
export type ReviewAction =
  | "accept"
  | "reject"
  | "edit"
  | "add_source"
  | "mark_ambiguous"
  | "request_document"
  | "create_discrepancy"
  | "escalate_legal"
  | "designate_controlling"
  | "remove_controlling";

export interface FactReview {
  id: string;
  factId: string;
  action: ReviewAction;
  reviewer: string;
  previousValue: string | null;
  newValue: string | null;
  previousState: VerificationStateValue;
  newState: VerificationStateValue;
  note: string | null;
  addedSource: FactSource | null;
  linkedDiscrepancyId: string | null;
  createdAt: string;
}

/**
 * Input for proposing a new candidate fact.
 */
export interface ProposeInput {
  caseId: string;
  factType: FactType;
  dataType: DataType;
  proposedValue: string;
  normalizedValue?: string;
  source: FactSource;
  confidence?: number;
}

/**
 * Input for a reviewer action.
 */
export interface ReviewInput {
  factId: string;
  action: ReviewAction;
  reviewer: string;
  note?: string;
  correctedValue?: string;
  additionalSource?: FactSource;
  discrepancyId?: string;
}

/**
 * Configuration.
 */
export interface FactWorkbenchConfig {
  tenantId: string;
}

/**
 * The Fact Verification Workbench — manages the full lifecycle of
 * candidate facts from AI extraction through human verification to
 * controlling fact designation.
 *
 * Key principles (spec §8.5):
 *  - AI proposes; humans verify; only controlling facts feed policy
 *  - Every review action is recorded as an immutable FactReview
 *  - Contradictory facts are tracked and must be resolved
 *  - Superseded facts are preserved for audit
 *  - The original proposed value is never overwritten — corrections
 *    create a review record with the previous and new values
 */
export class FactWorkbench {
  private readonly tenantId: string;
  private readonly facts: Map<string, CandidateFact> = new Map();
  private readonly reviews: FactReview[] = new Map() as unknown as never;

  constructor(config: FactWorkbenchConfig) {
    this.tenantId = config.tenantId;
    // Reviews are an array, not a map — we push to it
    (this as unknown as { reviews: FactReview[] }).reviews = [];
  }

  private get reviewLog(): FactReview[] {
    return (this as unknown as { reviews: FactReview[] }).reviews;
  }

  /**
   * Propose a new candidate fact from an extraction source.
   * The fact starts in the `proposed` state and must be reviewed.
   */
  propose(input: ProposeInput): CandidateFact {
    const now = new Date().toISOString();
    const id = randomUUID();

    const fact: CandidateFact = {
      id,
      tenantId: this.tenantId,
      caseId: input.caseId,
      factType: input.factType,
      dataType: input.dataType,
      proposedValue: input.proposedValue,
      normalizedValue: input.normalizedValue ?? input.proposedValue,
      currentValue: input.proposedValue,
      sources: [input.source],
      verificationState: VerificationState.PROPOSED,
      confidence: input.confidence ?? input.source.confidence,
      contradictoryFactIds: [],
      reviewer: null,
      reviewedAt: null,
      reviewerNote: null,
      isControlling: false,
      supersededBy: null,
      modelVersion: input.source.modelVersion ?? null,
      promptVersion: input.source.promptVersion ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.facts.set(id, fact);
    return fact;
  }

  /**
   * Process a reviewer action on a candidate fact.
   * Records a FactReview and transitions the fact state.
   */
  review(input: ReviewInput): { fact: CandidateFact; reviewRecord: FactReview } {
    const fact = this.facts.get(input.factId);
    if (!fact) {
      throw new Error(`Fact not found: ${input.factId}`);
    }

    const previousState = fact.verificationState;
    const previousValue = fact.currentValue;

    let newState: VerificationStateValue = previousState;
    let newValue: string | null = null;
    let addedSource: FactSource | null = null;
    let discrepancyId: string | null = null;

    switch (input.action) {
      case "accept":
        newState = VerificationState.ACCEPTED;
        break;

      case "reject":
        newState = VerificationState.REJECTED;
        break;

      case "edit":
        if (!input.correctedValue) {
          throw new Error("edit action requires correctedValue");
        }
        newState = VerificationState.CORRECTED;
        newValue = input.correctedValue;
        fact.currentValue = input.correctedValue;
        // Update normalized value if it was derived from proposed value
        if (fact.normalizedValue === fact.proposedValue) {
          fact.normalizedValue = input.correctedValue;
        }
        break;

      case "add_source":
        if (!input.additionalSource) {
          throw new Error("add_source action requires additionalSource");
        }
        fact.sources.push(input.additionalSource);
        addedSource = input.additionalSource;
        // Does not change verification state — just adds evidence
        break;

      case "mark_ambiguous":
        newState = VerificationState.CONTRADICTED;
        break;

      case "request_document":
        newState = VerificationState.REQUIRES_ADDITIONAL_EVIDENCE;
        break;

      case "create_discrepancy":
        if (!input.discrepancyId) {
          throw new Error("create_discrepancy action requires discrepancyId");
        }
        discrepancyId = input.discrepancyId;
        // Does not change verification state on its own — the discrepancy
        // is linked for the discrepancy engine to process
        break;

      case "escalate_legal":
        // Escalation marks the fact as requiring additional evidence
        // pending legal review. The reviewer note should capture the
        // escalation reason.
        newState = VerificationState.REQUIRES_ADDITIONAL_EVIDENCE;
        break;

      case "designate_controlling":
        if (
          fact.verificationState !== VerificationState.ACCEPTED &&
          fact.verificationState !== VerificationState.ACCEPTED_WITH_QUALIFICATION &&
          fact.verificationState !== VerificationState.CORRECTED
        ) {
          throw new Error(
            "Only accepted, accepted_with_qualification, or corrected facts can be designated as controlling",
          );
        }
        fact.isControlling = true;
        break;

      case "remove_controlling":
        fact.isControlling = false;
        break;
    }

    // Validate state transition if it changed
    if (newState !== previousState) {
      if (!isValidFactTransition(previousState, newState)) {
        throw new Error(
          `Invalid fact verification transition: ${previousState} → ${newState}`,
        );
      }
      fact.verificationState = newState;
    }

    fact.reviewer = input.reviewer;
    fact.reviewedAt = new Date().toISOString();
    fact.reviewerNote = input.note ?? null;
    fact.updatedAt = new Date().toISOString();
    this.facts.set(input.factId, fact);

    const reviewRecord: FactReview = {
      id: randomUUID(),
      factId: input.factId,
      action: input.action,
      reviewer: input.reviewer,
      previousValue: previousValue !== fact.currentValue ? previousValue : null,
      newValue,
      previousState,
      newState: fact.verificationState,
      note: input.note ?? null,
      addedSource,
      linkedDiscrepancyId: discrepancyId,
      createdAt: new Date().toISOString(),
    };

    this.reviewLog.push(reviewRecord);
    return { fact, reviewRecord };
  }

  /**
   * Mark two facts as contradicting each other.
   * Both facts transition to the `contradicted` state.
   */
  markContradiction(factIdA: string, factIdB: string, reviewer: string, note: string): void {
    const factA = this.facts.get(factIdA);
    const factB = this.facts.get(factIdB);
    if (!factA || !factB) {
      throw new Error("Both facts must exist to mark a contradiction");
    }
    if (factIdA === factIdB) {
      throw new Error("Cannot contradict a fact with itself");
    }
    if (factA.caseId !== factB.caseId) {
      throw new Error("Cannot contradict facts from different cases");
    }

    // Link them
    if (!factA.contradictoryFactIds.includes(factIdB)) {
      factA.contradictoryFactIds.push(factIdB);
    }
    if (!factB.contradictoryFactIds.includes(factIdA)) {
      factB.contradictoryFactIds.push(factIdA);
    }

    // Both must be non-controlling while contradicted
    factA.isControlling = false;
    factB.isControlling = false;

    // Transition both to contradicted (if not already terminal)
    for (const fact of [factA, factB]) {
      if (
        fact.verificationState !== VerificationState.REJECTED &&
        fact.verificationState !== VerificationState.SUPERSEDED
      ) {
        if (isValidFactTransition(fact.verificationState, VerificationState.CONTRADICTED)) {
          fact.verificationState = VerificationState.CONTRADICTED;
        }
      }
      fact.updatedAt = new Date().toISOString();
    }

    this.facts.set(factIdA, factA);
    this.facts.set(factIdB, factB);

    // Record reviews for both
    for (const [factId, fact] of [[factIdA, factA], [factIdB, factB]] as const) {
      this.reviewLog.push({
        id: randomUUID(),
        factId,
        action: "mark_ambiguous",
        reviewer,
        previousValue: null,
        newValue: null,
        previousState: factA.verificationState === VerificationState.CONTRADICTED
          ? (factA.verificationState as VerificationStateValue)
          : (fact.verificationState as VerificationStateValue),
        newState: VerificationState.CONTRADICTED,
        note: `Contradiction with fact ${factId === factIdA ? factIdB : factIdA}: ${note}`,
        addedSource: null,
        linkedDiscrepancyId: null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Supersede a fact with a newer version.
   * The old fact transitions to `superseded` and links to the replacement.
   */
  supersede(oldFactId: string, newFactId: string, reviewer: string, note: string): void {
    const oldFact = this.facts.get(oldFactId);
    const newFact = this.facts.get(newFactId);
    if (!oldFact || !newFact) {
      throw new Error("Both old and new facts must exist");
    }
    if (oldFact.caseId !== newFact.caseId) {
      throw new Error("Cannot supersede with a fact from a different case");
    }
    if (oldFact.verificationState === VerificationState.SUPERSEDED) {
      throw new Error("Fact is already superseded");
    }

    if (!isValidFactTransition(oldFact.verificationState, VerificationState.SUPERSEDED)) {
      throw new Error(
        `Cannot supersede a fact in state ${oldFact.verificationState}`,
      );
    }

    // Transfer controlling status if the old fact was controlling
    if (oldFact.isControlling) {
      oldFact.isControlling = false;
      if (
        newFact.verificationState === VerificationState.ACCEPTED ||
        newFact.verificationState === VerificationState.ACCEPTED_WITH_QUALIFICATION ||
        newFact.verificationState === VerificationState.CORRECTED
      ) {
        newFact.isControlling = true;
      }
    }

    oldFact.verificationState = VerificationState.SUPERSEDED;
    oldFact.supersededBy = newFactId;
    oldFact.updatedAt = new Date().toISOString();

    this.facts.set(oldFactId, oldFact);
    this.facts.set(newFactId, newFact);

    this.reviewLog.push({
      id: randomUUID(),
      factId: oldFactId,
      action: "reject",
      reviewer,
      previousValue: null,
      newValue: null,
      previousState: oldFact.verificationState as VerificationStateValue,
      newState: VerificationState.SUPERSEDED,
      note: `Superseded by fact ${newFactId}: ${note}`,
      addedSource: null,
      linkedDiscrepancyId: null,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Designate a fact as controlling — only controlling facts may be
   * used as deterministic policy inputs (spec §8.5).
   */
  designateControlling(factId: string, reviewer: string): CandidateFact {
    const fact = this.facts.get(factId);
    if (!fact) throw new Error(`Fact not found: ${factId}`);

    if (
      fact.verificationState !== VerificationState.ACCEPTED &&
      fact.verificationState !== VerificationState.ACCEPTED_WITH_QUALIFICATION &&
      fact.verificationState !== VerificationState.CORRECTED
    ) {
      throw new Error(
        "Only accepted, accepted_with_qualification, or corrected facts can be controlling",
      );
    }

    if (fact.contradictoryFactIds.length > 0) {
      throw new Error(
        "Cannot designate a contradicted fact as controlling — resolve the contradiction first",
      );
    }

    return this.review({
      factId,
      action: "designate_controlling",
      reviewer,
    }).fact;
  }

  /**
   * Remove controlling status from a fact.
   */
  removeControlling(factId: string, reviewer: string): CandidateFact {
    return this.review({
      factId,
      action: "remove_controlling",
      reviewer,
    }).fact;
  }

  /**
   * Get a single fact by ID.
   */
  get(factId: string): CandidateFact | undefined {
    return this.facts.get(factId);
  }

  /**
   * List all facts for a case.
   */
  listByCase(caseId: string): CandidateFact[] {
    return [...this.facts.values()].filter((f) => f.caseId === caseId);
  }

  /**
   * List controlling facts for a case — these are the facts the
   * policy engine may use as deterministic inputs.
   */
  listControllingFacts(caseId: string): CandidateFact[] {
    return this.listByCase(caseId).filter((f) => f.isControlling);
  }

  /**
   * List facts pending review (in the proposed state).
   */
  listPendingReview(caseId: string): CandidateFact[] {
    return this.listByCase(caseId).filter(
      (f) => f.verificationState === VerificationState.PROPOSED,
    );
  }

  /**
   * List facts that have contradictions.
   */
  listContradicted(caseId: string): CandidateFact[] {
    return this.listByCase(caseId).filter(
      (f) => f.verificationState === VerificationState.CONTRADICTED,
    );
  }

  /**
   * Get the full review history for a fact.
   */
  reviewHistory(factId: string): FactReview[] {
    return this.reviewLog.filter((r) => r.factId === factId);
  }

  /**
   * Get all reviews across all facts (for audit).
   */
  allReviews(): FactReview[] {
    return [...this.reviewLog];
  }
}
