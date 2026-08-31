import { randomUUID } from "node:crypto";
import type { PoolClient, QueryResultRow } from "pg";
import {
  AUDIT_CANONICALIZATION_VERSION,
  AUDIT_CHAIN_VERSION,
  hashAuditPayload,
  type CanonicalAuditPayload,
} from "./audit-canonical.js";
import type { Database } from "./index.js";

export interface AuditEventInput {
  tenantId: string;
  caseId?: string | undefined;
  actor: string;
  action: string;
  sourceHashes?: string[] | undefined;
  policyVersion?: string | undefined;
  extractionVersion?: string | undefined;
  result?: Record<string, unknown> | undefined;
  humanAuthorizedBy?: string | undefined;
}

export type AuditChainStatus =
  | "valid"
  | "valid_with_legacy_prefix"
  | "legacy_unverifiable"
  | "invalid_hash"
  | "invalid_link"
  | "invalid_sequence"
  | "invalid_genesis"
  | "unsupported_canonicalization_version";

export interface AuditChainVerification {
  status: AuditChainStatus;
  valid: boolean;
  totalEvents: number;
  legacyEvents: number;
  verifiedEvents: number;
  brokenAt?: string;
  expected?: string | number | null;
  actual?: string | number | null;
}

interface AuditHeadRow extends QueryResultRow {
  id: string;
  sequence_number: number;
  event_hash: string;
}

interface CountRow extends QueryResultRow {
  count: number;
}

interface HashRow extends QueryResultRow {
  event_hash: string;
}

interface TenantRow extends QueryResultRow {
  id: string;
}

interface AuditEventRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  case_id: string | null;
  actor: string;
  action: string;
  source_hashes: unknown;
  policy_version: string | null;
  extraction_version: string | null;
  result: unknown;
  human_authorized_by: string | null;
  prior_event_hash: string | null;
  event_hash: string;
  chain_version: number;
  sequence_number: number | null;
  occurred_at: Date | string | null;
  canonicalization_version: string | null;
  created_at: Date | string;
}

async function lockTenantChain(
  client: PoolClient,
  tenantId: string,
): Promise<void> {
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
    [tenantId],
  );
}

async function assertTenantExists(
  client: PoolClient,
  tenantId: string,
): Promise<void> {
  const tenant = await client.query(
    "SELECT 1 FROM tenants WHERE id = $1",
    [tenantId],
  );
  if (tenant.rows.length === 0) {
    throw new Error(`Cannot append audit event for unknown tenant: ${tenantId}`);
  }
}

function occurredAtToIso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`Invalid persisted audit timestamp: ${String(value)}`);
  }
  return date.toISOString();
}

function asSourceHashes(value: unknown): string[] {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
    throw new TypeError("Persisted audit source_hashes must be an array of strings");
  }
  return parsed;
}

function asResult(value: unknown): Record<string, unknown> {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new TypeError("Persisted audit result must be a JSON object");
  }
  return parsed as Record<string, unknown>;
}

function buildCanonicalPayload(
  row: Omit<AuditEventRow, "occurred_at"> & { occurred_at: Date | string },
): CanonicalAuditPayload {
  return {
    canonicalizationVersion: AUDIT_CANONICALIZATION_VERSION,
    chainVersion: AUDIT_CHAIN_VERSION,
    id: row.id,
    tenantId: row.tenant_id,
    caseId: row.case_id,
    sequenceNumber: row.sequence_number!,
    occurredAt: occurredAtToIso(row.occurred_at),
    actor: row.actor,
    action: row.action,
    sourceHashes: asSourceHashes(row.source_hashes),
    policyVersion: row.policy_version,
    extractionVersion: row.extraction_version,
    result: asResult(row.result),
    humanAuthorizedBy: row.human_authorized_by,
    priorEventHash: row.prior_event_hash,
  };
}

async function latestV2Head(
  client: PoolClient,
  tenantId: string,
): Promise<AuditHeadRow | undefined> {
  const result = await client.query<AuditHeadRow>(
    `SELECT id, sequence_number::int AS sequence_number, event_hash
       FROM audit_events
      WHERE tenant_id = $1 AND chain_version = 2
      ORDER BY sequence_number DESC
      LIMIT 1`,
    [tenantId],
  );
  return result.rows[0];
}

async function createGenesisEvent(
  client: PoolClient,
  tenantId: string,
): Promise<AuditHeadRow> {
  const legacyCountResult = await client.query<CountRow>(
    `SELECT COUNT(*)::int AS count
       FROM audit_events
      WHERE tenant_id = $1 AND chain_version = 1`,
    [tenantId],
  );
  const legacyHashResult = await client.query<HashRow>(
    `SELECT event_hash
       FROM audit_events
      WHERE tenant_id = $1 AND chain_version = 1
      ORDER BY created_at DESC, id DESC
      LIMIT 1`,
    [tenantId],
  );

  const id = randomUUID();
  const occurredAt = new Date().toISOString();
  const legacyEventCount = legacyCountResult.rows[0]?.count ?? 0;
  const lastLegacyEventHash = legacyHashResult.rows[0]?.event_hash ?? null;
  const result = {
    boundaryOccurredAt: occurredAt,
    canonicalizationVersion: AUDIT_CANONICALIZATION_VERSION,
    lastLegacyEventHash,
    legacyEventCount,
  };
  const payload: CanonicalAuditPayload = {
    canonicalizationVersion: AUDIT_CANONICALIZATION_VERSION,
    chainVersion: AUDIT_CHAIN_VERSION,
    id,
    tenantId,
    caseId: null,
    sequenceNumber: 1,
    occurredAt,
    actor: "system",
    action: "audit_chain_initialized",
    sourceHashes: [],
    policyVersion: null,
    extractionVersion: null,
    result,
    humanAuthorizedBy: null,
    priorEventHash: null,
  };
  const eventHash = hashAuditPayload(payload);

  const inserted = await client.query<AuditHeadRow>(
    `INSERT INTO audit_events
      (id, tenant_id, case_id, actor, action, source_hashes, policy_version,
       extraction_version, result, human_authorized_by, prior_event_hash,
       event_hash, chain_version, sequence_number, occurred_at,
       canonicalization_version)
     VALUES
      ($1, $2, NULL, 'system', 'audit_chain_initialized', '[]'::jsonb, NULL,
       NULL, $3::jsonb, NULL, NULL, $4, 2, 1, $5,
       $6)
     RETURNING id, sequence_number::int AS sequence_number, event_hash`,
    [
      id,
      tenantId,
      JSON.stringify(result),
      eventHash,
      occurredAt,
      AUDIT_CANONICALIZATION_VERSION,
    ],
  );

  return inserted.rows[0]!;
}

async function ensureGenesisEvent(
  client: PoolClient,
  tenantId: string,
): Promise<AuditHeadRow> {
  const currentHead = await latestV2Head(client, tenantId);
  if (currentHead) return currentHead;
  return createGenesisEvent(client, tenantId);
}

export async function initializeAuditChains(db: Database): Promise<number> {
  const tenants = await db.query<TenantRow>("SELECT id FROM tenants ORDER BY id");
  let initialized = 0;

  for (const tenant of tenants.rows) {
    const created = await db.transaction(async (client) => {
      await lockTenantChain(client, tenant.id);
      await assertTenantExists(client, tenant.id);
      const existing = await latestV2Head(client, tenant.id);
      if (existing) return false;
      await createGenesisEvent(client, tenant.id);
      return true;
    });
    if (created) initialized += 1;
  }

  return initialized;
}

export async function recordAuditEvent(
  db: Database,
  input: AuditEventInput,
): Promise<{ id: string; eventHash: string }> {
  return db.transaction(async (client) => {
    await lockTenantChain(client, input.tenantId);
    await assertTenantExists(client, input.tenantId);
    const priorEvent = await ensureGenesisEvent(client, input.tenantId);

    const id = randomUUID();
    const sequenceNumber = priorEvent.sequence_number + 1;
    const occurredAt = new Date().toISOString();
    const payload: CanonicalAuditPayload = {
      canonicalizationVersion: AUDIT_CANONICALIZATION_VERSION,
      chainVersion: AUDIT_CHAIN_VERSION,
      id,
      tenantId: input.tenantId,
      caseId: input.caseId ?? null,
      sequenceNumber,
      occurredAt,
      actor: input.actor,
      action: input.action,
      sourceHashes: input.sourceHashes ?? [],
      policyVersion: input.policyVersion ?? null,
      extractionVersion: input.extractionVersion ?? null,
      result: input.result ?? {},
      humanAuthorizedBy: input.humanAuthorizedBy ?? null,
      priorEventHash: priorEvent.event_hash,
    };
    const eventHash = hashAuditPayload(payload);

    await client.query(
      `INSERT INTO audit_events
        (id, tenant_id, case_id, actor, action, source_hashes, policy_version,
         extraction_version, result, human_authorized_by, prior_event_hash,
         event_hash, chain_version, sequence_number, occurred_at,
         canonicalization_version)
       VALUES
        ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9::jsonb, $10, $11,
         $12, 2, $13, $14, $15)`,
      [
        id,
        input.tenantId,
        input.caseId ?? null,
        input.actor,
        input.action,
        JSON.stringify(input.sourceHashes ?? []),
        input.policyVersion ?? null,
        input.extractionVersion ?? null,
        JSON.stringify(input.result ?? {}),
        input.humanAuthorizedBy ?? null,
        priorEvent.event_hash,
        eventHash,
        sequenceNumber,
        occurredAt,
        AUDIT_CANONICALIZATION_VERSION,
      ],
    );

    return { id, eventHash };
  });
}

function invalidVerification(
  status: Exclude<
    AuditChainStatus,
    "valid" | "valid_with_legacy_prefix" | "legacy_unverifiable"
  >,
  totalEvents: number,
  legacyEvents: number,
  verifiedEvents: number,
  brokenAt: string,
  expected: string | number | null,
  actual: string | number | null,
): AuditChainVerification {
  return {
    status,
    valid: false,
    totalEvents,
    legacyEvents,
    verifiedEvents,
    brokenAt,
    expected,
    actual,
  };
}

export async function verifyAuditChain(
  db: Database,
  tenantId: string,
): Promise<AuditChainVerification> {
  const result = await db.query<AuditEventRow>(
    `SELECT id, tenant_id, case_id, actor, action::text AS action,
            source_hashes, policy_version, extraction_version, result,
            human_authorized_by, prior_event_hash, event_hash, chain_version,
            sequence_number::int AS sequence_number, occurred_at,
            canonicalization_version, created_at
       FROM audit_events
      WHERE tenant_id = $1
      ORDER BY created_at, id`,
    [tenantId],
  );

  const legacyRows = result.rows.filter((row) => row.chain_version === 1);
  const verifiedRows = result.rows
    .filter((row) => row.chain_version === AUDIT_CHAIN_VERSION)
    .sort((left, right) =>
      (left.sequence_number ?? 0) - (right.sequence_number ?? 0),
    );
  const legacyEvents = legacyRows.length;
  const totalEvents = result.rows.length;

  if (verifiedRows.length === 0) {
    if (legacyEvents > 0) {
      return {
        status: "legacy_unverifiable",
        valid: false,
        totalEvents,
        legacyEvents,
        verifiedEvents: 0,
      };
    }
    return {
      status: "valid",
      valid: true,
      totalEvents: 0,
      legacyEvents: 0,
      verifiedEvents: 0,
    };
  }

  const genesis = verifiedRows[0]!;
  let genesisResult: Record<string, unknown>;
  try {
    genesisResult = asResult(genesis.result);
  } catch (error) {
    return invalidVerification(
      "invalid_genesis",
      totalEvents,
      legacyEvents,
      0,
      genesis.id,
      "genesis result object",
      error instanceof Error ? error.message : "invalid genesis result",
    );
  }

  const capturedLegacyCount = genesisResult.legacyEventCount;
  const capturedLastLegacyHash = genesisResult.lastLegacyEventHash;
  if (
    typeof capturedLegacyCount !== "number" ||
    !Number.isInteger(capturedLegacyCount) ||
    capturedLegacyCount < 0 ||
    (capturedLastLegacyHash !== null &&
      typeof capturedLastLegacyHash !== "string")
  ) {
    return invalidVerification(
      "invalid_genesis",
      totalEvents,
      legacyEvents,
      0,
      genesis.id,
      "valid legacyEventCount and lastLegacyEventHash snapshot",
      JSON.stringify({ capturedLegacyCount, capturedLastLegacyHash }),
    );
  }

  if (legacyEvents !== capturedLegacyCount) {
    const boundaryViolation = legacyRows[capturedLegacyCount];
    return invalidVerification(
      "invalid_genesis",
      totalEvents,
      legacyEvents,
      0,
      boundaryViolation?.id ?? genesis.id,
      capturedLegacyCount,
      `legacy event after v2 genesis; ${legacyEvents} legacy event(s) now present`,
    );
  }

  const currentLastLegacyHash = legacyRows.at(-1)?.event_hash ?? null;
  if (capturedLastLegacyHash !== currentLastLegacyHash) {
    return invalidVerification(
      "invalid_genesis",
      totalEvents,
      legacyEvents,
      0,
      legacyRows.at(-1)?.id ?? genesis.id,
      capturedLastLegacyHash,
      currentLastLegacyHash,
    );
  }

  let priorHash: string | null = null;

  for (let index = 0; index < verifiedRows.length; index += 1) {
    const row = verifiedRows[index]!;
    const expectedSequence = index + 1;

    if (row.sequence_number !== expectedSequence) {
      return invalidVerification(
        "invalid_sequence",
        totalEvents,
        legacyEvents,
        index,
        row.id,
        expectedSequence,
        row.sequence_number,
      );
    }

    if (
      index === 0 &&
      (row.action !== "audit_chain_initialized" ||
        row.actor !== "system" ||
        row.case_id !== null ||
        row.prior_event_hash !== null)
    ) {
      return invalidVerification(
        "invalid_genesis",
        totalEvents,
        legacyEvents,
        0,
        row.id,
        "system audit_chain_initialized event with no case or predecessor",
        `${row.actor}:${row.action}:${row.case_id ?? "null"}:${row.prior_event_hash ?? "null"}`,
      );
    }

    if (row.prior_event_hash !== priorHash) {
      return invalidVerification(
        "invalid_link",
        totalEvents,
        legacyEvents,
        index,
        row.id,
        priorHash,
        row.prior_event_hash,
      );
    }

    if (row.canonicalization_version !== AUDIT_CANONICALIZATION_VERSION) {
      return invalidVerification(
        "unsupported_canonicalization_version",
        totalEvents,
        legacyEvents,
        index,
        row.id,
        AUDIT_CANONICALIZATION_VERSION,
        row.canonicalization_version,
      );
    }

    if (row.occurred_at === null) {
      return invalidVerification(
        "invalid_hash",
        totalEvents,
        legacyEvents,
        index,
        row.id,
        "persisted occurred_at timestamp",
        null,
      );
    }

    let expectedHash: string;
    try {
      expectedHash = hashAuditPayload(
        buildCanonicalPayload({ ...row, occurred_at: row.occurred_at }),
      );
    } catch (error) {
      return invalidVerification(
        "invalid_hash",
        totalEvents,
        legacyEvents,
        index,
        row.id,
        error instanceof Error ? error.message : "canonical audit payload",
        row.event_hash,
      );
    }

    if (row.event_hash !== expectedHash) {
      return invalidVerification(
        "invalid_hash",
        totalEvents,
        legacyEvents,
        index,
        row.id,
        expectedHash,
        row.event_hash,
      );
    }

    priorHash = row.event_hash;
  }

  return {
    status: legacyEvents > 0 ? "valid_with_legacy_prefix" : "valid",
    valid: true,
    totalEvents,
    legacyEvents,
    verifiedEvents: verifiedRows.length,
  };
}
