/**
 * @file sequence.ts
 * @description Evaluator for sequential operations.
 * Checks if events or operations occurred in the correct relative sequence.
 */

import { Rule, EvaluationResult } from '../types';

interface SequenceEvent {
  name: string;
  date: string;
}

export function evaluateSequence(rule: Rule, inputs: Record<string, any>): EvaluationResult {
  const {
    events = [],
    expected_sequence = [],
    search_limitations = [],
    input_source_references = {},
  } = inputs;

  const evaluation_timestamp = new Date().toISOString();

  if (!Array.isArray(events) || !Array.isArray(expected_sequence) || expected_sequence.length === 0) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      evaluation_timestamp,
      status: 'InsufficientEvidence',
      explanation: 'Sequence evaluation requires both an array of events and an expected sequence list.',
      severity: rule.severity,
      search_limitations,
    };
  }

  // Create a map of located events to their dates (and verify dates are valid)
  const eventDateMap = new Map<string, number>();
  for (const ev of events as SequenceEvent[]) {
    if (ev && ev.name && ev.date) {
      const time = new Date(ev.date).getTime();
      if (!isNaN(time)) {
        eventDateMap.set(ev.name, time);
      }
    }
  }

  // Check if all expected sequence elements are located
  const missingFromSequence = expected_sequence.filter(name => !eventDateMap.has(name));
  if (missingFromSequence.length > 0) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      input_source_references,
      evaluation_timestamp,
      status: 'NotLocated',
      explanation: `The following events required in the sequence were not located: ${missingFromSequence.join(', ')}.`,
      severity: rule.severity,
      search_limitations,
      recommended_next_action: 'Perform a targeted docket search for the missing sequence steps.',
    };
  }

  // Check sequence order
  let lastTime = -1;
  let outOfOrder = false;
  const chronologicalDetails: string[] = [];

  for (const name of expected_sequence) {
    const time = eventDateMap.get(name)!;
    chronologicalDetails.push(`${name} (${new Date(time).toISOString().split('T')[0]})`);
    if (time < lastTime) {
      outOfOrder = true;
    }
    lastTime = time;
  }

  if (outOfOrder) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      input_source_references,
      evaluation_timestamp,
      status: 'LocatedOutsideExpectedSequence',
      explanation: `Events were located but occurred out of the expected sequence order: ${chronologicalDetails.join(' -> ')}.`,
      severity: rule.severity,
      search_limitations,
      recommended_next_action: 'Initiate a human review to evaluate if procedural exceptions or remedial rules apply.',
    };
  }

  return {
    rule_id: rule.rule_id,
    policy_version: rule.policy_version,
    input_values: inputs,
    input_source_references,
    evaluation_timestamp,
    status: 'Satisfied',
    explanation: `All sequence events were located in correct chronological order: ${chronologicalDetails.join(' -> ')}.`,
    severity: 'low',
    search_limitations,
  };
}
