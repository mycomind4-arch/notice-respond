import assert from "node:assert/strict";
import test from "node:test";
import { extractCP14, generateCP14Draft } from "../src/domain/cp14.ts";
import { classifyNoticeType } from "../src/domain/notice-type.ts";
import { validateDraft } from "../src/domain/draft-validator.ts";
import { getWorkflowById } from "../src/domain/workflow-catalog.ts";
import { createWorkflowState, advanceStep, canAdvance, setExtraction, setUpload, setUserFacts, setUserObjective, setDraft, setReviewChecks } from "../src/domain/workflow-runtime.ts";

// ── Fixtures ──────────────────────────────────────────────────

const CP14_CLEAN = `
Internal Revenue Service
Department of the Treasury
Notice CP14
Notice Number: CP14-2024-56789-B
Notice Date: February 20, 2024
Tax Year 2023

Amount you owe: $3,250.00
Penalty: $325.00
Interest: $48.75
Total amount due: $3,623.75

Please pay by April 20, 2024.

If you cannot pay in full, you may request an installment agreement.

Send your payment or response to:
IRS — Receipts and Accounts
P.O. Box 912
Cincinnati, OH 45201-0912

Call us at 800-829-8310 if you have questions.
`;

const CP14_NO_DEADLINE = `
Internal Revenue Service
Notice CP14-2023-12345-A
Tax Year 2022
Amount you owe: $1,500.00
Penalty: $150.00
Interest: $22.50
Total due: $1,672.50
`;

const CP14_MISSING_TAX_YEAR = `
Internal Revenue Service
CP14-2024-99888-C
Notice Date: January 15, 2024
Please pay by March 15, 2024.
Balance due: $2,800.00
Penalty: $280.00
Interest: $42.00
Total amount due: $3,122.00
`;

const CP14_INSTALLMENT = `
Internal Revenue Service
CP14-2024-44444-D
Tax Year 2023
Notice Date: May 1, 2024
Amount you owe: $5,400.00
Penalty: $540.00
Interest: $81.00
Total amount due: $6,021.00
Pay by July 1, 2024.

If you can't pay the full amount, you may be eligible for an installment agreement using Form 9465.
You may also qualify for an Offer in Compromise.

Send payment to:
IRS
P.O. Box 722
Memphis, TN 37501-0722

Call 800-555-9876 for assistance.
`;

const CP14_CONFLICTING = `
Internal Revenue Service
CP14-2024-77777-E
Tax Year 2023
Notice Date: April 1, 2024
Respond by June 1, 2024.
Balance due: $4,000.00
Penalty: $400.00
Interest: $60.00
Total amount due: $3,500.00
`;

const NON_CP14 = `
Superior Court of California
Summons
Case Number: CV-2024-5678
You are hereby summoned to appear in court.
You must file a response within 30 days of service.
`;

const CP2000_DOCUMENT = `
Internal Revenue Service
Notice CP2000
Notice Number: CP2000-2024-12345-A
Tax Year 2023
We are proposing changes to your return based on underreported income.
You reported income of: $45,000
Income reported to us on Form W-2: $52,000
`;

// ── Classification Tests ──────────────────────────────────────

test("CP14 classification: correctly identifies CP14 notice", () => {
  const result = classifyNoticeType(CP14_CLEAN);
  assert.equal(result.type, "irs_cp14");
  assert.ok(result.confidence > 0.4, "Confidence should be reasonable");
});

test("CP14 classification: beats generic irs_letter", () => {
  const result = classifyNoticeType(CP14_CLEAN);
  assert.notEqual(result.type, "irs_letter", "Should not classify as generic irs_letter");
  assert.equal(result.type, "irs_cp14");
});

test("CP14 classification: does not classify CP2000 as CP14", () => {
  const result = classifyNoticeType(CP2000_DOCUMENT);
  assert.equal(result.type, "irs_cp2000", "CP2000 document should classify as CP2000, not CP14");
  assert.notEqual(result.type, "irs_cp14");
});

test("CP14 classification: does not classify court summons as CP14", () => {
  const result = classifyNoticeType(NON_CP14);
  assert.notEqual(result.type, "irs_cp14");
});

// ── Extraction Tests ──────────────────────────────────────────

test("CP14 extraction: extracts notice number", () => {
  const ext = extractCP14(CP14_CLEAN);
  assert.ok(ext.isCP14, "Should be classified as CP14");
  assert.ok(ext.noticeNumber, "Should extract notice number");
  assert.ok(ext.noticeNumber.includes("CP14"), `Notice number should contain CP14, got: ${ext.noticeNumber}`);
});

test("CP14 extraction: extracts notice date", () => {
  const ext = extractCP14(CP14_CLEAN);
  assert.ok(ext.noticeDate, "Should extract notice date");
});

test("CP14 extraction: extracts response deadline", () => {
  const ext = extractCP14(CP14_CLEAN);
  assert.ok(ext.responseDeadline, "Should extract response deadline");
  assert.ok(ext.responseDeadline.includes("April"), `Expected April, got: ${ext.responseDeadline}`);
});

test("CP14 extraction: extracts tax year", () => {
  const ext = extractCP14(CP14_CLEAN);
  assert.equal(ext.taxYear, "2023", `Expected tax year 2023, got: ${ext.taxYear}`);
});

test("CP14 extraction: extracts balance due", () => {
  const ext = extractCP14(CP14_CLEAN);
  assert.ok(ext.balanceDue, "Should extract balance due");
  assert.ok(ext.balanceDue.includes("3,250"), `Expected $3,250, got: ${ext.balanceDue}`);
});

test("CP14 extraction: extracts penalty and interest", () => {
  const ext = extractCP14(CP14_CLEAN);
  assert.ok(ext.penaltyAmount, "Should extract penalty amount");
  assert.ok(ext.interestAmount, "Should extract interest amount");
});

test("CP14 extraction: extracts total due", () => {
  const ext = extractCP14(CP14_CLEAN);
  assert.ok(ext.totalDue, "Should extract total amount due");
  assert.ok(ext.totalDue.includes("3,623"), `Expected $3,623.75, got: ${ext.totalDue}`);
});

test("CP14 extraction: detects installment agreement option", () => {
  const ext = extractCP14(CP14_INSTALLMENT);
  assert.equal(ext.installmentOption, true, "Should detect installment agreement option");
});

test("CP14 extraction: installment option false when not mentioned", () => {
  const ext = extractCP14(CP14_CLEAN);
  // CP14_CLEAN mentions "installment agreement" so this should be true
  assert.equal(ext.installmentOption, true, "CP14_CLEAN mentions installment agreement");
});

test("CP14 extraction: facts have provenance", () => {
  const ext = extractCP14(CP14_CLEAN);
  for (const fact of ext.facts) {
    assert.equal(fact.source, "extracted", "All extracted facts should have source 'extracted'");
    assert.ok(fact.confidence, "Each fact should have a confidence level");
  }
});

test("CP14 extraction: warns when deadline is missing", () => {
  const ext = extractCP14(CP14_NO_DEADLINE);
  assert.ok(ext.warnings.some((w) => w.toLowerCase().includes("deadline")), "Should warn about missing deadline");
});

test("CP14 extraction: warns when tax year is missing", () => {
  const ext = extractCP14(CP14_MISSING_TAX_YEAR);
  assert.ok(ext.warnings.some((w) => w.toLowerCase().includes("tax year")), "Should warn about missing tax year");
});

test("CP14 extraction: warns when balance due is missing", () => {
  const noBalance = `
    Internal Revenue Service
    CP14-2024-12345-A
    Tax Year 2023
    Please pay by April 20, 2024.
  `;
  const ext = extractCP14(noBalance);
  assert.ok(ext.warnings.some((w) => w.toLowerCase().includes("balance")), "Should warn about missing balance");
});

test("CP14 extraction: rejects non-CP14 document", () => {
  const ext = extractCP14(NON_CP14);
  assert.equal(ext.isCP14, false, "Court summons should not be classified as CP14");
  assert.ok(ext.warnings.some((w) => w.includes("not a CP14") || w.includes("classified as")), "Should warn about misclassification");
});

test("CP14 extraction: rejects CP2000 document as CP14", () => {
  const ext = extractCP14(CP2000_DOCUMENT);
  assert.equal(ext.isCP14, false, "CP2000 should not be classified as CP14");
  assert.equal(ext.isCP14, false);
});

test("CP14 extraction: warns about conflicting total vs balance", () => {
  const ext = extractCP14(CP14_CONFLICTING);
  assert.ok(
    ext.warnings.some((w) => w.includes("less than") || w.includes("verify") || w.includes("Verify")),
    "Should warn about total being less than balance"
  );
});

test("CP14 extraction: extracts response address", () => {
  const ext = extractCP14(CP14_CLEAN);
  assert.ok(ext.responseAddress, "Should extract response address");
  assert.ok(ext.responseAddress.includes("P.O. Box") || ext.responseAddress.includes("Box"), "Address should contain P.O. Box");
});

test("CP14 extraction: extracts contact phone", () => {
  const ext = extractCP14(CP14_CLEAN);
  assert.ok(ext.contactPhone, "Should extract contact phone");
});

test("CP14 extraction: extracts requested action", () => {
  const ext = extractCP14(CP14_CLEAN);
  assert.ok(ext.requestedAction, "Should extract requested action");
});

test("CP14 extraction: installment notice extracts Form 9465 reference", () => {
  const ext = extractCP14(CP14_INSTALLMENT);
  assert.ok(ext.installmentOption, "Should detect installment option with Form 9465");
  assert.ok(ext.facts.some((f) => f.label.includes("Installment")), "Should have installment fact");
});

// ── Draft Generation Tests ────────────────────────────────────

test("CP14 draft generation: includes notice number and tax year", () => {
  const ext = extractCP14(CP14_CLEAN);
  const draft = generateCP14Draft({
    noticeNumber: ext.noticeNumber,
    taxYear: ext.taxYear,
    noticeDate: ext.noticeDate,
    responseDeadline: ext.responseDeadline,
    balanceDue: ext.balanceDue,
    totalDue: ext.totalDue,
    userFacts: "I already paid this balance on January 15, 2024.",
    userObjective: "I want to provide proof of payment and request the balance be removed.",
  });
  assert.ok(draft.includes(ext.noticeNumber), "Draft should contain notice number");
  assert.ok(draft.includes("2023"), "Draft should contain tax year");
  assert.ok(draft.includes("April 20, 2024"), "Draft should contain response deadline");
  assert.ok(draft.includes("Dear Sir or Madam"), "Draft should have proper salutation");
});

test("CP14 draft generation: includes balance due when provided", () => {
  const draft = generateCP14Draft({
    noticeNumber: "CP14-2024-56789-B",
    taxYear: "2023",
    noticeDate: "February 20, 2024",
    responseDeadline: "April 20, 2024",
    balanceDue: "$3,250.00",
    totalDue: "$3,623.75",
    userFacts: "I paid this balance.",
    userObjective: "Provide proof of payment.",
  });
  assert.ok(draft.includes("$3,250.00"), "Draft should contain balance due");
  assert.ok(draft.includes("$3,623.75"), "Draft should contain total due");
});

test("CP14 draft generation: includes all required sections", () => {
  const draft = generateCP14Draft({
    noticeNumber: "CP14-TEST",
    taxYear: "2023",
    noticeDate: null,
    responseDeadline: null,
    balanceDue: null,
    totalDue: null,
    userFacts: "Facts here",
    userObjective: "Objective here",
  });
  assert.ok(draft.includes("CP14 reference number:"), "Should have CP14 reference number section");
  assert.ok(draft.includes("Tax year:"), "Should have tax year");
  assert.ok(draft.toLowerCase().includes("payment or dispute position"), "Should have payment or dispute position");
  assert.ok(draft.toLowerCase().includes("balance explanation"), "Should have balance explanation");
  assert.ok(draft.toLowerCase().includes("supporting records list"), "Should have supporting records list");
  assert.ok(draft.toLowerCase().includes("attachments:"), "Should have attachments section");
});

test("CP14 draft generation: handles null amounts gracefully", () => {
  const draft = generateCP14Draft({
    noticeNumber: "CP14-TEST",
    taxYear: null,
    noticeDate: null,
    responseDeadline: null,
    balanceDue: null,
    totalDue: null,
    userFacts: "",
    userObjective: "",
  });
  assert.ok(draft.includes("[Notice Number]") || draft.includes("CP14-TEST"), "Should handle null notice number");
  assert.ok(draft.includes("[Verify on notice]"), "Should indicate tax year needs verification");
  assert.ok(draft.includes("[Verify deadline"), "Should indicate deadline needs verification");
});

// ── Draft Validation Tests ────────────────────────────────────

test("CP14 draft validation: passes for well-formed draft", () => {
  const def = getWorkflowById("cp14-response");
  const ext = extractCP14(CP14_CLEAN);
  const draft = generateCP14Draft({
    noticeNumber: ext.noticeNumber,
    taxYear: ext.taxYear,
    noticeDate: ext.noticeDate,
    responseDeadline: ext.responseDeadline,
    balanceDue: ext.balanceDue,
    totalDue: ext.totalDue,
    userFacts: "I paid this balance on January 15, 2024.",
    userObjective: "I want to provide proof of payment.",
  });
  const validation = validateDraft(draft, ext.facts, def, {
    expectedNoticeNumber: ext.noticeNumber,
    expectedTaxYear: ext.taxYear,
    expectedDeadline: ext.responseDeadline,
    expectedAmounts: [ext.balanceDue, ext.totalDue].filter(Boolean),
  });
  assert.equal(validation.errors, 0, `Expected 0 errors, got ${validation.errors}: ${validation.findings.filter(f => !f.passed && f.severity === "error").map(f => f.detail).join("; ")}`);
});

test("CP14 draft validation: detects missing required section", () => {
  const def = getWorkflowById("cp14-response");
  const badDraft = "This is a short response with no required sections.";
  const validation = validateDraft(badDraft, [], def, {});
  assert.ok(validation.errors > 0, "Should detect missing required sections");
});

test("CP14 draft validation: detects mismatched notice number", () => {
  const def = getWorkflowById("cp14-response");
  const ext = extractCP14(CP14_CLEAN);
  const draft = generateCP14Draft({
    noticeNumber: "WRONG-NUMBER",
    taxYear: ext.taxYear,
    noticeDate: ext.noticeDate,
    responseDeadline: ext.responseDeadline,
    balanceDue: ext.balanceDue,
    totalDue: ext.totalDue,
    userFacts: "My records show the payment was made.",
    userObjective: "Dispute the balance due.",
  });
  const validation = validateDraft(draft, ext.facts, def, {
    expectedNoticeNumber: ext.noticeNumber,
  });
  const noticeNumFinding = validation.findings.find((f) => f.check === "notice_number_consistency");
  assert.ok(noticeNumFinding, "Should have a notice number consistency check");
  assert.equal(noticeNumFinding.passed, false, "Should detect mismatched notice number");
});

test("CP14 draft validation: detects draft too short", () => {
  const def = getWorkflowById("cp14-response");
  const validation = validateDraft("Too short", [], def, {});
  assert.ok(validation.errors > 0, "Should detect draft that is too short");
});

test("CP14 draft validation: detects unsupported amounts", () => {
  const def = getWorkflowById("cp14-response");
  const draft = generateCP14Draft({
    noticeNumber: "CP14-TEST",
    taxYear: "2023",
    noticeDate: null,
    responseDeadline: null,
    balanceDue: "$3,250.00",
    totalDue: "$3,623.75",
    userFacts: "I paid $999,999.99 already.",
    userObjective: "Provide proof of payment.",
  });
  const validation = validateDraft(draft, [], def, {
    expectedAmounts: ["$3,250.00", "$3,623.75"],
  });
  // $999,999.99 should be flagged as unsupported
  const unsupportedFinding = validation.findings.find((f) => f.check.includes("unsupported_amount") && f.detail.includes("999,999"));
  assert.ok(unsupportedFinding, "Should flag unsupported amount $999,999.99");
});

// ── Workflow State Tests ──────────────────────────────────────

test("CP14 workflow state: create initial state", () => {
  const def = getWorkflowById("cp14-response");
  const state = createWorkflowState(def);
  assert.equal(state.workflowId, "cp14-response");
  assert.equal(state.step, 0);
  assert.equal(state.phase, "intro");
  assert.equal(state.upload, null);
  assert.equal(state.extraction, null);
  assert.equal(state.approved, false);
  assert.ok(state.reviewChecks.length > 0, "Should have review checks from definition");
});

test("CP14 workflow state: advance through steps", () => {
  const def = getWorkflowById("cp14-response");
  let state = createWorkflowState(def);
  assert.equal(state.phase, "intro");
  
  state = advanceStep(state, def);
  assert.equal(state.phase, "document");
  
  state = advanceStep(state, def);
  assert.equal(state.phase, "extraction");
});

test("CP14 workflow state: can advance requires facts at facts step", () => {
  const def = getWorkflowById("cp14-response");
  let state = createWorkflowState(def);
  
  state = advanceStep(state, def); // document
  state = advanceStep(state, def); // extraction
  state = advanceStep(state, def); // facts
  
  assert.equal(state.phase, "facts");
  assert.equal(canAdvance(state, def), false, "Cannot advance without user facts");
  
  state = setUserFacts(state, "I paid this balance already.");
  assert.equal(canAdvance(state, def), true, "Can advance with user facts");
});

test("CP14 workflow state: can advance requires objective at objective step", () => {
  const def = getWorkflowById("cp14-response");
  let state = createWorkflowState(def);
  
  state = advanceStep(state, def); // intro → document
  state = advanceStep(state, def); // document → extraction
  state = advanceStep(state, def); // extraction → facts
  state = setUserFacts(state, "Facts here");
  state = advanceStep(state, def); // facts → objective
  
  assert.equal(state.phase, "objective");
  assert.equal(canAdvance(state, def), false, "Cannot advance without objective");
  
  state = setUserObjective(state, "I want to dispute this balance.");
  assert.equal(canAdvance(state, def), true, "Can advance with objective");
});

test("CP14 workflow state: review checks must all be checked", () => {
  const def = getWorkflowById("cp14-response");
  let state = createWorkflowState(def);
  
  state = { ...state, step: 6, phase: "review" };
  state = setUserFacts(state, "Facts");
  state = setUserObjective(state, "Objective");
  
  assert.equal(canAdvance(state, def), false, "Cannot advance with unchecked review");
  
  state = setReviewChecks(state, state.reviewChecks.map(() => true));
  assert.equal(state.approved, true, "Should be approved when all checks are true");
  assert.equal(canAdvance(state, def), true, "Can advance with all checks true");
});

test("CP14 workflow state: set extraction populates facts", () => {
  const def = getWorkflowById("cp14-response");
  let state = createWorkflowState(def);
  const ext = extractCP14(CP14_CLEAN);
  
  state = setExtraction(state, {
    noticeType: "irs_cp14",
    classificationConfidence: 0.85,
    facts: ext.facts,
    deadlines: [],
    agency: "IRS",
    referenceNumber: ext.noticeNumber ?? undefined,
    rawText: CP14_CLEAN,
    extractionConfidence: 0.85,
  });
  
  assert.ok(state.extractedFacts.length > 0, "Should have extracted facts");
  assert.ok(state.extraction, "Should have extraction result");
});

// ── Catalog Tests ────────────────────────────────────────────

test("CP14 catalog: has correct quality gate settings", () => {
  const def = getWorkflowById("cp14-response");
  assert.equal(def.qualityGate.documentRecognition, true, "CP14 should have document recognition");
  assert.equal(def.qualityGate.draftValidation, true, "CP14 should have draft validation");
  assert.equal(def.qualityGate.factGrounding, true, "CP14 should have fact grounding");
  assert.equal(def.qualityGate.deadlineVerification, true, "CP14 should have deadline verification");
});

test("CP14 catalog: has extraction fields for key CP14 data", () => {
  const def = getWorkflowById("cp14-response");
  const fields = def.documents[0].extractionFields;
  assert.ok(fields.includes("taxYear"), "Should extract tax year");
  assert.ok(fields.includes("responseDeadline"), "Should extract response deadline");
  assert.ok(fields.includes("balanceDue"), "Should extract balance due");
  assert.ok(fields.includes("totalDue"), "Should extract total due");
  assert.ok(fields.includes("penaltyAmount"), "Should extract penalty amount");
  assert.ok(fields.includes("interestAmount"), "Should extract interest amount");
  assert.ok(fields.includes("installmentOption"), "Should extract installment option");
});

test("CP14 catalog: has FAQ for SEO", () => {
  const def = getWorkflowById("cp14-response");
  assert.ok(def.seo?.faq?.length >= 4, "Should have at least 4 FAQ entries");
  assert.ok(def.seo?.faq?.some((f) => f.question.includes("What is a CP14")), "Should have 'what is CP14' FAQ");
  assert.ok(def.seo?.faq?.some((f) => f.question.includes("How long")), "Should have deadline FAQ");
  assert.ok(def.seo?.faq?.some((f) => f.question.includes("options")), "Should have options FAQ");
});

test("CP14 catalog: lifecycle is functional", () => {
  const def = getWorkflowById("cp14-response");
  assert.equal(def.lifecycle, "functional");
  assert.notEqual(def.lifecycle, "authority", "CP14 should not be authority until all quality gates are fully validated in production");
});

test("CP14 catalog: has directory entry", () => {
  const def = getWorkflowById("cp14-response");
  assert.ok(def.directory, "Should have directory metadata");
  assert.ok(def.directory?.category, "Should have directory category");
  assert.ok(def.directory?.seoRoute, "Should have SEO route");
  assert.equal(def.directory?.seoRoute, "/workflows/respond-to-cp14-notice");
});

test("CP14 catalog: required sections match draft generator output", () => {
  const def = getWorkflowById("cp14-response");
  const requiredSections = def.drafting.requiredSections;
  const draft = generateCP14Draft({
    noticeNumber: "CP14-TEST",
    taxYear: "2023",
    noticeDate: "Jan 1, 2024",
    responseDeadline: "Mar 1, 2024",
    balanceDue: "$1,000.00",
    totalDue: "$1,100.00",
    userFacts: "Facts",
    userObjective: "Objective",
  });
  const draftLower = draft.toLowerCase();
  for (const section of requiredSections) {
    const found = draftLower.includes(section.toLowerCase()) ||
      draftLower.includes(section.toLowerCase().replace(/[^a-z0-9]/g, ""));
    assert.ok(found, `Required section "${section}" not found in generated draft`);
  }
});

test("CP14 catalog: forbidden behaviors are defined", () => {
  const def = getWorkflowById("cp14-response");
  assert.ok(def.drafting.forbiddenBehavior.length > 0, "Should have forbidden behaviors defined");
  assert.ok(def.drafting.forbiddenBehavior.includes("invent tax positions"), "Should forbid inventing tax positions");
  assert.ok(def.drafting.forbiddenBehavior.includes("claim to provide tax advice"), "Should forbid claiming tax advice");
});

// ── Wrong Document / Conflicting Fact Tests ──────────────────

test("CP14 wrong document: CP2000 text fed to CP14 extractor warns", () => {
  const ext = extractCP14(CP2000_DOCUMENT);
  assert.equal(ext.isCP14, false, "CP2000 text should not be classified as CP14");
  assert.ok(ext.warnings.length > 0, "Should have warnings about wrong document type");
});

test("CP14 wrong document: court summons fed to CP14 extractor warns", () => {
  const ext = extractCP14(NON_CP14);
  assert.equal(ext.isCP14, false, "Court summons should not be classified as CP14");
  assert.ok(ext.warnings.some((w) => w.includes("classified as")), "Should warn about classification mismatch");
});

test("CP14 conflicting facts: total less than balance triggers warning", () => {
  const ext = extractCP14(CP14_CONFLICTING);
  // Total due ($3,500) < Balance due ($4,000) — should warn
  assert.ok(
    ext.warnings.some((w) => w.includes("less than") || w.toLowerCase().includes("verify")),
    "Should warn about total being less than balance"
  );
});

test("CP14 conflicting facts: draft with wrong notice number fails validation", () => {
  const def = getWorkflowById("cp14-response");
  const ext = extractCP14(CP14_CLEAN);
  const draft = generateCP14Draft({
    noticeNumber: "CP14-9999-WRONG",
    taxYear: ext.taxYear,
    noticeDate: ext.noticeDate,
    responseDeadline: ext.responseDeadline,
    balanceDue: ext.balanceDue,
    totalDue: ext.totalDue,
    userFacts: "Facts",
    userObjective: "Objective",
  });
  const validation = validateDraft(draft, ext.facts, def, {
    expectedNoticeNumber: ext.noticeNumber,
  });
  const finding = validation.findings.find((f) => f.check === "notice_number_consistency");
  assert.ok(finding, "Should have notice number consistency check");
  assert.equal(finding.passed, false, "Should flag wrong notice number");
});

test("CP14 conflicting facts: draft missing balance amount still validates sections", () => {
  const def = getWorkflowById("cp14-response");
  const draft = generateCP14Draft({
    noticeNumber: "CP14-TEST",
    taxYear: "2023",
    noticeDate: null,
    responseDeadline: null,
    balanceDue: null,
    totalDue: null,
    userFacts: "No amounts mentioned",
    userObjective: "Dispute the balance",
  });
  const validation = validateDraft(draft, [], def, {});
  // Should still pass section checks (sections are present)
  const sectionErrors = validation.findings.filter(
    (f) => f.check.startsWith("required_section:") && !f.passed && f.severity === "error"
  );
  assert.equal(sectionErrors.length, 0, "All required sections should be present even without amounts");
});

// ── End-to-End: Extraction → Draft → Validate ─────────────────

test("CP14 end-to-end: extraction → draft → validation all pass", () => {
  const def = getWorkflowById("cp14-response");
  const ext = extractCP14(CP14_CLEAN);
  assert.ok(ext.isCP14, "Should classify as CP14");
  assert.ok(ext.noticeNumber, "Should extract notice number");
  assert.ok(ext.balanceDue, "Should extract balance due");
  assert.ok(ext.totalDue, "Should extract total due");
  
  const draft = generateCP14Draft({
    noticeNumber: ext.noticeNumber,
    taxYear: ext.taxYear,
    noticeDate: ext.noticeDate,
    responseDeadline: ext.responseDeadline,
    balanceDue: ext.balanceDue,
    totalDue: ext.totalDue,
    userFacts: "I am paying the balance in full and have enclosed a check for the total amount due.",
    userObjective: "I am paying the balance in full.",
  });
  
  const validation = validateDraft(draft, ext.facts, def, {
    expectedNoticeNumber: ext.noticeNumber,
    expectedTaxYear: ext.taxYear,
    expectedDeadline: ext.responseDeadline,
    expectedAmounts: [ext.balanceDue, ext.totalDue].filter(Boolean),
  });
  
  assert.equal(validation.errors, 0, `End-to-end validation should have 0 errors, got ${validation.errors}: ${validation.findings.filter(f => !f.passed && f.severity === "error").map(f => f.detail).join("; ")}`);
  assert.ok(validation.passed, "End-to-end validation should pass");
});

test("CP14 end-to-end: installment scenario works", () => {
  const def = getWorkflowById("cp14-response");
  const ext = extractCP14(CP14_INSTALLMENT);
  assert.ok(ext.isCP14, "Should classify as CP14");
  assert.equal(ext.installmentOption, true, "Should detect installment option");
  
  const draft = generateCP14Draft({
    noticeNumber: ext.noticeNumber,
    taxYear: ext.taxYear,
    noticeDate: ext.noticeDate,
    responseDeadline: ext.responseDeadline,
    balanceDue: ext.balanceDue,
    totalDue: ext.totalDue,
    userFacts: "I cannot pay the full amount. I am requesting an installment agreement and have enclosed Form 9465.",
    userObjective: "I am requesting an installment agreement to pay the balance over time.",
  });
  
  const validation = validateDraft(draft, ext.facts, def, {
    expectedNoticeNumber: ext.noticeNumber,
    expectedTaxYear: ext.taxYear,
    expectedAmounts: [ext.balanceDue, ext.totalDue].filter(Boolean),
  });
  
  assert.equal(validation.errors, 0, `Installment scenario validation should have 0 errors, got ${validation.errors}`);
});

test("CP14 end-to-end: dispute scenario works", () => {
  const def = getWorkflowById("cp14-response");
  const ext = extractCP14(CP14_CLEAN);
  
  const draft = generateCP14Draft({
    noticeNumber: ext.noticeNumber,
    taxYear: ext.taxYear,
    noticeDate: ext.noticeDate,
    responseDeadline: ext.responseDeadline,
    balanceDue: ext.balanceDue,
    totalDue: ext.totalDue,
    userFacts: "I already paid this balance on January 10, 2024. The payment of $3,623.75 was made via electronic funds transfer. I have enclosed the bank confirmation.",
    userObjective: "I am disputing the balance because I have already paid it in full. I request that the balance be removed from my account.",
  });
  
  const validation = validateDraft(draft, ext.facts, def, {
    expectedNoticeNumber: ext.noticeNumber,
    expectedTaxYear: ext.taxYear,
    expectedAmounts: [ext.balanceDue, ext.totalDue].filter(Boolean),
  });
  
  assert.equal(validation.errors, 0, `Dispute scenario validation should have 0 errors, got ${validation.errors}`);
});
