import { createHash } from "node:crypto";

export const AUDIT_CANONICALIZATION_VERSION = "fairprocess-audit-v1" as const;
export const AUDIT_CHAIN_VERSION = 2 as const;

export interface CanonicalAuditPayload {
  canonicalizationVersion: typeof AUDIT_CANONICALIZATION_VERSION;
  chainVersion: typeof AUDIT_CHAIN_VERSION;
  id: string;
  tenantId: string;
  caseId: string | null;
  sequenceNumber: number;
  occurredAt: string;
  actor: string;
  action: string;
  sourceHashes: string[];
  policyVersion: string | null;
  extractionVersion: string | null;
  result: Record<string, unknown>;
  humanAuthorizedBy: string | null;
  priorEventHash: string | null;
}

function normalizeCanonicalValue(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Audit payload contains a non-finite number");
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeCanonicalValue(item));
  }

  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("Audit payload contains a non-plain object");
    }

    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map((key) => [key, normalizeCanonicalValue(record[key])]),
    );
  }

  throw new TypeError(
    `Audit payload contains unsupported value type: ${typeof value}`,
  );
}

export function canonicalizeAuditPayload(
  payload: CanonicalAuditPayload,
): string {
  return JSON.stringify({
    canonicalizationVersion: payload.canonicalizationVersion,
    chainVersion: payload.chainVersion,
    id: payload.id,
    tenantId: payload.tenantId,
    caseId: payload.caseId,
    sequenceNumber: payload.sequenceNumber,
    occurredAt: payload.occurredAt,
    actor: payload.actor,
    action: payload.action,
    sourceHashes: normalizeCanonicalValue(payload.sourceHashes),
    policyVersion: payload.policyVersion,
    extractionVersion: payload.extractionVersion,
    result: normalizeCanonicalValue(payload.result),
    humanAuthorizedBy: payload.humanAuthorizedBy,
    priorEventHash: payload.priorEventHash,
  });
}

export function hashAuditPayload(payload: CanonicalAuditPayload): string {
  return createHash("sha256")
    .update(canonicalizeAuditPayload(payload), "utf8")
    .digest("hex");
}
