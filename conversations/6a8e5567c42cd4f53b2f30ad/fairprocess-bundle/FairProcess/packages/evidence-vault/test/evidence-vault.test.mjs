import assert from "node:assert/strict";
import test from "node:test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";

import {
  EvidenceVault,
  EvidenceState,
  isValidTransition,
  getNextStates,
  FilesystemStorage,
  sha256Buffer,
} from "../dist/index.js";

const ALLOWED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/tiff",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "message/rfc822",
  "text/html",
];

const MAX_SIZE = 250 * 1024 * 1024; // 250 MB

function makeVault(tenantId = "tenant-test") {
  const dir = mkdtempSync(join(tmpdir(), "fairprocess-ev-"));
  const storage = new FilesystemStorage(dir);
  return {
    dir,
    vault: new EvidenceVault({
      storage,
      mimeCheck: { allowedMimeTypes: ALLOWED_MIME, maxByteSize: MAX_SIZE },
      tenantId,
    }),
  };
}

const samplePdf = Buffer.from("%PDF-1.4\n%test content\n%%EOF");
const samplePng = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

// ─── Hashing ───────────────────────────────────────────────

test("sha256Buffer produces stable hex digests", () => {
  const a = sha256Buffer(samplePdf);
  const b = sha256Buffer(samplePdf);
  assert.equal(a, b);
  assert.equal(a.length, 64);
  assert.match(a, /^[0-9a-f]{64}$/);
});

test("different content produces different hashes", () => {
  const a = sha256Buffer(samplePdf);
  const b = sha256Buffer(samplePng);
  assert.notEqual(a, b);
});

// ─── State machine ─────────────────────────────────────────

test("uploaded → validated is a valid transition", () => {
  assert.ok(isValidTransition(EvidenceState.UPLOADED, EvidenceState.VALIDATED));
});

test("validated → processing is a valid transition", () => {
  assert.ok(isValidTransition(EvidenceState.VALIDATED, EvidenceState.PROCESSING));
});

test("duplicate → accepted is NOT a valid transition (duplicate is terminal)", () => {
  assert.ok(!isValidTransition(EvidenceState.DUPLICATE, EvidenceState.ACCEPTED));
});

test("accepted → superseded is valid", () => {
  assert.ok(isValidTransition(EvidenceState.ACCEPTED, EvidenceState.SUPERSEDED));
});

test("superseded has no outgoing transitions", () => {
  assert.equal(getNextStates(EvidenceState.SUPERSEDED).length, 0);
});

test("deleted_under_policy has no outgoing transitions", () => {
  assert.equal(getNextStates(EvidenceState.DELETED_UNDER_POLICY).length, 0);
});

test("restricted → accepted is valid (hold release)", () => {
  assert.ok(isValidTransition(EvidenceState.RESTRICTED, EvidenceState.ACCEPTED));
});

test("uploaded → accepted is NOT valid (must go through validated)", () => {
  assert.ok(!isValidTransition(EvidenceState.UPLOADED, EvidenceState.ACCEPTED));
});

// ─── Intake ────────────────────────────────────────────────

test("intake stores evidence and transitions to validated", async () => {
  const { vault } = makeVault();
  const result = await vault.intake({
    caseId: "case-1",
    originalFilename: "notice.pdf",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "drag_and_drop",
    acquiredBy: "analyst-1",
  });

  assert.equal(result.isDuplicate, false);
  assert.equal(result.evidence.evidenceState, EvidenceState.VALIDATED);
  assert.equal(result.evidence.mimeType, "application/pdf");
  assert.equal(result.evidence.tenantId, "tenant-test");
  assert.equal(result.evidence.caseId, "case-1");
  assert.equal(result.evidence.originalFilename, "notice.pdf");
  assert.equal(result.evidence.displayTitle, "notice.pdf");
  assert.equal(result.evidence.fileType, "pdf");
  assert.equal(result.evidence.sha256, sha256Buffer(samplePdf));
  assert.equal(result.evidence.versionType, "original");
  assert.equal(result.evidence.duplicateOfEvidenceId, null);
  assert.ok(result.evidence.id.length > 0);
  assert.ok(result.custodyEvents.length >= 2);
});

test("intake uses displayTitle when provided", async () => {
  const { vault } = makeVault();
  const result = await vault.intake({
    caseId: "case-1",
    originalFilename: "doc-001.pdf",
    displayTitle: "Notice of Violation - 123 Main St",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "api_intake",
    acquiredBy: "system",
  });

  assert.equal(result.evidence.displayTitle, "Notice of Violation - 123 Main St");
  assert.equal(result.evidence.originalFilename, "doc-001.pdf");
});

test("intake rejects unsupported MIME types", async () => {
  const { vault } = makeVault();
  await assert.rejects(
    () =>
      vault.intake({
        caseId: "case-1",
        originalFilename: "malware.exe",
        mimeType: "application/x-msdownload",
        data: Buffer.from("MZ"),
        sourceType: "drag_and_drop",
        acquiredBy: "user-1",
      }),
    /Unsupported MIME type/,
  );
});

test("intake rejects zero-byte files", async () => {
  const { vault } = makeVault();
  await assert.rejects(
    () =>
      vault.intake({
        caseId: "case-1",
        originalFilename: "empty.pdf",
        mimeType: "application/pdf",
        data: Buffer.alloc(0),
        sourceType: "drag_and_drop",
        acquiredBy: "user-1",
      }),
    /outside allowed range/,
  );
});

test("intake rejects files exceeding max size", async () => {
  const dir = mkdtempSync(join(tmpdir(), "fairprocess-ev-"));
  const vault = new EvidenceVault({
    storage: new FilesystemStorage(dir),
    mimeCheck: { allowedMimeTypes: ALLOWED_MIME, maxByteSize: 100 },
    tenantId: "t",
  });

  await assert.rejects(
    () =>
      vault.intake({
        caseId: "c1",
        originalFilename: "big.pdf",
        mimeType: "application/pdf",
        data: Buffer.alloc(101, 0x42),
        sourceType: "drag_and_drop",
        acquiredBy: "u1",
      }),
    /outside allowed range/,
  );
});

// ─── Duplicate detection ───────────────────────────────────

test("identical content is detected as duplicate", async () => {
  const { vault } = makeVault();
  const first = await vault.intake({
    caseId: "case-1",
    originalFilename: "notice.pdf",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "drag_and_drop",
    acquiredBy: "analyst-1",
  });

  const second = await vault.intake({
    caseId: "case-1",
    originalFilename: "notice-copy.pdf",
    mimeType: "application/pdf",
    data: samplePdf, // same content
    sourceType: "email_intake",
    acquiredBy: "analyst-2",
  });

  assert.equal(second.isDuplicate, true);
  assert.equal(second.evidence.evidenceState, EvidenceState.DUPLICATE);
  assert.equal(second.evidence.duplicateOfEvidenceId, first.evidence.id);
  assert.equal(second.evidence.sha256, first.evidence.sha256);
});

test("different content is not a duplicate", async () => {
  const { vault } = makeVault();
  await vault.intake({
    caseId: "case-1",
    originalFilename: "a.pdf",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "drag_and_drop",
    acquiredBy: "u1",
  });

  const second = await vault.intake({
    caseId: "case-1",
    originalFilename: "b.png",
    mimeType: "image/png",
    data: samplePng,
    sourceType: "drag_and_drop",
    acquiredBy: "u1",
  });

  assert.equal(second.isDuplicate, false);
  assert.notEqual(second.evidence.sha256, sha256Buffer(samplePdf));
});

// ─── State transitions ─────────────────────────────────────

test("transition from validated to processing succeeds", async () => {
  const { vault } = makeVault();
  const result = await vault.intake({
    caseId: "c1",
    originalFilename: "doc.pdf",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "drag_and_drop",
    acquiredBy: "u1",
  });

  const updated = vault.transition(
    result.evidence.id,
    EvidenceState.PROCESSING,
    "worker-1",
    "Document intelligence pipeline started",
  );
  assert.equal(updated.evidenceState, EvidenceState.PROCESSING);
});

test("invalid transition throws", async () => {
  const { vault } = makeVault();
  const result = await vault.intake({
    caseId: "c1",
    originalFilename: "doc.pdf",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "drag_and_drop",
    acquiredBy: "u1",
  });

  // validated → accepted is valid, but validated → duplicate is NOT
  assert.throws(
    () => vault.transition(result.evidence.id, EvidenceState.DUPLICATE, "u1"),
    /Invalid evidence state transition/,
  );
});

// ─── Versioning ────────────────────────────────────────────

test("createVersion supersedes the original and links parent", async () => {
  const { vault } = makeVault();
  const original = await vault.intake({
    caseId: "c1",
    originalFilename: "notice-v1.pdf",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "drag_and_drop",
    acquiredBy: "u1",
  });

  // Parent must be accepted before it can be superseded
  vault.transition(original.evidence.id, EvidenceState.ACCEPTED, "u1", "Approved");

  const redactedContent = Buffer.from("%PDF-1.4\n%redacted\n%%EOF");
  const versionResult = await vault.createVersion(original.evidence.id, {
    originalFilename: "notice-v1-redacted.pdf",
    mimeType: "application/pdf",
    data: redactedContent,
    sourceType: "api_intake",
    acquiredBy: "u1",
    versionType: "redaction_derivative",
  });

  assert.equal(versionResult.evidence.parentVersionId, original.evidence.id);
  assert.equal(versionResult.evidence.versionType, "redaction_derivative");

  const parentRecord = vault.get(original.evidence.id);
  assert.equal(parentRecord.evidenceState, EvidenceState.SUPERSEDED);
});

// ─── Chain of custody ──────────────────────────────────────

test("custody history records all events for an evidence item", async () => {
  const { vault } = makeVault();
  const result = await vault.intake({
    caseId: "c1",
    originalFilename: "doc.pdf",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "drag_and_drop",
    acquiredBy: "analyst-1",
  });

  const history = vault.custodyHistory(result.evidence.id);
  assert.ok(history.length >= 2); // intake + validate
  assert.equal(history[0].action, "intake");
  assert.equal(history[0].actor, "analyst-1");
  assert.equal(history[0].toState, EvidenceState.UPLOADED);
  assert.equal(history[1].action, "validate");
  assert.equal(history[1].toState, EvidenceState.VALIDATED);
});

// ─── Legal hold ────────────────────────────────────────────

test("restrict places a legal hold and release lifts it", async () => {
  const { vault } = makeVault();
  const result = await vault.intake({
    caseId: "c1",
    originalFilename: "doc.pdf",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "drag_and_drop",
    acquiredBy: "u1",
  });

  // validated → accepted first
  vault.transition(result.evidence.id, EvidenceState.ACCEPTED, "u1", "Approved");

  // accepted → restricted (legal hold)
  const restricted = vault.restrict(result.evidence.id, "attorney-1", "Pending litigation");
  assert.equal(restricted.evidenceState, EvidenceState.RESTRICTED);

  // restricted → accepted (release)
  const released = vault.releaseRestriction(result.evidence.id, "attorney-1", "Case dismissed");
  assert.equal(released.evidenceState, EvidenceState.ACCEPTED);
});

// ─── Delete under policy ───────────────────────────────────

test("deleteUnderPolicy transitions to terminal state", async () => {
  const { vault } = makeVault();
  const result = await vault.intake({
    caseId: "c1",
    originalFilename: "doc.pdf",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "drag_and_drop",
    acquiredBy: "u1",
  });

  // validated → accepted → deleted_under_policy
  vault.transition(result.evidence.id, EvidenceState.ACCEPTED, "u1", "Accepted");
  await vault.deleteUnderPolicy(result.evidence.id, "admin-1", "Retention period expired");

  const record = vault.get(result.evidence.id);
  assert.equal(record.evidenceState, EvidenceState.DELETED_UNDER_POLICY);
  assert.equal(record.retentionStatus, "deleted");
});

// ─── Metadata update ───────────────────────────────────────

test("updateMetadata updates fields and records custody event", async () => {
  const { vault } = makeVault();
  const result = await vault.intake({
    caseId: "c1",
    originalFilename: "doc.pdf",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "drag_and_drop",
    acquiredBy: "u1",
  });

  const updated = vault.updateMetadata(
    result.evidence.id,
    {
      displayTitle: "Notice of Violation - Case 2024-001",
      pageCount: 5,
      classification: "restricted",
      privilegeStatus: "attorney_client",
    },
    "attorney-1",
  );

  assert.equal(updated.displayTitle, "Notice of Violation - Case 2024-001");
  assert.equal(updated.pageCount, 5);
  assert.equal(updated.classification, "restricted");
  assert.equal(updated.privilegeStatus, "attorney_client");

  const history = vault.custodyHistory(result.evidence.id);
  const metaEvent = history.find((e) => e.action === "update_metadata");
  assert.ok(metaEvent);
  assert.deepEqual(metaEvent.metadata.fields, [
    "displayTitle",
    "pageCount",
    "classification",
    "privilegeStatus",
  ]);
});

// ─── Retrieve ───────────────────────────────────────────────

test("retrieve returns the original bytes", async () => {
  const { vault } = makeVault();
  const result = await vault.intake({
    caseId: "c1",
    originalFilename: "doc.pdf",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "drag_and_drop",
    acquiredBy: "u1",
  });

  const retrieved = await vault.retrieve(result.evidence.id);
  assert.deepEqual(retrieved, samplePdf);
});

// ─── List by case ───────────────────────────────────────────

test("listByCase returns evidence for the specified case", async () => {
  const { vault } = makeVault();
  await vault.intake({
    caseId: "case-A",
    originalFilename: "doc1.pdf",
    mimeType: "application/pdf",
    data: samplePdf,
    sourceType: "drag_and_drop",
    acquiredBy: "u1",
  });
  await vault.intake({
    caseId: "case-B",
    originalFilename: "doc2.png",
    mimeType: "image/png",
    data: samplePng,
    sourceType: "drag_and_drop",
    acquiredBy: "u1",
  });

  const caseA = vault.listByCase("case-A");
  assert.equal(caseA.length, 1);
  assert.equal(caseA[0].caseId, "case-A");

  const caseB = vault.listByCase("case-B");
  assert.equal(caseB.length, 1);
  assert.equal(caseB[0].fileType, "png");
});
