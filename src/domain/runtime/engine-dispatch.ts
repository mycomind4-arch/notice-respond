/* ═══════════════════════════════════════════════════════════
   ENGINE DISPATCH — typed engine policies for pipeline execution.

   Each engine defines:
   - ordered pipeline stages
   - which stages are required vs optional
   - how stage failures are handled

   Currently implemented: document-action
   Future: dispute, records, appeal, jurisdictional

   Unknown engines are rejected — never silently ignored.

   ═══════════════════════════════════════════════════════════ */

import type { WorkflowEngine } from "../workflow-definition";

// ── Pipeline Stage Definition ──────────────────────────────

export interface PipelineStageDef {
  /** Stage name (matches StageResult.stage) */
  name: string;
  /** Whether this stage is required for the engine */
  required: boolean;
  /** Whether failure of this stage blocks subsequent stages */
  blocksOnFailure: boolean;
}

// ── Engine Policy ───────────────────────────────────────────

export interface EnginePolicy {
  engine: WorkflowEngine;
  stages: PipelineStageDef[];
  /** Human-readable description */
  description: string;
}

// ── document-action engine policy ───────────────────────────
// Full pipeline with 20 stages per the architecture.
// Stages 1-14 are executable. Stages 15-20 are framework
// extension points that are currently SKIPPED — they must be
// explicitly present so the pipeline marks them SKIPPED
// rather than silently omitting them.

const documentActionPolicy: EnginePolicy = {
  engine: "document-action",
  description: "Upload a document, classify it, extract facts, identify deadlines and requirements, produce a response.",
  stages: [
    // ── Executable stages ──
    { name: "security", required: true, blocksOnFailure: true },
    { name: "classification", required: true, blocksOnFailure: true },
    { name: "extraction", required: true, blocksOnFailure: true },
    { name: "facts", required: true, blocksOnFailure: false },
    { name: "deadline", required: false, blocksOnFailure: false },
    { name: "discrepancy", required: false, blocksOnFailure: false },
    { name: "evidence", required: false, blocksOnFailure: false },
    { name: "research", required: false, blocksOnFailure: false },
    { name: "strategy", required: false, blocksOnFailure: false },
    { name: "draft", required: true, blocksOnFailure: true },
    { name: "draftProvenance", required: true, blocksOnFailure: false },
    { name: "factualValidation", required: false, blocksOnFailure: false },
    { name: "requirementValidation", required: false, blocksOnFailure: false },
    { name: "blocking", required: true, blocksOnFailure: true },
    // ── Framework extension points (SKIPPED until implemented) ──
    { name: "reviewBoundary", required: false, blocksOnFailure: false },
    { name: "approvalBoundary", required: false, blocksOnFailure: false },
    { name: "submissionBoundary", required: false, blocksOnFailure: false },
    { name: "proofTrackingBoundary", required: false, blocksOnFailure: false },
    // ── Marker stages (delegated to other stages) ──
    { name: "provenance", required: false, blocksOnFailure: false },
    { name: "analysis", required: false, blocksOnFailure: false },
  ],
};

// ── Engine Policy Registry ──────────────────────────────────

const ENGINE_POLICIES: Partial<Record<WorkflowEngine, EnginePolicy>> = {
  "document-action": documentActionPolicy,
};

// ── Resolution ──────────────────────────────────────────────

export function getEnginePolicy(engine: WorkflowEngine): EnginePolicy | undefined {
  return ENGINE_POLICIES[engine];
}

export function isEngineImplemented(engine: WorkflowEngine): boolean {
  return engine in ENGINE_POLICIES;
}

export function listImplementedEngines(): WorkflowEngine[] {
  return Object.keys(ENGINE_POLICIES) as WorkflowEngine[];
}

// ── Stage lookup helpers ────────────────────────────────────

export function getStageDef(policy: EnginePolicy, stageName: string): PipelineStageDef | undefined {
  return policy.stages.find((s) => s.name === stageName);
}

export function isStageRequired(policy: EnginePolicy, stageName: string): boolean {
  const def = getStageDef(policy, stageName);
  return def?.required ?? false;
}

export function stageBlocksOnFailure(policy: EnginePolicy, stageName: string): boolean {
  const def = getStageDef(policy, stageName);
  return def?.blocksOnFailure ?? false;
}
