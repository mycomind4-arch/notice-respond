/* ═══════════════════════════════════════════════════════════
   DOMAIN OWNERSHIP VALIDATION TESTS

   Tests that prove:
   - Valid domain/repo combinations pass
   - Dispute-mail workflows cannot claim notice-respond ownership
   - Notice-respond workflows cannot accidentally claim another vertical
   - Unknown domains fail
   - Duplicate ownership is detected
   - Cross-domain contamination is caught
   - All current registry entries pass ownership validation after correction

   ═══════════════════════════════════════════════════════════ */

import { describe, it, expect } from "vitest";
import {
  CANONICAL_DOMAINS,
  validateDomainOwnership,
  validateRegistryOwnership,
  isValidOwnership,
  getDomain,
  getCanonicalRepo,
  listDomains,
  type WorkflowOwnershipEntry,
} from "../canonical-domains";
import { WORKFLOW_REGISTRY } from "../workflow-master-registry";

// ── Helper: extract registry entries for validation ──────────

function registryToOwnershipEntries(): WorkflowOwnershipEntry[] {
  return WORKFLOW_REGISTRY.map((w) => ({
    id: w.id,
    vertical: w.vertical,
    repo: w.repo,
    engine: w.engine,
  }));
}

// ── Tests ────────────────────────────────────────────────────

describe("Canonical Domains Registry", () => {
  it("has all 12 canonical domains", () => {
    const domains = listDomains();
    expect(domains.length).toBe(12);
  });

  it("every domain has a unique canonical repo", () => {
    const repos = listDomains().map((d) => d.canonicalRepo);
    const unique = new Set(repos);
    expect(unique.size).toBe(repos.length);
  });

  it("every domain has required fields", () => {
    for (const domain of listDomains()) {
      expect(domain.id).toBeTruthy();
      expect(domain.name).toBeTruthy();
      expect(domain.canonicalRepo).toBeTruthy();
      expect(domain.description).toBeTruthy();
      expect(domain.primaryEngines.length).toBeGreaterThan(0);
      expect(domain.ownershipRule).toBeTruthy();
      expect(domain.repoExists).toBe(true);
      expect(["active", "planned", "research"]).toContain(domain.status);
    }
  });

  it("notice-respond domain is correctly defined", () => {
    const domain = getDomain("notice-respond");
    expect(domain).toBeDefined();
    expect(domain!.canonicalRepo).toBe("notice-respond");
    expect(domain!.primaryEngines).toContain("document-action");
    expect(domain!.status).toBe("active");
  });

  it("dispute-mail domain is correctly defined", () => {
    const domain = getDomain("dispute-mail");
    expect(domain).toBeDefined();
    expect(domain!.canonicalRepo).toBe("dispute-mail");
    expect(domain!.primaryEngines).toContain("dispute");
    expect(domain!.status).toBe("active");
  });
});

describe("validateDomainOwnership — single entry", () => {
  it("passes for valid notice-respond workflow", () => {
    const result = validateDomainOwnership({
      id: "cp2000-response",
      vertical: "notice-respond",
      repo: "notice-respond",
      engine: "document-action",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("passes for valid dispute-mail workflow", () => {
    const result = validateDomainOwnership({
      id: "transunion-dispute",
      vertical: "dispute-mail",
      repo: "dispute-mail",
      engine: "dispute",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails when vertical/repo mismatch — dispute workflow in notice-respond repo", () => {
    const result = validateDomainOwnership({
      id: "equifax-dispute",
      vertical: "dispute-mail",
      repo: "notice-respond",
      engine: "dispute",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("Repo mismatch");
    expect(result.errors.join(" ")).toContain("dispute-mail");
    expect(result.errors.join(" ")).toContain("notice-respond");
  });

  it("fails when vertical/repo mismatch — IRS notice in dispute-mail repo", () => {
    const result = validateDomainOwnership({
      id: "cp14-response",
      vertical: "notice-respond",
      repo: "dispute-mail",
      engine: "document-action",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("Repo mismatch");
  });

  it("fails for unknown vertical", () => {
    const result = validateDomainOwnership({
      id: "test-workflow",
      vertical: "nonexistent-domain",
      repo: "nonexistent-domain",
      engine: "document-action",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("Unknown vertical");
  });

  it("fails for unknown repo", () => {
    const result = validateDomainOwnership({
      id: "test-workflow",
      vertical: "notice-respond",
      repo: "nonexistent-repo",
      engine: "document-action",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("Unknown repo");
  });

  it("warns when engine is not a primary engine for the domain", () => {
    const result = validateDomainOwnership({
      id: "test-workflow",
      vertical: "notice-respond",
      repo: "notice-respond",
      engine: "appeal" as any,
    });
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.join(" ")).toContain("not a primary engine");
  });
});

describe("validateRegistryOwnership — full registry", () => {
  it("all current registry entries pass ownership validation", () => {
    const entries = registryToOwnershipEntries();
    const result = validateRegistryOwnership(entries);
    expect(result.allValid).toBe(true);
    expect(result.invalidCount).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it("detects duplicate workflow IDs", () => {
    const entries: WorkflowOwnershipEntry[] = [
      { id: "cp2000-response", vertical: "notice-respond", repo: "notice-respond", engine: "document-action" },
      { id: "cp2000-response", vertical: "notice-respond", repo: "notice-respond", engine: "document-action" },
    ];
    const result = validateRegistryOwnership(entries);
    expect(result.duplicateIds).toContain("cp2000-response");
    expect(result.allValid).toBe(false);
    expect(result.errors.join(" ")).toContain("Duplicate workflow ID");
  });

  it("detects cross-domain contamination — credit dispute in notice-respond", () => {
    const entries: WorkflowOwnershipEntry[] = [
      { id: "equifax-dispute", vertical: "notice-respond", repo: "notice-respond", engine: "dispute" },
    ];
    const result = validateRegistryOwnership(entries);
    expect(result.allValid).toBe(false);
    expect(result.errors.join(" ")).toContain("Cross-domain contamination");
    expect(result.errors.join(" ")).toContain("equifax-dispute");
    expect(result.errors.join(" ")).toContain("dispute-mail");
  });

  it("detects cross-domain contamination — IRS notice in dispute-mail", () => {
    const entries: WorkflowOwnershipEntry[] = [
      { id: "cp14-response", vertical: "dispute-mail", repo: "dispute-mail", engine: "document-action" },
    ];
    const result = validateRegistryOwnership(entries);
    expect(result.allValid).toBe(false);
    expect(result.errors.join(" ")).toContain("Cross-domain contamination");
    expect(result.errors.join(" ")).toContain("cp14-response");
    expect(result.errors.join(" ")).toContain("notice-respond");
  });

  it("detects cross-domain contamination — FOIA in notice-respond", () => {
    const entries: WorkflowOwnershipEntry[] = [
      { id: "foia-request", vertical: "notice-respond", repo: "notice-respond", engine: "records" },
    ];
    const result = validateRegistryOwnership(entries);
    expect(result.allValid).toBe(false);
    expect(result.errors.join(" ")).toContain("Cross-domain contamination");
    expect(result.errors.join(" ")).toContain("foia-request");
    expect(result.errors.join(" ")).toContain("records-requests");
  });

  it("detects cross-domain contamination — insurance in notice-respond", () => {
    const entries: WorkflowOwnershipEntry[] = [
      { id: "insurance-claim-denied", vertical: "notice-respond", repo: "notice-respond", engine: "appeal" },
    ];
    const result = validateRegistryOwnership(entries);
    expect(result.allValid).toBe(false);
    expect(result.errors.join(" ")).toContain("Cross-domain contamination");
    expect(result.errors.join(" ")).toContain("insurance");
  });

  it("rejects a contaminated registry — equifax-dispute claiming notice-respond ownership", () => {
    // Simulate the OLD state before our fix
    const entries = registryToOwnershipEntries().map((e) =>
      e.id === "equifax-dispute"
        ? { ...e, vertical: "notice-respond", repo: "notice-respond" }
        : e
    );
    const result = validateRegistryOwnership(entries);
    expect(result.allValid).toBe(false);
    expect(result.errors.join(" ")).toContain("equifax-dispute");
    expect(result.errors.join(" ")).toContain("Cross-domain contamination");
  });

  it("rejects a contaminated registry — transunion-dispute claiming notice-respond ownership", () => {
    const entries = registryToOwnershipEntries().map((e) =>
      e.id === "transunion-dispute"
        ? { ...e, vertical: "notice-respond", repo: "notice-respond" }
        : e
    );
    const result = validateRegistryOwnership(entries);
    expect(result.allValid).toBe(false);
    expect(result.errors.join(" ")).toContain("transunion-dispute");
  });

  it("rejects a contaminated registry — cp2000-response claiming dispute-mail ownership", () => {
    const entries = registryToOwnershipEntries().map((e) =>
      e.id === "cp2000-response"
        ? { ...e, vertical: "dispute-mail", repo: "dispute-mail" }
        : e
    );
    const result = validateRegistryOwnership(entries);
    expect(result.allValid).toBe(false);
    expect(result.errors.join(" ")).toContain("cp2000-response");
    expect(result.errors.join(" ")).toContain("notice-respond");
  });

  it("reports correct counts", () => {
    const entries = registryToOwnershipEntries();
    const result = validateRegistryOwnership(entries);
    expect(result.totalEntries).toBe(entries.length);
    expect(result.validCount).toBe(entries.length);
    expect(result.invalidCount).toBe(0);
  });
});

describe("isValidOwnership — helper", () => {
  it("returns true for valid combinations", () => {
    expect(isValidOwnership("notice-respond", "notice-respond")).toBe(true);
    expect(isValidOwnership("dispute-mail", "dispute-mail")).toBe(true);
    expect(isValidOwnership("appeal-mail", "appeal-mail")).toBe(true);
  });

  it("returns false for mismatched combinations", () => {
    expect(isValidOwnership("notice-respond", "dispute-mail")).toBe(false);
    expect(isValidOwnership("dispute-mail", "notice-respond")).toBe(false);
  });

  it("returns false for unknown domains", () => {
    expect(isValidOwnership("unknown-domain", "unknown-domain")).toBe(false);
  });
});

describe("getCanonicalRepo — helper", () => {
  it("returns the canonical repo for a known domain", () => {
    expect(getCanonicalRepo("notice-respond")).toBe("notice-respond");
    expect(getCanonicalRepo("dispute-mail")).toBe("dispute-mail");
    expect(getCanonicalRepo("appeal-mail")).toBe("appeal-mail");
    expect(getCanonicalRepo("immigration-mail")).toBe("immigration-mail");
  });

  it("returns undefined for unknown domain", () => {
    expect(getCanonicalRepo("nonexistent")).toBeUndefined();
  });
});
