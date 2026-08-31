/**
 * @file engine.test.ts
 * @description Core unit tests for evaluation rules, custom expression checks,
 * and search limitation carrying behavior.
 */

import { PolicyEngine } from '../src/engine';
import { humboldtRecordationRule } from './fixtures/humboldt-recordation-rule';
import { Rule, EvaluationResult } from '../src/types';

describe('Policy Engine Core Evaluation Tests', () => {
  const engine = new PolicyEngine();

  // Activate our Humboldt rule for production tests
  const activationResult = engine.activateRule(humboldtRecordationRule);
  const activeHumboldtRule = activationResult.rule;

  test('Should skip evaluation and return RuleNotActivated if rule is not active', () => {
    const inactiveRule: Rule = {
      ...humboldtRecordationRule,
      activation_state: 'Approved',
    };

    const result = engine.evaluate(inactiveRule, { apn: '501-123-045-000' });
    expect(result.status).toBe('RuleNotActivated');
    expect(result.explanation).toContain('is currently in state \'Approved\' and is not activated');
    expect(result.policy_version).toBe(inactiveRule.policy_version);
  });

  test('Should evaluate Active recordation rule successfully - Satisfied', () => {
    const inputs = {
      recorded_date: '2026-06-15T10:00:00Z',
      trigger_date: '2026-06-01T09:00:00Z',
      deadline_days: 30,
      apn: '501-123-045-000',
    };

    const result = engine.evaluate(activeHumboldtRule, inputs);
    expect(result.status).toBe('Satisfied');
    expect(result.explanation).toContain('successfully recorded');
    expect(result.policy_version).toBe(activeHumboldtRule.policy_version);
  });

  test('Should evaluate Active recordation rule - NotLocated with search limitations carried', () => {
    const search_limitations = [
      {
        source_system: 'Humboldt Recorder Index',
        query_parameter: 'APN: 501-123-045-000',
        scope_limitation: 'Delayed indexing',
        limitation_reason: 'Office backlog',
      },
    ];

    const inputs = {
      trigger_date: '2026-06-01T09:00:00Z',
      apn: '501-123-045-000',
      search_limitations,
    };

    const result = engine.evaluate(activeHumboldtRule, inputs);
    expect(result.status).toBe('NotLocated');
    expect(result.search_limitations).toHaveLength(1);
    expect(result.search_limitations[0].source_system).toBe('Humboldt Recorder Index');
  });

  test('Should evaluate timing rules correctly', () => {
    const timingRule: Rule = {
      rule_id: 'R-TIM-01',
      name: 'Appeals Timing Window',
      jurisdiction: 'State',
      agency: 'OAH',
      proceeding_type: 'Administrative Appeal',
      citation: 'OAH Rule 12',
      source_document: 'Statutes',
      source_url: 'http://example.com',
      source_excerpt: 'Appeals must be filed no earlier than 5 days and no later than 15 days after notice.',
      effective_start_date: '2026-01-01',
      effective_end_date: null,
      rule_type: 'timing',
      required_inputs: {
        type: 'object',
        properties: {
          action_date: { type: 'string' },
          trigger_date: { type: 'string' },
          min_days_required: { type: 'number' },
          max_days_allowed: { type: 'number' },
        },
        required: [],
      },
      deterministic_expression: '',
      exceptions: [],
      output_statuses: ['Satisfied', 'NotYetEligible', 'RecordedAfterExpectedDeadline'],
      severity: 'medium',
      human_review_required: false,
      legal_review_status: 'Approved',
      drafted_by: 'Staff',
      reviewed_by: 'Staff',
      approved_by: 'Legal',
      policy_version: '1.2.0',
      activation_state: 'Active',
      test_suite: [],
    };

    // Case 1: Satisfied (10 days)
    let res = engine.evaluate(timingRule, {
      action_date: '2026-07-15T00:00:00Z',
      trigger_date: '2026-07-05T00:00:00Z',
      min_days_required: 5,
      max_days_allowed: 15,
    });
    expect(res.status).toBe('Satisfied');

    // Case 2: Too early (3 days)
    res = engine.evaluate(timingRule, {
      action_date: '2026-07-08T00:00:00Z',
      trigger_date: '2026-07-05T00:00:00Z',
      min_days_required: 5,
      max_days_allowed: 15,
    });
    expect(res.status).toBe('NotYetEligible');

    // Case 3: Too late (20 days)
    res = engine.evaluate(timingRule, {
      action_date: '2026-07-25T00:00:00Z',
      trigger_date: '2026-07-05T00:00:00Z',
      min_days_required: 5,
      max_days_allowed: 15,
    });
    expect(res.status).toBe('RecordedAfterExpectedDeadline');
  });

  test('Should evaluate sequence rules correctly', () => {
    const sequenceRule: Rule = {
      rule_id: 'R-SEQ-01',
      name: 'Procedural Notice Sequence',
      jurisdiction: 'State',
      agency: 'Agency',
      proceeding_type: 'Hearing',
      citation: 'S-1',
      source_document: 'Doc',
      source_url: 'http://example.com',
      source_excerpt: 'Notice of Violation must precede Notice of Hearing.',
      effective_start_date: '2026-01-01',
      effective_end_date: null,
      rule_type: 'sequence',
      required_inputs: {
        type: 'object',
        properties: {
          events: { type: 'array' },
          expected_sequence: { type: 'array' },
        },
        required: [],
      },
      deterministic_expression: '',
      exceptions: [],
      output_statuses: ['Satisfied', 'LocatedOutsideExpectedSequence', 'NotLocated'],
      severity: 'high',
      human_review_required: false,
      legal_review_status: 'Approved',
      drafted_by: 'Staff',
      reviewed_by: 'Staff',
      approved_by: 'Legal',
      policy_version: '1.0.0',
      activation_state: 'Active',
      test_suite: [],
    };

    // Correct sequence: Notice of Violation (June 1) -> Notice of Hearing (June 5)
    let res = engine.evaluate(sequenceRule, {
      events: [
        { name: 'Notice of Violation', date: '2026-06-01T00:00:00Z' },
        { name: 'Notice of Hearing', date: '2026-06-05T00:00:00Z' },
      ],
      expected_sequence: ['Notice of Violation', 'Notice of Hearing'],
    });
    expect(res.status).toBe('Satisfied');

    // Incorrect sequence: Notice of Hearing (June 1) -> Notice of Violation (June 5)
    res = engine.evaluate(sequenceRule, {
      events: [
        { name: 'Notice of Violation', date: '2026-06-05T00:00:00Z' },
        { name: 'Notice of Hearing', date: '2026-06-01T00:00:00Z' },
      ],
      expected_sequence: ['Notice of Violation', 'Notice of Hearing'],
    });
    expect(res.status).toBe('LocatedOutsideExpectedSequence');
  });
});
