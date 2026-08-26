export type InstrumentKind =
  | "notice_of_violation_and_proposed_penalty"
  | "final_finding_and_order"
  | "resolution_documentation"
  | "administrative_civil_penalty_lien";

export type TriggerField = "servedOn" | "becameFinalOn" | "resolvedOn";

export interface LocatedInstrument {
  instrumentNumber: string;
  recordedOn: string;
}

export type RecordationStatus =
  | "awaiting_trigger"
  | "not_yet_eligible"
  | "not_located"
  | "recorded"
  | "recorded_too_early";

export interface RecordationResult {
  status: RecordationStatus;
  ruleId: string;
  citation: string;
  sourceUrl: string;
  policyVersion: string;
  triggerDate?: string;
  earliestRecordingDate?: string;
  matchedInstrument?: LocatedInstrument;
  humanReviewRequired: boolean;
  explanation: string;
}

export interface RecordationRule {
  id: string;
  jurisdiction: string;
  citation: string;
  sourceUrl: string;
  instrumentKind: InstrumentKind;
  triggerField: TriggerField;
  earliestCalendarDaysAfterTrigger: number;
  recordingRequired: boolean;
  legalReviewRequired: boolean;
  policyVersion: string;
}

export interface ImportedRecorderInstrument extends LocatedInstrument {
  apns: string[];
  instrumentKind: InstrumentKind;
  parties: string[];
}

export interface RecordationInput {
  instrumentKind: InstrumentKind;
  asOf: string;
  servedOn?: string;
  becameFinalOn?: string;
  resolvedOn?: string;
  locatedInstruments: LocatedInstrument[];
}
