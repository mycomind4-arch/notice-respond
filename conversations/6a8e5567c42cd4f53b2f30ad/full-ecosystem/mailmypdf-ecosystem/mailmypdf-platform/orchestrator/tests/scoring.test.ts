import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculatePriority,
  platformLeverageLevel,
  requiresApproval,
  scoreOpportunity,
  generateCapabilityOpportunities,
  rankOpportunities,
  selectSafeAutonomousTask,
} from "../src/scoring.js";
import type { EcosystemManifest, CapabilityGraph, EngineeringMode } from "../src/types.js";

// ── calculatePriority ──────────────────────────────────────────────────────────

describe("calculatePriority", () => {
  test("returns 0 for zero leverage (no ecosystem impact)", () => {
    assert.equal(calculatePriority(10, 0, 10, 1), 0);
  });

  test("returns 0 for zero effort (division by zero guard)", () => {
    assert.equal(calculatePriority(10, 10, 10, 0), 0);
  });

  test("higher impact produces higher priority", () => {
    const low = calculatePriority(2, 5, 5, 5);
    const high = calculatePriority(10, 5, 5, 5);
    assert.ok(high > low);
  });

  test("higher effort produces lower priority", () => {
    const easy = calculatePriority(5, 5, 5, 2);
    const hard = calculatePriority(5, 5, 5, 10);
    assert.ok(easy > hard);
  });

  test("higher urgency produces higher priority", () => {
    const low = calculatePriority(5, 5, 2, 5);
    const high = calculatePriority(5, 5, 9, 5);
    assert.ok(high > low);
  });

  test("clamps inputs to [0, 10]", () => {
    const clamped = calculatePriority(100, 100, 100, 1);
    const expected = calculatePriority(10, 10, 10, 1);
    assert.equal(clamped, expected);
  });

  test("maximum priority is capped at 10", () => {
    const max = calculatePriority(10, 10, 10, 1);
    assert.ok(max <= 10);
    assert.ok(max > 9);
  });
});

// ── platformLeverageLevel ───────────────────────────────────────────────────────

describe("platformLeverageLevel", () => {
  test("NONE for 0 repos", () => {
    assert.equal(platformLeverageLevel(0), "NONE");
  });

  test("LOW for 1 repo", () => {
    assert.equal(platformLeverageLevel(1), "LOW");
  });

  test("MEDIUM for 2 repos", () => {
    assert.equal(platformLeverageLevel(2), "MEDIUM");
  });

  test("HIGH for 3 repos", () => {
    assert.equal(platformLeverageLevel(3), "HIGH");
  });

  test("EXTREME for 4+ repos", () => {
    assert.equal(platformLeverageLevel(4), "EXTREME");
    assert.equal(platformLeverageLevel(10), "EXTREME");
    assert.equal(platformLeverageLevel(100), "EXTREME");
  });
});

// ── requiresApproval ───────────────────────────────────────────────────────────

describe("requiresApproval", () => {
  const safeAutonomous: EngineeringMode = {
    name: "SAFE_AUTONOMOUS",
    description: "Safe autonomous",
    canModifyCode: true,
    canCommit: true,
    canDeploy: false,
    autoSelectsTasks: true,
    requiresApproval: ["architectural changes", "new package creation"],
  };

  const autonomous: EngineeringMode = {
    name: "AUTONOMOUS",
    description: "Fully autonomous",
    canModifyCode: true,
    canCommit: true,
    canDeploy: true,
    autoSelectsTasks: true,
  };

  const observe: EngineeringMode = {
    name: "OBSERVE",
    description: "Read only",
    canModifyCode: false,
    canCommit: false,
    canDeploy: false,
    autoSelectsTasks: false,
  };

  test("AUTONOMOUS never requires approval", () => {
    assert.equal(requiresApproval("architectural", autonomous), false);
    assert.equal(requiresApproval("bug_fix", autonomous), false);
    assert.equal(requiresApproval("new_vertical", autonomous), false);
  });

  test("OBSERVE always requires approval", () => {
    assert.equal(requiresApproval("bug_fix", observe), true);
    assert.equal(requiresApproval("documentation", observe), true);
  });

  test("SAFE_AUTONOMOUS allows safe actions without approval", () => {
    assert.equal(requiresApproval("bug_fix", safeAutonomous), false);
    assert.equal(requiresApproval("test_improvement", safeAutonomous), false);
    assert.equal(requiresApproval("documentation", safeAutonomous), false);
    assert.equal(requiresApproval("ci_improvement", safeAutonomous), false);
    assert.equal(requiresApproval("observability", safeAutonomous), false);
  });

  test("SAFE_AUTONOMOUS requires approval for architectural changes", () => {
    assert.equal(requiresApproval("architectural", safeAutonomous), true);
    assert.equal(requiresApproval("new_vertical", safeAutonomous), true);
    assert.equal(requiresApproval("platform_extraction", safeAutonomous), true);
    assert.equal(requiresApproval("dependency_update", safeAutonomous), true);
  });
});

// ── scoreOpportunity ──────────────────────────────────────────────────────────

describe("scoreOpportunity", () => {
  test("produces a complete Opportunity with calculated fields", () => {
    const mode: EngineeringMode = {
      name: "SAFE_AUTONOMOUS",
      description: "",
      canModifyCode: true,
      canCommit: true,
      canDeploy: false,
      autoSelectsTasks: true,
      requiresApproval: ["architectural changes"],
    };

    const opp = scoreOpportunity({
      id: "test-1",
      type: "bug_fix",
      title: "Fix a bug",
      description: "A bug exists",
      targetRepo: "appeal-mail",
      affectedRepos: ["appeal-mail"],
      impact: 5,
      leverage: 1,
      urgency: 7,
      effort: 3,
      confidence: 0.8,
      rationale: "It's a bug",
      steps: ["Fix it"],
    }, mode);

    assert.ok(opp.priority > 0);
    assert.equal(opp.platformLeverage, "LOW");
    assert.equal(opp.requiresApproval, false);
  });
});

// ── generateCapabilityOpportunities ───────────────────────────────────────────

describe("generateCapabilityOpportunities", () => {
  const manifest: EcosystemManifest = {
    ecosystem: { name: "Test", description: "", githubOrg: "test", version: "0.1.0", lastUpdated: "" },
    repositories: [],
    engineeringModes: [{
      name: "SAFE_AUTONOMOUS",
      description: "",
      canModifyCode: true,
      canCommit: true,
      canDeploy: false,
      autoSelectsTasks: true,
    }],
    defaultMode: "SAFE_AUTONOMOUS",
  };

  const graph: CapabilityGraph = {
    version: "0.1.0",
    lastUpdated: "",
    capabilities: [
      {
        id: "core",
        name: "Core",
        package: "@mailmypdf/core",
        status: "implemented",
        stability: "stable",
        consumers: ["a", "b", "c"],
        unlocks: 3,
        description: "Core package",
      },
      {
        id: "deadline-engine",
        name: "Deadline Engine",
        package: null,
        status: "not-started",
        stability: "none",
        consumers: ["a", "b", "c", "d"],
        unlocks: 4,
        description: "Deadline computation",
        duplicateImplementation: true,
        duplicationScore: 9.7,
      },
      {
        id: "evidence-graph",
        name: "Evidence Graph",
        package: null,
        status: "planned",
        stability: "none",
        consumers: ["a", "b"],
        unlocks: 2,
        description: "Evidence linking",
      },
      {
        id: "agent-runtime",
        name: "Agent Runtime",
        package: null,
        status: "deferred",
        stability: "none",
        consumers: ["x"],
        unlocks: 1,
        description: "Agent runtime",
        deferredReason: "Premature",
      },
    ],
    capabilityMatrix: {},
  };

  test("skips implemented capabilities", () => {
    const mode = manifest.engineeringModes[0]!;
    const opps = generateCapabilityOpportunities(graph, manifest, mode);
    const ids = opps.map((o) => o.id);
    assert.ok(!ids.includes("cap-core"));
  });

  test("skips deferred capabilities", () => {
    const mode = manifest.engineeringModes[0]!;
    const opps = generateCapabilityOpportunities(graph, manifest, mode);
    const ids = opps.map((o) => o.id);
    assert.ok(!ids.includes("cap-agent-runtime"));
  });

  test("generates opportunities for not-started and planned", () => {
    const mode = manifest.engineeringModes[0]!;
    const opps = generateCapabilityOpportunities(graph, manifest, mode);
    const ids = opps.map((o) => o.id);
    assert.ok(ids.includes("cap-deadline-engine"));
    assert.ok(ids.includes("cap-evidence-graph"));
  });

  test("duplicate implementations get higher urgency", () => {
    const mode = manifest.engineeringModes[0]!;
    const opps = generateCapabilityOpportunities(graph, manifest, mode);
    const deadline = opps.find((o) => o.id === "cap-deadline-engine")!;
    const evidence = opps.find((o) => o.id === "cap-evidence-graph")!;
    assert.ok(deadline.urgency > evidence.urgency);
  });

  test("duplicate implementations are platform_extraction type", () => {
    const mode = manifest.engineeringModes[0]!;
    const opps = generateCapabilityOpportunities(graph, manifest, mode);
    const deadline = opps.find((o) => o.id === "cap-deadline-engine")!;
    assert.equal(deadline.type, "platform_extraction");
  });

  test("opportunities are sorted by priority descending", () => {
    const mode = manifest.engineeringModes[0]!;
    const opps = generateCapabilityOpportunities(graph, manifest, mode);
    for (let i = 1; i < opps.length; i++) {
      assert.ok(opps[i - 1]!.priority >= opps[i]!.priority);
    }
  });
});

// ── rankOpportunities ──────────────────────────────────────────────────────────

describe("rankOpportunities", () => {
  test("returns top N sorted by priority", () => {
    const opps = [
      { id: "a", type: "bug_fix" as const, title: "A", description: "", targetRepo: null, affectedRepos: [], impact: 3, leverage: 1, urgency: 5, effort: 5, priority: 1.5, confidence: 0.5, requiresApproval: false, platformLeverage: "LOW" as const, rationale: "", steps: [] },
      { id: "b", type: "bug_fix" as const, title: "B", description: "", targetRepo: null, affectedRepos: [], impact: 8, leverage: 5, urgency: 9, effort: 2, priority: 9.0, confidence: 0.9, requiresApproval: false, platformLeverage: "EXTREME" as const, rationale: "", steps: [] },
      { id: "c", type: "bug_fix" as const, title: "C", description: "", targetRepo: null, affectedRepos: [], impact: 4, leverage: 2, urgency: 6, effort: 3, priority: 4.0, confidence: 0.7, requiresApproval: false, platformLeverage: "MEDIUM" as const, rationale: "", steps: [] },
    ];
    const ranked = rankOpportunities(opps, 2);
    assert.equal(ranked.length, 2);
    assert.equal(ranked[0]!.id, "b");
    assert.equal(ranked[1]!.id, "c");
  });
});

// ── selectSafeAutonomousTask ───────────────────────────────────────────────────

describe("selectSafeAutonomousTask", () => {
  test("selects highest priority non-approval task", () => {
    const opps = [
      { id: "a", type: "architectural" as const, title: "A", description: "", targetRepo: null, affectedRepos: [], impact: 10, leverage: 10, urgency: 10, effort: 1, priority: 10, confidence: 1, requiresApproval: true, platformLeverage: "EXTREME" as const, rationale: "", steps: [] },
      { id: "b", type: "bug_fix" as const, title: "B", description: "", targetRepo: null, affectedRepos: [], impact: 6, leverage: 1, urgency: 5, effort: 2, priority: 5, confidence: 0.8, requiresApproval: false, platformLeverage: "LOW" as const, rationale: "", steps: [] },
      { id: "c", type: "test_improvement" as const, title: "C", description: "", targetRepo: null, affectedRepos: [], impact: 3, leverage: 1, urgency: 4, effort: 1, priority: 4, confidence: 0.9, requiresApproval: false, platformLeverage: "LOW" as const, rationale: "", steps: [] },
    ];
    const selected = selectSafeAutonomousTask(opps);
    assert.ok(selected !== null);
    assert.equal(selected!.id, "b");
  });

  test("returns null when all require approval", () => {
    const opps = [
      { id: "a", type: "architectural" as const, title: "A", description: "", targetRepo: null, affectedRepos: [], impact: 10, leverage: 10, urgency: 10, effort: 1, priority: 10, confidence: 1, requiresApproval: true, platformLeverage: "EXTREME" as const, rationale: "", steps: [] },
    ];
    const selected = selectSafeAutonomousTask(opps);
    assert.equal(selected, null);
  });

  test("returns null for empty list", () => {
    assert.equal(selectSafeAutonomousTask([]), null);
  });
});
