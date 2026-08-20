/* ═══════════════════════════════════════════════════════════
   WORKFLOW RUNTIME — reusable state machine for all workflows.

   Owns:
   - workflow definition (from catalog)
   - current step / step navigation
   - collected workflow state (facts, deadlines, evidence, draft)
   - transition validation
   - lifecycle awareness

   Does NOT own:
   - domain intelligence (domain services do that)
   - UI rendering (components do that)
   - persistence (repository does that)

   The runtime is generic: CP2000, IRS notice, and court summons
   all use the same runtime with different definitions.
   ═══════════════════════════════════════════════════════════ */

import type { MasterWorkflowDefinition, WorkflowLifecycle } from "./workflow-definition";
import type { NoticeFact } from "./fact";
import type { Deadline } from "./deadline";
import type { Evidence } from "./evidence";
import type { NoticeType } from "./notice-type";

export type WorkflowPhase =
  | "intro"
  | "document"
  | "extraction"
  | "facts"
  | "objective"
  | "draft"
  | "review"
  | "attachments"
  | "recipient"
  | "mailing"
  | "checkout"
  | "submitted";

export interface DocumentUpload {
  fileName: string;
  fileSize: number;
  fileType: string;
  rawText: string;
  uploadedAt: string;
}

export interface ExtractionResult {
  noticeType: NoticeType;
  classificationConfidence: number;
  facts: NoticeFact[];
  deadlines: Deadline[];
  agency?: string;
  referenceNumber?: string;
  noticeDate?: string;
  amountOwed?: string;
  rawText: string;
  extractionConfidence: number;
}

export interface DraftValidationFinding {
  check: string;
  passed: boolean;
  detail: string;
  severity: "error" | "warning" | "info";
}

export interface DraftValidationResult {
  findings: DraftValidationFinding[];
  passed: boolean;
  errors: number;
  warnings: number;
}

export interface MailingState {
  method: string;
  recipient: {
    name: string;
    org: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
  };
  providerOrderId?: string;
  trackingNumber?: string;
  status: "not_started" | "draft" | "paid" | "submitted" | "mailed" | "in_transit" | "delivered" | "failed";
}

export interface WorkflowState {
  workflowId: string;
  step: number;
  phase: WorkflowPhase;
  upload: DocumentUpload | null;
  extraction: ExtractionResult | null;
  isProcessing: boolean;
  extractedFacts: NoticeFact[];
  userFacts: string;
  userObjective: string;
  deadline: Deadline | null;
  evidence: Evidence[];
  draft: string;
  draftValidation: DraftValidationResult | null;
  reviewChecks: boolean[];
  approved: boolean;
  mailing: MailingState | null;
  startedAt: string;
  lastUpdated: string;
}

export function createWorkflowState(definition: MasterWorkflowDefinition): WorkflowState {
  const steps = definition.ux?.steps ?? [];
  return {
    workflowId: definition.id,
    step: 0,
    phase: (steps[0]?.id as WorkflowPhase | undefined) ?? "intro",
    upload: null,
    extraction: null,
    isProcessing: false,
    extractedFacts: [],
    userFacts: "",
    userObjective: "",
    deadline: null,
    evidence: [],
    draft: "",
    draftValidation: null,
    reviewChecks: (definition.ux?.reviewChecks ?? []).map(() => false),
    approved: false,
    mailing: null,
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
}

export function getSteps(definition: MasterWorkflowDefinition): { id: string; label: string }[] {
  return definition.ux?.steps ?? [];
}

function hasValidRecipient(state: WorkflowState): boolean {
  if (!state.mailing) return false;
  const r = state.mailing.recipient;
  return Boolean(r.name.trim() && r.address1.trim() && r.city.trim() && r.state.trim() && r.zip.trim());
}

function canEnterConsequentialMailing(state: WorkflowState): boolean {
  return state.approved && Boolean(state.mailing) && hasValidRecipient(state);
}

function hasCompletedReview(state: WorkflowState): boolean {
  return state.draftValidation?.passed === true && state.reviewChecks.length > 0 && state.reviewChecks.every(Boolean);
}

export function canAdvance(state: WorkflowState, definition: MasterWorkflowDefinition): boolean {
  const phase = state.phase;

  switch (phase) {
    case "document":
      return Boolean(state.upload) || state.extraction !== null;
    case "extraction":
      return state.extraction !== null;
    case "facts":
      return state.userFacts.trim().length > 0;
    case "objective":
      return state.userObjective.trim().length > 0;
    case "draft":
      return Boolean(state.draft.trim()) && state.draftValidation !== null && state.draftValidation.passed;
    case "review":
      // Review is complete only when validation passed and every review check passed.
      // Explicit approval is a separate transition and is required before mailing.
      return hasCompletedReview(state) && state.approved;
    case "attachments":
      return true;
    case "recipient":
      return hasValidRecipient(state);
    case "mailing":
      return canEnterConsequentialMailing(state);
    case "checkout":
      return (
        canEnterConsequentialMailing(state) &&
        Boolean(state.mailing?.providerOrderId) &&
        ["submitted", "mailed", "in_transit", "delivered"].includes(state.mailing?.status ?? "not_started")
      );
    case "submitted":
      return false;
    case "intro":
    default:
      return true;
  }
}

export function advanceStep(state: WorkflowState, definition: MasterWorkflowDefinition): WorkflowState {
  const steps = getSteps(definition);
  if (state.step >= steps.length - 1) return state;
  if (!canAdvance(state, definition)) return state;

  const nextStep = state.step + 1;
  return {
    ...state,
    step: nextStep,
    phase: steps[nextStep].id as WorkflowPhase,
    lastUpdated: new Date().toISOString(),
  };
}

export function retreatStep(state: WorkflowState, definition: MasterWorkflowDefinition): WorkflowState {
  if (state.step <= 0) return state;
  const steps = getSteps(definition);
  const prevStep = state.step - 1;
  return {
    ...state,
    step: prevStep,
    phase: steps[prevStep].id as WorkflowPhase,
    lastUpdated: new Date().toISOString(),
  };
}

export function goToStep(state: WorkflowState, definition: MasterWorkflowDefinition, stepIndex: number): WorkflowState {
  const steps = getSteps(definition);
  if (stepIndex < 0 || stepIndex >= steps.length) return state;
  if (stepIndex <= state.step) {
    return {
      ...state,
      step: stepIndex,
      phase: steps[stepIndex].id as WorkflowPhase,
      lastUpdated: new Date().toISOString(),
    };
  }
  if (stepIndex !== state.step + 1 || !canAdvance(state, definition)) return state;
  return {
    ...state,
    step: stepIndex,
    phase: steps[stepIndex].id as WorkflowPhase,
    lastUpdated: new Date().toISOString(),
  };
}

export function setUpload(state: WorkflowState, upload: DocumentUpload): WorkflowState {
  return { ...state, upload, lastUpdated: new Date().toISOString() };
}

export function setExtraction(state: WorkflowState, extraction: ExtractionResult): WorkflowState {
  return {
    ...state,
    extraction,
    extractedFacts: extraction.facts,
    deadline: extraction.deadlines[0] ?? null,
    lastUpdated: new Date().toISOString(),
  };
}

export function setProcessing(state: WorkflowState, isProcessing: boolean): WorkflowState {
  return { ...state, isProcessing, lastUpdated: new Date().toISOString() };
}

export function setUserFacts(state: WorkflowState, facts: string): WorkflowState {
  return { ...state, userFacts: facts, lastUpdated: new Date().toISOString() };
}

export function setUserObjective(state: WorkflowState, objective: string): WorkflowState {
  return { ...state, userObjective: objective, lastUpdated: new Date().toISOString() };
}

export function setDraft(state: WorkflowState, draft: string): WorkflowState {
  return { ...state, draft, lastUpdated: new Date().toISOString() };
}

export function setDraftValidation(state: WorkflowState, validation: DraftValidationResult): WorkflowState {
  return { ...state, draftValidation: validation, lastUpdated: new Date().toISOString() };
}

export function setReviewChecks(state: WorkflowState, checks: boolean[]): WorkflowState {
  return {
    ...state,
    reviewChecks: checks,
    lastUpdated: new Date().toISOString(),
  };
}

export function approveWorkflow(state: WorkflowState): WorkflowState {
  if (!hasCompletedReview(state)) return state;
  return { ...state, approved: true, lastUpdated: new Date().toISOString() };
}

export function revokeApproval(state: WorkflowState): WorkflowState {
  return { ...state, approved: false, lastUpdated: new Date().toISOString() };
}

export function setMailing(state: WorkflowState, mailing: MailingState): WorkflowState {
  return { ...state, mailing, lastUpdated: new Date().toISOString() };
}

export function setMailingStatus(
  state: WorkflowState,
  status: MailingState["status"],
  providerOrderId?: string,
  trackingNumber?: string,
): WorkflowState {
  if (!state.mailing) return state;
  return {
    ...state,
    mailing: {
      ...state.mailing,
      status,
      providerOrderId: providerOrderId ?? state.mailing.providerOrderId,
      trackingNumber: trackingNumber ?? state.mailing.trackingNumber,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function evaluateQualityGate(definition: MasterWorkflowDefinition): {
  gate: MasterWorkflowDefinition["qualityGate"];
  lifecycle: WorkflowLifecycle;
  canBeAuthority: boolean;
} {
  const gate = definition.qualityGate;
  const canBeAuthority = Object.values(gate).every(Boolean);
  return {
    gate,
    lifecycle: canBeAuthority ? "authority" : definition.lifecycle,
    canBeAuthority,
  };
}

export function isLastStep(state: WorkflowState, definition: MasterWorkflowDefinition): boolean {
  const steps = getSteps(definition);
  return state.step === steps.length - 1;
}

export function getCurrentStepLabel(state: WorkflowState, definition: MasterWorkflowDefinition): string {
  const steps = getSteps(definition);
  return steps[state.step]?.label ?? "";
}
