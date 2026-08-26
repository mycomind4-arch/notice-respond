/**
 * @file humboldt-recordation-rule.ts
 * @description Example process-integrity fixture based on Humboldt County code enforcement recordation.
 * Rule: An instrument of notice/recordation must be recorded AFTER finality is achieved
 * and BEFORE the statutory deadline of 30 days expires.
 */

import { Rule } from '../../src/types';

export const humboldtRecordationRule: Rule = {
  rule_id: 'HUM-CE-REC-01',
  name: 'Humboldt Code Enforcement Instrument Recordation Deadline Rule',
  jurisdiction: 'Humboldt County',
  agency: 'Planning and Building Department - Code Enforcement',
  proceeding_type: 'Nuisance Abatement',
  citation: 'Humboldt County Code § 351-14(c)',
  source_document: 'Humboldt County Code Enforcement Procedure Guidebook 2024',
  source_url: 'https://humboldtgov.org/documentcenter/view/code-enforcement-351',
  source_excerpt: 'Notice of violation must be recorded in the Office of the County Recorder within 30 days of the administrative decision becoming final, and never prior to finality.',
  effective_start_date: '2024-01-01T00:00:00Z',
  effective_end_date: null,
  rule_type: 'recordation',
  required_inputs: {
    type: 'object',
    properties: {
      recorded_date: { type: 'string' },
      trigger_date: { type: 'string' }, // Finality date
      deadline_days: { type: 'number' }, // Window constraint (usually 30)
      apn: { type: 'string' }, // Assessor Parcel Number
      search_limitations: { type: 'array' }
    },
    required: ['apn'] // recorded_date and trigger_date are checked by timing logic dynamically
  },
  deterministic_expression: 'recorded_date > trigger_date && (recorded_date - trigger_date) <= 30 * 24 * 60 * 60 * 1000',
  exceptions: [
    'Written extension signed by Planning Director',
    'County recorder system-wide outage'
  ],
  output_statuses: [
    'Satisfied',
    'NotLocated',
    'RecordedTooEarly',
    'RecordedAfterExpectedDeadline',
    'AwaitingTrigger',
    'InsufficientEvidence'
  ],
  severity: 'high',
  human_review_required: false,
  legal_review_status: 'Approved',
  drafted_by: 'Staff Draftsman',
  reviewed_by: 'Senior Planner',
  approved_by: 'County Counsel',
  policy_version: '1.0.0',
  activation_state: 'Approved', // Starts in Approved, can transition to Active
  test_suite: [
    {
      test_id: 'TC-HUM-REC-01',
      description: 'Satisfied recording: recorded 15 days after finality trigger',
      inputs: {
        recorded_date: '2026-06-15T10:00:00Z',
        trigger_date: '2026-06-01T09:00:00Z',
        deadline_days: 30,
        apn: '501-123-045-000'
      },
      expected_status: 'Satisfied',
      expected_explanation_contains: 'complying with the recordation window constraints'
    },
    {
      test_id: 'TC-HUM-REC-02',
      description: 'Recorded too early: recorded 5 days BEFORE finality trigger',
      inputs: {
        recorded_date: '2026-05-25T10:00:00Z',
        trigger_date: '2026-06-01T09:00:00Z',
        deadline_days: 30,
        apn: '501-123-045-000'
      },
      expected_status: 'RecordedTooEarly',
      expected_explanation_contains: 'BEFORE/on the finality trigger date'
    },
    {
      test_id: 'TC-HUM-REC-03',
      description: 'Recorded after deadline: recorded 45 days after finality trigger',
      inputs: {
        recorded_date: '2026-07-16T12:00:00Z',
        trigger_date: '2026-06-01T09:00:00Z',
        deadline_days: 30,
        apn: '501-123-045-000'
      },
      expected_status: 'RecordedAfterExpectedDeadline',
      expected_explanation_contains: 'exceeds the deadline of 30 days'
    },
    {
      test_id: 'TC-HUM-REC-04',
      description: 'Not located: APN provided but no recording found',
      inputs: {
        trigger_date: '2026-06-01T09:00:00Z',
        apn: '501-123-045-000',
        search_limitations: [
          {
            source_system: 'Humboldt Recorder Index',
            query_parameter: 'APN: 501-123-045-000',
            scope_limitation: 'Limited to instruments indexed up to June 30, 2026',
            limitation_reason: 'Indices are running 15 days behind recordation'
          }
        ]
      },
      expected_status: 'NotLocated',
      expected_explanation_contains: 'No recording instrument was located'
    },
    {
      test_id: 'TC-HUM-REC-05',
      description: 'Insufficient Evidence: Missing mandatory APN input',
      inputs: {
        recorded_date: '2026-06-15T10:00:00Z',
        trigger_date: '2026-06-01T09:00:00Z'
      },
      expected_status: 'InsufficientEvidence',
      expected_explanation_contains: "Required field 'apn' is missing"
    }
  ]
};
