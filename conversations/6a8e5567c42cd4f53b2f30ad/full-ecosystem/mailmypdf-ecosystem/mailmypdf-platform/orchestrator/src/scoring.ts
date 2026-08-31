/**
 * Ecosystem Orchestrator — Scoring & Priority Engine
 *
 * Calculates opportunity priority using:
 *   Priority = Impact × Leverage × Urgency ÷ Effort
 *
 * Also determines platform leverage level and whether
 * a task requires approval based on engineering mode.
 */

import type {
  Opportunity,
  OpportunityType,
  EngineeringMode,
  Capability,
  CapabilityGraph,
  EcosystemManifest,
  RepoAudit,
} from "./types.js";

// ── Scoring Constants ──────────────────────────────────────────────────────────

export const SCORE_MIN = 0;
export const SCORE_MAX = 10;

export const LEVERAGE_THRESHOLD = {
  EXTREME: 4,   // 4+ repos affected
  HIGH: 3,      // 3 repos affected
  MEDIUM: 2,    // 2 repos affected
  LOW: 1,       // 1 repo affected
};

// ── Priority Calculation ───────────────────────────────────────────────────────

/**
 * Priority = Impact × Leverage × Urgency ÷ Effort
 *
 * All inputs are 0-10. Result is 0-100 (before normalization).
 * A higher priority means the work should be done sooner.
 */
export function calculatePriority(
  impact: number,
  leverage: number,
  urgency: number,
  effort: number,
): number {
  // Guard against division by zero
  if (effort <= 0) return 0;

  // Clamp all inputs to [0, 10]
  const i = clamp(impact);
  const l = clamp(leverage);
  const u = clamp(urgency);
  const e = clamp(effort);

  // Leverage multiplier: if 0, the opportunity has no ecosystem impact
  if (l === 0) return 0;

  const raw = (i * l * u) / e;
  // Normalize to 0-10 scale (max possible = 10*10*10/1 = 1000, but we normalize differently)
  // Realistic max: impact=10, leverage=10, urgency=10, effort=1 → 1000
  // Normalize: divide by 100, cap at 10
  return Math.min(raw / 10, 10);
}

/**
 * Determine platform leverage level based on number of affected repos.
 */
export function platformLeverageLevel(affectedRepoCount: number): "EXTREME" | "HIGH" | "MEDIUM" | "LOW" | "NONE" {
  if (affectedRepoCount >= LEVERAGE_THRESHOLD.EXTREME) return "EXTREME";
  if (affectedRepoCount >= LEVERAGE_THRESHOLD.HIGH) return "HIGH";
  if (affectedRepoCount >= LEVERAGE_THRESHOLD.MEDIUM) return "MEDIUM";
  if (affectedRepoCount >= LEVERAGE_THRESHOLD.LOW) return "LOW";
  return "NONE";
}

/**
 * Determine if a task requires approval based on the engineering mode.
 */
export function requiresApproval(
  type: OpportunityType,
  mode: EngineeringMode,
): boolean {
  if (mode.name === "AUTONOMOUS") return false;
  if (mode.name === "OBSERVE" || mode.name === "PLAN") return true;
  if (mode.name === "BUILD") return true; // BUILD requires explicit task selection

  // SAFE_AUTONOMOUS: check safe actions list
  if (mode.name === "SAFE_AUTONOMOUS" && mode.requiresApproval) {
    const approvalTriggers: Record<OpportunityType, boolean> = {
      architectural: true,
      new_vertical: true,
      platform_extraction: true,
      platform_integration: false,
      bug_fix: false,
      test_improvement: false,
      dependency_update: true, // major version bumps need approval
      documentation: false,
      ci_improvement: false,
      observability: false,
    };
    return approvalTriggers[type] ?? true;
  }

  return true;
}

// ── Opportunity Scoring ─────────────────────────────────────────────────────────

export function scoreOpportunity(
  opp: Omit<Opportunity, "priority" | "platformLeverage" | "requiresApproval">,
  mode: EngineeringMode,
): Opportunity {
  const priority = calculatePriority(opp.impact, opp.leverage, opp.urgency, opp.effort);
  const leverage = platformLeverageLevel(opp.affectedRepos.length);
  const approval = requiresApproval(opp.type, mode);

  return {
    ...opp,
    priority,
    platformLeverage: leverage,
    requiresApproval: approval,
  };
}

// ── Opportunity Generation ─────────────────────────────────────────────────────

/**
 * Generate opportunities from the capability graph and audit data.
 *
 * For each capability that is not yet implemented or in-progress, generate
 * an opportunity to implement it. Score based on how many verticals it unlocks.
 */
export function generateCapabilityOpportunities(
  graph: CapabilityGraph,
  manifest: EcosystemManifest,
  mode: EngineeringMode,
): Opportunity[] {
  const opportunities: Opportunity[] = [];

  for (const cap of graph.capabilities) {
    if (cap.status === "implemented" || cap.status === "deferred") continue;

    // Base impact: how many verticals this unlocks
    const impact = Math.min(cap.unlocks * 1.5, 10);

    // Leverage: number of affected repos
    const leverage = Math.min(cap.unlocks, 10);

    // Urgency: if duplicate implementation exists, urgency is high
    const urgency = cap.duplicateImplementation ? 9 : 5;

    // Effort: planned capabilities are estimated, not-started need full build
    let effort = 5;
    if (cap.status === "not-started") effort = 7;
    if (cap.status === "in-progress") effort = 4;
    if (cap.status === "planned") effort = 6;

    const id = `cap-${cap.id}`;
    const type: OpportunityType = cap.duplicateImplementation ? "platform_extraction" : "platform_integration";

    const opp = scoreOpportunity(
      {
        id,
        type,
        title: cap.duplicateImplementation
          ? `Extract duplicate ${cap.name}`
          : `Implement ${cap.name}`,
        description: cap.description,
        targetRepo: "mailmypdf-platform",
        affectedRepos: cap.consumers,
        impact,
        leverage,
        urgency,
        effort,
        confidence: cap.duplicateImplementation ? 0.94 : 0.7,
        rationale: cap.duplicateImplementation
          ? `${cap.name} is duplicated across ${cap.consumers.length} repos. Extracting to platform unlocks ${cap.unlocks} verticals and eliminates maintenance burden.`
          : `${cap.name} is ${cap.status}. Implementing it unlocks ${cap.unlocks} verticals.`,
        steps: [
          `Design ${cap.id} package API`,
          `Implement core type contracts`,
          `Write tests`,
          `Publish @mailmypdf/${cap.id} package`,
          `Integrate into consumer verticals`,
        ],
      },
      mode,
    );

    opportunities.push(opp);
  }

  return opportunities.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate opportunities from audit data — tech debt, test gaps, CI issues.
 */
export function generateAuditOpportunities(
  audits: RepoAudit[],
  mode: EngineeringMode,
): Opportunity[] {
  const opportunities: Opportunity[] = [];

  for (const audit of audits) {
    // Low test coverage opportunity
    if (audit.dimensions.test_coverage.score < 5) {
      opportunities.push(
        scoreOpportunity(
          {
            id: `test-${audit.repoId}`,
            type: "test_improvement",
            title: `Improve test coverage in ${audit.repoId}`,
            description: `Test coverage score is ${audit.dimensions.test_coverage.score}/10`,
            targetRepo: audit.repoId,
            affectedRepos: [audit.repoId],
            impact: 4,
            leverage: 1,
            urgency: 6,
            effort: 3,
            confidence: 0.8,
            rationale: `Low test coverage in ${audit.repoId} risks regressions.`,
            steps: [`Identify untested modules`, `Write tests`, `Verify coverage`],
          },
          mode,
        ),
      );
    }

    // Tech debt opportunity
    if (audit.techDebt > 5) {
      opportunities.push(
        scoreOpportunity(
          {
            id: `debt-${audit.repoId}`,
            type: "bug_fix",
            title: `Address tech debt in ${audit.repoId}`,
            description: `Tech debt score is ${audit.techDebt}/10`,
            targetRepo: audit.repoId,
            affectedRepos: [audit.repoId],
            impact: 3,
            leverage: 1,
            urgency: 4,
            effort: 5,
            confidence: 0.6,
            rationale: `Accumulated tech debt in ${audit.repoId} is slowing development.`,
            steps: [`Identify top debt items`, `Plan refactoring`, `Execute incrementally`],
          },
          mode,
        ),
      );
    }

    // Staleness opportunity
    if (audit.staleness > 7) {
      opportunities.push(
        scoreOpportunity(
          {
            id: `stale-${audit.repoId}`,
            type: "dependency_update",
            title: `Update stale dependencies in ${audit.repoId}`,
            description: `Repository has not been updated recently (staleness: ${audit.staleness}/10)`,
            targetRepo: audit.repoId,
            affectedRepos: [audit.repoId],
            impact: 2,
            leverage: 1,
            urgency: 7,
            effort: 2,
            confidence: 0.9,
            rationale: `Stale repository may have security vulnerabilities and outdated dependencies.`,
            steps: [`Audit dependencies`, `Update safe patches`, `Test after each update`],
          },
          mode,
        ),
      );
    }

    // Low platform integration
    if (audit.platformIntegration < 3 && audit.repoId !== "mailmypdf-platform") {
      opportunities.push(
        scoreOpportunity(
          {
            id: `integrate-${audit.repoId}`,
            type: "platform_integration",
            title: `Integrate ${audit.repoId} with platform packages`,
            description: `Platform integration score is ${audit.platformIntegration}/10`,
            targetRepo: audit.repoId,
            affectedRepos: [audit.repoId],
            impact: 6,
            leverage: 1,
            urgency: 5,
            effort: 4,
            confidence: 0.7,
            rationale: `${audit.repoId} is not consuming platform packages. Integration reduces duplication.`,
            steps: [`Identify duplicate code`, `Map to platform packages`, `Integrate`, `Test`],
          },
          mode,
        ),
      );
    }
  }

  return opportunities.sort((a, b) => b.priority - a.priority);
}

// ── Utility ────────────────────────────────────────────────────────────────────

function clamp(value: number): number {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, value));
}

/**
 * Rank all opportunities and return the top N.
 */
export function rankOpportunities(
  opportunities: Opportunity[],
  limit: number = 10,
): Opportunity[] {
  return [...opportunities].sort((a, b) => b.priority - a.priority).slice(0, limit);
}

/**
 * Select the best opportunity that doesn't require approval (for autonomous modes).
 */
export function selectSafeAutonomousTask(
  opportunities: Opportunity[],
): Opportunity | null {
  const safe = opportunities.filter((o) => !o.requiresApproval);
  if (safe.length === 0) return null;
  return rankOpportunities(safe, 1)[0] ?? null;
}
