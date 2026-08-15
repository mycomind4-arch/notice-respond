import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { createCase, updateCase, transitionStatus } from "../src/domain/notice.ts";
import { InMemoryCaseRepository } from "../src/platform/in-memory-repository.ts";
import { createAuditEntry } from "../src/domain/audit.ts";

describe("Case Repository (In-Memory)", () => {
  it("saves and loads a case", () => {
    const repo = new InMemoryCaseRepository();
    const myCase = createCase("analyze");

    repo.saveSync(myCase);
    const loaded = repo.loadSync(myCase.id);

    assert.ok(loaded !== null);
    assert.equal(loaded.id, myCase.id);
    assert.equal(loaded.status, "intake");
    assert.equal(loaded.workflowId, "analyze");
  });

  it("returns null for missing case", () => {
    const repo = new InMemoryCaseRepository();
    const loaded = repo.loadSync("nonexistent");
    assert.equal(loaded, null);
  });

  it("updates an existing case", () => {
    const repo = new InMemoryCaseRepository();
    const myCase = createCase("analyze");
    repo.saveSync(myCase);

    const updated = updateCase(myCase, { noticeType: "irs-cp504" });
    repo.saveSync(updated);

    const loaded = repo.loadSync(myCase.id);
    assert.equal(loaded.noticeType, "irs-cp504");
  });

  it("deletes a case", () => {
    const repo = new InMemoryCaseRepository();
    const myCase = createCase("analyze");
    repo.saveSync(myCase);

    const deleted = repo.deleteSync(myCase.id);
    assert.equal(deleted, true);

    const loaded = repo.loadSync(myCase.id);
    assert.equal(loaded, null);
  });

  it("lists case summaries sorted by updatedAt", () => {
    const repo = new InMemoryCaseRepository();
    const case1 = createCase("analyze");
    case1.updatedAt = "2024-01-01T00:00:00Z";
    const case2 = createCase("analyze");
    case2.updatedAt = "2024-03-01T00:00:00Z";
    const case3 = createCase("analyze");
    case3.updatedAt = "2024-02-01T00:00:00Z";

    repo.saveSync(case1);
    repo.saveSync(case2);
    repo.saveSync(case3);

    const summaries = repo.listSummariesSync();
    assert.equal(summaries.length, 3);
    // Most recently updated first
    assert.equal(summaries[0].id, case2.id);
    assert.equal(summaries[2].id, case1.id);
  });

  it("filters by status", () => {
    const repo = new InMemoryCaseRepository();
    const c1 = createCase("analyze");
    const c2 = transitionStatus(createCase("analyze"), "analyzed");
    const c3 = transitionStatus(createCase("analyze"), "ready");

    repo.saveSync(c1);
    repo.saveSync(c2);
    repo.saveSync(c3);

    const analyzed = repo.listByStatusSync("analyzed");
    assert.equal(analyzed.length, 1);
    assert.equal(analyzed[0].id, c2.id);
  });

  it("persists and retrieves audit entries", () => {
    const repo = new InMemoryCaseRepository();
    const myCase = createCase("analyze");
    repo.saveSync(myCase);

    const entry = createAuditEntry({
      caseId: myCase.id,
      action: "case_created",
      actor: "system",
      objectType: "case",
      description: "Case created",
    });
    repo.saveAuditSync(entry);

    const audit = repo.loadAuditSync(myCase.id);
    assert.equal(audit.length, 1);
    assert.equal(audit[0].action, "case_created");
  });

  it("exists returns true for saved case", () => {
    const repo = new InMemoryCaseRepository();
    const myCase = createCase("analyze");
    repo.saveSync(myCase);

    assert.equal(repo.existsSync(myCase.id), true);
    assert.equal(repo.existsSync("nonexistent"), false);
  });
});
