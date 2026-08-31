/**
 * Benefits Appeal — Workflow Engine
 * Domain-specific analysis, drafting, validation, and pricing for government benefits appeals.
 */

export interface BenefitsAnalysisResult {
  summary: string;
  benefitType: string;
  agency: string;
  caseNumber: string;
  decisionDate: string;
  denialReasons: string[];
  deadline: string;
  appealLevel: string;
  keyFacts: string[];
  issues: { issue: string; whyItMatters: string; evidenceNeeded: string[] }[];
  confidence: "high" | "medium" | "low";
}

export interface BenefitsDraftConfig {
  workflowId: string;
  workflowName: string;
  systemPrompt: string;
  validationPrompt: string;
  requiredSections: string[];
  forbiddenPhrases: string[];
  pricing: {
    preparationFee: number;
    includedResponsePages: number;
    supportingPagePrice: number;
    standardMail: number;
    certifiedMail: number;
    registeredMail: number;
    largePacketThresholdSheets: number;
    largePacketFee: number;
  };
}

export const BENEFITS_WORKFLOW_CONFIGS: Record<string, BenefitsDraftConfig> = {
  "ssdi-denial": {
    workflowId: "ssdi-denial",
    workflowName: "Appeal an SSDI Denial",
    systemPrompt: "Draft a factual, persuasive appeal an ssdi denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal an ssdi denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "ssdi-reconsideration": {
    workflowId: "ssdi-reconsideration",
    workflowName: "Request SSDI Reconsideration",
    systemPrompt: "Draft a factual, persuasive request ssdi reconsideration letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this request ssdi reconsideration draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "ssi-denial": {
    workflowId: "ssi-denial",
    workflowName: "Appeal an SSI Denial",
    systemPrompt: "Draft a factual, persuasive appeal an ssi denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal an ssi denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "ssi-reconsideration": {
    workflowId: "ssi-reconsideration",
    workflowName: "Request SSI Reconsideration",
    systemPrompt: "Draft a factual, persuasive request ssi reconsideration letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this request ssi reconsideration draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "social-security-denial": {
    workflowId: "social-security-denial",
    workflowName: "Appeal a Social Security Denial",
    systemPrompt: "Draft a factual, persuasive appeal a social security denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal a social security denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "social-security-overpayment": {
    workflowId: "social-security-overpayment",
    workflowName: "Respond to a Social Security Overpayment Notice",
    systemPrompt: "Draft a factual, persuasive respond to a social security overpayment notice letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this respond to a social security overpayment notice draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "ssdi-hearing": {
    workflowId: "ssdi-hearing",
    workflowName: "Request an SSDI Administrative Law Judge Hearing",
    systemPrompt: "Draft a factual, persuasive request an ssdi administrative law judge hearing letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this request an ssdi administrative law judge hearing draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "ssi-hearing": {
    workflowId: "ssi-hearing",
    workflowName: "Request an SSI Administrative Law Judge Hearing",
    systemPrompt: "Draft a factual, persuasive request an ssi administrative law judge hearing letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this request an ssi administrative law judge hearing draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "unemployment-denial": {
    workflowId: "unemployment-denial",
    workflowName: "Appeal an Unemployment Denial",
    systemPrompt: "Draft a factual, persuasive appeal an unemployment denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal an unemployment denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "unemployment-overpayment": {
    workflowId: "unemployment-overpayment",
    workflowName: "Respond to an Unemployment Overpayment Notice",
    systemPrompt: "Draft a factual, persuasive respond to an unemployment overpayment notice letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this respond to an unemployment overpayment notice draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "edd-denial": {
    workflowId: "edd-denial",
    workflowName: "Appeal an EDD Denial",
    systemPrompt: "Draft a factual, persuasive appeal an edd denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal an edd denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "edd-appeal": {
    workflowId: "edd-appeal",
    workflowName: "Respond to an EDD Appeal Letter",
    systemPrompt: "Draft a factual, persuasive respond to an edd appeal letter letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this respond to an edd appeal letter draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "unemployment-reconsideration": {
    workflowId: "unemployment-reconsideration",
    workflowName: "Request Unemployment Reconsideration",
    systemPrompt: "Draft a factual, persuasive request unemployment reconsideration letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this request unemployment reconsideration draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "unemployment-hearing": {
    workflowId: "unemployment-hearing",
    workflowName: "Request an Unemployment Hearing",
    systemPrompt: "Draft a factual, persuasive request an unemployment hearing letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this request an unemployment hearing draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "medicaid-denial": {
    workflowId: "medicaid-denial",
    workflowName: "Appeal a Medicaid Denial",
    systemPrompt: "Draft a factual, persuasive appeal a medicaid denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal a medicaid denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "medicaid-reduction": {
    workflowId: "medicaid-reduction",
    workflowName: "Respond to a Medicaid Benefit Reduction or Termination",
    systemPrompt: "Draft a factual, persuasive respond to a medicaid benefit reduction or termination letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this respond to a medicaid benefit reduction or termination draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "medicaid-reconsideration": {
    workflowId: "medicaid-reconsideration",
    workflowName: "Request Medicaid Reconsideration",
    systemPrompt: "Draft a factual, persuasive request medicaid reconsideration letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this request medicaid reconsideration draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "chip-denial": {
    workflowId: "chip-denial",
    workflowName: "Appeal a CHIP Denial",
    systemPrompt: "Draft a factual, persuasive appeal a chip denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal a chip denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "medicare-denial": {
    workflowId: "medicare-denial",
    workflowName: "Appeal a Medicare Denial",
    systemPrompt: "Draft a factual, persuasive appeal a medicare denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal a medicare denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "food-stamp-denial": {
    workflowId: "food-stamp-denial",
    workflowName: "Appeal a Food Stamp (SNAP) Denial",
    systemPrompt: "Draft a factual, persuasive appeal a food stamp (snap) denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal a food stamp (snap) denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "snap-reduction": {
    workflowId: "snap-reduction",
    workflowName: "Respond to a SNAP Benefit Reduction",
    systemPrompt: "Draft a factual, persuasive respond to a snap benefit reduction letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this respond to a snap benefit reduction draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "tanf-denial": {
    workflowId: "tanf-denial",
    workflowName: "Appeal a TANF Denial",
    systemPrompt: "Draft a factual, persuasive appeal a tanf denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal a tanf denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "va-disability-denial": {
    workflowId: "va-disability-denial",
    workflowName: "Appeal a VA Disability Denial",
    systemPrompt: "Draft a factual, persuasive appeal a va disability denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal a va disability denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "va-claim-reconsideration": {
    workflowId: "va-claim-reconsideration",
    workflowName: "Request a VA Claim Reconsideration",
    systemPrompt: "Draft a factual, persuasive request a va claim reconsideration letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this request a va claim reconsideration draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "va-hearing": {
    workflowId: "va-hearing",
    workflowName: "Request a VA Board Hearing",
    systemPrompt: "Draft a factual, persuasive request a va board hearing letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this request a va board hearing draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "state-disability-denial": {
    workflowId: "state-disability-denial",
    workflowName: "Appeal a State Disability Denial",
    systemPrompt: "Draft a factual, persuasive appeal a state disability denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal a state disability denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "workers-comp-denial": {
    workflowId: "workers-comp-denial",
    workflowName: "Appeal a Workers Compensation Denial",
    systemPrompt: "Draft a factual, persuasive appeal a workers compensation denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal a workers compensation denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "private-disability-denial": {
    workflowId: "private-disability-denial",
    workflowName: "Appeal a Private Disability Insurance Denial",
    systemPrompt: "Draft a factual, persuasive appeal a private disability insurance denial letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this appeal a private disability insurance denial draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "benefits-reconsideration": {
    workflowId: "benefits-reconsideration",
    workflowName: "Request a Benefits Reconsideration",
    systemPrompt: "Draft a factual, persuasive request a benefits reconsideration letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this request a benefits reconsideration draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  },
  "benefits-hearing": {
    workflowId: "benefits-hearing",
    workflowName: "Request a Benefits Hearing",
    systemPrompt: "Draft a factual, persuasive request a benefits hearing letter. Address the specific benefits issue, eligibility criteria, and evidence basis. Cite supplied evidence references. Never invent facts, dates, medical conditions, or outcomes. Distinguish established facts from arguments.",
    validationPrompt: "Audit this request a benefits hearing draft. Check for case number consistency, decision date, deadline compliance, and evidence citations. Return JSON: {valid:boolean, issues:string[], suggestions:string[]}.",
    requiredSections: ["Dear", "Sincerely", "Re:"],
    forbiddenPhrases: ["guaranteed approval", "you must approve", "I promise"],
    pricing: { preparationFee: 39, includedResponsePages: 5, supportingPagePrice: 0.25, standardMail: 1.15, certifiedMail: 4.35, registeredMail: 15.40, largePacketThresholdSheets: 20, largePacketFee: 5.00 },
  }
};

export function getBenefitsWorkflowConfig(workflowId: string): BenefitsDraftConfig | undefined {
  return BENEFITS_WORKFLOW_CONFIGS[workflowId] ?? BENEFITS_WORKFLOW_CONFIGS["ssdi-denial"];
}

export function calculateBenefitsPricing(
  config: BenefitsDraftConfig,
  supportingSheets: number,
  mailingMethod: "standard" | "certified" | "registered",
) {
  const P = config.pricing;
  const mailing = mailingMethod === "standard" ? P.standardMail : mailingMethod === "certified" ? P.certifiedMail : P.registeredMail;
  const largePacket = supportingSheets + P.includedResponsePages >= P.largePacketThresholdSheets ? P.largePacketFee : 0;
  const total = P.preparationFee + supportingSheets * P.supportingPagePrice + mailing + largePacket;
  return { preparationFee: P.preparationFee, includedResponsePages: P.includedResponsePages, supportingSheets, mailingMethod, mailingFee: mailing, largePacketFee: largePacket, total: Number(total.toFixed(2)) };
}
