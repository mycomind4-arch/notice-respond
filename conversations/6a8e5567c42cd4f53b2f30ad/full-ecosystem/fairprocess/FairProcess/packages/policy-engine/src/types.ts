/**
 * @file types.ts
 * @description Core TypeScript interfaces and enums for the FairProcess Policy-as-Code Engine.
 * Implements Section 8.8 of the product spec, focusing on neutral process integrity language,
 * explicit lifecycle tracking, and rigorous test-suite validation before activation.
 */

/**
 * Supported rule types as mandated by Section 8.8 of the spec.
 * Each type represents a specific process-integrity check.
 */
export type RuleType =
  | 'required-event'
  | 'required-document'
  | 'timing' // Earliest or latest action constraints
  | 'sequence'
  | 'service'
  | 'notice-content'
  | 'recordation'
  | 'filing'
  | 'appeal-window'
  | 'finality'
  | 'monetary-calculation'
  | 'release'
  | 'cross-system-consistency'
  | 'search-completeness';

/**
 * Valid lifecycle states for a process rule.
 * State transition rules must be strictly enforced.
 */
export type RuleLifecycleState =
  | 'Draft'
  | 'EngineeringReview'
  | 'LegalReview'
  | 'Approved'
  | 'Active'
  | 'Suspended'
  | 'Superseded'
  | 'Retired';

/**
 * Evaluation output statuses as mandated by the FairProcess spec.
 * Crucial principle: Use neutral process language. Avoid prejudicial words like 'illegal',
 * 'fraudulent', or 'missing'. Use 'NotLocated' rather than 'Missing'.
 */
export type OutputStatus =
  | 'Satisfied'
  | 'NotYetApplicable'
  | 'AwaitingTrigger'
  | 'NotYetEligible'
  | 'Located'
  | 'NotLocated' // Use instead of "missing" to maintain procedural neutrality
  | 'LocatedOutsideExpectedSequence'
  | 'RecordedTooEarly'
  | 'RecordedAfterExpectedDeadline'
  | 'ContradictoryEvidence'
  | 'InsufficientEvidence'
  | 'SearchIncomplete'
  | 'HumanReviewRequired'
  | 'RuleNotActivated';

/**
 * Severity levels for process violations or evaluation anomalies.
 */
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Represents a test case embedded within the rule itself.
 * The test suite MUST pass before a rule can be transitioned to the 'Active' state.
 */
export interface TestCase {
  test_id: string;
  description: string;
  inputs: Record<string, any>;
  expected_status: OutputStatus;
  expected_explanation_contains?: string;
}

/**
 * The JSON Schema interface for declaring required inputs.
 */
export interface JsonSchema {
  type: 'object';
  properties: Record<string, any>;
  required: string[];
  [key: string]: any;
}

/**
 * Core Rule interface defining a policy as code.
 * Implements the Rule schema from Section 8.8.
 */
export interface Rule {
  rule_id: string;
  name: string;
  jurisdiction: string;
  agency: string;
  proceeding_type: string;
  citation: string;
  source_document: string;
  source_url: string;
  source_excerpt: string;
  effective_start_date: string; // ISO-8601 string
  effective_end_date: string | null; // ISO-8601 string or null
  rule_type: RuleType;
  required_inputs: JsonSchema;
  deterministic_expression: string; // Evaluation logic representation
  exceptions: string[];
  output_statuses: OutputStatus[];
  severity: SeverityLevel;
  human_review_required: boolean;
  legal_review_status: 'Pending' | 'Approved' | 'Rejected';
  drafted_by: string;
  reviewed_by: string;
  approved_by: string;
  policy_version: string;
  test_suite: TestCase[];
  activation_state: RuleLifecycleState;
}

/**
 * Details any limitations encountered during the factual search.
 * FairProcess principle: Negative findings ("NotLocated") must be qualified by search limitations,
 * as "not located" is not equivalent to "did not exist".
 */
export interface SearchLimitation {
  source_system: string;
  query_parameter: string;
  scope_limitation: string;
  limitation_reason: string;
}

/**
 * Output of a single rule evaluation.
 * Captures all contextual and tracking information required for procedural transparency.
 */
export interface EvaluationResult {
  rule_id: string;
  policy_version: string;
  input_values: Record<string, any>;
  input_source_references?: Record<string, string>;
  evaluation_timestamp: string; // ISO-8601 format
  status: OutputStatus;
  explanation: string;
  severity: SeverityLevel;
  search_limitations: SearchLimitation[];
  required_reviewer_role?: string | null;
  recommended_next_action?: string;
}
