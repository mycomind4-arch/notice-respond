/**
 * @file required-document.ts
 * @description Evaluator for 'required-document' rules.
 * Implements standard check for document existence under neutral wording guidelines.
 */

import { Rule, EvaluationResult, SearchLimitation } from '../types';

export function evaluateRequiredDocument(rule: Rule, inputs: Record<string, any>): EvaluationResult {
  const {
    document_located,
    document_id,
    filing_date,
    search_limitations = [],
    input_source_references = {},
  } = inputs;

  const evaluation_timestamp = new Date().toISOString();
  const limitations: SearchLimitation[] = search_limitations;

  if (document_located === undefined) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      evaluation_timestamp,
      status: 'InsufficientEvidence',
      explanation: 'The presence of the required document could not be evaluated due to insufficient input values.',
      severity: rule.severity,
      search_limitations: limitations,
    };
  }

  if (document_located === true) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      input_source_references,
      evaluation_timestamp,
      status: 'Located',
      explanation: `The required document of type '${inputs.document_type || rule.name}' was successfully located (ID: ${document_id || 'unspecified'}, filed on ${filing_date || 'unspecified'}).`,
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
      status: 'NotLocated', // Not "missing", "illegal", or "absent"
      explanation: `The required document of type '${inputs.document_type || rule.name}' was not located under the current search parameters.`,
      severity: rule.severity,
      search_limitations: limitations,
      recommended_next_action: 'Perform a secondary docket search or request a manual filing verification from the recording office.',
    };
  }
}
