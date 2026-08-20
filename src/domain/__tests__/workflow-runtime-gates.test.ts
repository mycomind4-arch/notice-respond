import { describe, expect, it } from "vitest";
import {
  advanceStep,
  canAdvance,
  createWorkflowState,
  goToStep,
  setDraft,
  setDraftValidation,
  setMailing,
  setReviewChecks,
  type WorkflowState,
} from "../workflow-runtime";
import type { MasterWorkflowDefinition } from "../workflow-definition";

const definition = {
  id: "fixture",
  lifecycle: "functional",
  qualityGate: {
    documentRecognition: true,
    factGrounding: true,
    deadlineVerification: true,
    evidenceGrounding: true,
    draftValidation: true,
    submissionReadiness: true,
    proofReady: true,
  },
  ux: {
    steps: [
      { id: "draft", label: "Draft" },
      { id: "review", label: "Review" },
      { id: "recipient", label: "Recipient" },
      { id: "mailing", label: "Mailing" },
      { id: "checkout", label: "Checkout" },
      { id: "submitted", label: "Submitted" },
    ],
    reviewChecks: ["accuracy", "completeness"],
  },
} as unknown as MasterWorkflowDefinition;

function atPhase(phase: WorkflowState["phase"]): WorkflowState {
  return {
    ...createWorkflowState(definition),
    phase,
    step: definition.ux!.steps.findIndex((step) => step.id === phase),
  };
}

describe("workflow runtime consequential gates", () => {
  it("requires validation to have run before leaving draft", () => {
    const base = atPhase("draft");
    const drafted = setDraft(base, "complete draft");
    expect(canAdvance(drafted, definition)).toBe(false);
    const validated = setDraftValidation(drafted, { findings: [], passed: true, errors: 0, warnings: 0 });
    expect(canAdvance(validated, definition)).toBe(true);
  });

  it("cannot jump directly to a later consequential phase", () => {
    const state = atPhase("draft");
    const jumped = goToStep(state, definition, 3);
    expect(jumped.step).toBe(state.step);
    expect(jumped.phase).toBe("draft");
  });

  it("requires explicit review approval before mailing", () => {
    let state = atPhase("mailing");
    state = setMailing(state, {
      method: "certified",
      recipient: { name: "Agency", org: "Agency", address1: "1 Main", address2: "", city: "City", state: "CA", zip: "90000" },
      status: "draft",
    });
    expect(canAdvance(state, definition)).toBe(false);

    state = { ...state, approved: true };
    expect(canAdvance(state, definition)).toBe(true);
  });

  it("never permits advance from submitted", () => {
    const state = atPhase("submitted");
    expect(canAdvance(state, definition)).toBe(false);
    expect(advanceStep(state, definition)).toEqual(state);
  });

  it("requires a real provider transition before checkout can complete", () => {
    let state = atPhase("checkout");
    state = setMailing(state, {
      method: "certified",
      recipient: { name: "Agency", org: "Agency", address1: "1 Main", address2: "", city: "City", state: "CA", zip: "90000" },
      status: "draft",
    });
    state = setReviewChecks(state, [true, true]);
    expect(canAdvance(state, definition)).toBe(false);
    state = { ...state, mailing: { ...state.mailing!, providerOrderId: "order-1", status: "submitted" } };
    expect(canAdvance(state, definition)).toBe(true);
  });
});
