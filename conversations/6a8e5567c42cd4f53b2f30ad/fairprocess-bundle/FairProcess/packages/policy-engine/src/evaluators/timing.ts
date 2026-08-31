/**
 * @file timing.ts
 * @description Evaluator for timing constraints (earliest/latest action limits).
 */

import { Rule, EvaluationResult } from '../types';

export function evaluateTiming(rule: Rule, inputs: Record<string, any>): EvaluationResult {
  const {
    action_date,
    trigger_date,
    min_days_required,
    max_days_allowed,
    search_limitations = [],
    input_source_references = {},
  } = inputs;

  const evaluation_timestamp = new Date().toISOString();

  if (!action_date || !trigger_date) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      evaluation_timestamp,
      status: 'AwaitingTrigger',
      explanation: 'Timing evaluation is awaiting either the trigger date or the action date input values.',
      severity: 'low',
      search_limitations,
    };
  }

  const actMs = new Date(action_date).getTime();
  const trigMs = new Date(trigger_date).getTime();

  if (isNaN(actMs) || isNaN(trigMs)) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      evaluation_timestamp,
      status: 'InsufficientEvidence',
      explanation: 'One or both date fields contain invalid date formats.',
      severity: rule.severity,
      search_limitations,
    };
  }

  const diffDays = (actMs - trigMs) / (1000 * 60 * 60 * 24);

  if (min_days_required !== undefined && diffDays < min_days_required) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      input_source_references,
      evaluation_timestamp,
      status: 'NotYetEligible', // or RecordedTooEarly depending on context
      explanation: `The action took place ${diffDays.toFixed(1)} days after trigger, which is earlier than the required minimum of ${min_days_required} days.`,
      severity: rule.severity,
      search_limitations,
      recommended_next_action: 'Hold evaluation until the minimum eligibility period has elapsed or flag for exception review.',
    };
  }

  if (max_days_allowed !== undefined && diffDays > max_days_allowed) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      input_source_references,
      evaluation_timestamp,
      status: 'RecordedAfterExpectedDeadline',
      explanation: `The action took place ${diffDays.toFixed(1)} days after trigger, exceeding the maximum allowed window of ${max_days_allowed} days.`,
      severity: rule.severity,
      search_limitations,
      recommended_next_action: 'Flag the record for administrative review of the late filing and potential penalty/remedy.',
    };
  }

  return {
    rule_id: rule.rule_id,
    policy_version: rule.policy_version,
    input_values: inputs,
    input_source_references,
    evaluation_timestamp,
    status: 'Satisfied',
    explanation: `The action occurred ${diffDays.toFixed(1)} days after trigger, which complies with timing constraints (Min: ${min_days_required ?? 'None'}, Max: ${max_days_allowed ?? 'None'}).`,
    severity: 'low',
    search_limitations,
  };
}
