/**
 * Ecosystem Orchestrator — Main Entry Point
 *
 * The orchestrator loop: discover → audit → find opportunities → prioritize →
 * select task → (implement if allowed) → verify → update ecosystem → repeat.
 *
 * In v0.1, only the read-only phases (discovery, audit, opportunity generation,
 * prioritization) are implemented. Implementation is manual.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  EcosystemManifest,
  CapabilityGraph,
  Opportunity,
  OrchestratorCycle,
  OrchestratorMode,
  EcosystemAudit,
} from "./types.js";
import { DiscoveryEngine } from "./discovery.js";
import { AuditEngine } from "./audit.js";
import {
  generateCapabilityOpportunities,
  generateAuditOpportunities,
  rankOpportunities,
  selectSafeAutonomousTask,
} from "./scoring.js";
import { Journal, generateCycleId } from "./journal.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ORCHESTRATOR_DIR = join(__dirname, "..");

// ── Manifest / Graph Loading ──────────────────────────────────────────────────

export function loadManifest(): EcosystemManifest {
  const raw = readFileSync(join(ORCHESTRATOR_DIR, "ecosystem-manifest.json"), "utf-8");
  return JSON.parse(raw) as EcosystemManifest;
}

export function loadCapabilityGraph(): CapabilityGraph {
  const raw = readFileSync(join(ORCHESTRATOR_DIR, "capability-graph.json"), "utf-8");
  return JSON.parse(raw) as CapabilityGraph;
}

export function getMode(manifest: EcosystemManifest, modeName?: string): OrchestratorMode {
  const name = modeName ?? manifest.defaultMode;
  const mode = manifest.engineeringModes.find((m) => m.name === name);
  if (!mode) throw new Error(`Unknown engineering mode: ${name}`);
  return name as OrchestratorMode;
}

// ── Orchestrator Cycle ─────────────────────────────────────────────────────────

export interface RunOptions {
  githubToken: string;
  mode?: OrchestratorMode;
  dryRun?: boolean;
}

export async function runCycle(options: RunOptions): Promise<OrchestratorCycle> {
  const manifest = loadManifest();
  const graph = loadCapabilityGraph();
  const modeName = options.mode ?? (manifest.defaultMode as OrchestratorMode);
  const mode = manifest.engineeringModes.find((m) => m.name === modeName)!;
  const cycleId = generateCycleId();
  const journal = new Journal(cycleId, modeName);

  journal.log("discovery_started", "Scanning GitHub organization for repositories");

  // ── Phase 1: Discovery ──────────────────────────────────────────────────────
  const discovery = new DiscoveryEngine({
    githubToken: options.githubToken,
    organization: manifest.ecosystem.githubOrg,
    ecosystemRepoIds: new Set(manifest.repositories.map((r) => r.id)),
  });

  const allRepos = await discovery.discoverAllRepos();
  const { ecosystem, other } = discovery.filterEcosystemRepos(allRepos, manifest);

  journal.log("discovery_completed", `Found ${allRepos.length} total repos, ${ecosystem.length} ecosystem, ${other.length} other`, {
    metadata: { ecosystem: ecosystem.map((r) => r.id), other: other.map((r) => r.id) },
  });

  // ── Phase 2: Audit ──────────────────────────────────────────────────────────
  journal.log("audit_started", "Assessing ecosystem health across all dimensions");

  const auditEngine = new AuditEngine();
  const audit: EcosystemAudit = auditEngine.auditEcosystem(ecosystem, manifest, graph);

  journal.log("audit_completed", `Overall health: ${audit.overallHealth}/10, Platform: ${audit.platformHealth}/10, Ecosystem: ${audit.ecosystemHealth}/10`, {
    metadata: {
      overallHealth: audit.overallHealth,
      platformHealth: audit.platformHealth,
      ecosystemHealth: audit.ecosystemHealth,
      summary: audit.summary,
    },
  });

  // ── Phase 3: Find Opportunities ──────────────────────────────────────────────
  const capOpps = generateCapabilityOpportunities(graph, manifest, mode);
  const auditOpps = generateAuditOpportunities(audit.repos, mode);
  const allOpportunities = [...capOpps, ...auditOpps];
  const ranked = rankOpportunities(allOpportunities, 20);

  journal.log("opportunity_identified", `Generated ${allOpportunities.length} opportunities, top ${ranked.length} ranked`, {
    metadata: { top5: ranked.slice(0, 5).map((o) => ({ id: o.id, title: o.title, priority: o.priority })) },
  });

  // ── Phase 4: Select Task ──────────────────────────────────────────────────────
  let selected: Opportunity | null = null;

  if (mode.autoSelectsTasks) {
    if (modeName === "SAFE_AUTONOMOUS") {
      selected = selectSafeAutonomousTask(ranked);
    } else {
      selected = ranked[0] ?? null;
    }
    if (selected) {
      journal.log("task_selected", selected.title, {
        targetRepo: selected.targetRepo ?? undefined,
        metadata: { priority: selected.priority, type: selected.type, requiresApproval: selected.requiresApproval },
      });
    }
  }

  // ── Phase 5: Report ────────────────────────────────────────────────────────────
  const cycle: OrchestratorCycle = {
    id: cycleId,
    mode: modeName,
    startedAt: journal.toJournal().startedAt,
    discovery: { totalRepos: allRepos.length, ecosystemRepos: ecosystem.length, otherRepos: other.length },
    audit,
    opportunities: ranked,
    selectedTask: selected,
    journal: journal.toJournal(),
  };

  // Save the cycle report
  const reportPath = join(ORCHESTRATOR_DIR, "reports", `${cycleId}.json`);
  writeFileSync(reportPath, JSON.stringify(cycle, null, 2));

  journal.log("cycle_completed", `Cycle ${cycleId} completed in ${modeName} mode`);

  return cycle;
}

// ── Report Formatting ─────────────────────────────────────────────────────────

export function formatCycleReport(cycle: OrchestratorCycle): string {
  const audit = cycle.audit;
  const lines: string[] = [
    "╔════════════════════════════════════════════════════════════╗",
    "║                  MAILMYPDF COMMAND CENTER                  ║",
    "╠════════════════════════════════════════════════════════════╣",
    "║                                                            ║",
  ];

  if (audit) {
    lines.push(`║  ECOSYSTEM HEALTH     ${audit.ecosystemHealth.toFixed(0)}%       ${audit.summary.totalRepos} REPOS              ║`);
    lines.push(`║  PLATFORM HEALTH      ${audit.platformHealth.toFixed(0)}%       ${audit.summary.implementedCapabilities}/${audit.summary.totalCapabilities} CAPS    ║`);
    lines.push(`║  ACTIVE WORK          ${cycle.opportunities.length}         ${audit.summary.plannedRepos} PLANNED              ║`);
  }
  lines.push("║                                                            ║");
  lines.push("║  ──────────────────────────────────────────────────────── ║");
  lines.push("║                                                            ║");
  lines.push(`║  🤖 ECOSYSTEM ORCHESTRATOR                                 ║`);
  lines.push("║                                                            ║");

  if (cycle.selectedTask) {
    lines.push(`║  Current task:                                             ║`);
    lines.push(`║  "${cycle.selectedTask.title}"`);
    lines.push("║                                                            ║");
    lines.push(`║  Target: ${cycle.selectedTask.targetRepo ?? "N/A"}`);
    lines.push(`║  Unlocks: ${cycle.selectedTask.affectedRepos.length} verticals`);
    lines.push(`║  Confidence: ${(cycle.selectedTask.confidence * 100).toFixed(0)}%`);
    lines.push("║                                                            ║");
  } else {
    lines.push("║  No task selected (read-only mode)                         ║");
    lines.push("║                                                            ║");
  }

  lines.push("║  ──────────────────────────────────────────────────────── ║");
  lines.push("║                                                            ║");
  lines.push("║  NEXT BEST ACTIONS                                         ║");
  lines.push("║                                                            ║");

  const top5 = cycle.opportunities.slice(0, 5);
  for (const opp of top5) {
    const title = opp.title.length > 35 ? opp.title.slice(0, 32) + "..." : opp.title;
    lines.push(`║  #${top5.indexOf(opp) + 1} ${title.padEnd(30)} ${opp.priority.toFixed(1)}`);
  }

  lines.push("║                                                            ║");
  lines.push("║  ──────────────────────────────────────────────────────── ║");
  lines.push("║                                                            ║");
  lines.push("║  RECENT AUTOMATION                                        ║");
  lines.push("║                                                            ║");
  lines.push(`║  Mode: ${cycle.mode}`);
  lines.push(`║  Cycle: ${cycle.id}`);
  lines.push("║                                                            ║");
  lines.push("╚════════════════════════════════════════════════════════════╝");

  return lines.join("\n");
}
