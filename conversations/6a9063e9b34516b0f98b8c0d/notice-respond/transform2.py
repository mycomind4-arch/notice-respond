import re

WORKFLOWS = {
    "tax-notice": {
        "badge": "Tax Authority Notice",
        "title_italic": "tax notice",
        "hero_desc": "You received a notice from a state or local tax authority. Upload it, extract the key details, and prepare a documented response with your facts and supporting evidence.",
        "keyfacts": [("Notice type", "Tax Authority"), ("Jurisdiction", "State or local"), ("Recommended mail", "Certified"), ("Cost to prepare", "Free")],
        "what_is_title": "What is a tax authority notice?",
        "what_is_paras": [
            "A tax authority notice is an official communication from a state or local tax agency \u2014 such as a state Department of Revenue, franchise tax board, or county assessor. It may notify you of a balance due, a filing requirement, an audit, a correction to your return, or a lien.",
            "These notices have strict response deadlines, typically 30 days. Missing the deadline can result in automatic assessments, additional penalties, or collection actions. Each jurisdiction has its own appeal process, but all require a written response with supporting documentation.",
            "Responding early gives you the opportunity to correct errors, request a payment plan, or contest the assessment before enforcement begins. Most tax agencies are willing to work with taxpayers who initiate contact promptly.",
        ],
        "includes": ["Agency name and contact info","Notice/reference number","Tax period and amount due","Penalties and interest","Response deadline","Appeal rights","Payment instructions","Agency mailing address"],
        "process": [
            ("Upload & analyze", "Upload the notice PDF or paste the text. AI extracts the agency, notice number, deadline, and amount \u2014 then identifies what needs your attention."),
            ("Review & draft", "Add your facts and objective. Generate a professional response letter addressing the specific notice type and your desired outcome."),
            ("Mail with proof", "Approve the exact draft. Certified mail provides tracking and delivery confirmation \u2014 your record of timely response."),
        ],
        "related": [
            ("/workflows/irs-notice", "IRS Notice", "Any IRS notice not covered by a specific workflow"),
            ("/workflows/cp14-response", "CP14 - Balance Due", "First IRS collection notice"),
            ("/workflows/code-enforcement", "Code Enforcement", "Respond to municipal code violations"),
        ],
    },
    "code-enforcement": {
        "badge": "Municipal Notice",
        "title_italic": "code enforcement notice",
        "hero_desc": "Your city or county sent a code enforcement notice alleging a property violation. Upload it, understand the violation, and prepare a documented response with evidence of compliance or a plan to correct.",
        "keyfacts": [("Notice type", "Code Violation"), ("Jurisdiction", "City or county"), ("Recommended mail", "Certified"), ("Cost to prepare", "Free")],
        "what_is_title": "What is a code enforcement notice?",
        "what_is_paras": [
            "A code enforcement notice is issued by a city or county government when a property is alleged to violate local ordinances. Common violations include overgrown vegetation, unpermitted structures, unsafe conditions, parking violations, and nuisance complaints.",
            "These notices typically include a deadline to correct the violation and may carry daily fines for non-compliance. Ignoring them can lead to administrative hearings, liens on your property, or in extreme cases, abatement where the government performs the work and bills you.",
            "You have the right to respond, request an inspection, or appeal. A documented response showing your compliance plan or contesting the violation can stop the escalation and preserve your right to a hearing.",
        ],
        "includes": ["Issuing department","Case/reference number","Cited violation and code section","Property address","Compliance deadline","Required corrective action","Fine or penalty amount","Hearing or appeal information"],
        "process": [
            ("Upload & analyze", "Upload the code enforcement notice. AI extracts the violation type, cited code sections, deadline, and required corrections."),
            ("Review & draft", "Document your compliance plan or contest the violation with evidence \u2014 photos, permits, prior correspondence. Generate a formal response letter."),
            ("Mail with proof", "Approve the exact draft. Certified mail creates a documented record of your response before the compliance deadline."),
        ],
        "related": [
            ("/workflows/permit-correction", "Permit Correction", "Respond to permit-related notices"),
            ("/workflows/court-summons", "Court Summons", "Respond to a court summons"),
            ("/workflows/tax-notice", "Tax Notice", "Respond to state or local tax notices"),
        ],
    },
    "permit-correction": {
        "badge": "Permitting Authority",
        "title_italic": "permit correction notice",
        "hero_desc": "A permitting authority notified you of an issue with a building or construction permit. Upload the notice, understand the required corrections, and prepare a documented response.",
        "keyfacts": [("Notice type", "Permit Issue"), ("Jurisdiction", "City or county"), ("Recommended mail", "Certified"), ("Cost to prepare", "Free")],
        "what_is_title": "What is a permit correction notice?",
        "what_is_paras": [
            "A permit correction notice is issued by a building department or permitting authority when a construction or land-use permit has errors, missing information, or work that doesn't match the approved plans. It may require corrections, additional documentation, or a re-inspection.",
            "These notices often come with a deadline and can halt construction until the issue is resolved. Unresolved permit issues can lead to fines, permit revocation, or difficulty selling the property later.",
            "Responding with the corrected documents, additional information, or a plan for compliance can resolve the issue quickly. You also have the right to contest the notice if you believe the permit was issued correctly.",
        ],
        "includes": ["Permit number and type","Issuing department","Cited issue or deficiency","Property address","Correction deadline","Required corrective action","Re-inspection requirements","Fee or penalty"],
        "process": [
            ("Upload & analyze", "Upload the permit correction notice. AI extracts the permit number, cited issues, deadline, and required corrections."),
            ("Review & draft", "Document your corrections, provide additional information, or contest the notice. Generate a formal response with supporting evidence."),
            ("Mail with proof", "Approve the exact draft. Certified mail provides proof of timely response before the correction deadline."),
        ],
        "related": [
            ("/workflows/code-enforcement", "Code Enforcement", "Respond to municipal code violations"),
            ("/workflows/agency-action", "Agency Action", "Respond to any government agency action"),
            ("/workflows/benefits-notice", "Benefits Notice", "Respond to benefits determination notices"),
        ],
    },
    "dmv-notice": {
        "badge": "DMV Notice",
        "title_italic": "DMV notice",
        "hero_desc": "Your state DMV sent a notice about your driver's license, vehicle registration, or driving record. Upload it, understand the issue, and prepare a documented response.",
        "keyfacts": [("Notice type", "DMV"), ("Jurisdiction", "State DMV"), ("Recommended mail", "Certified"), ("Cost to prepare", "Free")],
        "what_is_title": "What is a DMV notice?",
        "what_is_paras": [
            "A DMV notice is an official communication from your state's Department of Motor Vehicles regarding your driver's license, vehicle registration, title, or driving record. Common notices include license suspension, registration denial, emissions compliance, or points on your record.",
            "DMV notices have strict deadlines \u2014 often 10 to 30 days. Missing the deadline can result in automatic suspension, additional fees, or a hold on your registration. Most states offer an administrative hearing to contest the action.",
            "A documented response can request a hearing, present evidence (such as proof of insurance, completed requirements, or corrected records), or explain mitigating circumstances. Responding early preserves your right to appeal and can prevent automatic enforcement.",
        ],
        "includes": ["DMV case/reference number","Notice type (suspension, denial, etc.)","Driver license or plate number","Deadline for response","Required action","Hearing or appeal rights","DMV office address","Fee or penalty"],
        "process": [
            ("Upload & analyze", "Upload the DMV notice. AI extracts the notice type, deadline, case number, and required action \u2014 and identifies your hearing rights."),
            ("Review & draft", "Add your evidence and explanation. Generate a response requesting a hearing, providing compliance proof, or contesting the action."),
            ("Mail with proof", "Approve the exact draft. Certified mail provides proof of timely response \u2014 critical for preserving hearing rights before the deadline."),
        ],
        "related": [
            ("/workflows/court-summons", "Court Summons", "Respond to a traffic court summons"),
            ("/workflows/agency-action", "Agency Action", "Respond to any government agency action"),
            ("/workflows/tax-notice", "Tax Notice", "Respond to state or local tax notices"),
        ],
    },
    "ssa-notice": {
        "badge": "Social Security",
        "title_italic": "SSA notice",
        "hero_desc": "The Social Security Administration sent a notice about your benefits, overpayment, or eligibility. Upload it, understand the determination, and prepare a documented response.",
        "keyfacts": [("Notice type", "SSA"), ("Jurisdiction", "Federal"), ("Recommended mail", "Certified"), ("Cost to prepare", "Free")],
        "what_is_title": "What is an SSA notice?",
        "what_is_paras": [
            "A Social Security Administration notice informs you of a determination about your benefits \u2014 retirement, disability (SSDI), SSI, Medicare, or survivor benefits. It may announce an overpayment, a cessation of benefits, a change in payment amount, or a request for updated information.",
            "SSA notices include appeal rights and deadlines. You typically have 60 days to request a reconsideration, and additional rights to request a hearing before an Administrative Law Judge. Missing these deadlines can result in benefit termination or overpayment collection.",
            "A documented response can request reconsideration, provide additional medical evidence, explain financial hardship for overpayment waiver, or correct information. Responding promptly preserves your appeal rights and can prevent benefit interruption.",
        ],
        "includes": ["SSA notice type and number","Determination or decision","Benefit type affected","Amount (if overpayment or change)","Appeal deadline (usually 60 days)","Appeal level available","SSA office address","Required action or documentation"],
        "process": [
            ("Upload & analyze", "Upload the SSA notice. AI extracts the determination, deadline, appeal rights, and amount \u2014 and identifies the appropriate appeal level."),
            ("Review & draft", "Add your evidence, medical records, or financial documentation. Generate a reconsideration request, waiver request, or hearing appeal."),
            ("Mail with proof", "Approve the exact draft. Certified mail provides proof of timely appeal \u2014 essential for preserving your 60-day appeal window."),
        ],
        "related": [
            ("/workflows/benefits-notice", "Benefits Notice", "Respond to other benefits agency notices"),
            ("/workflows/uscis-notice", "USCIS Notice", "Respond to immigration notices"),
            ("/workflows/irs-notice", "IRS Notice", "Respond to IRS notices"),
        ],
    },
    "uscis-notice": {
        "badge": "Immigration",
        "title_italic": "USCIS notice",
        "hero_desc": "USCIS sent a notice about your immigration application or petition. Upload it, understand the request, and prepare a documented response with supporting evidence.",
        "keyfacts": [("Notice type", "USCIS"), ("Jurisdiction", "Federal"), ("Recommended mail", "Certified"), ("Cost to prepare", "Free")],
        "what_is_title": "What is a USCIS notice?",
        "what_is_paras": [
            "A USCIS notice informs you of a decision or action on an immigration application or petition. Common types include Request for Evidence (RFE), Notice of Intent to Deny (NOID), interview scheduling, biometrics appointment, or a decision (approval, denial, or withdrawal).",
            "USCIS notices have strict deadlines \u2014 RFEs typically require a response within 87 days, and NOIDs within 30 days. Missing the deadline results in automatic denial of your application. Appeals and motions to reopen have their own deadlines, usually 30 days.",
            "A documented response provides the requested evidence, legal arguments, or corrected forms. Responding with complete, well-organized documentation gives you the best chance of a favorable outcome.",
        ],
        "includes": ["Receipt number (e.g., MSC-xxx)","Notice type (RFE, NOID, etc.)","Application/petition type","Deadline for response","Requested evidence or action","USCIS office address","Filing fee requirements","Appeal rights (if applicable)"],
        "process": [
            ("Upload & analyze", "Upload the USCIS notice. AI extracts the receipt number, notice type, deadline, and requested evidence \u2014 and identifies your response obligations."),
            ("Review & draft", "Organize your evidence, draft a cover letter, and address each request point by point. Generate a complete RFE or NOID response."),
            ("Mail with proof", "Approve the exact draft. Certified mail provides proof of timely response \u2014 critical for meeting USCIS deadlines and avoiding automatic denial."),
        ],
        "related": [
            ("/workflows/ssa-notice", "SSA Notice", "Respond to Social Security notices"),
            ("/workflows/benefits-notice", "Benefits Notice", "Respond to benefits agency notices"),
            ("/workflows/agency-action", "Agency Action", "Respond to any government agency action"),
        ],
    },
    "benefits-notice": {
        "badge": "Benefits Agency",
        "title_italic": "benefits notice",
        "hero_desc": "A government benefits agency sent a notice about your eligibility, overpayment, or determination. Upload it, understand the decision, and prepare a documented response.",
        "keyfacts": [("Notice type", "Benefits"), ("Jurisdiction", "State or federal"), ("Recommended mail", "Certified"), ("Cost to prepare", "Free")],
        "what_is_title": "What is a benefits notice?",
        "what_is_paras": [
            "A benefits notice is an official communication from a government agency that administers public assistance \u2014 unemployment insurance, SNAP/food assistance, Medicaid, housing benefits, VA benefits, or workers' compensation. It may announce an overpayment, eligibility determination, benefit reduction, or termination.",
            "These notices include appeal rights and deadlines, typically 30 to 60 days. Missing the deadline can result in automatic collection of overpayments, benefit termination, or denial of future benefits. Most agencies offer an administrative appeal process.",
            "A documented response can request a fair hearing, present evidence of eligibility, explain overpayment circumstances, or request a waiver. Responding promptly preserves your appeal rights and can prevent benefit interruption or collection action.",
        ],
        "includes": ["Agency name and case number","Notice type (overpayment, termination, etc.)","Benefit program affected","Amount (if overpayment or adjustment)","Appeal deadline","Appeal or hearing rights","Agency mailing address","Required documentation"],
        "process": [
            ("Upload & analyze", "Upload the benefits notice. AI extracts the agency, determination, deadline, and appeal rights \u2014 and identifies what needs your attention."),
            ("Review & draft", "Add your evidence, financial documentation, or explanation. Generate a fair hearing request, waiver application, or appeal letter."),
            ("Mail with proof", "Approve the exact draft. Certified mail provides proof of timely appeal \u2014 essential for preserving your hearing rights before the deadline."),
        ],
        "related": [
            ("/workflows/ssa-notice", "SSA Notice", "Respond to Social Security Administration notices"),
            ("/workflows/uscis-notice", "USCIS Notice", "Respond to immigration notices"),
            ("/workflows/agency-action", "Agency Action", "Respond to any government agency action"),
        ],
    },
    "court-summons": {
        "badge": "Court Summons",
        "title_italic": "court summons",
        "hero_desc": "You've been served with a court summons. Upload it, understand the requirements, and prepare a documented response within the deadline to protect your rights.",
        "keyfacts": [("Notice type", "Summons"), ("Jurisdiction", "State or federal"), ("Recommended mail", "Certified"), ("Cost to prepare", "Free")],
        "what_is_title": "What is a court summons?",
        "what_is_paras": [
            "A court summons is an official notice that a lawsuit has been filed against you and you are required to respond. It includes the court name, case number, plaintiff, deadline to respond, and the type of claim. The summons may be for civil court, small claims, family court, or traffic court.",
            "The response deadline is strict \u2014 typically 20 to 30 days from service. Missing the deadline can result in a default judgment against you, meaning the court may rule in the plaintiff's favor without hearing your side.",
            "A documented response \u2014 called an Answer \u2014 addresses each allegation, states your defenses, and preserves your right to be heard. Even if you plan to settle, filing a response prevents default judgment and buys you time to negotiate.",
        ],
        "includes": ["Court name and jurisdiction","Case number","Plaintiff and defendant names","Deadline to respond (20-30 days)","Type of claim or allegations","Filing fee information","Court address","Required response format"],
        "process": [
            ("Upload & analyze", "Upload the summons. AI extracts the court, case number, deadline, plaintiff, and claim type \u2014 and identifies your response deadline."),
            ("Review & draft", "Add your facts and defenses. Generate a formal Answer addressing each allegation and stating your affirmative defenses."),
            ("Mail with proof", "Approve the exact draft. File with the court and serve the plaintiff. Certified mail provides proof of timely service."),
        ],
        "related": [
            ("/workflows/agency-action", "Agency Action", "Respond to government agency actions"),
            ("/workflows/file-appeal", "File an Appeal", "Appeal a decision or judgment"),
            ("/workflows/dmv-notice", "DMV Notice", "Respond to DMV hearings"),
        ],
    },
    "agency-action": {
        "badge": "Government Agency",
        "title_italic": "agency action",
        "hero_desc": "A government agency took an action affecting your rights, property, or benefits. Upload the notice, understand the decision, and prepare a documented response or appeal.",
        "keyfacts": [("Notice type", "Agency Action"), ("Jurisdiction", "Any"), ("Recommended mail", "Certified"), ("Cost to prepare", "Free")],
        "what_is_title": "What is an agency action notice?",
        "what_is_paras": [
            "An agency action notice is a formal communication from a government body \u2014 federal, state, or local \u2014 informing you of a decision that affects your rights, property, license, or benefits. This catch-all covers notices from agencies not covered by a specific workflow: environmental agencies, labor boards, licensing boards, housing authorities, and more.",
            "Most agency actions include appeal rights under the Administrative Procedure Act or equivalent state law. You typically have 30 to 60 days to request an administrative hearing or file an appeal. Missing the deadline can make the agency's decision final and unappealable.",
            "A documented response can request a hearing, present evidence, challenge the factual basis of the decision, or propose alternatives. Responding promptly preserves your due process rights and can open the door to negotiation or reconsideration.",
        ],
        "includes": ["Agency name and contact","Case or file number","Type of action taken","Legal basis or authority","Deadline for response or appeal","Hearing or appeal rights","Required documentation","Agency mailing address"],
        "process": [
            ("Upload & analyze", "Upload the agency notice. AI extracts the agency, action type, deadline, and appeal rights \u2014 and identifies what needs your response."),
            ("Review & draft", "Add your facts, evidence, and legal arguments. Generate a formal response, appeal request, or hearing request."),
            ("Mail with proof", "Approve the exact draft. Certified mail provides proof of timely response \u2014 critical for preserving your appeal rights before the deadline."),
        ],
        "related": [
            ("/workflows/court-summons", "Court Summons", "Respond to a court summons"),
            ("/workflows/file-appeal", "File an Appeal", "Appeal a decision or judgment"),
            ("/workflows/code-enforcement", "Code Enforcement", "Respond to municipal code violations"),
        ],
    },
    "file-appeal": {
        "badge": "Appeal",
        "title_italic": "appeal",
        "hero_desc": "You need to appeal a decision from a court, agency, or tribunal. Upload the original decision, understand your appeal rights, and prepare a documented appeal within the deadline.",
        "keyfacts": [("Notice type", "Appeal"), ("Jurisdiction", "Any"), ("Recommended mail", "Certified"), ("Cost to prepare", "Free")],
        "what_is_title": "What is an appeal?",
        "what_is_paras": [
            "An appeal is a formal request to a higher authority to review and overturn a decision made by a lower court, administrative agency, or tribunal. You may be appealing a judgment, a denial of benefits, a license revocation, a tax assessment, or any government action you believe was wrong.",
            "Appeals have strict deadlines \u2014 typically 30 days from the date of the decision. Missing the deadline usually forfeits your right to appeal entirely. Some appeals require specific forms, filing fees, or a statement of grounds.",
            "A documented appeal identifies the errors in the original decision, presents new evidence or legal arguments, and requests a specific remedy. Responding with a well-organized, timely appeal gives you the best chance of a favorable outcome.",
        ],
        "includes": ["Original decision or judgment","Case or reference number","Deadline to appeal (usually 30 days)","Grounds for appeal","Court or appellate body","Filing fee","Required forms","Statement of errors"],
        "process": [
            ("Upload & analyze", "Upload the original decision. AI extracts the case number, decision date, deadline, and identifies potential grounds for appeal."),
            ("Review & draft", "State your grounds for appeal, cite specific errors, and present supporting evidence. Generate a formal appeal document."),
            ("Mail with proof", "Approve the exact draft. File with the appropriate court or body. Certified mail provides proof of timely filing."),
        ],
        "related": [
            ("/workflows/court-summons", "Court Summons", "Respond to a court summons"),
            ("/workflows/agency-action", "Agency Action", "Respond to government agency actions"),
            ("/workflows/irs-notice", "IRS Notice", "Respond to IRS notices"),
        ],
    },
}

def generate_landing(wf):
    key_facts = "\n".join('              <KeyFact label="%s" value="%s" />' % (l, v) for l, v in wf["keyfacts"])
    includes_items = "\n".join('                <li className="flex items-center gap-2 text-sm text-ink-soft"><span className="text-stamp">\u25b8</span>%s</li>' % i for i in wf["includes"])
    process_steps = "\n".join('              <ProcessStep number="%02d" title="%s" text="%s" />' % (idx, t, d) for idx, (t, d) in enumerate(wf["process"], 1))
    what_paras = "\n".join('              <p>%s</p>' % p for p in wf["what_is_paras"])
    return LANDING_TEMPLATE \
        .replace("@@BADGE@@", wf["badge"]) \
        .replace("@@TITLEI@@", wf["title_italic"]) \
        .replace("@@HEROD@@", wf["hero_desc"]) \
        .replace("@@KEYF@@", key_facts) \
        .replace("@@WIT@@", wf["what_is_title"]) \
        .replace("@@WPARAS@@", what_paras) \
        .replace("@@INCL@@", includes_items) \
        .replace("@@PROC@@", process_steps)

LANDING_TEMPLATE = '''    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-rule/60">
          <div className="absolute inset-0 bg-gradient-to-b from-paper-deep/40 via-paper to-paper" aria-hidden="true" />
          <div className="relative mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 md:py-28">
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-stamp transition-colors">Notice Respond</Link>
              <span className="text-rule">/</span>
              <Link to="/workflows" className="hover:text-stamp transition-colors">Workflows</Link>
              <span className="text-rule">/</span>
              <span className="text-ink-soft">@@BADGE@@</span>
            </nav>
            <div className="postmark w-fit mt-6">@@BADGE@@</div>
            <h1 className="mt-6 font-serif text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
              Respond to your <span className="italic text-stamp">@@TITLEI@@</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg">
              @@HEROD@@
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={startWorkflow} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper shadow-card transition-transform hover:-translate-y-0.5">
                Start your response
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
              <Link to="/workflows" className="inline-flex items-center gap-2 rounded-full border border-rule bg-card px-6 py-3.5 text-sm font-medium transition-colors hover:border-ink/30">Browse other notices</Link>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-rule/60 bg-rule/60 sm:grid-cols-4">
@@KEYF@@
            </div>
          </div>
        </section>

        {/* WHAT IS */}
        <section className="border-b border-rule/60">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Understanding the notice</div>
            <h2 className="mt-3 font-serif text-3xl leading-tight">@@WIT@@</h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-ink-soft">
@@WPARAS@@
            </div>
            <div className="mt-8 rounded-lg border border-rule/60 bg-paper-deep/30 p-5">
              <div className="font-mono text-xs uppercase tracking-widest text-stamp">What this notice includes</div>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
@@INCL@@
              </ul>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-b border-rule/60 bg-paper-deep/20">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">The process</div>
            <h2 className="mt-3 font-serif text-3xl leading-tight">How Notice Respond works</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
@@PROC@@
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section ref={workflowRef} className="border-b border-rule/60" style={{ scrollMarginTop: "80px" }}>
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            {workflowStarted ? (
'''

CLOSING_TEMPLATE = '''            ) : (
              <div className="text-center py-16">
                <button onClick={startWorkflow} className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-medium text-paper shadow-card transition-transform hover:-translate-y-0.5">
                  Start your response
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* TRUST BAND */}
        <section className="border-y border-rule/60 bg-ink text-paper">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="inline-flex items-center gap-0.4rem border border-stamp/40 px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.15em] text-stamp rounded-full">Trust architecture</div>
            <h2 className="mt-5 font-serif text-3xl text-paper">You stay in control of every step.</h2>
            <p className="mt-4 text-base leading-7 text-paper/70">The notice is the source material. Your facts remain under your control. AI assists \u2014 it does not decide. You review the response before approval. Approval applies to the exact draft. Payment is distinct from authorization. Mailing creates a documented record.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <TrustItem title="Your data, your control" text="Documents are processed for extraction. Nothing is shared with third parties." />
              <TrustItem title="Review before send" text="You approve the exact letter. Nothing is mailed without your explicit confirmation." />
              <TrustItem title="Proof of delivery" text="Certified mail provides tracking and delivery confirmation \u2014 your record of timely response." />
            </div>
          </div>
        </section>

        {/* RELATED */}
        <section className="border-b border-rule/60">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <div className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Related workflows</div>
            <h2 className="mt-3 font-serif text-2xl">Other notice types</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
@@RELC@@
            </div>
            <div className="mt-6"><Link to="/workflows" className="text-sm text-stamp hover:text-ink transition-colors">Browse all notice types \u2192</Link></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function KeyFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper p-3 text-center">
      <div className="font-serif text-lg text-ink">{value}</div>
      <div className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function ProcessStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div>
      <div className="font-mono text-xs font-semibold text-stamp">{number}</div>
      <h3 className="mt-2 font-serif text-xl text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p>
    </div>
  );
}

function TrustItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-paper/15 p-4">
      <h3 className="font-medium text-paper">{title}</h3>
      <p className="mt-1.5 text-sm text-paper/60">{text}</p>
    </div>
  );
}

function RelatedCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link to={href} className="block rounded-lg border border-rule/60 bg-card p-4 transition-colors hover:border-stamp/40">
      <div className="font-medium text-foreground">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </Link>
  );
}'''

def generate_closing(wf):
    related_cards = "\n".join('              <RelatedCard href="%s" title="%s" desc="%s" />' % (h, t, d) for h, t, d in wf["related"])
    return CLOSING_TEMPLATE.replace("@@RELC@@", related_cards)


for wf_id, wf in WORKFLOWS.items():
    filepath = "src/routes/workflows/%s.tsx" % wf_id
    with open(filepath, "r") as f:
        content = f.read()

    # 1. Add Link import
    if 'import { createFileRoute } from "@tanstack/react-router";' in content and 'Link' not in content.split('\n')[0]:
        content = content.replace(
            'import { createFileRoute } from "@tanstack/react-router";',
            'import { createFileRoute, Link } from "@tanstack/react-router";'
        )

    # 2. Add useRef, useEffect
    if 'import { useState, useCallback } from "react";' in content:
        content = content.replace(
            'import { useState, useCallback } from "react";',
            'import { useState, useCallback, useRef, useEffect } from "react";'
        )
    elif 'import { useState } from "react";' in content:
        content = content.replace(
            'import { useState } from "react";',
            'import { useState, useRef, useEffect } from "react";'
        )

    # 3. Add SiteHeader/SiteFooter imports
    if 'import { SiteHeader }' not in content:
        if 'from "@/components/workflow-shell"' in content:
            content = content.replace(
                'from "@/components/workflow-shell";',
                'from "@/components/workflow-shell";\nimport { SiteHeader } from "@/components/site-header";\nimport { SiteFooter } from "@/components/site-footer";'
            )

    # 4. Add workflowStarted state + workflowRef + startWorkflow
    if "workflowStarted" not in content:
        if 'const llmAnalysis = useCombinedAnalysis(' in content:
            content = content.replace(
                'const llmAnalysis = useCombinedAnalysis(',
                'const [workflowStarted, setWorkflowStarted] = useState(false);\n  const workflowRef = useRef<HTMLDivElement>(null);\n\n  const startWorkflow = useCallback(() => {\n    setWorkflowStarted(true);\n    setTimeout(() => {\n      workflowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });\n    }, 50);\n  }, []);\n\n  const llmAnalysis = useCombinedAnalysis('
            )
        elif 'const allChecked = checks.every(Boolean);' in content:
            content = content.replace(
                'const allChecked = checks.every(Boolean);',
                'const allChecked = checks.every(Boolean);\n  const [workflowStarted, setWorkflowStarted] = useState(false);\n  const workflowRef = useRef<HTMLDivElement>(null);\n\n  const startWorkflow = useCallback(() => {\n    setWorkflowStarted(true);\n    setTimeout(() => {\n      workflowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });\n    }, 50);\n  }, []);'
            )

    # 5. Find and replace the return( <WorkflowShell ...> ... </WorkflowShell> );
    return_match = re.search(r'return \(\s*\n\s*<WorkflowShell\s+(.+?)>\n', content, re.DOTALL)
    if not return_match:
        print("SKIP %s: no return(WorkflowShell)" % wf_id)
        continue

    shell_props = return_match.group(1)
    return_start = return_match.start()

    closing_match = re.search(r'</WorkflowShell>\s*\n\s*\);', content)
    if not closing_match:
        print("SKIP %s: no </WorkflowShell>" % wf_id)
        continue

    closing_end = closing_match.end()

    # Extract children (between > newline and </WorkflowShell>)
    shell_open_end = return_match.end()
    children = content[shell_open_end:closing_match.start()]

    # Build new return
    landing = generate_landing(wf)
    closing = generate_closing(wf)

    new_return = landing
    new_return += '              <WorkflowShell ' + shell_props + '>\n'
    new_return += children
    new_return += '              </WorkflowShell>\n'
    new_return += '            ' + closing

    content = content[:return_start] + new_return + content[closing_end:]

    with open(filepath, "w") as f:
        f.write(content)
    print("OK %s" % wf_id)

print("Done!")
