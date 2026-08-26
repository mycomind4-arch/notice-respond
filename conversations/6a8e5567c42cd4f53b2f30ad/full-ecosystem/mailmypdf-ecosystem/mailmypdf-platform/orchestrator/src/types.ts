/**
 * Ecosystem Orchestrator — Type definitions
 *
 * Shared types for the manifest, capability graph, audit results,
 * opportunities, and engineering journal.
 */

// ── Manifest Types ─────────────────────────────────────────────────────────────

export type RepositoryType = "core" | "vertical" | "platform" | "backup";
export type RepositoryStatus = "production" | "live" | "development" | "planned" | "archived";

export interface RepositoryEntry {
  id: string;
  type: RepositoryType;
  status: RepositoryStatus;
  description?: string | undefined;
  github: string | null;
  production: boolean;
  createdAt: string;
  lastUpdated?: string | undefined;
  sizeKB?: number | undefined;
  openIssues?: number | undefined;
  branches?: number | undefined;
  defaultBranch: string;
  extraBranches?: string[] | undefined;
}

export interface EngineeringMode {
  name: string;
  description: string;
  canModifyCode: boolean;
  canCommit: boolean;
  canDeploy: boolean;
  autoSelectsTasks: boolean;
  safeActions?: string[] | undefined;
  requiresApproval?: string[] | undefined;
}

export interface EcosystemManifest {
  ecosystem: {
    name: string;
    description: string;
    githubOrg: string;
    version: string;
    lastUpdated: string;
  };
  repositories: RepositoryEntry[];
  engineeringModes: EngineeringMode[];
  defaultMode: string;
}

// ── Capability Graph Types ─────────────────────────────────────────────────────

export type CapabilityStatus = "implemented" | "in-progress" | "planned" | "deferred" | "not-started";
export type StabilityLevel = "stable" | "unstable" | "none";

export interface Capability {
  id: string;
  name: string;
  package: string | null;
  status: CapabilityStatus;
  stability: StabilityLevel;
  consumers: string[];
  unlocks: number;
  description: string;
  duplicateImplementation?: boolean | undefined;
  duplicationScore?: number | undefined;
  deferredReason?: string | undefined;
}

export interface CapabilityGraph {
  version: string;
  lastUpdated: string;
  capabilities: Capability[];
  capabilityMatrix: Record<string, string[]>;
}

// ── Audit Types ───────────────────────────────────────────────────────────────

export type HealthDimension =
  | "build"
  | "product"
  | "technical"
  | "security"
  | "ai_capability"
  | "ux"
  | "test_coverage"
  | "platform_integration"
  | "deployment"
  | "opportunity";

export interface RepoAudit {
  repoId: string;
  dimensions: Record<HealthDimension, AuditDimension>;
  overallHealth: number;
  platformIntegration: number;
  techDebt: number;
  staleness: number;
}

export interface AuditDimension {
  score: number;
  notes: string;
  evidence: string[];
}

export interface EcosystemAudit {
  repos: RepoAudit[];
  overallHealth: number;
  platformHealth: number;
  ecosystemHealth: number;
  auditedAt: string;
  summary: AuditSummary;
}

export interface AuditSummary {
  totalRepos: number;
  liveRepos: number;
  plannedRepos: number;
  productionRepos: number;
  totalCapabilities: number;
  implementedCapabilities: number;
  missingCapabilities: number;
  duplicatedCode: number;
  highPriorityGaps: string[];
}

// ── Opportunity Types ─────────────────────────────────────────────────────────

export type OpportunityType =
  | "platform_extraction"
  | "platform_integration"
  | "bug_fix"
  | "test_improvement"
  | "dependency_update"
  | "documentation"
  | "ci_improvement"
  | "observability"
  | "new_vertical"
  | "architectural";

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  description: string;
  targetRepo: string | null;
  affectedRepos: string[];
  impact: number;
  leverage: number;
  urgency: number;
  effort: number;
  priority: number;
  confidence: number;
  platformLeverage: "EXTREME" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  requiresApproval: boolean;
  rationale: string;
  steps: string[];
}

// ── Journal Types ─────────────────────────────────────────────────────────────

export type JournalActionType =
  | "discovery_started"
  | "discovery_completed"
  | "audit_started"
  | "audit_completed"
  | "opportunity_identified"
  | "task_selected"
  | "implementation_started"
  | "code_change"
  | "test_run"
  | "test_passed"
  | "test_failed"
  | "security_scan"
  | "review_started"
  | "review_passed"
  | "review_failed"
  | "commit"
  | "push"
  | "deploy"
  | "deploy_verified"
  | "ecosystem_updated"
  | "approval_requested"
  | "approval_granted"
  | "approval_denied"
  | "cycle_completed";

export interface JournalEntry {
  timestamp: string;
  action: JournalActionType;
  details: string;
  targetRepo?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface EngineeringJournal {
  entries: JournalEntry[];
  cycleId: string;
  mode: string;
  startedAt: string;
  completedAt?: string | undefined;
  impact?: {
    platformReuse?: number | undefined;
    repoHealth?: Record<string, number> | undefined;
    capabilitiesUnlocked?: number | undefined;
  } | undefined;
}

// ── Orchestrator Cycle Types ──────────────────────────────────────────────────

export interface OrchestratorCycle {
  id: string;
  mode: string;
  startedAt: string;
  completedAt?: string | undefined;
  discovery: unknown;
  audit: EcosystemAudit | null;
  opportunities: Opportunity[];
  selectedTask: Opportunity | null;
  journal: EngineeringJournal;
}

export type OrchestratorMode = "OBSERVE" | "PLAN" | "BUILD" | "AUTONOMOUS" | "SAFE_AUTONOMOUS";
