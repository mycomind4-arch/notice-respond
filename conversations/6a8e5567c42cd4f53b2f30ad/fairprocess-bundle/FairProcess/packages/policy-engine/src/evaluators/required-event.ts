/**
 * @file required-event.ts
 * @description Evaluator for 'required-event' rules.
 * Implements standard procedural check for whether a required process milestone occurred.
 */

import { Rule, EvaluationResult, OutputStatus, SearchLimitation } from '../types';

export function evaluateRequiredEvent(rule: Rule, inputs: Record<string, any>): EvaluationResult {
  const {
    event_occurred,
    event_date,
    search_limitations = [],
    input_source_references = {},
  } = inputs;

  const evaluation_timestamp = new Date().toISOString();
  const limitations: SearchLimitation[] = search_limitations;

  // Process neutral language checks:
  // "Not located" does not equal "did not exist". Must carry search limitations.
  if (event_occurred === undefined) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      evaluation_timestamp,
      status: 'InsufficientEvidence',
      explanation: 'The event occurrence status could not be verified due to missing or incomplete input data.',
      severity: rule.severity,
      search_limitations: limitations,
    };
  }

  if (event_occurred === true) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      input_source_references,
      evaluation_timestamp,
      status: 'Satisfied',
      explanation: `The required event '${rule.name}' was located and confirmed as occurred on ${event_date || 'an unspecified date'}.`,
      severity: 'low',
      search_limitations: limitations,
    };
  } else {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      input_source_references,
      evaluation_timestamp,
      status: 'NotLocated', // Use neutral language: NotLocated instead of "missing" or "failed"
      explanation: `A search of record systems was completed, but the required event '${rule.name}' was not located within the specified parameters.`,
      severity: rule.severity,
      search_limitations: limitations,
      recommended_next_action: 'Initiate manual review of collateral records or issue a procedural notice for verification.',
    };
  }
}
