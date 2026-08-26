/**
 * @file lifecycle.test.ts
 * @description Unit tests for rule state transitions and lifecycle safety.
 */

import { PolicyEngine } from '../src/engine';
import { humboldtRecordationRule } from './fixtures/humboldt-recordation-rule';
import { Rule } from '../src/types';

describe('Rule Lifecycle State Machine', () => {
  const engine = new PolicyEngine();

  test('Should not allow transition from Draft directly to Active', () => {
    const draftRule: Rule = {
      ...humboldtRecordationRule,
      activation_state: 'Draft',
    };

    const result = engine.transitionState(draftRule, 'Active');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid state transition');
  });

  test('Should block activation if legal_review_status is not Approved', () => {
    const unapprovedRule: Rule = {
      ...humboldtRecordationRule,
      activation_state: 'Approved',
      legal_review_status: 'Pending',
    };

    const result = engine.activateRule(unapprovedRule);
    expect(result.success).toBe(false);
    expect(result.message).toContain('cannot be activated without an Approved legal_review_status');
  });

  test('Should transition successfully to Active when Approved and tests pass', () => {
    const validApprovedRule: Rule = {
      ...humboldtRecordationRule,
      activation_state: 'Approved',
      legal_review_status: 'Approved',
    };

    const result = engine.activateRule(validApprovedRule);
    expect(result.success).toBe(true);
    expect(result.rule.activation_state).toBe('Active');
  });

  test('Should block activation if test suite fails', () => {
    const brokenRule: Rule = {
      ...humboldtRecordationRule,
      activation_state: 'Approved',
      legal_review_status: 'Approved',
      test_suite: [
        {
          test_id: 'FAILING-TC',
          description: 'A test designed to fail to verify blocking',
          inputs: { apn: '123' },
          expected_status: 'Satisfied', // But recordation with only APN yields 'NotLocated'
        },
      ],
    };

    const result = engine.activateRule(brokenRule);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Activation failed: Test suite did not pass');
  });
});
