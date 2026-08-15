import { z } from "zod";

/* ═══════════════════════════════════════════════════════════
   EVIDENCE MODEL — user-provided supporting materials attached
   to a case. Evidence is never manufactured from AI output.
   
   Source types are explicitly distinguished:
   - SOURCE DOCUMENT: the notice itself
   - USER-PROVIDED FACT: information the user entered
   - EXTRACTED FACT: information the system pulled from a document
   - INFERRED INFORMATION: derived by the system
   - SYSTEM FINDING: a conclusion reached by the intelligence layer
   - AI SUGGESTION: a recommendation that may be wrong
   
   Evidence is always USER-PROVIDED or SOURCE DOCUMENT.
   ═══════════════════════════════════════════════════════════ */

export const evidenceTypeSchema = z.enum([
  "document",
  "receipt",
  "form",
  "correspondence",
  "photo",
  "screenshot",
  "contract",
  "bank_statement",
  "tax_form",
  "other",
]);
export type EvidenceType = z.infer<typeof evidenceTypeSchema>;

export const evidenceRelationshipSchema = z.object({
  factId: z.string(),
  relationship: z.enum(["supports", "contradicts", "contextualizes"]),
});
export type EvidenceRelationship = z.infer<typeof evidenceRelationshipSchema>;

export const evidenceSchema = z.object({
  id: z.string(),
  caseId: z.string().optional(),
  type: evidenceTypeSchema,
  label: z.string(),
  description: z.string().optional(),
  source: z.string().optional(),
  documentRef: z.string().optional(),
  hash: z.string().optional(),
  relationships: z.array(evidenceRelationshipSchema).default([]),
  status: z.enum(["pending", "verified", "rejected"]).default("pending"),
  createdAt: z.string().default(() => new Date().toISOString()),
});
export type Evidence = z.infer<typeof evidenceSchema>;

export function createEvidence(
  type: EvidenceType,
  label: string,
  options?: {
    id?: string;
    caseId?: string;
    description?: string;
    source?: string;
    documentRef?: string;
    hash?: string;
    relatedFactIds?: string[];
    relationships?: EvidenceRelationship[];
    status?: "pending" | "verified" | "rejected";
  },
): Evidence {
  const relationships = options?.relationships ??
    (options?.relatedFactIds
      ? options.relatedFactIds.map((factId) => ({
          factId,
          relationship: "supports" as const,
        }))
      : []);

  return evidenceSchema.parse({
    id: options?.id ?? crypto.randomUUID(),
    caseId: options?.caseId,
    type,
    label,
    description: options?.description,
    source: options?.source,
    documentRef: options?.documentRef,
    hash: options?.hash,
    relationships,
    status: options?.status ?? "pending",
  });
}

export function addEvidenceRelationship(
  evidence: Evidence,
  factId: string,
  relationship: "supports" | "contradicts" | "contextualizes",
): Evidence {
  return {
    ...evidence,
    relationships: [
      ...evidence.relationships.filter((r) => r.factId !== factId),
      { factId, relationship },
    ],
  };
}
