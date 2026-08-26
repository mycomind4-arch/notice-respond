export const GOLD_STANDARD_STAGES = [
  "secure-ingest",
  "classify",
  "extract",
  "understand",
  "facts-provenance",
  "timeline-deadlines",
  "issues-discrepancies",
  "evidence",
  "authority-research",
  "risk",
  "strategy",
  "draft",
  "validate",
  "blocking-gates",
  "human-review",
  "authorized-mail",
  "track",
  "prove-audit",
] as const;

export type GoldStandardStage = (typeof GOLD_STANDARD_STAGES)[number];

export type WorkflowStageResult<T = unknown> = {
  stage: GoldStandardStage;
  status: "completed" | "blocked" | "failed" | "skipped";
  data?: T;
  errors?: string[];
  warnings?: string[];
};

export type GoldStandardWorkflowResult<TState = unknown> = {
  status: "completed" | "blocked" | "failed";
  stages: WorkflowStageResult[];
  state: TState;
};

export type GoldStandardWorkflow<TInput, TState> = {
  id: string;
  run(input: TInput): Promise<GoldStandardWorkflowResult<TState>>;
};

/**
 * Shared contract helpers. Domain adapters own the actual intelligence;
 * this module owns stage identity and result semantics.
 */
export function isGoldStandardStage(value: string): value is GoldStandardStage {
  return (GOLD_STANDARD_STAGES as readonly string[]).includes(value);
}

export function hasAllGoldStandardStages(stages: readonly WorkflowStageResult[]): boolean {
  const completed = new Set(stages.filter((stage) => stage.status === "completed").map((stage) => stage.stage));
  return GOLD_STANDARD_STAGES.every((stage) => completed.has(stage));
}
