import assert from "node:assert/strict";
import test from "node:test";

import {
  FactWorkbench,
  VerificationState,
  isValidFactTransition,
  getNextFactStates,
} from "../dist/index.js";

function makeWorkbench(tenantId = "tenant-test") {
  return new FactWorkbench({ tenantId });
}

function makeSource(overrides = {}) {
  return {
    documentId: "doc-001",
    page: 1,
    excerpt: "Notice of Violation dated July 1, 2026",
    extractionMethod: "model_extraction",
    modelVersion: "fairprocess-extract-v1",
    promptVersion: "v1.0",
    confidence: 0.92,
    ...overrides,
  };
}

// ─── State machine ─────────────────────────────────────────

test("proposed → accepted is valid", () => {
  assert.ok(isValidFactTransition(VerificationState.PROPOSED, VerificationState.ACCEPTED));
});

test("proposed → rejected is valid", () => {
  assert.ok(isValidFactTransition(VerificationState.PROPOSED, VerificationState.REJECTED));
});

test("rejected is terminal (no outgoing transitions)", () => {
  assert.equal(getNextFactStates(VerificationState.REJECTED).length, 0);
});

test("superseded is terminal", () => {
  assert.equal(getNextFactStates(VerificationState.SUPERSEDED).length, 0);
});

test("contradicted can be re-opened to proposed", () => {
  assert.ok(isValidFactTransition(VerificationState.CONTRADICTED, VerificationState.PROPOSED));
});

test("requires_additional_evidence can be re-opened to proposed", () => {
  assert.ok(
    isValidFactTransition(
      VerificationState.REQUIRES_ADDITIONAL_EVIDENCE,
      VerificationState.PROPOSED,
    ),
  );
});

test("accepted → corrected is valid (reviewer changes value)", () => {
  assert.ok(isValidFactTransition(VerificationState.ACCEPTED, VerificationState.CORRECTED));
});

// ─── Propose ───────────────────────────────────────────────

test("propose creates a fact in the proposed state", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource(),
  });

  assert.equal(fact.verificationState, VerificationState.PROPOSED);
  assert.equal(fact.caseId, "case-1");
  assert.equal(fact.proposedValue, "2026-07-01");
  assert.equal(fact.currentValue, "2026-07-01");
  assert.equal(fact.normalizedValue, "2026-07-01");
  assert.equal(fact.isControlling, false);
  assert.equal(fact.reviewer, null);
  assert.equal(fact.sources.length, 1);
  assert.equal(fact.sources[0].documentId, "doc-001");
  assert.equal(fact.modelVersion, "fairprocess-extract-v1");
});

test("propose uses provided normalizedValue", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "apn",
    dataType: "apn",
    proposedValue: "123-456-789",
    normalizedValue: "123456789",
    source: makeSource(),
  });

  assert.equal(fact.proposedValue, "123-456-789");
  assert.equal(fact.normalizedValue, "123456789");
});

// ─── Accept ───────────────────────────────────────────────

test("accept transitions to accepted and records review", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource(),
  });

  const { fact: reviewed, reviewRecord } = wb.review({
    factId: fact.id,
    action: "accept",
    reviewer: "analyst-1",
    note: "Verified against proof of service",
  });

  assert.equal(reviewed.verificationState, VerificationState.ACCEPTED);
  assert.equal(reviewed.reviewer, "analyst-1");
  assert.equal(reviewed.reviewerNote, "Verified against proof of service");
  assert.ok(reviewed.reviewedAt);

  assert.equal(reviewRecord.action, "accept");
  assert.equal(reviewRecord.reviewer, "analyst-1");
  assert.equal(reviewRecord.previousState, VerificationState.PROPOSED);
  assert.equal(reviewRecord.newState, VerificationState.ACCEPTED);
});

// ─── Reject ─────────────────────────────────────────────────

test("reject transitions to rejected (terminal)", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "instrument_number",
    dataType: "string",
    proposedValue: "2026-12345",
    source: makeSource({ confidence: 0.45 }),
  });

  const { fact: rejected } = wb.review({
    factId: fact.id,
    action: "reject",
    reviewer: "analyst-1",
    note: "Cannot verify — source page illegible",
  });

  assert.equal(rejected.verificationState, VerificationState.REJECTED);
});

// ─── Edit / Correct ────────────────────────────────────────

test("edit corrects the value and transitions to corrected", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-10",
    source: makeSource(),
  });

  const { fact: corrected, reviewRecord } = wb.review({
    factId: fact.id,
    action: "edit",
    reviewer: "analyst-1",
    correctedValue: "2026-07-01",
    note: "OCR misread — actual date is July 1, not July 10",
  });

  assert.equal(corrected.verificationState, VerificationState.CORRECTED);
  assert.equal(corrected.currentValue, "2026-07-01");
  assert.equal(corrected.proposedValue, "2026-07-10"); // original preserved
  assert.equal(corrected.normalizedValue, "2026-07-01"); // updated
  assert.equal(reviewRecord.previousValue, "2026-07-10");
  assert.equal(reviewRecord.newValue, "2026-07-01");
});

// ─── Add source ─────────────────────────────────────────────

test("add_source adds an additional source without changing state", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "hearing_date",
    dataType: "date",
    proposedValue: "2026-08-15",
    source: makeSource({ page: 3 }),
  });

  const { fact: updated } = wb.review({
    factId: fact.id,
    action: "add_source",
    reviewer: "analyst-1",
    additionalSource: makeSource({
      documentId: "doc-002",
      page: 7,
      excerpt: "Hearing scheduled for August 15, 2026",
    }),
  });

  assert.equal(updated.sources.length, 2);
  assert.equal(updated.verificationState, VerificationState.PROPOSED); // unchanged
  assert.equal(updated.sources[1].documentId, "doc-002");
});

// ─── Controlling facts ─────────────────────────────────────

test("designate_controlling works on accepted facts", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource(),
  });

  wb.review({
    factId: fact.id,
    action: "accept",
    reviewer: "analyst-1",
  });

  const controlling = wb.designateControlling(fact.id, "analyst-1");
  assert.equal(controlling.isControlling, true);
});

test("designate_controlling fails on proposed facts", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource(),
  });

  assert.throws(
    () => wb.designateControlling(fact.id, "analyst-1"),
    /Only accepted/,
  );
});

test("remove_controlling removes controlling status", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource(),
  });

  wb.review({ factId: fact.id, action: "accept", reviewer: "analyst-1" });
  wb.designateControlling(fact.id, "analyst-1");
  const removed = wb.removeControlling(fact.id, "analyst-1");
  assert.equal(removed.isControlling, false);
});

test("listControllingFacts returns only controlling facts", () => {
  const wb = makeWorkbench();

  const fact1 = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource(),
  });
  wb.review({ factId: fact1.id, action: "accept", reviewer: "a1" });
  wb.designateControlling(fact1.id, "a1");

  const fact2 = wb.propose({
    caseId: "case-1",
    factType: "hearing_date",
    dataType: "date",
    proposedValue: "2026-08-15",
    source: makeSource({ page: 3 }),
  });
  wb.review({ factId: fact2.id, action: "accept", reviewer: "a1" });
  // fact2 not designated as controlling

  const controlling = wb.listControllingFacts("case-1");
  assert.equal(controlling.length, 1);
  assert.equal(controlling[0].factType, "service_date");
});

// ─── Contradiction ─────────────────────────────────────────

test("markContradiction transitions both facts to contradicted", () => {
  const wb = makeWorkbench();

  const factA = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource({ documentId: "doc-A", page: 1 }),
  });

  const factB = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-15",
    source: makeSource({ documentId: "doc-B", page: 1 }),
  });

  wb.markContradiction(factA.id, factB.id, "analyst-1", "Two different service dates found");

  const a = wb.get(factA.id);
  const b = wb.get(factB.id);

  assert.equal(a.verificationState, VerificationState.CONTRADICTED);
  assert.equal(b.verificationState, VerificationState.CONTRADICTED);
  assert.ok(a.contradictoryFactIds.includes(factB.id));
  assert.ok(b.contradictoryFactIds.includes(factA.id));
  assert.equal(a.isControlling, false); // contradicted facts can't be controlling
});

test("contradicted facts cannot be designated as controlling", () => {
  const wb = makeWorkbench();

  const factA = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource({ documentId: "doc-A" }),
  });
  const factB = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-15",
    source: makeSource({ documentId: "doc-B" }),
  });

  wb.review({ factId: factA.id, action: "accept", reviewer: "a1" });
  wb.markContradiction(factA.id, factB.id, "a1", "conflict");

  // Fact is in 'contradicted' state which fails the state check first
  assert.throws(
    () => wb.designateControlling(factA.id, "a1"),
  );
});

test("markContradiction rejects facts from different cases", () => {
  const wb = makeWorkbench();
  const factA = wb.propose({
    caseId: "case-A",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource(),
  });
  const factB = wb.propose({
    caseId: "case-B",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-15",
    source: makeSource(),
  });

  assert.throws(
    () => wb.markContradiction(factA.id, factB.id, "a1", "conflict"),
    /different cases/,
  );
});

// ─── Supersede ──────────────────────────────────────────────

test("supersede replaces old fact and transfers controlling status", () => {
  const wb = makeWorkbench();

  const oldFact = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource({ confidence: 0.75 }),
  });
  wb.review({ factId: oldFact.id, action: "accept", reviewer: "a1" });
  wb.designateControlling(oldFact.id, "a1");

  const newFact = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource({ confidence: 0.98, documentId: "doc-better" }),
  });
  wb.review({ factId: newFact.id, action: "accept", reviewer: "a1" });

  wb.supersede(oldFact.id, newFact.id, "a1", "Higher confidence source found");

  const old = wb.get(oldFact.id);
  const newer = wb.get(newFact.id);

  assert.equal(old.verificationState, VerificationState.SUPERSEDED);
  assert.equal(old.supersededBy, newFact.id);
  assert.equal(old.isControlling, false);
  assert.equal(newer.isControlling, true); // transferred
});

// ─── Request additional evidence ──────────────────────────

test("request_document transitions to requires_additional_evidence", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "owner_identity",
    dataType: "string",
    proposedValue: "John Smith",
    source: makeSource({ confidence: 0.51 }),
  });

  const { fact: result } = wb.review({
    factId: fact.id,
    action: "request_document",
    reviewer: "analyst-1",
    note: "Need deed or title to confirm ownership",
  });

  assert.equal(result.verificationState, VerificationState.REQUIRES_ADDITIONAL_EVIDENCE);
});

// ─── Review history ────────────────────────────────────────

test("reviewHistory returns all reviews for a fact", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource(),
  });

  wb.review({ factId: fact.id, action: "accept", reviewer: "a1" });
  wb.review({ factId: fact.id, action: "remove_controlling", reviewer: "a1" });

  const history = wb.reviewHistory(fact.id);
  assert.equal(history.length, 2);
  assert.equal(history[0].action, "accept");
  assert.equal(history[1].action, "remove_controlling");
});

// ─── List helpers ──────────────────────────────────────────

test("listPendingReview returns only proposed facts", () => {
  const wb = makeWorkbench();
  const f1 = wb.propose({
    caseId: "c1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource(),
  });
  const f2 = wb.propose({
    caseId: "c1",
    factType: "hearing_date",
    dataType: "date",
    proposedValue: "2026-08-15",
    source: makeSource(),
  });

  wb.review({ factId: f1.id, action: "accept", reviewer: "a1" });

  const pending = wb.listPendingReview("c1");
  assert.equal(pending.length, 1);
  assert.equal(pending[0].factType, "hearing_date");
});

test("listContradicted returns only contradicted facts", () => {
  const wb = makeWorkbench();
  const f1 = wb.propose({
    caseId: "c1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource({ documentId: "d1" }),
  });
  const f2 = wb.propose({
    caseId: "c1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-15",
    source: makeSource({ documentId: "d2" }),
  });

  wb.markContradiction(f1.id, f2.id, "a1", "conflict");

  const contradicted = wb.listContradicted("c1");
  assert.equal(contradicted.length, 2);
});

// ─── Escalate legal ────────────────────────────────────────

test("escalate_legal transitions to requires_additional_evidence", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "monetary_amount",
    dataType: "number",
    proposedValue: "5000",
    source: makeSource(),
  });

  const { fact: result } = wb.review({
    factId: fact.id,
    action: "escalate_legal",
    reviewer: "analyst-1",
    note: "Privilege designation unclear — escalating to legal",
  });

  assert.equal(result.verificationState, VerificationState.REQUIRES_ADDITIONAL_EVIDENCE);
});

// ─── Create discrepancy ───────────────────────────────────

test("create_discrepancy links a discrepancy without changing state", () => {
  const wb = makeWorkbench();
  const fact = wb.propose({
    caseId: "case-1",
    factType: "service_date",
    dataType: "date",
    proposedValue: "2026-07-01",
    source: makeSource(),
  });

  const { reviewRecord } = wb.review({
    factId: fact.id,
    action: "create_discrepancy",
    reviewer: "analyst-1",
    discrepancyId: "disc-001",
    note: "Date conflicts with agency timeline",
  });

  assert.equal(reviewRecord.linkedDiscrepancyId, "disc-001");
  assert.equal(fact.verificationState, VerificationState.PROPOSED); // unchanged
});
