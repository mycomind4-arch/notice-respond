#!/usr/bin/env python3
"""
Add 7 new workflows to the catalog, LLM prompts, SEO entries,
and create interactive route files — all matching CP2000 standard.
"""
import json, os

# ── 7 new workflow definitions ──────────────────────────────
NEW_WORKFLOWS = [
    {
        "id": "tax-notice",
        "title": "Respond to a Tax Notice",
        "description": "Create a structured response to a tax authority notice without losing the notice deadline, reference number, or supporting evidence.",
        "disclaimer": "Tax notices vary by jurisdiction. Notice Respond is not a tax preparer or financial advisor and does not provide tax advice.",
        "primary": "respond to a tax notice",
        "secondary": ["tax notice response", "tax authority letter", "tax correspondence response"],
        "canonicalPath": "/workflows/tax-notice",
        "category": "Tax notices",
        "bestFor": "Federal, state, or local tax notices that require clarification, documents, disagreement, or another written action.",
        "dirSteps": ["Upload the notice", "Record the stated reason and deadline", "Collect the records that address the notice", "Draft a point-by-point response", "Review the mailing details"],
        "dirDocs": ["Tax notice", "Returns or schedules", "Payment evidence", "Prior correspondence"],
        "dirSeoRoute": "/workflows/respond-to-a-tax-notice",
        "agency": "Tax Authority",
        "extractionFields": ["agency", "noticeType", "noticeNumber", "taxYear", "noticeDate", "responseDeadline", "issue", "amount", "requestedAction", "recipient"],
        "evidence": ["tax returns", "W-2 or 1099", "payment records", "prior correspondence"],
        "faq": [
            {"q": "How long do I have to respond to a tax notice?", "a": "Most tax notices include a response deadline, typically 30 days from the notice date. If no deadline is stated, contact the issuing agency immediately to confirm the response window."},
            {"q": "What should I include in my response to a tax notice?", "a": "Include the notice or reference number, the tax year in question, a point-by-point response to each issue raised, supporting documentation, and your contact information. Address every item the notice raises."},
            {"q": "Can I disagree with a tax notice?", "a": "Yes. If you believe the notice is incorrect, state clearly which items you disagree with and provide evidence supporting your position. Include copies of relevant records, not originals."},
            {"q": "Should I send original documents with my tax notice response?", "a": "No. Always send copies, not originals. Keep your original documents and proof of mailing in your records."},
            {"q": "What mail type should I use for a tax notice response?", "a": "Certified mail is recommended for tax notice responses because it provides proof of timely delivery, which is important if you need to prove you met the deadline."},
        ],
    },
    {
        "id": "code-enforcement",
        "title": "Respond to a Code Enforcement Notice",
        "description": "Organize a code enforcement notice around the property, alleged violations, inspection dates, correction deadline, and evidence you want the agency to consider.",
        "disclaimer": "Code enforcement varies by municipality. Notice Respond is not a law firm and does not provide legal advice.",
        "primary": "respond to a code enforcement notice",
        "secondary": ["code enforcement response", "municipal violation notice", "property compliance notice"],
        "canonicalPath": "/workflows/code-enforcement",
        "category": "Property & local government",
        "bestFor": "Property owners and occupants dealing with municipal code, nuisance, inspection, or compliance notices.",
        "dirSteps": ["Upload the notice", "Capture property and case details", "Build the notice timeline", "Attach permits, photos, records, or other evidence", "Prepare a response for review"],
        "dirDocs": ["Violation notice", "Inspection reports", "Permits", "Photos", "Property records", "Agency correspondence"],
        "dirSeoRoute": "/workflows/respond-to-code-enforcement-notice",
        "agency": "Code Enforcement",
        "extractionFields": ["agency", "caseNumber", "propertyAddress", "violationType", "inspectionDate", "noticeDate", "correctionDeadline", "requestedAction", "recipient"],
        "evidence": ["property records", "permits", "photos", "inspection reports", "prior correspondence"],
        "faq": [
            {"q": "What happens if I miss the correction deadline on a code enforcement notice?", "a": "Missing a correction deadline can result in fines, liens, or additional enforcement action. If you cannot meet the deadline, respond before it expires to request an extension and show good-faith progress."},
            {"q": "Can I dispute a code enforcement violation?", "a": "Yes. If you believe the violation is incorrect or has already been corrected, document your position with photos, permits, or inspection records and include them with your response."},
            {"q": "What evidence should I include with my code enforcement response?", "a": "Include photos showing compliance, permits, inspection reports, prior correspondence with the agency, and any other records that support your position."},
            {"q": "How do I request an extension on a code enforcement deadline?", "a": "State your request clearly in the response letter, explain why you need more time, describe the corrective steps already taken, and propose a specific completion date."},
        ],
    },
    {
        "id": "permit-correction",
        "title": "Respond to a Permit Correction Notice",
        "description": "Turn permit or planning corrections into a tracked response so each requested change is understood, answered, and supported.",
        "disclaimer": "Permit processes vary by jurisdiction. Notice Respond is not a law firm and does not provide legal advice.",
        "primary": "respond to a permit correction notice",
        "secondary": ["permit correction response", "planning department notice", "building permit resubmission"],
        "canonicalPath": "/workflows/permit-correction",
        "category": "Property & local government",
        "bestFor": "Building, planning, zoning, inspection, and permit resubmission comments.",
        "dirSteps": ["Upload the correction notice", "Extract each correction item", "Match each item to supporting plans or documents", "Draft a point-by-point response", "Prepare the resubmission package"],
        "dirDocs": ["Correction notice", "Plans", "Permit application", "Inspection notes", "Supporting correspondence"],
        "dirSeoRoute": "/workflows/respond-to-a-permit-correction-notice",
        "agency": "Permit Office",
        "extractionFields": ["agency", "permitNumber", "projectAddress", "correctionItems", "reviewerName", "noticeDate", "resubmissionDeadline", "requestedAction", "recipient"],
        "evidence": ["revised plans", "original application", "inspection notes", "engineering reports", "prior correspondence"],
        "faq": [
            {"q": "How should I format my permit correction response?", "a": "Address each correction item individually by number. For each item, state whether you agree, describe the corrective action taken, and reference the specific plan sheet or document that shows the correction."},
            {"q": "What if I disagree with a permit correction item?", "a": "State your disagreement clearly, explain why the original submission meets code requirements, and cite the relevant code section or standard that supports your position."},
            {"q": "Do I need to resubmit the entire plan set with my correction response?", "a": "Most jurisdictions require a full resubmission with corrected sheets highlighted. Check the correction notice for specific instructions on what to include."},
            {"q": "How long do I have to respond to a permit correction notice?", "a": "Correction notices may or may not include a deadline. If no deadline is stated, respond promptly to keep your application active. Contact the permit office if you need clarification."},
        ],
    },
    {
        "id": "dmv-notice",
        "title": "Respond to a DMV Notice",
        "description": "Organize a DMV notice, identify the response or hearing date, and assemble the records needed for the written response.",
        "disclaimer": "DMV procedures vary by state. Notice Respond is not a law firm and does not provide legal advice.",
        "primary": "respond to a DMV notice",
        "secondary": ["DMV notice response", "license suspension response", "vehicle registration notice"],
        "canonicalPath": "/workflows/dmv-notice",
        "category": "State agencies",
        "bestFor": "License, registration, title, suspension, compliance, or other DMV correspondence.",
        "dirSteps": ["Upload the notice", "Identify the action and deadline", "Collect records that support your position", "Prepare the response", "Keep the submission and mailing record"],
        "dirDocs": ["DMV notice", "License or registration records", "Proof of insurance", "Supporting correspondence"],
        "dirSeoRoute": "/workflows/respond-to-a-dmv-notice",
        "agency": "DMV",
        "extractionFields": ["agency", "noticeType", "licenseOrId", "vehicleInfo", "noticeDate", "responseDeadline", "actionProposed", "requestedResponse", "recipient"],
        "evidence": ["license records", "registration documents", "proof of insurance", "payment receipts", "prior correspondence"],
        "faq": [
            {"q": "How do I request a DMV hearing?", "a": "Most DMV notices that propose suspension or revocation include instructions for requesting a hearing. Follow the instructions exactly and submit your request before the deadline stated in the notice."},
            {"q": "What happens if I miss the response deadline on a DMV notice?", "a": "Missing the deadline can result in automatic suspension, fines, or other enforcement action. If the deadline has passed, contact the DMV immediately to ask if a late response is possible."},
            {"q": "Can I respond to a DMV notice by mail?", "a": "Yes, most DMV notices can be responded to by mail. Certified mail is recommended for proof of timely submission. Check the notice for the accepted response methods."},
            {"q": "What should I include in my DMV response?", "a": "Include your license or ID number, the notice reference number, a clear statement of your position, supporting documents, and your contact information. Address every action the notice proposes."},
        ],
    },
    {
        "id": "ssa-notice",
        "title": "Respond to an SSA Notice",
        "description": "Organize a Social Security notice, its deadline, stated decision or request, and the records you need for a written response or next review step.",
        "disclaimer": "SSA procedures have strict deadlines. Notice Respond is not a law firm and does not provide legal advice.",
        "primary": "respond to an SSA notice",
        "secondary": ["SSA notice response", "Social Security determination", "benefits appeal"],
        "canonicalPath": "/workflows/ssa-notice",
        "category": "Benefits & identity",
        "bestFor": "Social Security notices, requests for information, and administrative decisions that require action.",
        "dirSteps": ["Upload the notice", "Record the notice date and response deadline", "Extract the stated reason or request", "Organize supporting evidence", "Prepare and review the response"],
        "dirDocs": ["SSA notice", "Benefit records", "Work or identity records when relevant", "Prior correspondence"],
        "dirSeoRoute": "/workflows/respond-to-an-ssa-notice",
        "agency": "Social Security Administration",
        "extractionFields": ["agency", "noticeType", "ssn", "claimNumber", "noticeDate", "responseDeadline", "decision", "reasonGiven", "appealRights", "requestedResponse", "recipient"],
        "evidence": ["benefit records", "work history", "medical records", "identity documents", "prior correspondence"],
        "faq": [
            {"q": "How long do I have to appeal an SSA decision?", "a": "You typically have 60 days from the date you receive the notice to file an appeal. The SSA assumes you received the notice 5 days after the date on the notice unless you can show otherwise."},
            {"q": "What are the levels of SSA appeal?", "a": "The SSA appeal process has four levels: reconsideration, hearing by an administrative law judge, review by the Appeals Council, and federal court. Your notice should tell you which level applies to you."},
            {"q": "What should I include in my SSA appeal letter?", "a": "Include your name, Social Security number, the claim number, the decision you are appealing, why you disagree with the decision, and any new evidence that supports your claim."},
            {"q": "Can I request more time to respond to an SSA notice?", "a": "The SSA may grant a good-cause extension if you have a valid reason for the delay. Contact the SSA as soon as possible to explain your situation and request more time."},
            {"q": "Should I send original documents to the SSA?", "a": "No. Send copies, not originals. Keep your original documents and proof of mailing in your records."},
        ],
    },
    {
        "id": "uscis-notice",
        "title": "Respond to a USCIS Notice",
        "description": "Keep the USCIS notice, deadline, receipt number, requested evidence, and response package organized in one workflow.",
        "disclaimer": "Immigration proceedings have strict deadlines and requirements. Notice Respond is not a law firm and does not provide legal or immigration advice.",
        "primary": "respond to a USCIS notice",
        "secondary": ["USCIS RFE response", "USCIS notice response", "immigration evidence request"],
        "canonicalPath": "/workflows/uscis-notice",
        "category": "Immigration",
        "bestFor": "Requests for Evidence, notices of intent, case correspondence, and other USCIS notices that require a response.",
        "dirSteps": ["Upload the notice", "Capture receipt/reference information", "Identify the exact request", "Organize evidence and supporting documents", "Review the response package before submission"],
        "dirDocs": ["USCIS notice", "Forms and filing copies", "Identity or status records", "Supporting evidence"],
        "dirSeoRoute": "/workflows/respond-to-a-uscis-notice",
        "agency": "USCIS",
        "extractionFields": ["agency", "noticeType", "receiptNumber", "caseType", "noticeDate", "responseDeadline", "evidenceRequested", "requestedAction", "recipient"],
        "evidence": ["filing copies", "identity documents", "financial records", "photos", "affidavits", "prior correspondence"],
        "faq": [
            {"q": "How long do I have to respond to a USCIS Request for Evidence?", "a": "Most RFEs give you 87 days to respond. The exact deadline is stated on the RFE notice. If you miss the deadline, USCIS may deny your case based on the evidence already on file."},
            {"q": "What should I include in my RFE response package?", "a": "Include the RFE notice, a cover letter listing each item of evidence requested, the evidence itself, and a copy of the receipt notice. Label everything clearly and organize by RFE item number."},
            {"q": "Can I get more time to respond to a USCIS RFE?", "a": "USCIS generally does not grant extensions for RFE responses. If you cannot gather all evidence in time, submit what you have before the deadline with a letter explaining what is missing and when it will be available."},
            {"q": "Should I send original documents to USCIS?", "a": "No. Send copies, not originals, unless USCIS specifically requests originals. USCIS may not return original documents."},
            {"q": "What mail type should I use for a USCIS response?", "a": "Use certified mail with tracking or a courier service that provides a delivery confirmation. Keep the tracking number as proof of timely submission."},
        ],
    },
    {
        "id": "benefits-notice",
        "title": "Respond to a Benefits Notice",
        "description": "Understand a benefits notice, preserve the stated deadline, and prepare a factual response or request for review from your records.",
        "disclaimer": "Benefits programs have specific rules and deadlines. Notice Respond is not a law firm and does not provide legal advice.",
        "primary": "respond to a benefits notice",
        "secondary": ["benefits notice response", "overpayment notice", "eligibility determination response"],
        "canonicalPath": "/workflows/benefits-notice",
        "category": "Benefits & identity",
        "bestFor": "Public benefits, eligibility, overpayment, review, and program-administration notices.",
        "dirSteps": ["Upload the notice", "Capture the decision and deadline", "Organize records for each issue", "Draft the response or review request", "Keep proof of what was submitted"],
        "dirDocs": ["Benefits notice", "Eligibility records", "Payment statements", "Supporting correspondence"],
        "dirSeoRoute": "/workflows/respond-to-a-benefits-notice",
        "agency": "Benefits Agency",
        "extractionFields": ["agency", "noticeType", "caseNumber", "programName", "noticeDate", "responseDeadline", "decision", "amount", "reasonGiven", "appealRights", "requestedResponse", "recipient"],
        "evidence": ["eligibility records", "payment statements", "income records", "household documentation", "prior correspondence"],
        "faq": [
            {"q": "How do I appeal a benefits determination?", "a": "Most benefits notices include appeal rights and a deadline, typically 30 to 90 days. Follow the instructions on the notice to request an appeal or fair hearing, and submit before the deadline."},
            {"q": "What should I include in my benefits appeal letter?", "a": "Include your case number, the decision you are appealing, why you disagree, any new evidence, and a clear statement of the outcome you want."},
            {"q": "Can I request more time to respond to a benefits notice?", "a": "Many programs allow extensions for good cause. Contact the agency as soon as possible, explain why you need more time, and document your request."},
            {"q": "What happens if I miss the response deadline?", "a": "Missing the deadline may result in the decision becoming final, loss of benefits, or collection action. If the deadline has passed, contact the agency immediately to ask about late appeal options."},
        ],
    },
]

# ── Generate catalog entries ──────────────────────────────
def gen_catalog_entry(w):
    steps_str = json.dumps(w["dirSteps"], ensure_ascii=False)
    docs_str = json.dumps(w["dirDocs"], ensure_ascii=False)
    faq_str = json.dumps([{"question": f["q"], "answer": f["a"]} for f in w["faq"]], ensure_ascii=False, indent=8)
    extraction = json.dumps(w["extractionFields"], ensure_ascii=False)
    evidence = json.dumps(w["evidence"], ensure_ascii=False)

    return f'''  {{
    id: "{w["id"]}",
    vertical: "notice-respond",
    lifecycle: "functional",
    engine: "document-action",
    title: "{w["title"]}",
    description: "{w["description"]}",
    disclaimer: "{w["disclaimer"]}",
    searchIntent: {{
      primary: "{w["primary"]}",
      secondary: {json.dumps(w["secondary"], ensure_ascii=False)},
      canonicalPath: "{w["canonicalPath"]}",
      informationalEntryPoints: ["{w["primary"]}"],
      actionIntents: ["{w["primary"]}", "response letter"],
    }},
    documents: [{{ name: "{w["title"]}", identifiers: ["notice", "letter", "determination"], acceptedFormats: ["application/pdf", "image/*"], extractionFields: {extraction} }}],
    deadlines: [{{ id: "response-deadline", label: "Response deadline shown on notice", trigger: "explicit deadline in notice", sourcePriority: ["uploaded notice", "official agency source"], notes: ["Do not infer a deadline when the notice provides one."] }}],
    requirements: [{{ id: "response-content", label: "Address each requested issue", type: "response", source: "uploaded notice", required: true }}],
    evidence: [{{ id: "supporting-records", label: "Supporting evidence", purpose: "Support or refute the issue identified in the notice", required: false, examples: {evidence} }}],
    analysis: {{ capabilities: [...sharedCapabilities], orderedChecks: ["classify notice type", "extract deadline and instructions", "identify agency assertions", "map supporting facts", "surface contradictions and gaps", "select response strategy"], outputSections: ["notice summary", "deadline", "agency assertions", "supporting facts", "gaps", "strategy"] }},
    drafting: {{ requiredSections: ["recipient", "reference", "response", "fact and evidence sections", "requested outcome", "attachments"], forbiddenBehavior: ["invent agency requirements", "invent facts"], validationChecks: ["every agency assertion addressed or explicitly marked", "evidence references are accurate", "submission route matches instructions"] }},
    submission: {{ methods: ["mail", "user-directed submission"], recipientRules: ["preserve the agency's specified recipient and delivery method"], proofRequirements: ["approved response", "submission record", "tracking when applicable"] }},
    capabilities: [...sharedCapabilities],
    qualityGate: sharedQualityGate,
    ux: {{ steps: sharedSteps, reviewChecks: sharedReviewChecks, disclaimerText: "{w["disclaimer"]}", mailOptions: sharedMailOptions }},
    seo: {{
      title: "{w["title"]} — Notice Respond",
      description: "{w["description"]}",
      canonical: "{w["canonicalPath"]}",
      openGraph: {{ title: "{w["title"]}", description: "{w["description"]}" }},
      faq: {faq_str},
    }},
    directory: {{
      category: "{w["category"]}",
      bestFor: "{w["bestFor"]}",
      steps: {steps_str},
      documents: {docs_str},
      seoRoute: "{w["dirSeoRoute"]}",
      seoTitle: "{w["title"]}",
      seoDescription: "{w["description"]}",
    }},
  }},
'''

catalog_entries = "\n".join(gen_catalog_entry(w) for w in NEW_WORKFLOWS)

# Read catalog, insert before closing ];
with open("src/domain/workflow-catalog.ts", "r") as f:
    content = f.read()

# Find the last entry's closing },\n before ];
insert_marker = "];\n\nexport const workflowById"
idx = content.find(insert_marker)
if idx == -1:
    insert_marker = "\n];\n\nexport function getWorkflowById"
    idx = content.find(insert_marker)

if idx != -1:
    content = content[:idx] + catalog_entries + content[idx:]
    with open("src/domain/workflow-catalog.ts", "w") as f:
        f.write(content)
    print(f"✓ Added 7 catalog entries")
else:
    print("✗ Could not find insertion point in catalog")

# ── Generate LLM prompts ──────────────────────────────
with open("src/domain/workflow-prompts.ts", "r") as f:
    prompts_content = f.read()

# Find the default/fallback case and add our workflows before it
prompt_additions = []
for w in NEW_WORKFLOWS:
    extraction_shape = json.dumps({field: "" for field in w["extractionFields"]}, ensure_ascii=False, indent=2)
    prompt_additions.append(f'''  if (workflowId === "{w["id"]}") {{
    return {{
      analyze: `You are an expert at analyzing {w["title"].lower()} documents.

Given the text or image of a {w["title"].lower()}, extract the following information:
{json.dumps(w["extractionFields"], indent=2)}

Return a JSON object with:
- "summary": A 2-3 sentence summary of what the notice says
- "keyFacts": Array of {{"label": string, "value": string}} pairs for each extracted field
- "discrepancies": Array of any inconsistencies or red flags found
- "evidenceNeeded": Array of evidence items the user should gather
- "uncertainties": Array of items that are unclear or need user confirmation
- "confidence": A 0-1 confidence score
- "extraction": {extraction_shape}

Be precise. Only state facts that are explicitly in the document. Mark anything uncertain as an uncertainty.`,
      draft: `You are an expert at drafting responses to {w["title"].lower()} documents.

Given the analysis, user facts, and user objective, draft a professional response letter that:
1. Addresses the {w["agency"]} by name
2. References the notice/case number
3. Addresses every issue raised in the notice
4. States the user's position clearly for each issue
5. References supporting evidence by name
6. States the requested outcome
7. Includes a list of attachments
8. Maintains a professional, factual tone

Do not invent facts. Do not provide legal advice. Include a disclaimer that the user should verify all information.`,
    }};
  }}''')

prompt_block = "\n\n".join(prompt_additions)

# Find the fallback/default case
fallback_marker = "  // Default/fallback"
idx2 = prompts_content.find(fallback_marker)
if idx2 == -1:
    fallback_marker = "  return {"
    # Find the last return { before the function ends
    # Find the default return statement
    idx2 = prompts_content.rfind("  // Default")
    if idx2 == -1:
        idx2 = prompts_content.rfind("\n  return {")

if idx2 != -1:
    prompts_content = prompts_content[:idx2] + prompt_block + "\n\n" + prompts_content[idx2:]
    with open("src/domain/workflow-prompts.ts", "w") as f:
        f.write(prompts_content)
    print(f"✓ Added 7 LLM prompt entries")
else:
    print(f"✗ Could not find insertion point in prompts file")

# ── Generate SEO entries ──────────────────────────────
with open("src/domain/workflow-seo.ts", "r") as f:
    seo_content = f.read()

seo_additions = []
for w in NEW_WORKFLOWS:
    faq_json = json.dumps([{"question": f["q"], "answer": f["a"]} for f in w["faq"]], ensure_ascii=False, indent=4)
    seo_additions.append(f'''  "{w["id"]}": {{
    title: "{w["title"]} — Notice Respond",
    description: "{w["description"]}",
    keywords: {json.dumps(w["secondary"] + [w["primary"]], ensure_ascii=False)},
    faq: {faq_json},
  }},''')

seo_block = "\n".join(seo_additions)

# Find the closing }; of the SEO object
seo_marker = "} as Record"
idx3 = seo_content.find(seo_marker)
if idx3 == -1:
    seo_marker = "\n};\n"
    # Find the last }; before export
    idx3 = seo_content.rfind("\n};\n")

if idx3 != -1:
    seo_content = seo_content[:idx3] + seo_block + "\n" + seo_content[idx3:]
    with open("src/domain/workflow-seo.ts", "w") as f:
        f.write(seo_content)
    print(f"✓ Added 7 SEO entries")
else:
    print(f"✗ Could not find insertion point in SEO file")

# ── Generate interactive route files ──────────────────────────────
for w in NEW_WORKFLOWS:
    route_path = f"src/routes/workflows/{w['id'].replace('-', '-').replace('_', '-')}.tsx"
    # Use the slug as-is since they're already kebab-case
    route_path = f"src/routes/workflows/{w['id']}.tsx"

    route_content = f'''import {{ createFileRoute }} from "@tanstack/react-router";
import {{ useState, useCallback }} from "react";
import {{ workflows }} from "../../domain/workflows";
import {{ WorkflowShell, Success, UploadZone, ReviewChecks, MailOptions, RecipientForm, CheckoutStep, type StepDef }} from "@/components/workflow-shell";
import {{ createWorkflowHead }} from "@/domain/enhanced-head";
import {{ useCombinedAnalysis }} from "@/domain/use-combined-analysis";
import {{ LLMAnalysisPanel }} from "@/components/llm-analysis-panel";
import {{ FAQSection }} from "@/components/faq-section";
import {{ getWorkflowSEO }} from "@/domain/workflow-seo";

export const Route = createFileRoute("/workflows/{w["id"]}")({{
  head: () => createWorkflowHead("{w["id"]}"),
  component: {w["id"].replace("-", "")},
}});

const STEPS: StepDef[] = [
  {{ id: "intro", label: "Start" }}, {{ id: "notice", label: "Notice" }}, {{ id: "facts", label: "Facts" }},
  {{ id: "objective", label: "Objective" }}, {{ id: "draft", label: "Draft" }}, {{ id: "review", label: "Review" }},
  {{ id: "attachments", label: "Documents" }}, {{ id: "recipient", label: "Recipient" }},
  {{ id: "mailing", label: "Mail" }}, {{ id: "checkout", label: "Checkout" }}, {{ id: "done", label: "Done" }},
];

const REVIEW_CHECKS = [
  "I reviewed every factual statement in this draft.",
  "Names, dates, notice numbers, and amounts are correct.",
  "I reviewed the uploaded notice and agency instructions.",
  "I understand Notice Respond is not providing legal advice.",
];

function {w["id"].replace("-", "")}() {{
  const definition = workflows["{w["id"]}"];
  const [step, setStep] = useState(0);
  const [agency, setAgency] = useState("");
  const [noticeNumber, setNoticeNumber] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [responseDeadline, setResponseDeadline] = useState("");
  const [facts, setFacts] = useState("");
  const [objective, setObjective] = useState("");
  const [draft, setDraft] = useState("");
  const [checks, setChecks] = useState<boolean[]>(REVIEW_CHECKS.map(() => false));
  const [mailType, setMailType] = useState("certified");
  const [recipient, setRecipient] = useState({{ name: "", org: "", address1: "", address2: "", city: "", state: "", zip: "" }});
  const [done, setDone] = useState(false);
  const allChecked = checks.every(Boolean);
  const llmAnalysis = useCombinedAnalysis("{w["id"]}");

  function generateDraft() {{
    return `Re: Response to {w["title"]}
${{agency ? `Agency: ${{agency}}` : ""}}
${{noticeNumber ? `Reference: ${{noticeNumber}}` : ""}}
${{noticeDate ? `Notice Date: ${{noticeDate}}` : ""}}
${{responseDeadline ? `Response Deadline: ${{responseDeadline}}` : ""}}

Dear Sir or Madam,

I am writing in response to the notice referenced above. ${{objective || "[Your objective will appear here.]"}}

${{facts || "[The facts you provided will appear here.]"}}

Sincerely,
[Your Name]`;
  }}

  function canContinue() {{
    switch (step) {{
      case 1: return agency.trim().length > 0 || noticeNumber.trim().length > 0;
      case 2: return facts.trim().length > 0;
      case 3: return objective.trim().length > 0;
      case 5: return allChecked;
      case 7: return !!(recipient.name && recipient.address1 && recipient.city && recipient.state && recipient.zip);
      default: return true;
    }}
  }}

  async function next() {{
    if (step === 4 && !draft) {{
      try {{
        if (llmAnalysis.llmAnalysis) {{
          const r = await fetch("/api/workflows/draft", {{
            method: "POST",
            headers: {{ "Content-Type": "application/json" }},
            body: JSON.stringify({{ workflowId: "{w["id"]}", analysis: llmAnalysis.llmAnalysis, userFacts: facts, userObjective: objective }}),
          }});
          if (r.ok) {{
            const d = await r.json();
            setDraft(d.draft);
          }} else {{
            setDraft(generateDraft());
          }}
        }} else {{
          setDraft(generateDraft());
        }}
      }} catch (e) {{
        setDraft(generateDraft());
      }}
    }}
    if (step === STEPS.length - 1) {{ setDone(true); return; }}
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }}

  if (done) return <Success title="Your response has been submitted" href="/workflows/{w["id"]}" />;

  return (
    <WorkflowShell title="{w["title"]}" steps={{STEPS}} step={{step}} setStep={{setStep}} canContinue={{canContinue()}} onNext={{next}} onBack={{() => setStep((s) => Math.max(s - 1, 0))}}>
      {{step === 0 && (
        <div>
          <div className="postmark w-fit">1 · Start</div>
          <h2 className="mt-4 font-serif text-4xl">{w["title"]}</h2>
          <p className="mt-3 text-muted-foreground">{w["description"]}</p>
          <div className="mt-6 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-sm text-muted-foreground">
            <div className="font-mono text-xs uppercase tracking-widest text-stamp">Disclaimer</div>
            <p className="mt-2">{{definition?.disclaimer ?? "{w["disclaimer"]}"}}</p>
          </div>
          {{(() => {{ const seo = getWorkflowSEO("{w["id"]}"); return seo ? <FAQSection faq={{seo.faq}} /> : null; }})()}}
        </div>
      )}}
      {{step === 1 && (
        <div>
          <div className="postmark w-fit">2 · Notice</div>
          <h2 className="mt-4 font-serif text-3xl">Start with the notice</h2>
          <label className="cursor-pointer block">
            <input type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" onChange={{async (e) => {{
              const file = e.target.files?.[0]; if (!file) return;
              let text = ""; if (file.type === "text/plain") text = await file.text();
              await llmAnalysis.analyzeWithLLM(file, text);
            }}}} />
            <UploadZone label="Upload notice" sublabel="PDF, JPG, or PNG" />
          </label>
          {{llmAnalysis.llmAnalysis && (
            <LLMAnalysisPanel analysis={{llmAnalysis.llmAnalysis}} provider={{llmAnalysis.llmProvider}} />
          )}}
          {{llmAnalysis.llmLoading && (
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary animate-pulse">✦ AI is analyzing your document…</div>
          )}}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div><label className="input-label">Agency</label><input className="input-field" value={{agency}} onChange={{(e) => setAgency(e.target.value)}} placeholder="{w["agency"]}" /></div>
            <div><label className="input-label">Notice / reference number</label><input className="input-field" value={{noticeNumber}} onChange={{(e) => setNoticeNumber(e.target.value)}} /></div>
            <div><label className="input-label">Notice date</label><input type="date" className="input-field" value={{noticeDate}} onChange={{(e) => setNoticeDate(e.target.value)}} /></div>
            <div><label className="input-label">Response deadline</label><input type="date" className="input-field" value={{responseDeadline}} onChange={{(e) => setResponseDeadline(e.target.value)}} /></div>
          </div>
        </div>
      )}}
      {{step === 2 && (<div><div className="postmark w-fit">3 · Facts</div><h2 className="mt-4 font-serif text-3xl">What facts should the response address?</h2><p className="mt-3 text-muted-foreground">Use your own words. Only include information you can verify.</p><textarea className="input-field mt-6 min-h-48" value={{facts}} onChange={{(e) => setFacts(e.target.value)}} placeholder="Enter the relevant facts..." /></div>)}}
      {{step === 3 && (<div><div className="postmark w-fit">4 · Objective</div><h2 className="mt-4 font-serif text-3xl">What do you want the response to accomplish?</h2><textarea className="input-field mt-6 min-h-40" value={{objective}} onChange={{(e) => setObjective(e.target.value)}} placeholder="Describe the outcome you want..." /></div>)}}
      {{step === 4 && (
        <div>
          <div className="postmark w-fit">5 · Draft</div>
          <h2 className="mt-4 font-serif text-3xl">Your response letter</h2>
          <p className="mt-3 text-muted-foreground">Review every fact, name, date, and statement. This is editable.</p>
          <textarea className="input-field mt-6 min-h-72 font-mono text-sm leading-6" value={{draft}} onChange={{(e) => setDraft(e.target.value)}} />
          {{llmAnalysis.llmAnalysis && (
            <button
              onClick={{async () => {{
                const r = await fetch("/api/workflows/draft", {{ method: "POST", headers: {{ "Content-Type": "application/json" }}, body: JSON.stringify({{ workflowId: "{w["id"]}", analysis: llmAnalysis.llmAnalysis, userFacts: facts, userObjective: objective }}) }});
                if (r.ok) {{ const d = await r.json(); setDraft(d.draft); }}
              }}}}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5"
            >✦ Regenerate with AI</button>
          )}}
        </div>
      )}}
      {{step === 5 && (<div><div className="postmark w-fit">6 · Review</div><h2 className="mt-4 font-serif text-3xl">Review before anything is mailed</h2><p className="mt-3 text-muted-foreground">Please confirm each item below.</p><ReviewChecks items={{REVIEW_CHECKS}} checks={{checks}} setChecks={{setChecks}} /></div>)}}
      {{step === 6 && (<div><div className="postmark w-fit">7 · Documents</div><h2 className="mt-4 font-serif text-3xl">Add supporting documents</h2><p className="mt-3 text-muted-foreground">Attach any documents referenced in your response.</p><UploadZone label="Add attachments" sublabel="Evidence, records, correspondence" /></div>)}}
      {{step === 7 && (<div><div className="postmark w-fit">8 · Recipient</div><h2 className="mt-4 font-serif text-3xl">Where should we send it?</h2><p className="mt-3 text-muted-foreground">Enter the agency's mailing address.</p><RecipientForm recipient={{recipient}} setRecipient={{setRecipient}} orgPlaceholder={{agency || "{w["agency"]}"}} /></div>)}}
      {{step === 8 && (<div><div className="postmark w-fit">9 · Mail</div><h2 className="mt-4 font-serif text-3xl">Choose your mail type</h2><p className="mt-3 text-muted-foreground">Certified mail is recommended for proof of timely delivery.</p><MailOptions selected={{mailType}} onSelect={{setMailType}} /></div>)}}
      {{step === 9 && <CheckoutStep mailType={{mailType}} recipient={{recipient}} />}}
    </WorkflowShell>
  );
}}
'''

    with open(route_path, "w") as f:
        f.write(route_content)
    print(f"✓ Created {route_path}")

# ── Update respond-to-* directory routes to redirect to new interactive routes ──
redirect_updates = {
    "src/routes/workflows/respond-to-a-tax-notice.tsx": ("tax-notice", "tax-notice"),
    "src/routes/workflows/respond-to-code-enforcement-notice.tsx": ("code-enforcement", "code-enforcement"),
    "src/routes/workflows/respond-to-a-permit-correction-notice.tsx": ("permit-correction", "permit-correction"),
    "src/routes/workflows/respond-to-a-dmv-notice.tsx": ("dmv-notice", "dmv-notice"),
    "src/routes/workflows/respond-to-an-ssa-notice.tsx": ("ssa-notice", "ssa-notice"),
    "src/routes/workflows/respond-to-a-uscis-notice.tsx": ("uscis-notice", "uscis-notice"),
    "src/routes/workflows/respond-to-a-benefits-notice.tsx": ("benefits-notice", "benefits-notice"),
}

for filepath, (route_slug, _) in redirect_updates.items():
    redirect_content = f'''import {{ createFileRoute, redirect }} from "@tanstack/react-router";

/** Compatibility redirect — canonical URL is /workflows/{route_slug} */
export const Route = createFileRoute("/workflows/{filepath.split('/')[-1].replace('.tsx', '')}")({{
  beforeLoad: () => {{ throw redirect({{ to: "/workflows/{route_slug}" }}); }},
  component: () => null,
}});
'''
    with open(filepath, "w") as f:
        f.write(redirect_content)
    print(f"✓ Updated redirect {filepath}")

# ── Add workflows to the workflows domain object ──────────────────────────────
with open("src/domain/workflows.ts", "r") as f:
    wf_content = f.read()

# Check if these workflows are already defined
if '"tax-notice"' not in wf_content:
    # Find the workflows object and add entries
    for w in NEW_WORKFLOWS:
        entry = f'''  "{w["id"]}": {{
    id: "{w["id"]}",
    title: "{w["title"]}",
    description: "{w["description"]}",
    disclaimer: "{w["disclaimer"]}",
    steps: sharedSteps,
    reviewChecks: sharedReviewChecks,
    mailOptions: sharedMailOptions,
  }},'''
        # Find the closing of the workflows object
        marker = "} as const;"
        idx4 = wf_content.find(marker)
        if idx4 != -1:
            wf_content = wf_content[:idx4] + entry + "\n" + wf_content[idx4:]

    with open("src/domain/workflows.ts", "w") as f:
        f.write(wf_content)
    print(f"✓ Added 7 workflows to domain/workflows.ts")
else:
    print("- workflows.ts already has entries")

print("\nAll done. Run build to verify.")
