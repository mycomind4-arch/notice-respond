/* ═══════════════════════════════════════════════════════════
   CP2000 TEST FIXTURES — 10 reusable test scenarios.

   1. valid/simple CP2000
   2. multiple discrepancies
   3. missing evidence
   4. ambiguous extraction
   5. conflicting user facts
   6. incomplete notice
   7. wrong document uploaded
   8. missing deadline
   9. unsupported draft claim
   10. adversarial/malformed input

   ═══════════════════════════════════════════════════════════ */

// ── 1. Valid/Simple CP2000 ────────────────────────────────────

export const FIXTURE_VALID_SIMPLE = `
Internal Revenue Service
Department of the Treasury
Notice CP2000
Notice Number: CP2000-2024-12345-A
Notice Date: March 15, 2024
Tax Year 2023

We are proposing changes to your 2023 tax return based on income reported to us that doesn't match your return.

You reported income of: $45,000
Income reported to us on Form W-2: $52,000
Proposed increase in tax: $1,200
Estimated penalty: $240

If you agree with our proposed changes, sign and return the response form.
If you disagree, send us documentation showing why the proposed changes are wrong.

Please respond by May 14, 2024.

Send your response to:
IRS — Automated Underreporter
P.O. Box 9019
Holtsville, NY 11742-9019

Call us at 800-555-1234 if you have questions.
`;

// ── 2. Multiple Discrepancies ────────────────────────────────

export const FIXTURE_MULTIPLE_DISCREPANCIES = `
Internal Revenue Service
Notice CP2000-2024-67890-B
Notice Date: June 10, 2024
Tax Year 2023

We are proposing changes to your 2023 tax return.

You reported income of: $32,000
Income reported to us on Form 1099-NEC: $45,000
Income reported to us on Form 1099-INT: $850
Proposed increase in tax: $3,200
Estimated penalty: $640

Please respond by August 9, 2024.

Send your response to:
IRS — Automated Underreporter
P.O. Box 9019
Holtsville, NY 11742-9019
`;

// ── 3. Missing Evidence ───────────────────────────────────────

export const FIXTURE_MISSING_EVIDENCE = `
Internal Revenue Service
CP2000-2024-99999-X
Tax Year 2022
Notice Date: April 1, 2024

We are proposing changes based on underreported income.
You reported: $28,000
Income reported to us on Form W-2: $35,000
Proposed tax increase: $1,400

Respond by June 1, 2024.
`;

// ── 4. Ambiguous Extraction ──────────────────────────────────

export const FIXTURE_AMBIGUOUS = `
IRS Notice
This is regarding your tax return.
The amount shown is $50,000.
Please contact us.

Some text that might be a deadline: within 30 days
Notice CP2000 reference
Tax Year: 2023
`;

// ── 5. Conflicting User Facts ────────────────────────────────

export const FIXTURE_CONFLICTING_USER = `
Internal Revenue Service
Notice CP2000-2024-55555-D
Notice Date: May 1, 2024
Tax Year 2023

You reported income of: $40,000
Income reported to us on Form 1099-MISC: $55,000
Proposed increase in tax: $2,400
Penalty: $480

Please respond by July 1, 2024.
`;

export const FIXTURE_CONFLICTING_USER_FACTS = "My actual income was $38,000, not $40,000 or $55,000. The 1099-MISC amount is wrong — I only received $38,000 from this payer.";

// ── 6. Incomplete Notice ──────────────────────────────────────

export const FIXTURE_INCOMPLETE = `
Internal Revenue Service
CP2000
We are proposing changes to your tax return.
`;

// ── 7. Wrong Document Uploaded ────────────────────────────────

export const FIXTURE_WRONG_DOCUMENT = `
Superior Court of California
County of Los Angeles
Summons

You are hereby summoned to appear in court on September 15, 2024.
Case Number: BC123456
This is a civil complaint filed by the plaintiff.
`;

// ── 8. Missing Deadline ───────────────────────────────────────

export const FIXTURE_MISSING_DEADLINE = `
Internal Revenue Service
Notice CP2000-2024-44444-E
Notice Date: February 15, 2024
Tax Year 2022

We are proposing changes to your 2022 tax return.
You reported income of: $50,000
Income reported to us on Form W-2: $60,000
Proposed increase in tax: $2,500
Estimated penalty: $500

If you agree, sign and return the response form.
If you disagree, send documentation.
`;

// ── 9. Unsupported Draft Claim ────────────────────────────────

export const FIXTURE_VALID_FOR_DRAFT_TEST = `
Internal Revenue Service
Notice CP2000-2024-33333-F
Notice Date: July 1, 2024
Tax Year 2023

You reported income of: $42,000
Income reported to us on Form 1099-NEC: $50,000
Proposed increase in tax: $1,800
Estimated penalty: $360

Please respond by August 30, 2024.

Send your response to:
IRS — Automated Underreporter
P.O. Box 9019
Holtsville, NY 11742-9019
`;

export const FIXTURE_DRAFT_WITH_UNSUPPORTED_CLAIM = `Re: CP2000-2024-33333-F
Notice Date: July 1, 2024
Response Deadline: August 30, 2024

Dear Internal Revenue Service,

I am writing to correct factual errors in the notice referenced above.

The following information was identified from the notice:
  • Notice Number: CP2000-2024-33333-F
  • Tax Year: 2023
  • Income You Reported: $42,000
  • Income Reported to IRS: $50,000
  • Proposed Tax Increase: $1,800
  • Estimated Penalty: $360

The correct tax is $0 and you owe nothing. I guarantee this will be resolved in my favor.

According to IRC §61, all income is taxable unless specifically excluded.

Please find enclosed the following supporting documentation:
  [LIST ENCLOSED DOCUMENTS]

Sincerely,
[YOUR NAME]`;

export const FIXTURE_DRAFT_VALID = `Re: CP2000-2024-33333-F
Notice Date: July 1, 2024
Response Deadline: August 30, 2024

Dear Internal Revenue Service,

I am writing to correct factual errors in the notice referenced above.

The following information was identified from the notice:
  • Notice Number: CP2000-2024-33333-F
  • Tax Year: 2023
  • Income You Reported: $42,000
  • Income Reported to IRS: $50,000
  • Proposed Tax Increase: $1,800
  • Estimated Penalty: $360

After reviewing my records, the income reported to the IRS on Form 1099-NEC of $50,000 does not match my records. I received $42,000 from this payer in 2023.

Please find enclosed the following supporting documentation:
  Copy of Form 1099-NEC
  Bank statements from 2023

I respectfully request that you review this response and adjust the proposed changes accordingly.

Sincerely,
John Smith`;

// ── 10. Adversarial/Malformed Input ───────────────────────────

export const FIXTURE_ADVERSARIAL_EMPTY = "";

export const FIXTURE_ADVERSARIAL_GIBBERISH = "asdfghjkl qwertyuiop zxcvbnm 12345";

export const FIXTURE_ADVERSARIAL_INJECTION = `
CP2000 notice
<script>alert('xss')</script>
Tax Year 2023
You reported: \${{injection}}
`;

// ── Fixture metadata ──────────────────────────────────────────

export const FIXTURES = [
  { id: "valid_simple", name: "Valid/Simple CP2000", text: FIXTURE_VALID_SIMPLE },
  { id: "multiple_discrepancies", name: "Multiple Discrepancies", text: FIXTURE_MULTIPLE_DISCREPANCIES },
  { id: "missing_evidence", name: "Missing Evidence", text: FIXTURE_MISSING_EVIDENCE },
  { id: "ambiguous", name: "Ambiguous Extraction", text: FIXTURE_AMBIGUOUS },
  { id: "conflicting_user", name: "Conflicting User Facts", text: FIXTURE_CONFLICTING_USER },
  { id: "incomplete", name: "Incomplete Notice", text: FIXTURE_INCOMPLETE },
  { id: "wrong_document", name: "Wrong Document", text: FIXTURE_WRONG_DOCUMENT },
  { id: "missing_deadline", name: "Missing Deadline", text: FIXTURE_MISSING_DEADLINE },
  { id: "draft_test", name: "Draft Validation Test", text: FIXTURE_VALID_FOR_DRAFT_TEST },
  { id: "adversarial_empty", name: "Adversarial: Empty", text: FIXTURE_ADVERSARIAL_EMPTY },
  { id: "adversarial_gibberish", name: "Adversarial: Gibberish", text: FIXTURE_ADVERSARIAL_GIBBERISH },
  { id: "adversarial_injection", name: "Adversarial: Injection", text: FIXTURE_ADVERSARIAL_INJECTION },
];
