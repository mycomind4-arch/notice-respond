# MailMyPDF Ecosystem — Complete Workflow Inventory

**Generated:** 2026-08-25  
**Source:** 12 ecosystem repositories  
**Total implemented workflows:** 78  
**Total planning universe:** 360 (12 product families × 30 target workflows each)

---

## Pipeline Archetypes (10)

| ID | Name | Description |
|----|------|-------------|
| P01 | Core Mail / Correspondence | Simple letters, PDFs, templates, routine correspondence, direct mailing, tracking, proof |
| P02 | Notice / Official Response | Government/agency notices, formal requests, CP2000/IRS-style responses |
| P03 | Appeal / Reconsideration | Denials, adverse decisions, reconsiderations, appeal packages, stress testing |
| P04 | Court / Formal Proceeding | Summonses, formal court papers, procedural response packages |
| P05 | Immigration Evidence / Response | Immigration notices, evidence submissions, explanation letters |
| P06 | Dispute / Investigation | Debt, collections, credit, billing, unauthorized charges, investigations, escalation |
| P07 | Business Automation | Triggered business correspondence, approvals, scheduling, risk, execution, audit |
| P08 | Records / Information Request | Records/public-information requests, scope, custodians, deadlines, production |
| P09 | Regulatory / Permit / Rights Response | Permits, licensing, housing/tenant formal responses, regulatory corrections |
| P10 | Claim / Proof / Evidence Package | Evidence-heavy claims where provenance, chronology, custody and proof are first-class |

---

## Implemented Workflows (78)

### Core — MailMyPDF (7 workflows, P01_CORE_MAIL)

| # | ID | Title | Pipeline | Adapters |
|---|-----|-------|----------|----------|
| 1 | `mail-a-pdf` | Mail a PDF | P01 | — |
| 2 | `write-a-letter` | Write a Letter | P01 | — |
| 3 | `send-a-letter` | Send a Letter | P01 | — |
| 4 | `templates` | Letter Templates | P01 | — |
| 5 | `future-self` | Future Self | P01 | — |
| 6 | `proof-of-mailing` | Proof of Mailing | P01 | — |
| 7 | `proof-of-service` | Proof of Service | P01 | — |

**Repo:** `mailmypdf`

---

### Appeal Mail (33 workflows, P03_APPEAL + P04_COURT + P09_REGULATORY)

| # | ID | Title | Pipeline | Adapters |
|---|-----|-------|----------|----------|
| 1 | `denied-claim` | Appeal a Denied Claim | P03 | government |
| 2 | `government-decision` | Appeal a Government Decision | P03 | government |
| 3 | `court-ruling` | Respond to a Court Ruling | P04 | court-procedure |
| 4 | `reconsideration` | Request Reconsideration | P03 | government |
| 5 | `insurance-claim-denial` | Appeal an Insurance Claim Denial | P03 | insurance |
| 6 | `insurance-denial-letter` | Respond to an Insurance Denial Letter | P03 | insurance |
| 7 | `insurance-coverage-denial` | Appeal an Insurance Coverage Denial | P03 | insurance |
| 8 | `medical-insurance-denial` | Appeal a Medical Insurance Denial | P03 | insurance, healthcare |
| 9 | `medical-necessity-appeal` | Appeal a Medical Necessity Denial | P03 | insurance, healthcare |
| 10 | `prior-authorization-denial` | Appeal a Prior Authorization Denial | P03 | insurance, healthcare |
| 11 | `out-of-network-denial` | Appeal an Out-of-Network Denial | P03 | insurance, healthcare |
| 12 | `dental-insurance-appeal` | Appeal a Dental Insurance Denial | P03 | insurance, healthcare |
| 13 | `car-insurance-appeal` | Appeal a Car Insurance Claim | P03 | insurance |
| 14 | `life-insurance-denial` | Appeal a Life Insurance Denial | P03 | insurance |
| 15 | `claim-denial-letter` | Respond to a Claim Denial Letter | P03 | insurance |
| 16 | `ssdi-denial` | Appeal an SSDI Denial | P03 | government, benefits |
| 17 | `ssi-denial` | Appeal an SSI Denial | P03 | government, benefits |
| 18 | `social-security-denial` | Appeal a Social Security Denial | P03 | government, benefits |
| 19 | `medicaid-denial` | Appeal a Medicaid Denial | P03 | government, benefits, healthcare |
| 20 | `unemployment-denial` | Appeal an Unemployment Denial | P03 | government, benefits |
| 21 | `edd-denial` | Appeal an EDD Denial | P03 | government, benefits |
| 22 | `financial-aid-appeal` | Appeal a Financial Aid Decision | P03 | education |
| 23 | `sap-appeal` | Build a SAP Appeal | P03 | education |
| 24 | `financial-aid-suspension-appeal` | Appeal a Financial Aid Suspension | P03 | education |
| 25 | `financial-aid-reinstatement` | Request Financial Aid Reinstatement | P03 | education |
| 26 | `financial-aid-special-circumstances` | Appeal for Financial Aid Special Circumstances | P03 | education |
| 27 | `scholarship-appeal` | Appeal a Scholarship Decision | P03 | education |
| 28 | `fafsa-appeal` | Appeal a FAFSA Decision | P03 | education |
| 29 | `license-suspension-appeal` | Appeal a License Suspension | P09 | government, dmv-licensing |
| 30 | `drivers-license-suspension` | Appeal a Driver's License Suspension | P09 | government, dmv-licensing |
| 31 | `license-revocation-appeal` | Appeal a License Revocation | P09 | government, dmv-licensing |
| 32 | `dmv-suspension-appeal` | Appeal a DMV Suspension | P09 | government, dmv-licensing |
| 33 | `registration-suspension-appeal` | Appeal a Registration Suspension | P09 | government, dmv-licensing |

**Repo:** `appeal-mail`

---

### Notice Respond (5 workflows, P02_OFFICIAL_RESPONSE + P04_COURT + P03_APPEAL)

| # | ID | Title | Pipeline | Adapters |
|---|-----|-------|----------|----------|
| 1 | `irs-notice` | Respond to an IRS Notice | P02 | government, tax |
| 2 | `cp2000-response` | Respond to a CP2000 | P02 | government, tax |
| 3 | `agency-action` | Respond to an Agency Action | P02 | government |
| 4 | `court-summons` | Respond to a Court Summons | P04 | court-procedure |
| 5 | `file-appeal` | File an Appeal | P03 | government |

**Repo:** `notice-respond`  
**Additional from Master Registry:** `cp14-response` (authority), `cp504-response` (functional)

---

### Immigration Mail (3 workflows, P05_IMMIGRATION)

| # | ID | Title | Pipeline | Adapters |
|---|-----|-------|----------|----------|
| 1 | `respond-to-notice` | Respond to an Immigration Notice | P05 | immigration, government |
| 2 | `supporting-documents` | Submit Immigration Supporting Documents | P05 | immigration, government |
| 3 | `explanation-letter` | Prepare an Immigration Explanation Letter | P05 | immigration, government |

**Repo:** `immigration-mail`

---

### Dispute Mail (19 workflows, P06_DISPUTE)

| # | ID | Title | Pipeline | Adapters |
|---|-----|-------|----------|----------|
| 1 | `debt-collection-dispute` | Dispute a Debt Collection | P06 | credit-debt |
| 2 | `dispute-collection-agency` | Dispute a Collection Agency | P06 | credit-debt |
| 3 | `debt-dispute` | Dispute a Debt Account | P06 | credit-debt |
| 4 | `debt-validation` | Request Debt Validation | P06 | credit-debt |
| 5 | `credit-report` | Dispute a Credit Report Error | P06 | credit-debt |
| 6 | `credit-report-collections` | Dispute a Collection on a Credit Report | P06 | credit-debt |
| 7 | `hard-inquiry` | Dispute a Hard Credit Inquiry | P06 | credit-debt |
| 8 | `charge-off` | Dispute Charge-Off Reporting | P06 | credit-debt |
| 9 | `medical-collections` | Dispute Medical Collections | P06 | credit-debt, healthcare |
| 10 | `student-loan` | Dispute a Student Loan Account | P06 | credit-debt |
| 11 | `credit-card-billing` | Dispute a Credit Card Billing Error | P06 | consumer-billing |
| 12 | `unauthorized-charge` | Dispute an Unauthorized Charge | P06 | consumer-billing |
| 13 | `billing-error` | Dispute a Billing Error | P06 | consumer-billing |
| 14 | `subscription-billing` | Dispute a Subscription Charge | P06 | consumer-billing |
| 15 | `service-contract` | Dispute a Service Contract | P06 | consumer-billing |
| 16 | `insurance-billing` | Dispute Insurance Billing or Payment | P06 | insurance, consumer-billing |
| 17 | `follow-up-no-response` | Follow Up on a Dispute With No Response | P06 | consumer-billing |
| 18 | `inadequate-response` | Escalate an Unresolved Dispute | P06 | consumer-billing |
| 19 | `cease-contact` | Document a Collection Communication Request | P06 | credit-debt |

**Repo:** `dispute-mail`

---

### Small Business Mail (5 workflows, P07_BUSINESS_AUTOMATION)

| # | ID | Title | Pipeline | Risk | Approval |
|---|-----|-------|----------|------|----------|
| 1 | `payment-reminder` | Payment Reminder | P07 | LOW | No |
| 2 | `payment-demand` | Payment Demand | P07 | HIGH | Yes |
| 3 | `contract-renewal` | Contract Renewal | P07 | MEDIUM | Yes |
| 4 | `compliance-notice` | Compliance Notice | P07 | HIGH | Yes |
| 5 | `customer-dispute-response` | Customer Dispute Response | P07 | HIGH | Yes |

**Repo:** `mailmypdf-smallbusiness`

---

### GovReply (1 workflow, P02_OFFICIAL_RESPONSE)

| # | ID | Title | Pipeline | Adapters |
|---|-----|-------|----------|----------|
| 1 | `govreply` | GovReply | P02 | government |

**Repo:** `gov-reply`

---

### Records Requests (1 workflow, P08_RECORDS)

| # | ID | Title | Pipeline | Adapters |
|---|-----|-------|----------|----------|
| 1 | `records-request` | Records Request | P08 | records, government |

**Repo:** `records-requests`

---

### Permit Response (1 workflow, P09_REGULATORY)

| # | ID | Title | Pipeline | Adapters |
|---|-----|-------|----------|----------|
| 1 | `permit-reply` | Permit Reply | P09 | permits-regulatory, government |

**Repo:** `permit-response`

---

### Benefits Appeal (1 workflow, P03_APPEAL)

| # | ID | Title | Pipeline | Adapters |
|---|-----|-------|----------|----------|
| 1 | `benefits-appeal` | Benefits Appeal | P03 | benefits, government |

**Repo:** `benefits-appeal`

---

### Tenant Reply (1 workflow, P09_REGULATORY)

| # | ID | Title | Pipeline | Adapters |
|---|-----|-------|----------|----------|
| 1 | `tenant-reply` | Tenant Reply | P09 | housing |

**Repo:** `tenant-reply` (catalog only)

---

### Claim Proof (1 workflow, P10_CLAIM_PROOF)

| # | ID | Title | Pipeline | Adapters |
|---|-----|-------|----------|----------|
| 1 | `claim-proof` | Claim Proof | P10 | insurance |

**Repo:** `insurance-claims` (catalog only)

---

### Code Enforcement (1 workflow)

| # | ID | Title | Pipeline | Maturity |
|---|-----|-------|----------|----------|
| 1 | `code-enforcement-notice` | Respond to a Code Enforcement Notice | P09 | blueprint |

**Repo:** `code-enforcement`

---

## Master Workflow Registry — Production Maturity

| ID | Title | Repo | Maturity | Route | Catalog | MSV |
|----|-------|------|----------|-------|---------|-----|
| `cp2000-response` | Respond to an IRS CP2000 Notice | notice-respond | **gold** | Y | Y | 1,900 |
| `cp14-response` | Respond to an IRS CP14 Notice | notice-respond | authority | Y | Y | TBD |
| `cp504-response` | Respond to an IRS CP504 Notice | notice-respond | functional | Y | Y | 1,900 |
| `irs-notice` | Respond to an IRS Notice | notice-respond | functional | Y | Y | TBD |
| `court-summons` | Respond to a Court Summons | notice-respond | functional | Y | Y | TBD |
| `agency-action` | Respond to an Agency Action | notice-respond | functional | Y | Y | TBD |
| `file-appeal` | File an Appeal | notice-respond | functional | Y | Y | 1,300 |
| `i-797-analysis` | I-797 Analysis | immigration-mail | blueprint | — | — | 18,100 |
| `i-797c-analysis` | I-797C Analysis | immigration-mail | blueprint | — | — | 8,100 |
| `uscis-rfe-response` | USCIS RFE Response | immigration-mail | blueprint | — | — | TBD |
| `transunion-dispute` | TransUnion Dispute | dispute-mail | functional | Y | Y | 12,100 |
| `experian-dispute` | Experian Dispute | dispute-mail | functional | Y | Y | 8,100 |
| `equifax-dispute` | Equifax Dispute | dispute-mail | functional | Y | Y | 6,600 |
| `credit-report-dispute` | Credit Report Dispute | dispute-mail | blueprint | — | — | 6,600 |
| `lexisnexis-dispute` | LexisNexis Dispute | dispute-mail | blueprint | — | — | 1,900 |
| `hard-inquiry-dispute` | Hard Inquiry Dispute | dispute-mail | blueprint | — | — | 880 |
| `collection-dispute` | Collection Dispute | dispute-mail | blueprint | — | — | 1,300 |
| `fcra-dispute` | FCRA Dispute | dispute-mail | blueprint | — | — | TBD |
| `debt-collection-dispute` | Debt Collection Dispute | dispute-mail | blueprint | — | — | 1,300 |
| `debt-validation` | Debt Validation Letter | dispute-mail | blueprint | — | — | TBD |
| `fdcpa-dispute` | FDCPA Dispute | dispute-mail | blueprint | — | — | TBD |
| `debt-lawsuit-response` | Debt Lawsuit Response | dispute-mail | blueprint | — | — | TBD |
| `collection-cease-contact` | Collection Cease Contact Letter | dispute-mail | blueprint | — | — | TBD |
| `insurance-claim-denied` | Insurance Claim Denied | appeal-mail | blueprint | — | — | 1,300 |
| `insurance-claim-appeal` | Insurance Claim Appeal | appeal-mail | blueprint | — | — | 260 |
| `health-insurance-denial` | Health Insurance Denial Appeal | appeal-mail | blueprint | — | — | TBD |
| `roof-claim-denied` | Roof Insurance Claim Denied | appeal-mail | blueprint | — | — | 320 |
| `workers-comp-denied` | Workers Compensation Denied | appeal-mail | blueprint | — | — | 210 |
| `life-insurance-claim-denied` | Life Insurance Claim Denied | appeal-mail | blueprint | — | — | 210 |
| `financial-aid-appeal` | Financial Aid Appeal | appeal-mail | blueprint | — | — | 1,000 |
| `sap-appeal` | SAP Appeal | appeal-mail | blueprint | — | — | 390 |
| `ssdi-appeal` | SSDI Appeal | appeal-mail | blueprint | — | — | 260 |
| `ssi-appeal` | SSI Appeal | appeal-mail | blueprint | — | — | 210 |
| `unemployment-appeal` | Unemployment Appeal | appeal-mail | blueprint | — | — | TBD |
| `medicaid-appeal` | Medicaid Appeal | appeal-mail | blueprint | — | — | TBD |
| `police-records-request` | Police Records Request | records-requests | blueprint | — | — | 1,600 |
| `police-report-request` | Police Report Request | records-requests | blueprint | — | — | 6,600 |
| `public-records-request` | Public Records Request | records-requests | blueprint | — | — | 3,600 |
| `open-records-request` | Open Records Request | records-requests | blueprint | — | — | 1,900 |
| `foia-request` | FOIA Request | records-requests | blueprint | — | — | TBD |
| `court-records-request` | Court Records Request | records-requests | blueprint | — | — | 1,900 |
| `arrest-records-request` | Arrest Records Request | records-requests | blueprint | — | — | 1,600 |
| `birth-records-request` | Birth Records Request | records-requests | blueprint | — | — | TBD |
| `marriage-records-request` | Marriage Records Request | records-requests | blueprint | — | — | TBD |
| `property-records-request` | Property Records Request | records-requests | blueprint | — | — | TBD |
| `permit-records-request` | Permit Records Request | records-requests | blueprint | — | — | TBD |
| `code-enforcement-notice` | Respond to a Code Enforcement Notice | code-enforcement | blueprint | — | — | TBD |
| `tenant-notice-response` | Respond to a Tenant Notice | tenant-reply | blueprint | — | — | TBD |

**Summary:** 48 workflows | 1 gold, 1 authority, 9 functional, 38 blueprint

---

## 360-Workflow Planning Universe

12 product families x 30 target workflows each = 360 total.

### 1. MailMyPDF Core (30) — P01
1. Mail a PDF
2. Mail a Document
3. Send a Letter Online
4. Write and Mail a Letter
5. Send a Physical Letter Online
6. Send Certified Mail Online
7. Send a Certified Letter Online
8. Send Registered Mail Online
9. Send Mail Without Going to the Post Office
10. Mail From Home
11. Print and Mail a PDF
12. Print and Mail a Letter
13. Send Documents by Mail
14. Send Important Documents by Mail
15. Send Legal Documents by Mail
16. Send Tax Documents by Mail
17. Send Business Documents by Mail
18. Send a Letter With Return Receipt
19. Send Certified Mail With Return Receipt
20. Proof of Mailing
21. Proof of Delivery
22. Proof of Service
23. Mailing With Tracking
24. Address Verification and Mailing
25. Letter to Future Self
26. Reusable Letter Templates
27. Bulk Document Mailing
28. Mail Again / Reorder
29. Secure Document Mailing
30. Document Mailing Record

### 2. Appeal Mail (30) — P03
1. Appeal a Denied Claim
2. Appeal a Government Decision
3. Request Reconsideration
4. Appeal an Insurance Claim Denial
5. Appeal an Insurance Coverage Denial
6. Respond to an Insurance Denial Letter
7. Appeal a Medical Insurance Denial
8. Appeal a Medical Necessity Denial
9. Appeal a Prior Authorization Denial
10. Appeal an Out-of-Network Denial
11. Appeal a Timely Filing Denial
12. Appeal a Dental Insurance Denial
13. Appeal a Car Insurance Claim
14. Appeal a Life Insurance Denial
15. Appeal a Medicare Claim Denial
16. Appeal an SSDI Denial
17. Appeal an SSI Denial
18. Appeal a Social Security Decision
19. Appeal a Social Security Overpayment
20. Appeal a Medicaid Denial
21. Appeal an Unemployment Denial
22. Appeal an EDD Disqualification
23. Appeal a Financial Aid Decision
24. SAP Appeal
25. Financial Aid Suspension Appeal
26. Financial Aid Reinstatement
27. FAFSA / Special Circumstances Appeal
28. Scholarship Appeal
29. License Suspension Appeal
30. DMV Suspension / Revocation Appeal

### 3. Notice Respond (30) — P02
1. IRS Notice Response
2. CP2000 Response
3. CP90 / Collection Notice Response
4. CP504 Response
5. CP3219A Response
6. IRS Audit Letter Response
7. IRS 30-Day Letter Response
8. IRS Income Tax Notice Response
9. IRS Penalty Notice Response
10. IRS Balance Due Notice Response
11. IRS Underreporter Notice Response
12. IRS Identity / Information Notice Response
13. Agency Action Response
14. Government Notice Response
15. State Tax Notice Response
16. State Revenue Department Notice Response
17. Court Summons Response
18. Civil Summons Response
19. Administrative Hearing Notice Response
20. Licensing Notice Response
21. Benefits Notice Response
22. Unemployment Notice Response
23. Compliance Notice Response
24. Regulatory Deficiency Notice Response
25. Document Request Response
26. Evidence Request Response
27. Deadline Extension Request
28. Notice Disagreement Response
29. Appeal After Notice
30. Follow-Up After Notice Submission

### 4. Immigration Mail (30) — P05
1. USCIS RFE Response
2. Respond to an Immigration Notice
3. Response to Request for Evidence
4. RFE Response Letter
5. RFE Cover Letter
6. Medical RFE Response
7. I-485 RFE Response
8. I-140 RFE Response
9. H-1B RFE Response
10. L-1 RFE Response
11. N-400 RFE Response
12. EB-1 RFE Response
13. NIW RFE Response
14. Submit Supporting Documents to USCIS
15. USCIS Evidence Submission
16. USCIS Explanation Letter
17. USCIS Missing Evidence Response
18. USCIS Notice of Intent Response
19. Notice of Intent to Deny Response
20. Notice of Intent to Revoke Response
21. Request for Reconsideration
22. Case Evidence Package
23. Immigration Affidavit Package
24. Translation / Certified Translation Package
25. Immigration Filing Cover Letter
26. Supplemental Evidence Submission
27. Biometrics / Appointment Correspondence
28. Immigration Deadline Response
29. USCIS Follow-Up After Submission
30. Immigration Mailing and Proof Package

### 5. Dispute Mail (30) — P06
1. Debt Collection Dispute
2. Dispute a Collection Agency
3. Debt Dispute
4. Debt Validation
5. Dispute a Collection Account
6. Dispute Collections on Credit Report
7. Credit Report Error Dispute
8. Credit Report Collections Dispute
9. Hard Inquiry Dispute
10. Charge-Off Dispute
11. Medical Collections Dispute
12. Medical Debt Dispute
13. Student Loan Account Dispute
14. Credit Card Billing Dispute
15. Unauthorized Charge Dispute
16. Billing Error Dispute
17. Subscription Charge Dispute
18. Service Contract Dispute
19. Insurance Billing Dispute
20. Insurance Payment Dispute
21. Dispute With Creditor
22. Dispute With Debt Buyer
23. Dispute With Collection Agency
24. Credit Bureau Dispute Package
25. Follow-Up on Unanswered Dispute
26. Escalate an Unresolved Dispute
27. Cease Contact Request
28. Debt Communication Documentation
29. FDCPA Dispute
30. Consumer Evidence Package

### 6. Small Business Mail (30) — P07
1. Payment Reminder
2. Final Payment Reminder
3. Past-Due Invoice Notice
4. Payment Demand
5. Unpaid Invoice Letter
6. Collection Letter
7. Final Demand for Payment
8. Account Balance Notice
9. Contract Renewal Notice
10. Contract Nonrenewal Notice
11. Contract Change Notice
12. Customer Dispute Response
13. Customer Complaint Response
14. Refund Response
15. Service Cancellation Response
16. Late Payment Notice
17. Terms Violation Notice
18. Compliance Notice
19. Vendor Dispute Response
20. Vendor Payment Dispute
21. Change-of-Address Notice
22. Business Policy Update
23. Price Increase Notice
24. Service Interruption Notice
25. Appointment / Scheduling Notice
26. Insurance Certificate Request
27. Business Records Request
28. Vendor Documentation Request
29. Cease-and-Desist Business Correspondence
30. General Formal Business Letter

### 7. Records Request (30) — P08
1. Public Records Request
2. FOIA Request
3. FOIA Police Records Request
4. Police Report Request
5. Police Records Request
6. Police Report Copy Request
7. Court Records Request
8. Criminal Records Request
9. Criminal History Request
10. Arrest Records Request
11. Background Check Records Request
12. Birth Records Request
13. Birth Certificate Request
14. Marriage Records Request
15. Divorce Records Request
16. Death Records Request
17. Military Records Request
18. Medical Records Request
19. Employment Records Request
20. Education Records Request
21. School Records Request
22. Public Information Request
23. Open Records Request
24. Agency Records Request
25. Government Documents Request
26. Permit Records Request
27. Property Records Request
28. Code Enforcement Records Request
29. Records Follow-Up Request
30. Records Denial / Appeal Request

### 8. Tenant Reply (30) — P09
1. Tenant Response to Landlord
2. Tenant Notice Response
3. Security Deposit Dispute
4. Security Deposit Demand
5. Security Deposit Response
6. Repair Request
7. Unresolved Repair Follow-Up
8. Habitability Complaint
9. Rent Increase Response
10. Late Fee Dispute
11. Lease Violation Response
12. Lease Termination Response
13. Eviction Notice Response
14. Pay-or-Quit Response
15. Cure-or-Quit Response
16. Notice to Enter Response
17. Unauthorized Entry Complaint
18. Utility Billing Dispute
19. Maintenance Neglect Response
20. Mold / Water Damage Notice
21. Property Damage Dispute
22. Landlord Damage Claim Response
23. Move-Out Dispute
24. Move-Out Charges Dispute
25. Lease Renewal Response
26. Lease Amendment Response
27. Landlord Communication Documentation
28. Tenant Evidence Package
29. Tenant Demand Letter
30. Housing Agency Complaint Response

### 9. Permit Reply (30) — P09
1. Building Permit Response
2. Building Permit Correction Response
3. Building Permit Denial Response
4. Construction Permit Response
5. Residential Building Permit
6. Commercial Building Permit
7. Electrical Permit Response
8. Plumbing Permit Response
9. Mechanical Permit Response
10. HVAC Permit Response
11. Roofing Permit Response
12. Reroof Permit Response
13. Fence Permit Response
14. Deck Permit Response
15. Demolition Permit Response
16. Temporary Structure Permit
17. Temporary Use Permit
18. Zoning Permit Response
19. Site Development Permit
20. Land Development Permit
21. Utility Permit Response
22. Certificate of Occupancy Response
23. Occupancy Permit Response
24. Nonconforming Use Permit
25. Permit Deficiency Response
26. Permit Document Submission
27. Permit Evidence Package
28. Permit Status / Tracking Request
29. Permit Reconsideration
30. Permit Appeal / Administrative Response

### 10. Benefits Appeal (30) — P03
1. SSI Appeal
2. SSI Denial Appeal
3. SSI Reconsideration
4. SSI Overpayment Appeal
5. SSDI Appeal
6. SSDI Denial Appeal
7. SSDI Reconsideration
8. SSDI Appeals Council
9. Social Security Decision Appeal
10. Social Security Overpayment Appeal
11. Social Security Non-Medical Appeal
12. Unemployment Appeal
13. Unemployment Denial Appeal
14. Unemployment Disqualification Appeal
15. Unemployment Overpayment Appeal
16. EDD Appeal
17. EDD Disqualification Appeal
18. SNAP Appeal
19. Food Stamp Appeal
20. Medicaid Appeal
21. Medicaid Denial Appeal
22. VA Claim Appeal
23. Workers' Compensation Appeal
24. Disability Claim Appeal
25. Benefits Reconsideration
26. Appeals Council Preparation
27. Benefits Evidence Package
28. Benefits Deadline Response
29. Benefits Hearing Preparation
30. Benefits Supporting-Document Submission

### 11. Claim Proof (30) — P10
1. Insurance Claim Documentation
2. Medical Insurance Claim Package
3. Health Insurance Claim Package
4. Medicare Claim Package
5. Dental Claim Package
6. Vision Claim Package
7. Disability Claim Evidence Package
8. Life Insurance Claim Package
9. Auto Insurance Claim Package
10. Home Insurance Claim Package
11. Property Damage Claim Package
12. Accident Claim Package
13. Travel Claim Package
14. Short-Term Disability Claim Package
15. Long-Term Disability Claim Package
16. Hospital Indemnity Claim Package
17. Reimbursement Claim Package
18. Claim Supporting Documents
19. Claim Proof Package
20. Claim Timeline Package
21. Claim Evidence Checklist
22. Claim Denial Evidence Package
23. Claim Reconsideration Package
24. Claim Appeal Evidence Package
25. Provider Claim Submission Package
26. Medical Necessity Evidence Package
27. Prior Authorization Evidence Package
28. Out-of-Network Evidence Package
29. Claim Follow-Up Package
30. Claim Record / Proof-of-Submission Package

### 12. GovReply (30) — P02
1. Government Letter Response
2. Government Notice Response
3. Agency Request Response
4. Government Document Request Response
5. Government Evidence Submission
6. Government Explanation Letter
7. Government Deadline Response
8. Government Compliance Response
9. Administrative Response
10. Regulatory Agency Response
11. Licensing Agency Response
12. Benefits Agency Response
13. Tax Agency Response
14. State Revenue Agency Response
15. County Agency Response
16. Municipal Agency Response
17. Permit Agency Response
18. Code Enforcement Response
19. Public Records Response
20. FOIA Response
21. Agency Follow-Up Letter
22. Government No-Response Follow-Up
23. Government Reconsideration Request
24. Government Appeal Letter
25. Administrative Hearing Response
26. Government Complaint Response
27. Government Supporting-Document Submission
28. Government Evidence Package
29. Government Mailing / Proof Package
30. Agency Escalation Correspondence

---

## Summary

| Metric | Count |
|--------|-------|
| Product families | 12 |
| Pipeline archetypes | 10 |
| Implemented workflows (pipeline manifest) | 78 |
| Master registry workflows (with maturity) | 48 |
| 360-workflow planning universe | 360 |
| Gold standard | 1 |
| Authority | 1 |
| Functional | 9 |
| Blueprint | 38 |

### By Repository

| Repo | Vertical | Implemented | Planning Target |
|------|----------|-------------|-----------------|
| mailmypdf | Core | 7 | 30 |
| appeal-mail | Appeal | 33 | 30 |
| notice-respond | Notice | 5 | 30 |
| immigration-mail | Immigration | 3 | 30 |
| dispute-mail | Dispute | 19 | 30 |
| mailmypdf-smallbusiness | Business | 5 | 30 |
| gov-reply | GovReply | 1 | 30 |
| records-requests | Records | 1 | 30 |
| permit-response | Permit | 1 | 30 |
| benefits-appeal | Benefits | 1 | 30 |
| code-enforcement | Code Enforcement | 1 | - |
| mailmypdf-platform | Platform (shared) | - | - |
