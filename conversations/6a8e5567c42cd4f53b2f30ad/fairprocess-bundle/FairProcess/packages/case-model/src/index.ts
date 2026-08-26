export type IsoDate = `${number}-${number}-${number}`;

export interface SourceReference {
  documentId: string;
  sha256: string;
  page?: number;
  quote?: string;
  extractionMethod: "manual" | "ocr" | "native_text" | "api_import";
  confidence?: number;
  humanVerified: boolean;
}

export interface VerifiedFact<T> {
  value: T;
  source: SourceReference;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface RecorderInstrument {
  instrumentNumber: string;
  recordedOn: IsoDate;
  apns: string[];
  instrumentType: string;
  parties?: string[];
  source: SourceReference;
}

export interface FairProcessCase {
  id: string;
  tenantId: string;
  jurisdiction: string;
  agency?: string;
  agencyCaseNumber?: VerifiedFact<string>;
  apns: Array<VerifiedFact<string>>;
  createdAt: string;
}

export type PublicRecordsRequestStatus =
  | "draft"
  | "submitted"
  | "acknowledged"
  | "clarification_requested"
  | "partially_produced"
  | "completed"
  | "no_response_recorded"
  | "closed";

export interface PublicRecordsRequest {
  id: string;
  caseId?: string;
  agency: string;
  submittedOn?: IsoDate;
  status: PublicRecordsRequestStatus;
  deliveryEvidence?: SourceReference;
  correspondenceDocumentIds: string[];
  notes?: string;
}
