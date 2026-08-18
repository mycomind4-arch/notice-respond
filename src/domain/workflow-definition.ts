export type WorkflowLifecycle = "blueprint" | "functional" | "authority";

export type CapabilityPack =
  | "document-classification"
  | "fact-extraction"
  | "deadline-analysis"
  | "requirements-analysis"
  | "evidence-analysis"
  | "contradiction-analysis"
  | "research"
  | "response-strategy"
  | "drafting"
  | "draft-validation"
  | "submission"
  | "mailing"
  | "proof";

export interface SearchIntentDefinition {
  primary: string;
  secondary: string[];
  canonicalPath: string;
  informationalEntryPoints: string[];
  actionIntents: string[];
}

export interface DocumentDefinition {
  name: string;
  identifiers: string[];
  acceptedFormats: string[];
  extractionFields: string[];
}

export interface DeadlineDefinition {
  id: string;
  label: string;
  trigger: string;
  sourcePriority: string[];
  notes?: string[];
}

export interface RequirementDefinition {
  id: string;
  label: string;
  type: "response" | "document" | "format" | "recipient" | "fee" | "other";
  source: string;
  required: boolean;
}

export interface EvidenceDefinition {
  id: string;
  label: string;
  purpose: string;
  required: boolean;
  examples: string[];
}

export interface WorkflowAnalysisPlan {
  capabilities: CapabilityPack[];
  orderedChecks: string[];
  outputSections: string[];
}

export interface WorkflowDraftPlan {
  requiredSections: string[];
  forbiddenBehavior: string[];
  validationChecks: string[];
}

export interface WorkflowSubmissionPlan {
  methods: string[];
  recipientRules: string[];
  proofRequirements: string[];
}

export interface WorkflowQualityGate {
  documentRecognition: boolean;
  factGrounding: boolean;
  deadlineVerification: boolean;
  requirementCoverage: boolean;
  evidenceGrounding: boolean;
  draftValidation: boolean;
  submissionReadiness: boolean;
  proofReady: boolean;
}

export interface SEOMetadata {
  title: string;
  description: string;
  canonical?: string;
  openGraph?: { title: string; description: string };
  faq?: { question: string; answer: string }[];
}

export interface UXStepDef {
  id: string;
  label: string;
}

export interface UXMetadata {
  steps: UXStepDef[];
  reviewChecks: string[];
  disclaimerText: string;
  mailOptions?: { id: string; label: string; price: string; desc: string }[];
}

export interface MasterWorkflowDefinition {
  id: string;
  vertical: string;
  lifecycle: WorkflowLifecycle;
  title: string;
  description: string;
  disclaimer: string;
  searchIntent: SearchIntentDefinition;
  documents: DocumentDefinition[];
  deadlines: DeadlineDefinition[];
  requirements: RequirementDefinition[];
  evidence: EvidenceDefinition[];
  analysis: WorkflowAnalysisPlan;
  drafting: WorkflowDraftPlan;
  submission: WorkflowSubmissionPlan;
  capabilities: CapabilityPack[];
  qualityGate: WorkflowQualityGate;
  seo?: SEOMetadata;
  directory?: DirectoryEntry;
  ux?: UXMetadata;
}

export interface DirectoryEntry {
  category: string;
  bestFor: string;
  steps: string[];
  documents: string[];
  seoRoute?: string;
  seoTitle?: string;
  seoDescription?: string;
}
