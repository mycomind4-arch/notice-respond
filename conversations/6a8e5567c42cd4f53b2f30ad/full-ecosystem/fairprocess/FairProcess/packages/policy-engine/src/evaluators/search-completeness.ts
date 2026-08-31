/**
 * @file search-completeness.ts
 * @description Evaluator for search-completeness rules.
 * Checks whether record searches were sufficiently thorough, accounting for system outages,
 * keyword restrictions, or un-indexed dates.
 */

import { Rule, EvaluationResult, SearchLimitation } from '../types';

export function evaluateSearchCompleteness(rule: Rule, inputs: Record<string, any>): EvaluationResult {
  const {
    systems_searched = [],
    required_systems = [],
    search_limitations = [],
    errors_encountered = [],
    input_source_references = {},
  } = inputs;

  const evaluation_timestamp = new Date().toISOString();
  const limitations: SearchLimitation[] = search_limitations;

  if (!Array.isArray(systems_searched) || !Array.isArray(required_systems)) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      evaluation_timestamp,
      status: 'InsufficientEvidence',
      explanation: 'Search completeness evaluation requires arrays of systems_searched and required_systems.',
      severity: rule.severity,
      search_limitations: limitations,
    };
  }

  // Find any required systems that were not searched
  const missedSystems = required_systems.filter(sys => !systems_searched.includes(sys));

  if (missedSystems.length > 0) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      input_source_references,
      evaluation_timestamp,
      status: 'SearchIncomplete',
      explanation: `The search is incomplete because the following required system(s) were not queried: ${missedSystems.join(', ')}.`,
      severity: rule.severity,
      search_limitations: limitations,
      recommended_next_action: `Initiate searches in the missing database(s): ${missedSystems.join(', ')}.`,
    };
  }

  // Check for critical search limitations or errors
  if (errors_encountered.length > 0) {
    return {
      rule_id: rule.rule_id,
      policy_version: rule.policy_version,
      input_values: inputs,
      input_source_references,
      evaluation_timestamp,
      status: 'SearchIncomplete',
      explanation: `Errors were encountered during record search, preventing complete coverage. Errors: ${errors_encountered.join('; ')}`,
      severity: 'high',
      search_limitations: limitations,
      recommended_next_action: 'Retry the search after system connection issues are resolved, or perform a manual search.',
    };
  }

  if (limitations.length > 0) {
    // If we have search limitations but all systems were searched, we might still be 'SearchIncomplete'
    // if the limitations severely restrict the scope (e.g. index date range too small)
    const hasCriticalLimitation = limitations.some(lim =>
      lim.limitation_reason.toLowerCase().includes('critical') ||
      lim.limitation_reason.toLowerCase().includes('outage') ||
      lim.scope_limitation.toLowerCase().includes('restricted')
    );

    if (hasCriticalLimitation) {
      return {
        rule_id: rule.rule_id,
        policy_version: rule.policy_version,
        input_values: inputs,
        input_source_references,
        evaluation_timestamp,
        status: 'SearchIncomplete',
        explanation: 'Critical search limitations exist (e.g. partial system outages or severe index constraints) preventing absolute validation.',
        severity: rule.severity,
        search_limitations: limitations,
        recommended_next_action: 'Queue for human audit once system limitations are cleared.',
      };
    }
  }

  return {
    rule_id: rule.rule_id,
    policy_version: rule.policy_version,
    input_values: inputs,
    input_source_references,
    evaluation_timestamp,
    status: 'Satisfied',
    explanation: `All required search systems (${required_systems.join(', ')}) were successfully queried, with no critical failures or scope limitations.`,
    severity: 'low',
    search_limitations: limitations,
  };
}
