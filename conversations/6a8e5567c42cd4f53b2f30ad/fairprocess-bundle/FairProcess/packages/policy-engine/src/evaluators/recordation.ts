/**
 * @file recordation.ts
 * @description Evaluator for instrument recordation rules.
 * Often checks whether an instrument was recorded after the finality date and before a deadline.
 */

import { Rule, EvaluationResult } from '../types';

export function evaluateRecordation(rule: Rule, inputs: Record<string, any>): EvaluationResult {
  const {
    recorded_date,
    trigger_date, // typically finality date
    deadline_days, // optional, maximum allowed days from trigger to recording
    apn,
    search_limitations = [],
    input_source_references = {},
  } = inputs;

  const evaluation_timestamp = new Date().toISOString();

  if (!apn) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      evaluation_timestamp,
      status: 'InsufficientEvidence',
      explanation: 'Recordation checks require a valid Assessor Parcel Number (APN) identifier.',
      severity: rule.severity,
      search_limitations,
    };
  }

  if (!recorded_date) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      evaluation_timestamp,
      status: 'NotLocated', // Neutral terminology instead of "missing recordation"
      explanation: `No recording instrument was located under the APN ${apn} since the trigger date ${trigger_date || 'unspecified'}.`,
      severity: rule.severity,
      search_limitations,
      recommended_next_action: 'Query the County Recorder index directly using alternative owner names or parcel codes.',
    };
  }

  if (!trigger_date) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      evaluation_timestamp,
      status: 'AwaitingTrigger',
      explanation: 'Recordation was located but the finality trigger date has not been established.',
      severity: 'low',
      search_limitations,
    };
  }

  const recMs = new Date(recorded_date).getTime();
  const trigMs = new Date(trigger_date).getTime();

  if (isNaN(recMs) || isNaN(trigMs)) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      evaluation_timestamp,
      status: 'InsufficientEvidence',
      explanation: 'Invalid date formats supplied for recorded_date or trigger_date.',
      severity: rule.severity,
      search_limitations,
    };
  }

  const diffDays = (recMs - trigMs) / (1000 * 60 * 60 * 24);

  // If recorded_date <= trigger_date (Recorded too early, meaning before finality has occurred)
  if (diffDays <= 0) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      input_source_references,
      evaluation_timestamp,
      status: 'RecordedTooEarly',
      explanation: `The instrument was recorded on ${recorded_date}, which is ${Math.abs(diffDays).toFixed(1)} days BEFORE/on the finality trigger date of ${trigger_date}.`,
      severity: rule.severity,
      search_limitations,
      recommended_next_action: 'Verify if the recorded instrument is a preliminary draft or belongs to a different proceeding.',
    };
  }

  // If deadline_days is provided, verify we recorded before deadline
  if (deadline_days !== undefined && diffDays > deadline_days) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      input_source_references,
      evaluation_timestamp,
      status: 'RecordedAfterExpectedDeadline',
      explanation: `The instrument was recorded on ${recorded_date} (${diffDays.toFixed(1)} days after trigger), which exceeds the deadline of ${deadline_days} days.`,
      severity: rule.severity,
      search_limitations,
      recommended_next_action: 'Assess potential statutory consequences of late recording or initiate administrative variance procedures.',
    };
  }

  return {
    rule_id: rule.rule_id,
    policy_version: rule.policy_version,
    input_values: inputs,
    input_source_references,
    evaluation_timestamp,
    status: 'Satisfied',
    explanation: `The instrument was successfully recorded on ${recorded_date} (${diffDays.toFixed(1)} days after trigger), complying with the recordation window constraints.`,
    severity: 'low',
    search_limitations,
  };
}
