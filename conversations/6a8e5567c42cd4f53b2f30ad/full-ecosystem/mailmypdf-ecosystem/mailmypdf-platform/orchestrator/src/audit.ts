/**
 * Ecosystem Orchestrator — Audit Engine
 *
 * Assesses the health of each repository across multiple dimensions:
 * build, product, technical, security, AI capability, UX, test coverage,
 * platform integration, deployment, and opportunity.
 *
 * Combines data from GitHub discovery with the capability graph.
 */

import type {
  EcosystemManifest,
  CapabilityGraph,
  RepoAudit,
  AuditDimension,
  EcosystemAudit,
  AuditSummary,
  HealthDimension,
} from "./types.js";
import type { DiscoveredRepo } from "./discovery.js";

export class AuditEngine {
  /**
   * Audit a single repository based on discovered data.
   */
  auditRepo(
    repo: DiscoveredRepo,
    manifest: EcosystemManifest,
    graph: CapabilityGraph,
  ): RepoAudit {
    const entry = manifest.repositories.find((r) => r.id === repo.id);

    const dimensions: Record<HealthDimension, AuditDimension> = {
      build: this.auditBuild(repo),
      product: this.auditProduct(repo, entry),
      technical: this.auditTechnical(repo),
      security: this.auditSecurity(repo),
      ai_capability: this.auditAICapability(repo, graph, entry),
      ux: this.auditUX(repo, entry),
      test_coverage: this.auditTestCoverage(repo),
      platform_integration: this.auditPlatformIntegration(repo, entry, graph),
      deployment: this.auditDeployment(repo, entry),
      opportunity: this.auditOpportunity(repo, entry, graph),
    };

    const overallHealth = this.calculateOverallHealth(dimensions);
    const platformIntegration = dimensions.platform_integration.score;
    const techDebt = this.calculateTechDebt(dimensions);
    const staleness = this.calculateStaleness(repo);

    return {
      repoId: repo.id,
      dimensions,
      overallHealth,
      platformIntegration,
      techDebt,
      staleness,
    };
  }

  /**
   * Audit the entire ecosystem.
   */
  auditEcosystem(
    repos: DiscoveredRepo[],
    manifest: EcosystemManifest,
    graph: CapabilityGraph,
  ): EcosystemAudit {
    const repoAudits = repos
      .filter((r) => !r.archived && !r.disabled)
      .map((r) => this.auditRepo(r, manifest, graph));

    const overallHealth = avg(repoAudits.map((a) => a.overallHealth));
    const platformHealth = this.calculatePlatformHealth(graph);
    const ecosystemHealth = this.calculateEcosystemHealth(repoAudits, graph);

    const summary: AuditSummary = {
      totalRepos: repoAudits.length,
      liveRepos: repoAudits.filter((a) => {
        const entry = manifest.repositories.find((r) => r.id === a.repoId);
        return entry?.status === "live" || entry?.status === "production";
      }).length,
      plannedRepos: manifest.repositories.filter((r) => r.status === "planned").length,
      productionRepos: manifest.repositories.filter((r) => r.status === "production").length,
      totalCapabilities: graph.capabilities.length,
      implementedCapabilities: graph.capabilities.filter((c) => c.status === "implemented").length,
      missingCapabilities: graph.capabilities.filter((c) => c.status === "not-started" || c.status === "planned").length,
      duplicatedCode: graph.capabilities.filter((c) => c.duplicateImplementation).length,
      highPriorityGaps: graph.capabilities
        .filter((c) => c.duplicateImplementation && (c.duplicationScore ?? 0) > 7)
        .map((c) => c.name),
    };

    return {
      repos: repoAudits,
      overallHealth,
      platformHealth,
      ecosystemHealth,
      auditedAt: new Date().toISOString(),
      summary,
    };
  }

  // ── Dimension Audits ─────────────────────────────────────────────────────────

  private auditBuild(repo: DiscoveredRepo): AuditDimension {
    // Heuristic: TypeScript repos with recent activity are healthier
    const hasTS = repo.language === "TypeScript";
    const score = hasTS ? 7 : repo.language ? 5 : 3;
    return {
      score,
      notes: `${repo.language ?? "Unknown"} repository`,
      evidence: [`Language: ${repo.language ?? "none"}`, `Size: ${repo.sizeKB}KB`],
    };
  }

  private auditProduct(repo: DiscoveredRepo, entry?: { status?: string }): AuditDimension {
    if (entry?.status === "production") return { score: 9, notes: "In production", evidence: ["production status"] };
    if (entry?.status === "live") return { score: 7, notes: "Live but not production", evidence: ["live status"] };
    if (entry?.status === "development") return { score: 5, notes: "In development", evidence: ["development status"] };
    if (entry?.status === "planned") return { score: 2, notes: "Not yet created", evidence: ["planned status"] };
    return { score: 1, notes: "Unknown status", evidence: [] };
  }

  private auditTechnical(repo: DiscoveredRepo): AuditDimension {
    // Heuristic: size indicates complexity. Very large repos may have tech debt.
    let score = 7;
    if (repo.sizeKB > 50000) score = 5; // 50MB+ — likely has node_modules committed
    if (repo.sizeKB > 100000) score = 3;
    if (repo.openIssues > 5) score -= 2;
    return {
      score,
      notes: `Size: ${repo.sizeKB}KB, ${repo.openIssues} open issues`,
      evidence: [`Size: ${repo.sizeKB}KB`, `Issues: ${repo.openIssues}`],
    };
  }

  private auditSecurity(repo: DiscoveredRepo): AuditDimension {
    let score = 7;
    if (repo.openIssues > 10) score -= 3;
    if (repo.defaultBranch === "main") score += 1; // Using main branch is good practice
    if (!repo.license) score -= 1;
    return {
      score: clamp(score),
      notes: `License: ${repo.license ?? "none"}, ${repo.branches.length} branches`,
      evidence: [`Default branch: ${repo.defaultBranch}`, `License: ${repo.license ?? "none"}`],
    };
  }

  private auditAICapability(
    repo: DiscoveredRepo,
    graph: CapabilityGraph,
    entry?: { id?: string },
  ): AuditDimension {
    if (!entry?.id) return { score: 3, notes: "Not in manifest", evidence: [] };
    const capabilities = graph.capabilityMatrix[entry.id] ?? [];
    const aiCaps = capabilities.filter((c) => c === "ai" || c === "intelligence");
    const score = aiCaps.length > 0 ? 7 : 3;
    return {
      score,
      notes: `${aiCaps.length} AI capabilities mapped`,
      evidence: aiCaps,
    };
  }

  private auditUX(repo: DiscoveredRepo, entry?: { status?: string }): AuditDimension {
    // Placeholder — would need to inspect the actual UI
    const score = entry?.status === "production" || entry?.status === "live" ? 6 : 4;
    return { score, notes: "UX not directly audited", evidence: [] };
  }

  private auditTestCoverage(repo: DiscoveredRepo): AuditDimension {
    // Heuristic: repos with no test files get low scores
    // This would be enhanced by actually scanning the repo
    const hasTS = repo.language === "TypeScript";
    const score = hasTS ? 5 : 3;
    return {
      score,
      notes: "Estimated from language and size",
      evidence: [`Language: ${repo.language ?? "none"}`],
    };
  }

  private auditPlatformIntegration(
    repo: DiscoveredRepo,
    entry?: { id?: string; type?: string },
    graph?: CapabilityGraph,
  ): AuditDimension {
    if (entry?.type === "core" || entry?.id === "mailmypdf-platform") {
      return { score: 10, notes: "Is the platform", evidence: ["platform repo"] };
    }
    if (!entry?.id || !graph) {
      return { score: 1, notes: "Not mapped to capabilities", evidence: [] };
    }
    const capabilities = graph.capabilityMatrix[entry.id] ?? [];
    const implemented = capabilities.filter((capId) => {
      const cap = graph.capabilities.find((c) => c.id === capId);
      return cap?.status === "implemented";
    });
    const score = capabilities.length > 0
      ? Math.round((implemented.length / capabilities.length) * 10)
      : 0;
    return {
      score,
      notes: `${implemented.length}/${capabilities.length} capabilities implemented`,
      evidence: implemented,
    };
  }

  private auditDeployment(repo: DiscoveredRepo, entry?: { status?: string }): AuditDimension {
    if (entry?.status === "production") return { score: 8, notes: "Deployed to production", evidence: [] };
    if (entry?.status === "live") return { score: 5, notes: "Live but deployment unknown", evidence: [] };
    return { score: 2, notes: "Not deployed", evidence: [] };
  }

  private auditOpportunity(
    repo: DiscoveredRepo,
    entry?: { type?: string; id?: string },
    graph?: CapabilityGraph,
  ): AuditDimension {
    if (!entry?.id || !graph) return { score: 3, notes: "No capability mapping", evidence: [] };
    const capabilities = graph.capabilityMatrix[entry.id] ?? [];
    const missing = capabilities.filter((capId) => {
      const cap = graph.capabilities.find((c) => c.id === capId);
      return cap && cap.status !== "implemented";
    });
    const score = Math.min(missing.length + 3, 10);
    return {
      score,
      notes: `${missing.length} capabilities not yet integrated`,
      evidence: missing,
    };
  }

  // ── Aggregate Calculations ──────────────────────────────────────────────────

  private calculateOverallHealth(dims: Record<HealthDimension, AuditDimension>): number {
    const weights: Record<HealthDimension, number> = {
      build: 1.0,
      product: 1.2,
      technical: 1.0,
      security: 1.5,
      ai_capability: 0.8,
      ux: 0.8,
      test_coverage: 1.0,
      platform_integration: 1.2,
      deployment: 1.0,
      opportunity: 0.5,
    };
    let weightedSum = 0;
    let weightTotal = 0;
    for (const key of Object.keys(weights) as HealthDimension[]) {
      weightedSum += dims[key].score * weights[key];
      weightTotal += weights[key];
    }
    return Math.round((weightedSum / weightTotal) * 10) / 10;
  }

  private calculateTechDebt(dims: Record<HealthDimension, AuditDimension>): number {
    // Tech debt is inverse of technical health + test coverage
    const techScore = dims.technical.score;
    const testScore = dims.test_coverage.score;
    return clamp(10 - (techScore + testScore) / 2);
  }

  private calculateStaleness(repo: DiscoveredRepo): number {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(repo.updatedAt).getTime()) / 86_400_000,
    );
    if (daysSinceUpdate < 1) return 0;
    if (daysSinceUpdate < 3) return 1;
    if (daysSinceUpdate < 7) return 2;
    if (daysSinceUpdate < 14) return 4;
    if (daysSinceUpdate < 30) return 6;
    if (daysSinceUpdate < 60) return 8;
    return 10;
  }

  private calculatePlatformHealth(graph: CapabilityGraph): number {
    const implemented = graph.capabilities.filter((c) => c.status === "implemented").length;
    const total = graph.capabilities.filter((c) => c.status !== "deferred").length;
    if (total === 0) return 0;
    return Math.round((implemented / total) * 100) / 10;
  }

  private calculateEcosystemHealth(audits: RepoAudit[], graph: CapabilityGraph): number {
    if (audits.length === 0) return 0;
    const avgHealth = avg(audits.map((a) => a.overallHealth));
    const implemented = graph.capabilities.filter((c) => c.status === "implemented").length;
    const total = graph.capabilities.filter((c) => c.status !== "deferred").length;
    const capabilityRatio = total > 0 ? implemented / total : 0;
    return Math.round((avgHealth * 0.6 + capabilityRatio * 10 * 0.4) * 10) / 10;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(10, value));
}
