import assert from "node:assert/strict";
import test from "node:test";

import { createWorkflowState, canAdvance, setDraft, setDraftValidation, advanceStep } from "../src/domain/workflow-runtime.ts";
import { getWorkflowById } from "../src/domain/workflow-catalog.ts";

const def = getWorkflowById("cp2000-response");
assert.ok(def, "CP2000 definition should exist");

// Helper: create a state at a given phase
function stateAtPhase(phase, overrides = {}) {
  const state = createWorkflowState(def);
  // Navigate to the target phase
  const steps = def.ux?.steps ?? [];
  const phaseIndex = steps.findIndex(s => s.id === phase);
  return {
    ...state,
    step: phaseIndex >= 0 ? phaseIndex : state.step,
    phase: phase,
    ...overrides,
  };
}

// ── P0-1: Validation blocking ────────────────────────────────

test("P0-1: canAdvance returns false for draft phase when validation has errors", () => {
  const state = stateAtPhase("draft", {
    draft: "Some draft text",
    draftValidation: { findings: [], passed: false, errors: 1, warnings: 0 },
  });
  assert.equal(canAdvance(state, def), false, "Should not advance when validation has errors");
});

test("P0-1: canAdvance returns true for draft phase when validation passes", () => {
  const state = stateAtPhase("draft", {
    draft: "Some draft text",
    draftValidation: { findings: [], passed: true, errors: 0, warnings: 0 },
  });
  assert.equal(canAdvance(state, def), true, "Should advance when validation passes");
});

test("P0-1: canAdvance returns true for draft phase when validation is null (not yet run)", () => {
  const state = stateAtPhase("draft", {
    draft: "",
    draftValidation: null,
  });
  assert.equal(canAdvance(state, def), true, "Should allow advance when validation hasn't run yet");
});

test("P0-1: canAdvance returns false for review phase when validation has errors", () => {
  const state = stateAtPhase("review", {
    draft: "Some draft text",
    draftValidation: { findings: [], passed: false, errors: 1, warnings: 0 },
    reviewChecks: [true, true, true, true],
  });
  assert.equal(canAdvance(state, def), false, "Should not advance past review when validation has errors");
});

test("P0-1: canAdvance returns true for review phase when validation passes and all checks done", () => {
  const state = stateAtPhase("review", {
    draft: "Some draft text",
    draftValidation: { findings: [], passed: true, errors: 0, warnings: 0 },
    reviewChecks: [true, true, true, true],
  });
  assert.equal(canAdvance(state, def), true, "Should advance when validation passes and all checks done");
});

test("P0-1: canAdvance returns false for review when checks incomplete even if validation passes", () => {
  const state = stateAtPhase("review", {
    draft: "Some draft text",
    draftValidation: { findings: [], passed: true, errors: 0, warnings: 0 },
    reviewChecks: [true, false, true, true],
  });
  assert.equal(canAdvance(state, def), false, "Should not advance when review checks incomplete");
});
