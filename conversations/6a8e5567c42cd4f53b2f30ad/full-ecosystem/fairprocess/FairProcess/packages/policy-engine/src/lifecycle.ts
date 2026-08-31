/**
 * @file lifecycle.ts
 * @description Implements the Rule lifecycle state machine for the FairProcess Policy-as-Code Engine.
 * Enforces valid state transitions and guarantees that a rule's test suite passes before transitioning to 'Active'.
 */

import { Rule, RuleLifecycleState } from './types';

/**
 * Valid transitions map.
 * Defines the direct destination states allowed from any given source state.
 */
const VALID_TRANSITIONS: Record<RuleLifecycleState, RuleLifecycleState[]> = {
  Draft: ['EngineeringReview', 'Suspended'],
  EngineeringReview: ['Draft', 'LegalReview', 'Suspended'],
  LegalReview: ['Draft', 'Approved', 'Suspended'],
  Approved: ['Active', 'Draft', 'Suspended'],
  Active: ['Suspended', 'Superseded', 'Retired'],
  Suspended: ['Draft', 'EngineeringReview', 'LegalReview', 'Approved', 'Active', 'Retired'],
  Superseded: ['Retired'],
  Retired: [],
};

/**
 * Helper to validate if a transition is allowed by the lifecycle state machine.
 */
export function isValidTransition(from: RuleLifecycleState, to: RuleLifecycleState): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Executes a lifecycle state transition.
 * Implements strict state machine rules and validation checks.
 *
 * @param rule The rule to transition.
 * @param targetState The target state.
 * @param testRunner A function that executes the rule's test suite and returns true if all tests pass.
 */
export function transitionRuleState(
  rule: Rule,
  targetState: RuleLifecycleState,
  testRunner: (rule: Rule) => { passed: boolean; errorCount: number; details: string }
): { success: boolean; message: string; rule: Rule } {
  const currentState = rule.activation_state;

  if (currentState === targetState) {
    return { success: true, message: `Rule is already in state ${targetState}`, rule };
  }

  if (!isValidTransition(currentState, targetState)) {
    return {
      success: false,
      message: `Invalid state transition from ${currentState} to ${targetState}`,
      rule,
    };
  }

  // Mandatory check: If transitioning to Active, the test suite MUST pass.
  if (targetState === 'Active') {
    // Also check if legal_review_status is approved
    if (rule.legal_review_status !== 'Approved') {
      return {
        success: false,
        message: 'Rule cannot be activated without an Approved legal_review_status',
        rule,
      };
    }

    const testResults = testRunner(rule);
    if (!testResults.passed) {
      return {
        success: false,
        message: `Activation failed: Test suite did not pass. Errors: ${testResults.errorCount}. Details: ${testResults.details}`,
        rule,
      };
    }
  }

  // Update rule activation state
  const updatedRule: Rule = {
    ...rule,
    activation_state: targetState,
  };

  return {
    success: true,
    message: `Successfully transitioned rule ${rule.rule_id} from ${currentState} to ${targetState}`,
    rule: updatedRule,
  };
}
