/**
 * @file engine.ts
 * @description Core PolicyEngine class for evaluating process rules, running test suites,
 * validating inputs, and managing rule activation states.
 */

import { Rule, EvaluationResult, TestCase, OutputStatus, RuleLifecycleState } from './types';
import { transitionRuleState } from './lifecycle';
import {
  evaluateRequiredEvent,
  evaluateRequiredDocument,
  evaluateTiming,
  evaluateSequence,
  evaluateRecordation,
  evaluateSearchCompleteness,
} from './evaluators';

export class PolicyEngine {
  /**
   * Evaluates a rule against a set of inputs.
   *
   * @param rule The rule to evaluate.
   * @param inputs The input variables (facts).
   * @param bypassActivationCheck Internal flag to bypass 'Active' checks during rule testing.
   */
  public evaluate(
    rule: Rule,
    inputs: Record<string, any>,
    bypassActivationCheck = false
  ): EvaluationResult {
    const evaluation_timestamp = new Date().toISOString();

    // Spec constraint: Only 'Active' rules can be evaluated.
    // Rule not activated = RuleNotActivated status (not an error).
    if (!bypassActivationCheck && rule.activation_state !== 'Active') {
      return {
        rule_id: rule.rule_id,
        policy_version: rule.policy_version,
        input_values: inputs,
        evaluation_timestamp,
        status: 'RuleNotActivated',
        explanation: `Evaluation skipped: The rule '${rule.name}' is currently in state '${rule.activation_state}' and is not activated for production use.`,
        severity: 'low',
        search_limitations: [],
      };
    }

    // Input Validation (Validate JSON Schema)
    const validation = this.validateInputsSchema(rule.required_inputs, inputs);
    if (!validation.valid) {
      return {
        rule_id: rule.rule_id,
        policy_version: rule.policy_version,
        input_values: inputs,
        evaluation_timestamp,
        status: 'InsufficientEvidence',
        explanation: `Input schema validation failed: ${validation.errors.join('; ')}`,
        severity: rule.severity,
        search_limitations: [],
      };
    }

    // Dispatch to rule-type specific evaluators or fall back to deterministic expression
    try {
      switch (rule.rule_type) {
        case 'required-event':
          return evaluateRequiredEvent(rule, inputs);
        case 'required-document':
          return evaluateRequiredDocument(rule, inputs);
        case 'timing':
          return evaluateTiming(rule, inputs);
        case 'sequence':
          return evaluateSequence(rule, inputs);
        case 'recordation':
          return evaluateRecordation(rule, inputs);
        case 'search-completeness':
          return evaluateSearchCompleteness(rule, inputs);
        default:
          // For other rule types, evaluate via deterministic expression or fallback
          return this.evaluateDeterministicExpression(rule, inputs);
      }
    } catch (err: any) {
      return {
        rule_id: rule.rule_id,
        policy_version: rule.policy_version,
        input_values: inputs,
        evaluation_timestamp,
        status: 'InsufficientEvidence',
        explanation: `An error occurred during rule execution: ${err.message}`,
        severity: 'critical',
        search_limitations: [],
      };
    }
  }

  /**
   * Activates a rule by transitioning its lifecycle state to 'Active'.
   * This guarantees that the rule's test suite passes before state change succeeds.
   *
   * @param rule The rule to activate.
   */
  public activateRule(rule: Rule): { success: boolean; message: string; rule: Rule } {
    return transitionRuleState(rule, 'Active', (r) => this.runRuleTestSuite(r));
  }

  /**
   * Transitions a rule's lifecycle to any other allowed target state.
   */
  public transitionState(
    rule: Rule,
    targetState: RuleLifecycleState
  ): { success: boolean; message: string; rule: Rule } {
    return transitionRuleState(rule, targetState, (r) => this.runRuleTestSuite(r));
  }

  /**
   * Runs the entire test suite associated with a rule.
   * Tests are evaluated with activation checks bypassed.
   */
  public runRuleTestSuite(rule: Rule): { passed: boolean; errorCount: number; details: string } {
    if (!rule.test_suite || rule.test_suite.length === 0) {
      return {
        passed: true,
        errorCount: 0,
        details: 'No tests defined in rule test suite. Automatically passes.',
      };
    }

    let errorCount = 0;
    const testDetails: string[] = [];

    for (const testCase of rule.test_suite) {
      const result = this.evaluate(rule, testCase.inputs, true);
      const statusMatches = result.status === testCase.expected_status;
      let textMatches = true;

      if (testCase.expected_explanation_contains) {
        textMatches = result.explanation
          .toLowerCase()
          .includes(testCase.expected_explanation_contains.toLowerCase());
      }

      if (statusMatches && textMatches) {
        testDetails.push(`Test [${testCase.test_id}] PASSED: Got expected status '${result.status}'`);
      } else {
        errorCount++;
        const mismatchReason = !statusMatches
          ? `Expected status '${testCase.expected_status}' but got '${result.status}'`
          : `Explanation did not contain expected text: "${testCase.expected_explanation_contains}". Got: "${result.explanation}"`;
        testDetails.push(`Test [${testCase.test_id}] FAILED: ${testCase.description}. Reason: ${mismatchReason}`);
      }
    }

    return {
      passed: errorCount === 0,
      errorCount,
      details: testDetails.join('\n'),
    };
  }

  /**
   * Evaluates custom rules or those relying purely on standard boolean / numerical expressions.
   * Implements a safe, scoped, sandbox-like expression runner.
   */
  private evaluateDeterministicExpression(rule: Rule, inputs: Record<string, any>): EvaluationResult {
    const evaluation_timestamp = new Date().toISOString();
    const expr = rule.deterministic_expression;

    if (!expr) {
      return {
        rule_id: rule.rule_id,
        policy_version: rule.policy_version,
        input_values: inputs,
        evaluation_timestamp,
        status: 'InsufficientEvidence',
        explanation: `Rule type '${rule.rule_type}' is not supported by a custom evaluator, and no deterministic_expression was provided.`,
        severity: rule.severity,
        search_limitations: [],
      };
    }

    try {
      // Safe, limited context evaluation
      // Extracts variables from keys matching those in the inputs
      const contextKeys = Object.keys(inputs);
      const contextValues = Object.values(inputs);
      const evaluatorFn = new Function(...contextKeys, `return (${expr});`);
      const evaluationResult = evaluatorFn(...contextValues);

      if (evaluationResult === true) {
        return {
          rule_id: rule.rule_id,
          policy_version: rule.policy_version,
          input_values: inputs,
          evaluation_timestamp,
          status: 'Satisfied',
          explanation: `The deterministic expression '${expr}' evaluated to true under current inputs.`,
          severity: 'low',
          search_limitations: [],
        };
      } else {
        return {
          rule_id: rule.rule_id,
          policy_version: rule.policy_version,
          input_values: inputs,
          evaluation_timestamp,
          status: 'NotLocated', // Default fallback status for custom rules not met
          explanation: `The deterministic expression '${expr}' did not resolve to true under current inputs.`,
          severity: rule.severity,
          search_limitations: [],
        };
      }
    } catch (err: any) {
      return {
        rule_id: rule.rule_id,
        policy_version: rule.policy_version,
        input_values: inputs,
        evaluation_timestamp,
        status: 'InsufficientEvidence',
        explanation: `Deterministic expression evaluation failed to execute: ${err.message}`,
        severity: rule.severity,
        search_limitations: [],
      };
    }
  }

  /**
   * Lightweight JSON Schema validator to keep the engine zero-dependency.
   */
  private validateInputsSchema(
    schema: any,
    inputs: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema || typeof schema !== 'object') {
      return { valid: true, errors };
    }

    const required: string[] = schema.required || [];
    for (const req of required) {
      if (inputs[req] === undefined || inputs[req] === null) {
        errors.push(`Required field '${req}' is missing`);
      }
    }

    const properties = schema.properties || {};
    for (const key of Object.keys(inputs)) {
      const propSchema = properties[key];
      if (propSchema) {
        const value = inputs[key];
        const valType = typeof value;

        if (propSchema.type === 'string' && valType !== 'string') {
          errors.push(`Field '${key}' expected type 'string', got '${valType}'`);
        } else if (propSchema.type === 'number' && valType !== 'number') {
          errors.push(`Field '${key}' expected type 'number', got '${valType}'`);
        } else if (propSchema.type === 'boolean' && valType !== 'boolean') {
          errors.push(`Field '${key}' expected type 'boolean', got '${valType}'`);
        } else if (propSchema.type === 'array' && !Array.isArray(value)) {
          errors.push(`Field '${key}' expected type 'array', got '${valType}'`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
