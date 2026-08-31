import { Hono } from "hono";
import postgres from "postgres";
import { createHash, randomUUID } from "node:crypto";
import {
  parseRecorderCsv,
  parseAuditCase,
  parsePolicyBundle,
  generateIntegrityReport,
  renderIntegrityReportMarkdown,
} from "../../audit-engine/dist/index.js";

// ─── Audit Canonical ──────────────────────────────────────────────
const AUDIT_CANONICALIZATION_VERSION = "fairprocess-audit-v1";
const AUDIT_CHAIN_VERSION = 2;

function normalizeCanonicalValue(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Audit payload contains a non-finite number");
    return value;
  }
  if (Array.isArray(value)) return value.map(normalizeCanonicalValue);
  if (typeof value === "object") {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) throw new TypeError("Audit payload contains a non-plain object");
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).sort().map((k) => [k, normalizeCanonicalValue(record[k])]));
  }
  throw new TypeError(`Audit payload contains unsupported value type: ${typeof value}`);
}

interface CanonicalAuditPayload {
  canonicalizationVersion: string;
  chainVersion: number;
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

function canonicalizeAuditPayload(p: CanonicalAuditPayload): string {
  return JSON.stringify({
    canonicalizationVersion: p.canonicalizationVersion,
    chainVersion: p.chainVersion,
    id: p.id,
    tenantId: p.tenantId,
    caseId: p.caseId,
    sequenceNumber: p.sequenceNumber,
    occurredAt: p.occurredAt,
    actor: p.actor,
    action: p.action,
    sourceHashes: normalizeCanonicalValue(p.sourceHashes),
    policyVersion: p.policyVersion,
    extractionVersion: p.extractionVersion,
    result: normalizeCanonicalValue(p.result),
    humanAuthorizedBy: p.humanAuthorizedBy,
    priorEventHash: p.priorEventHash,
  });
}

function hashAuditPayload(p: CanonicalAuditPayload): string {
  return createHash("sha256").update(canonicalizeAuditPayload(p), "utf8").digest("hex");
}

// ─── Audit Log (with JSONB fix) ────────────────────────────────────
interface Database {
  query<T = any>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
  transaction<T>(fn: (client: { query: (text: string, params?: unknown[]) => Promise<{ rows: any[] }> }) => Promise<T>): Promise<T>;
}

interface AuditEventInput {
  tenantId: string;
  caseId?: string;
  actor: string;
  action: string;
  sourceHashes?: string[];
  policyVersion?: string;
  extractionVersion?: string;
  result?: Record<string, unknown>;
  humanAuthorizedBy?: string;
}

async function lockTenantChain(client: { query: Function }, tenantId: string) {
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [tenantId]);
}

async function assertTenantExists(client: { query: Function }, tenantId: string) {
  const r = await client.query("SELECT 1 FROM tenants WHERE id = $1", [tenantId]);
  if (r.rows.length === 0) throw new Error(`Cannot append audit event for unknown tenant: ${tenantId}`);
}

function occurredAtToIso(value: unknown): string {
  const d = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(d.getTime())) throw new TypeError(`Invalid persisted audit timestamp: ${String(value)}`);
  return d.toISOString();
}

function asSourceHashes(value: unknown): string[] {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(parsed) || parsed.some((i) => typeof i !== "string"))
    throw new TypeError("Persisted audit source_hashes must be an array of strings");
  return parsed;
}

function asResult(value: unknown): Record<string, unknown> {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))
    throw new TypeError("Persisted audit result must be a JSON object");
  return parsed as Record<string, unknown>;
}

function buildCanonicalPayload(row: any): CanonicalAuditPayload {
  return {
    canonicalizationVersion: AUDIT_CANONICALIZATION_VERSION,
    chainVersion: AUDIT_CHAIN_VERSION,
    id: row.id,
    tenantId: row.tenant_id,
    caseId: row.case_id,
    sequenceNumber: row.sequence_number,
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

async function latestV2Head(client: { query: Function }, tenantId: string) {
  const r = await client.query(
    `SELECT id, sequence_number::int AS sequence_number, event_hash FROM audit_events WHERE tenant_id = $1 AND chain_version = 2 ORDER BY sequence_number DESC LIMIT 1`,
    [tenantId],
  );
  return r.rows[0];
}

async function createGenesisEvent(client: { query: Function }, tenantId: string) {
  const legacyCount = await client.query(`SELECT COUNT(*)::int AS count FROM audit_events WHERE tenant_id = $1 AND chain_version = 1`, [tenantId]);
  const legacyHash = await client.query(`SELECT event_hash FROM audit_events WHERE tenant_id = $1 AND chain_version = 1 ORDER BY created_at DESC, id DESC LIMIT 1`, [tenantId]);
  const id = randomUUID();
  const occurredAt = new Date().toISOString();
  const legacyEventCount = legacyCount.rows[0]?.count ?? 0;
  const lastLegacyEventHash = legacyHash.rows[0]?.event_hash ?? null;
  const result = { boundaryOccurredAt: occurredAt, canonicalizationVersion: AUDIT_CANONICALIZATION_VERSION, lastLegacyEventHash, legacyEventCount };
  const payload: CanonicalAuditPayload = {
    canonicalizationVersion: AUDIT_CANONICALIZATION_VERSION, chainVersion: AUDIT_CHAIN_VERSION, id, tenantId,
    caseId: null, sequenceNumber: 1, occurredAt, actor: "system", action: "audit_chain_initialized",
    sourceHashes: [], policyVersion: null, extractionVersion: null, result, humanAuthorizedBy: null, priorEventHash: null,
  };
  const eventHash = hashAuditPayload(payload);
  const inserted = await client.query(
    `INSERT INTO audit_events (id, tenant_id, case_id, actor, action, source_hashes, policy_version, extraction_version, result, human_authorized_by, prior_event_hash, event_hash, chain_version, sequence_number, occurred_at, canonicalization_version)
     VALUES ($1, $2, NULL, 'system', 'audit_chain_initialized', '[]'::jsonb, NULL, NULL, $3::jsonb, NULL, NULL, $4, 2, 1, $5, $6)
     RETURNING id, sequence_number::int AS sequence_number, event_hash`,
    [id, tenantId, JSON.stringify(result), eventHash, occurredAt, AUDIT_CANONICALIZATION_VERSION],
  );
  return inserted.rows[0];
}

async function ensureGenesisEvent(client: { query: Function }, tenantId: string) {
  const head = await latestV2Head(client, tenantId);
  return head ?? createGenesisEvent(client, tenantId);
}

export async function initializeAuditChains(db: Database): Promise<number> {
  const tenants = await db.query("SELECT id FROM tenants ORDER BY id");
  let initialized = 0;
  for (const t of tenants.rows) {
    const created = await db.transaction(async (client) => {
      await lockTenantChain(client, t.id);
      await assertTenantExists(client, t.id);
      const existing = await latestV2Head(client, t.id);
      if (existing) return false;
      await createGenesisEvent(client, t.id);
      return true;
    });
    if (created) initialized++;
  }
  return initialized;
}

async function recordAuditEvent(db: Database, input: AuditEventInput): Promise<{ id: string; eventHash: string }> {
  return db.transaction(async (client) => {
    await lockTenantChain(client, input.tenantId);
    await assertTenantExists(client, input.tenantId);
    const priorEvent = await ensureGenesisEvent(client, input.tenantId);
    const id = randomUUID();
    const sequenceNumber = priorEvent.sequence_number + 1;
    const occurredAt = new Date().toISOString();
    const payload: CanonicalAuditPayload = {
      canonicalizationVersion: AUDIT_CANONICALIZATION_VERSION, chainVersion: AUDIT_CHAIN_VERSION, id,
      tenantId: input.tenantId, caseId: input.caseId ?? null, sequenceNumber, occurredAt,
      actor: input.actor, action: input.action, sourceHashes: input.sourceHashes ?? [],
      policyVersion: input.policyVersion ?? null, extractionVersion: input.extractionVersion ?? null,
      result: input.result ?? {}, humanAuthorizedBy: input.humanAuthorizedBy ?? null, priorEventHash: priorEvent.event_hash,
    };
    const eventHash = hashAuditPayload(payload);
    await client.query(
      `INSERT INTO audit_events (id, tenant_id, case_id, actor, action, source_hashes, policy_version, extraction_version, result, human_authorized_by, prior_event_hash, event_hash, chain_version, sequence_number, occurred_at, canonicalization_version)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9::jsonb, $10, $11, $12, 2, $13, $14, $15)`,
      [id, input.tenantId, input.caseId ?? null, input.actor, input.action, JSON.stringify(input.sourceHashes ?? []),
       input.policyVersion ?? null, input.extractionVersion ?? null, JSON.stringify(input.result ?? {}),
       input.humanAuthorizedBy ?? null, priorEvent.event_hash, eventHash, sequenceNumber, occurredAt, AUDIT_CANONICALIZATION_VERSION],
    );
    return { id, eventHash };
  });
}

async function verifyAuditChain(db: Database, tenantId: string) {
  const result = await db.query(
    `SELECT id, tenant_id, case_id, actor, action::text AS action, source_hashes, policy_version, extraction_version, result,
            human_authorized_by, prior_event_hash, event_hash, chain_version, sequence_number::int AS sequence_number,
            occurred_at, canonicalization_version, created_at FROM audit_events WHERE tenant_id = $1 ORDER BY created_at, id`,
    [tenantId],
  );
  const legacyRows = result.rows.filter((r: any) => r.chain_version === 1);
  const verifiedRows = result.rows.filter((r: any) => r.chain_version === AUDIT_CHAIN_VERSION).sort((a: any, b: any) => (a.sequence_number ?? 0) - (b.sequence_number ?? 0));
  const legacyEvents = legacyRows.length;
  const totalEvents = result.rows.length;

  if (verifiedRows.length === 0) {
    return legacyEvents > 0
      ? { status: "legacy_unverifiable", valid: false, totalEvents, legacyEvents, verifiedEvents: 0 }
      : { status: "valid", valid: true, totalEvents: 0, legacyEvents: 0, verifiedEvents: 0 };
  }

  const genesis = verifiedRows[0];
  let genesisResult: Record<string, unknown>;
  try { genesisResult = asResult(genesis.result); } catch (e) {
    return { status: "invalid_genesis", valid: false, totalEvents, legacyEvents, verifiedEvents: 0, brokenAt: genesis.id, expected: "genesis result object", actual: e instanceof Error ? e.message : "invalid" };
  }
  const capturedLegacyCount = genesisResult.legacyEventCount as number;
  const capturedLastLegacyHash = genesisResult.lastLegacyEventHash as string | null;
  if (typeof capturedLegacyCount !== "number" || !Number.isInteger(capturedLegacyCount) || capturedLegacyCount < 0 || (capturedLastLegacyHash !== null && typeof capturedLastLegacyHash !== "string")) {
    return { status: "invalid_genesis", valid: false, totalEvents, legacyEvents, verifiedEvents: 0, brokenAt: genesis.id, expected: "valid legacy snapshot", actual: JSON.stringify({ capturedLegacyCount, capturedLastLegacyHash }) };
  }
  if (legacyEvents !== capturedLegacyCount) {
    const bv = legacyRows[capturedLegacyCount];
    return { status: "invalid_genesis", valid: false, totalEvents, legacyEvents, verifiedEvents: 0, brokenAt: bv?.id ?? genesis.id, expected: capturedLegacyCount, actual: `legacy event after v2 genesis; ${legacyEvents} present` };
  }
  const currentLastLegacyHash = legacyRows.at(-1)?.event_hash ?? null;
  if (capturedLastLegacyHash !== currentLastLegacyHash) {
    return { status: "invalid_genesis", valid: false, totalEvents, legacyEvents, verifiedEvents: 0, brokenAt: legacyRows.at(-1)?.id ?? genesis.id, expected: capturedLastLegacyHash, actual: currentLastLegacyHash };
  }

  let priorHash: string | null = null;
  for (let i = 0; i < verifiedRows.length; i++) {
    const row = verifiedRows[i];
    const expectedSeq = i + 1;
    if (row.sequence_number !== expectedSeq) return { status: "invalid_sequence", valid: false, totalEvents, legacyEvents, verifiedEvents: i, brokenAt: row.id, expected: expectedSeq, actual: row.sequence_number };
    if (i === 0 && (row.action !== "audit_chain_initialized" || row.actor !== "system" || row.case_id !== null || row.prior_event_hash !== null))
      return { status: "invalid_genesis", valid: false, totalEvents, legacyEvents, verifiedEvents: 0, brokenAt: row.id, expected: "system audit_chain_initialized", actual: `${row.actor}:${row.action}:${row.case_id ?? "null"}:${row.prior_event_hash ?? "null"}` };
    if (row.prior_event_hash !== priorHash) return { status: "invalid_link", valid: false, totalEvents, legacyEvents, verifiedEvents: i, brokenAt: row.id, expected: priorHash, actual: row.prior_event_hash };
    if (row.canonicalization_version !== AUDIT_CANONICALIZATION_VERSION) return { status: "unsupported_canonicalization_version", valid: false, totalEvents, legacyEvents, verifiedEvents: i, brokenAt: row.id, expected: AUDIT_CANONICALIZATION_VERSION, actual: row.canonicalization_version };
    if (row.occurred_at === null) return { status: "invalid_hash", valid: false, totalEvents, legacyEvents, verifiedEvents: i, brokenAt: row.id, expected: "persisted occurred_at", actual: null };
    let expectedHash: string;
    try { expectedHash = hashAuditPayload(buildCanonicalPayload(row)); } catch (e) {
      return { status: "invalid_hash", valid: false, totalEvents, legacyEvents, verifiedEvents: i, brokenAt: row.id, expected: e instanceof Error ? e.message : "canonical payload", actual: row.event_hash };
    }
    if (row.event_hash !== expectedHash) return { status: "invalid_hash", valid: false, totalEvents, legacyEvents, verifiedEvents: i, brokenAt: row.id, expected: expectedHash, actual: row.event_hash };
    priorHash = row.event_hash;
  }
  return { status: legacyEvents > 0 ? "valid_with_legacy_prefix" : "valid", valid: true, totalEvents, legacyEvents, verifiedEvents: verifiedRows.length };
}

// ─── Database Adapter ─────────────────────────────────────────────
class DatabaseAdapter implements Database {
  private sql: ReturnType<typeof postgres>;
  constructor(connectionString: string) {
    this.sql = postgres(connectionString, { max: 3, idle_timeout: 30, connect_timeout: 30, prepare: false });
  }
  async query<T = any>(text: string, params?: unknown[]): Promise<{ rows: T[] }> {
    const rows = await this.sql.unsafe(text, (params ?? []) as any[]);
    return { rows: rows as unknown as T[] };
  }
  async transaction<T>(fn: (client: { query: (text: string, params?: unknown[]) => Promise<{ rows: any[] }> }) => Promise<T>): Promise<T> {
    return this.sql.begin(async (txSql: any) => {
      const client = {
        query: async (text: string, params?: unknown[]) => {
          const rows = await txSql.unsafe(text, (params ?? []) as any[]);
          return { rows: rows as any[] };
        },
      };
      return fn(client);
    });
  }
}

// ─── Demo Auth ────────────────────────────────────────────────────
let cachedTenantId: string | null = null;
async function getPrincipal(db: Database) {
  if (!cachedTenantId) {
    const r = await db.query("SELECT id FROM tenants ORDER BY id LIMIT 1");
    cachedTenantId = r.rows[0]?.id ?? "default";
  }
  return { userId: "demo-admin", tenantId: cachedTenantId, email: "admin@fairprocess.demo", displayName: "Demo Admin", roles: ["admin"], permissions: ["*"] };
}

// ─── Hono App ─────────────────────────────────────────────────────
function createApp(db: Database) {
  const app = new Hono();

  // Health
  app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

  // API info
  app.get("/api", (c) => c.json({
    name: "FairProcess API",
    version: "0.3.0",
    authentication: "demo",
    endpoints: [
      "GET /api/me", "GET /api/cases", "POST /api/cases", "GET /api/cases/:id",
      "POST /api/cases/:id/expectations", "POST /api/cases/:id/recorder-csv",
      "POST /api/cases/:id/audit", "POST /api/cases/:id/evidence",
      "GET /api/cases/:id/audit-trail", "GET /api/reports/:id",
      "GET /api/reports/:id/markdown", "POST /api/reports/:id/authorize",
      "POST /api/reports/:id/publish", "GET /api/policies", "GET /api/policies/:id",
      "POST /api/policies", "PATCH /api/policies/:id/activate",
      "GET /api/records-requests", "POST /api/records-requests",
      "PATCH /api/records-requests/:id", "POST /api/cases/:id/correspondence",
      "POST /api/correspondence/:id/authorize", "GET /api/audit/verify-chain",
    ],
  }));

  // Me
  app.get("/api/me", async (c) => {
    const p = await getPrincipal(db);
    return c.json(p);
  });

  // ─── Cases ───
  app.get("/api/cases", async (c) => {
    try {
      const { tenantId } = await getPrincipal(db);
      const { rows } = await db.query("SELECT * FROM case_dashboard WHERE tenant_id = $1 ORDER BY created_at DESC", [tenantId]);
      return c.json({ cases: rows });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.post("/api/cases", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const body = await c.req.json();
      const id = body.id ?? randomUUID();
      await db.transaction(async (client) => {
        await client.query(
          `INSERT INTO cases (id, tenant_id, jurisdiction, agency, agency_case_number, as_of, status) VALUES ($1, $2, $3, $4, $5, $6, 'open')`,
          [id, tenantId, body.jurisdiction, body.agency ?? null, body.agencyCaseNumber ?? null, body.asOf],
        );
        if (Array.isArray(body.apns)) {
          for (const apn of body.apns) {
            const normalized = apn.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
            await client.query(`INSERT INTO case_apns (case_id, apn, normalized) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [id, apn, normalized]);
          }
        }
        await recordAuditEvent(db, { tenantId, caseId: id, actor: userId, action: "case_created", result: { caseId: id } });
      });
      return c.json({ id }, 201);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.get("/api/cases/:id", async (c) => {
    try {
      const { tenantId } = await getPrincipal(db);
      const id = c.req.param("id");
      const caseResult = await db.query("SELECT * FROM case_dashboard WHERE case_id = $1 AND tenant_id = $2", [id, tenantId]);
      if (caseResult.rows.length === 0) return c.json({ error: "Case not found" }, 404);
      const [apns, evidence, facts, expectations, recorderInstruments] = await Promise.all([
        db.query("SELECT * FROM case_apns WHERE case_id = $1", [id]),
        db.query(`SELECT id, filename, content_type, size_bytes, sha256, uploaded_by, uploaded_at FROM evidence_documents WHERE case_id = $1`, [id]),
        db.query("SELECT * FROM verified_facts WHERE case_id = $1", [id]),
        db.query("SELECT * FROM instrument_expectations WHERE case_id = $1", [id]),
        db.query("SELECT * FROM recorder_instruments WHERE case_id = $1", [id]),
      ]);
      return c.json({ case: caseResult.rows[0], apns: apns.rows, evidence: evidence.rows, facts: facts.rows, expectations: expectations.rows, recorderInstruments: recorderInstruments.rows });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.post("/api/cases/:id/expectations", async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const result = await db.query(
        `INSERT INTO instrument_expectations (case_id, rule_id, instrument_kind, served_on, became_final_on, resolved_on) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [id, body.ruleId, body.instrumentKind, body.servedOn ?? null, body.becameFinalOn ?? null, body.resolvedOn ?? null],
      );
      return c.json({ id: result.rows[0].id }, 201);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.post("/api/cases/:id/recorder-csv", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const id = c.req.param("id");
      const body = await c.req.json();
      const instruments = parseRecorderCsv(body.csv);
      await db.transaction(async (client) => {
        await client.query(
          `INSERT INTO recorder_searches (case_id, searched_on, source, scope, notes, instrument_count) VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, body.searchedOn, body.source, body.scope, body.notes ?? null, instruments.length],
        );
        for (const inst of instruments) {
          await client.query(
            `INSERT INTO recorder_instruments (case_id, tenant_id, instrument_number, recorded_on, apn, instrument_kind, party, import_source) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [id, tenantId, inst.instrumentNumber, inst.recordedOn, inst.apns[0] ?? null, inst.instrumentKind, inst.parties.join(", ") || null, "csv_upload"],
          );
        }
        await recordAuditEvent(db, { tenantId, caseId: id, actor: userId, action: "recorder_imported", result: { instrumentCount: instruments.length } });
      });
      return c.json({ imported: instruments.length }, 201);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.post("/api/cases/:id/audit", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const id = c.req.param("id");
      const body = await c.req.json().catch(() => ({}));

      let policyResult;
      if (body.policyBundleId) {
        policyResult = await db.query("SELECT * FROM policy_bundles WHERE id = $1", [body.policyBundleId]);
      } else {
        policyResult = await db.query(`SELECT * FROM policy_bundles WHERE jurisdiction = (SELECT jurisdiction FROM cases WHERE id = $1) AND activation_status = 'active' ORDER BY created_at DESC LIMIT 1`, [id]);
      }
      if (policyResult.rows.length === 0) return c.json({ error: "No active policy bundle found for this case's jurisdiction" }, 404);

      const policyRow = policyResult.rows[0];
      const policyBundle = {
        id: policyRow.id, jurisdiction: policyRow.jurisdiction, policyVersion: policyRow.policy_version,
        activationStatus: policyRow.activation_status, rules: typeof policyRow.rules === "string" ? JSON.parse(policyRow.rules) : policyRow.rules,
      };

      const caseResult = await db.query("SELECT * FROM cases WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
      if (caseResult.rows.length === 0) return c.json({ error: "Case not found" }, 404);
      const caseRow = caseResult.rows[0];

      const apnRows = (await db.query("SELECT apn FROM case_apns WHERE case_id = $1", [id])).rows;
      const expectationRows = (await db.query("SELECT * FROM instrument_expectations WHERE case_id = $1", [id])).rows;
      const recorderRows = (await db.query("SELECT * FROM recorder_instruments WHERE case_id = $1", [id])).rows;
      const searchResult = await db.query(`SELECT * FROM recorder_searches WHERE case_id = $1 ORDER BY created_at DESC LIMIT 1`, [id]);
      const searchRow = searchResult.rows[0];
      const searchDate = searchRow?.searched_on;
      const searchDateStr = searchDate instanceof Date ? searchDate.toISOString().slice(0, 10) : searchDate;

      const toDate = (v: unknown): string | undefined => v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === "string" ? v : undefined;
      const auditCaseInput = {
        caseId: id, jurisdiction: caseRow.jurisdiction, agencyCaseNumber: caseRow.agency_case_number ?? undefined,
        asOf: caseRow.as_of instanceof Date ? caseRow.as_of.toISOString().slice(0, 10) : caseRow.as_of,
        apns: apnRows.map((r: any) => r.apn),
        recorderSearch: { searchedOn: searchDateStr ?? new Date().toISOString().slice(0, 10), source: searchRow?.source ?? "database", scope: searchRow?.scope ?? "agency_export", notes: searchRow?.notes || undefined },
        expectations: expectationRows.map((e: any) => ({
          ruleId: e.rule_id, instrumentKind: e.instrument_kind, servedOn: toDate(e.served_on), becameFinalOn: toDate(e.became_final_on), resolvedOn: toDate(e.resolved_on),
        })),
      };

      const toDateStr = (v: unknown): string => v instanceof Date ? v.toISOString().slice(0, 10) : String(v);
      const recorderInstruments = recorderRows.map((r: any) => ({
        instrumentNumber: r.instrument_number, recordedOn: toDateStr(r.recorded_on), apns: r.apn ? [r.apn] : [],
        instrumentKind: r.instrument_kind, parties: r.party ? String(r.party).split(", ") : [],
      }));

      const parsedCase = parseAuditCase(auditCaseInput);
      const parsedPolicy = parsePolicyBundle(policyBundle);
      const report = generateIntegrityReport(parsedCase, recorderInstruments, parsedPolicy, new Date().toISOString());
      const markdown = renderIntegrityReportMarkdown(report);

      const reportId = await db.transaction(async (client) => {
        const rr = await client.query(
          `INSERT INTO integrity_reports (case_id, tenant_id, policy_bundle_id, report_json, report_markdown, status, summary) VALUES ($1, $2, $3, $4, $5, 'generated', $6) RETURNING id`,
          [id, tenantId, policyBundle.id, JSON.stringify(report), markdown, JSON.stringify(report.summary)],
        );
        const rid = rr.rows[0].id;
        await recordAuditEvent(db, { tenantId, caseId: id, actor: userId, action: "audit_run", policyVersion: policyBundle.policyVersion, result: { reportId: rid, summary: report.summary } });
        return rid;
      });
      return c.json({ reportId, summary: report.summary, findings: report.findings.length }, 201);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.post("/api/cases/:id/evidence", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const id = c.req.param("id");
      const body = await c.req.json();
      const evidenceId = randomUUID();
      await db.transaction(async (client) => {
        await client.query(
          `INSERT INTO evidence_documents (id, case_id, tenant_id, filename, content_type, size_bytes, sha256, storage_path, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [evidenceId, id, tenantId, body.filename, body.contentType, body.sizeBytes, body.sha256, body.storagePath, userId],
        );
        await recordAuditEvent(db, { tenantId, caseId: id, actor: userId, action: "evidence_uploaded", sourceHashes: [body.sha256], result: { documentId: evidenceId, filename: body.filename } });
      });
      return c.json({ id: evidenceId }, 201);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.get("/api/cases/:id/audit-trail", async (c) => {
    try {
      const { tenantId } = await getPrincipal(db);
      const id = c.req.param("id");
      const result = await db.query(
        `SELECT id, actor, action, source_hashes, policy_version, result, human_authorized_by, event_hash, created_at FROM audit_events WHERE tenant_id = $1 AND case_id = $2 ORDER BY created_at`,
        [tenantId, id],
      );
      return c.json({ events: result.rows });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  // ─── Reports ───
  app.get("/api/reports/:id", async (c) => {
    try {
      const { tenantId } = await getPrincipal(db);
      const id = c.req.param("id");
      const result = await db.query("SELECT * FROM integrity_reports WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
      if (result.rows.length === 0) return c.json({ error: "Report not found" }, 404);
      return c.json(result.rows[0]);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.get("/api/reports/:id/markdown", async (c) => {
    try {
      const { tenantId } = await getPrincipal(db);
      const id = c.req.param("id");
      const result = await db.query("SELECT report_markdown FROM integrity_reports WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
      if (result.rows.length === 0) return c.json({ error: "Report not found" }, 404);
      return c.body(result.rows[0].report_markdown, 200, { "Content-Type": "text/markdown" });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.post("/api/reports/:id/authorize", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const id = c.req.param("id");
      const authorized = await db.transaction(async (client) => {
        const result = await client.query(
          `UPDATE integrity_reports SET status = 'authorized', authorized_by = $1, authorized_at = now() WHERE id = $2 AND tenant_id = $3 AND status IN ('generated', 'human_review') RETURNING case_id, authorized_by`,
          [userId, id, tenantId],
        );
        const row = result.rows[0];
        if (!row) return null;
        await recordAuditEvent(db, { tenantId, caseId: row.case_id, actor: userId, action: "report_authorized", humanAuthorizedBy: row.authorized_by, result: { reportId: id, status: "authorized" } });
        return row;
      });
      if (!authorized) return c.json({ error: "Report not found or not eligible for authorization" }, 404);
      return c.json({ id, status: "authorized" });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.post("/api/reports/:id/publish", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const id = c.req.param("id");
      const published = await db.transaction(async (client) => {
        const loc = await client.query("SELECT case_id FROM integrity_reports WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
        const caseId = loc.rows[0]?.case_id;
        if (!caseId) return null;
        await client.query("SELECT pg_advisory_xact_lock(hashtextextended('fairprocess-report:' || $1, 0))", [caseId]);
        const result = await client.query(
          `UPDATE integrity_reports SET status = 'published', published_at = now() WHERE id = $1 AND tenant_id = $2 AND status = 'authorized' AND authorized_by IS NOT NULL AND authorized_at IS NOT NULL RETURNING case_id, authorized_by`,
          [id, tenantId],
        );
        const row = result.rows[0];
        if (!row) return null;
        await client.query(`UPDATE integrity_reports SET status = 'superseded', superseded_by = $1 WHERE case_id = $2 AND tenant_id = $3 AND id <> $1 AND status = 'published'`, [id, row.case_id, tenantId]);
        await recordAuditEvent(db, { tenantId, caseId: row.case_id, actor: userId, action: "report_published", humanAuthorizedBy: row.authorized_by, result: { reportId: id, status: "published" } });
        return row;
      });
      if (!published) return c.json({ error: "Report not found or not authorized" }, 404);
      return c.json({ id, status: "published" });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  // ─── Policies ───
  app.get("/api/policies", async (c) => {
    try {
      const { rows } = await db.query(`SELECT id, jurisdiction, policy_version, activation_status, created_at FROM policy_bundles ORDER BY created_at DESC`);
      return c.json({ policies: rows });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.get("/api/policies/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const result = await db.query("SELECT * FROM policy_bundles WHERE id = $1", [id]);
      if (result.rows.length === 0) return c.json({ error: "Policy not found" }, 404);
      return c.json(result.rows[0]);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.post("/api/policies", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const body = await c.req.json();
      const id = randomUUID();
      const activationStatus = body.activationStatus ?? "draft";
      if (!["draft", "legal_review_required"].includes(activationStatus))
        return c.json({ error: "invalid_request", message: "Policy creation cannot bypass governed activation" }, 400);
      await db.transaction(async (client) => {
        await client.query(
          `INSERT INTO policy_bundles (id, jurisdiction, policy_version, activation_status, rules) VALUES ($1, $2, $3, $4, $5)`,
          [id, body.jurisdiction, body.policyVersion, activationStatus, JSON.stringify(body.rules ?? [])],
        );
        await recordAuditEvent(db, { tenantId, actor: userId, action: "policy_created", policyVersion: body.policyVersion, result: { policyBundleId: id, activationStatus } });
      });
      return c.json({ id, status: activationStatus }, 201);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.patch("/api/policies/:id/activate", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const id = c.req.param("id");
      const activation = await db.transaction(async (client) => {
        const loc = await client.query("SELECT jurisdiction FROM policy_bundles WHERE id = $1", [id]);
        const jurisdiction = loc.rows[0]?.jurisdiction;
        if (!jurisdiction) return null;
        await client.query("SELECT pg_advisory_xact_lock(hashtextextended('fairprocess-policy:' || $1, 0))", [jurisdiction]);
        const target = await client.query(`SELECT jurisdiction, policy_version, activation_status FROM policy_bundles WHERE id = $1 FOR UPDATE`, [id]);
        const row = target.rows[0];
        if (!row) return null;
        const superseded = await client.query(`UPDATE policy_bundles SET activation_status = 'superseded' WHERE jurisdiction = $1 AND id <> $2 AND activation_status = 'active' RETURNING id`, [row.jurisdiction, id]);
        await client.query(`UPDATE policy_bundles SET activation_status = 'active', activated_at = now(), activated_by = $1 WHERE id = $2`, [userId, id]);
        const result = { jurisdiction: row.jurisdiction, policyVersion: row.policy_version, previousStatus: row.activation_status, supersededPolicyIds: superseded.rows.map((p: any) => p.id) };
        await recordAuditEvent(db, { tenantId, actor: userId, action: "policy_activated", policyVersion: result.policyVersion, result: { policyBundleId: id, jurisdiction: result.jurisdiction, previousStatus: result.previousStatus, supersededPolicyIds: result.supersededPolicyIds } });
        return result;
      });
      if (!activation) return c.json({ error: "Policy not found" }, 404);
      return c.json({ id, status: "active", supersededPolicyIds: activation.supersededPolicyIds });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  // ─── Records Requests ───
  app.get("/api/records-requests", async (c) => {
    try {
      const { tenantId } = await getPrincipal(db);
      const { rows } = await db.query("SELECT * FROM public_records_requests WHERE tenant_id = $1 ORDER BY created_at DESC", [tenantId]);
      return c.json({ requests: rows });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.post("/api/records-requests", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const body = await c.req.json();
      const id = randomUUID();
      await db.query(
        `INSERT INTO public_records_requests (id, case_id, tenant_id, agency, submitted_on, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, body.caseId ?? null, tenantId, body.agency, body.submittedOn ?? null, body.status ?? "draft", body.notes ?? null],
      );
      await recordAuditEvent(db, { tenantId, caseId: body.caseId ?? undefined, actor: userId, action: "records_request_created", result: { requestId: id } });
      return c.json({ id }, 201);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.patch("/api/records-requests/:id", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const id = c.req.param("id");
      const body = await c.req.json();
      const updates: string[] = [];
      const values: unknown[] = [];
      let param = 1;
      for (const field of ["status", "notes", "submitted_on"]) {
        if (body[field] !== undefined) { updates.push(`${field} = $${param++}`); values.push(body[field]); }
      }
      if (updates.length === 0) return c.json({ error: "No fields to update" }, 400);
      values.push(id, tenantId);
      const result = await db.query(`UPDATE public_records_requests SET ${updates.join(", ")} WHERE id = $${param++} AND tenant_id = $${param++} RETURNING case_id`, values);
      if (result.rows.length === 0) return c.json({ error: "Request not found" }, 404);
      await recordAuditEvent(db, { tenantId, caseId: result.rows[0].case_id ?? undefined, actor: userId, action: "records_request_updated", result: { requestId: id, changes: body } });
      return c.json({ id, updated: true });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  // ─── Correspondence ───
  app.post("/api/cases/:id/correspondence", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const id = c.req.param("id");
      const body = await c.req.json();
      const correspondenceId = randomUUID();
      await db.query(
        `INSERT INTO correspondence (id, case_id, tenant_id, direction, channel, subject, body, drafted_by_ai, ai_version) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [correspondenceId, id, tenantId, body.direction ?? "outgoing", body.channel ?? "email", body.subject, body.body, body.draftedByAi ?? true, body.aiVersion ?? null],
      );
      await recordAuditEvent(db, { tenantId, caseId: id, actor: userId, action: "correspondence_drafted", result: { correspondenceId, direction: body.direction } });
      return c.json({ id: correspondenceId }, 201);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  app.post("/api/correspondence/:id/authorize", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const id = c.req.param("id");
      const result = await db.query(`UPDATE correspondence SET authorized_by = $1, authorized_at = now() WHERE id = $2 AND tenant_id = $3 RETURNING case_id`, [userId, id, tenantId]);
      if (result.rows.length === 0) return c.json({ error: "Correspondence not found" }, 404);
      await recordAuditEvent(db, { tenantId, caseId: result.rows[0].case_id ?? undefined, actor: userId, action: "correspondence_authorized", humanAuthorizedBy: userId, result: { correspondenceId: id } });
      return c.json({ id, authorized: true });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });


  // ─── Policy Studio: Rules ───────────────────────────────────────

  // List rules with filters
  app.get("/api/rules", async (c) => {
    try {
      const { tenantId } = await getPrincipal(db);
      const jurisdiction = c.req.query("jurisdiction");
      const category = c.req.query("category");
      const status = c.req.query("status");
      const statute = c.req.query("statute");

      let sql = `SELECT id, jurisdiction, statute_reference, enabling_authority, category::text AS category,
        plain_language_description, trigger_event, comparison_event, comparison_operator::text AS comparison_operator,
        threshold_value, threshold_unit::text AS threshold_unit, severity_if_violated::text AS severity_if_violated,
        status::text AS status, effective_start_date, effective_end_date, superseded_by, author, reviewer,
        created_at, last_modified_at
        FROM policy_rules WHERE tenant_id = $1`;
      const params: unknown[] = [tenantId];
      let pi = 2;
      if (jurisdiction) { sql += ` AND jurisdiction = $${pi++}`; params.push(jurisdiction); }
      if (category) { sql += ` AND category = $${pi++}::rule_category`; params.push(category); }
      if (status) { sql += ` AND status = $${pi++}::rule_status`; params.push(status); }
      if (statute) { sql += ` AND statute_reference ILIKE $${pi++}`; params.push(`%${statute}%`); }
      sql += ` ORDER BY created_at DESC`;

      const { rows } = await db.query(sql, params);
      return c.json({ rules: rows });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  // Create a new rule (always starts as draft)
  app.post("/api/rules", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const body = await c.req.json();
      const id = randomUUID();

      await db.transaction(async (client) => {
        await client.query(
          `INSERT INTO policy_rules (id, tenant_id, jurisdiction, statute_reference, enabling_authority,
            category, plain_language_description, trigger_event, comparison_event, comparison_operator,
            threshold_value, threshold_unit, severity_if_violated, status, author)
           VALUES ($1, $2, $3, $4, $5, $6::rule_category, $7, $8, $9, $10::comparison_operator,
            $11, $12::threshold_unit, $13::rule_severity, 'draft'::rule_status, $14)`,
          [id, tenantId, body.jurisdiction, body.statuteReference, body.enablingAuthority ?? null,
           body.category, body.plainLanguageDescription, body.triggerEvent, body.comparisonEvent,
           body.comparisonOperator, body.thresholdValue, body.thresholdUnit, body.severityIfViolated, userId]
        );
        await recordAuditEvent(db, { tenantId, actor: userId, action: "rule_created" as any,
          result: { ruleId: id, jurisdiction: body.jurisdiction, statuteReference: body.statuteReference, category: body.category } });
      });
      return c.json({ id, status: "draft" }, 201);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  // Public changelog (all rules, reverse chronological)
  app.get("/api/rules/changelog", async (c) => {
    try {
      const { tenantId } = await getPrincipal(db);
      const { rows } = await db.query(
        `SELECT cl.id, cl.rule_id, cl.version_number, cl.change_summary, cl.enabling_authority_citation,
          cl.changed_by, cl.reviewed_by, cl.published_at,
          r.jurisdiction, r.statute_reference, r.plain_language_description
         FROM rule_changelog_entries cl
         JOIN policy_rules r ON cl.rule_id = r.id
         WHERE r.tenant_id = $1
         ORDER BY cl.published_at DESC`, [tenantId]);
      return c.json({ entries: rows });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  // Get rule details with changelog
  app.get("/api/rules/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const ruleResult = await db.query(
        `SELECT id, jurisdiction, statute_reference, enabling_authority, category::text AS category,
          plain_language_description, trigger_event, comparison_event, comparison_operator::text AS comparison_operator,
          threshold_value, threshold_unit::text AS threshold_unit, severity_if_violated::text AS severity_if_violated,
          status::text AS status, effective_start_date, effective_end_date, superseded_by, author, reviewer,
          created_at, last_modified_at
          FROM policy_rules WHERE id = $1`, [id]);
      if (ruleResult.rows.length === 0) return c.json({ error: "Rule not found" }, 404);

      const changelogResult = await db.query(
        `SELECT id, version_number, change_summary, enabling_authority_citation, changed_by, reviewed_by, published_at
          FROM rule_changelog_entries WHERE rule_id = $1 ORDER BY version_number DESC`, [id]);

      return c.json({ ...ruleResult.rows[0], changelog: changelogResult.rows });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  // Update rule (only if draft or in_review)
  app.patch("/api/rules/:id", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const id = c.req.param("id");
      const body = await c.req.json();

      const statusCheck = await db.query("SELECT status::text FROM policy_rules WHERE id = $1", [id]);
      if (statusCheck.rows.length === 0) return c.json({ error: "Rule not found" }, 404);
      if (["active", "superseded", "archived"].includes(statusCheck.rows[0].status))
        return c.json({ error: "cannot_edit_published", message: "Published rules cannot be edited. Create a new version." }, 400);

      const fields: string[] = [];
      const params: unknown[] = [];
      let pi = 1;
      const fieldMap: Record<string, string> = {
        jurisdiction: "jurisdiction", statuteReference: "statute_reference",
        enablingAuthority: "enabling_authority", plainLanguageDescription: "plain_language_description",
        triggerEvent: "trigger_event", comparisonEvent: "comparison_event",
        thresholdValue: "threshold_value", effectiveStartDate: "effective_start_date",
        effectiveEndDate: "effective_end_date", reviewer: "reviewer"
      };
      const enumMap: Record<string, string> = {
        category: "rule_category", comparisonOperator: "comparison_operator",
        thresholdUnit: "threshold_unit", severityIfViolated: "rule_severity"
      };

      for (const [k, v] of Object.entries(body)) {
        if (fieldMap[k]) {
          fields.push(`${fieldMap[k]} = $${pi++}`);
          params.push(v);
        } else if (enumMap[k]) {
          fields.push(`${enumMap[k].replace(/([A-Z])/g, '_$1').toLowerCase()} = $${pi++}::${enumMap[k]}`);
          params.push(v);
        }
      }

      if (fields.length === 0) return c.json({ error: "no_fields_to_update" }, 400);
      params.push(id);
      await db.query(`UPDATE policy_rules SET ${fields.join(", ")} WHERE id = $${pi}`, params);
      return c.json({ id, updated: true });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  // Submit rule for review (draft → in_review)
  app.post("/api/rules/:id/submit-review", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const id = c.req.param("id");
      await db.query("UPDATE policy_rules SET status = 'in_review'::rule_status WHERE id = $1 AND status = 'draft'::rule_status", [id]);
      return c.json({ id, status: "in_review" });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  // Publish rule (in_review → active) with guardrails
  app.post("/api/rules/:id/publish", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const id = c.req.param("id");
      const body = await c.req.json();
      const reviewer = body.reviewer ?? userId;

      // Guardrail 1: author ≠ reviewer
      if (reviewer === userId) {
        return c.json({ error: "self_review_prohibited", message: "Publishing requires a second-party sign-off (author ≠ reviewer)." }, 400);
      }

      // Guardrail 2: enabling_authority required
      const rule = await db.query("SELECT author, enabling_authority, jurisdiction, statute_reference, status::text AS status FROM policy_rules WHERE id = $1", [id]);
      if (rule.rows.length === 0) return c.json({ error: "Rule not found" }, 404);
      if (!rule.rows[0].enabling_authority) {
        return c.json({ error: "missing_authority", message: "A rule cannot reach active without an enabling authority citation." }, 400);
      }
      if (!["draft", "in_review"].includes(rule.rows[0].status)) {
        return c.json({ error: "not_publishable", message: "Only draft or in_review rules can be published." }, 400);
      }

      const jurisdiction = rule.rows[0].jurisdiction;

      const result = await db.transaction(async (client) => {
        // Lock the jurisdiction to prevent concurrent publishes
        await client.query("SELECT pg_advisory_xact_lock(hashtextextended('fairprocess-rules:' || $1, 0))", [jurisdiction]);

        // Supersede any prior active rule with the same jurisdiction + statute_reference
        const superseded = await client.query(
          `UPDATE policy_rules SET status = 'superseded'::rule_status, effective_end_date = CURRENT_DATE,
            superseded_by = $1
           WHERE jurisdiction = $2 AND statute_reference = $3 AND status = 'active'::rule_status AND id <> $1
           RETURNING id, (SELECT version_number FROM rule_changelog_entries WHERE rule_id = policy_rules.id ORDER BY version_number DESC LIMIT 1) as last_version`,
          [id, jurisdiction, rule.rows[0].statute_reference]
        );

        // Activate the new rule — respect provided effective_start_date or existing value
        const effectiveStart = body.effectiveStartDate ?? null;
        if (effectiveStart) {
          await client.query(
            `UPDATE policy_rules SET status = 'active'::rule_status, effective_start_date = $1, reviewer = $2
             WHERE id = $3`, [effectiveStart, reviewer, id]);
        } else {
          await client.query(
            `UPDATE policy_rules SET status = 'active'::rule_status, effective_start_date = COALESCE(effective_start_date, CURRENT_DATE), reviewer = $1
             WHERE id = $2`, [reviewer, id]);
        }

        // Compute version number
        const versionResult = await client.query(
          "SELECT COALESCE(MAX(version_number), 0) + 1 AS next_version FROM rule_changelog_entries WHERE rule_id = $1", [id]);
        const versionNumber = versionResult.rows[0].next_version;

        // Write changelog entry
        const changelogId = randomUUID();
        await client.query(
          `INSERT INTO rule_changelog_entries (id, rule_id, version_number, change_summary, enabling_authority_citation, changed_by, reviewed_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [changelogId, id, versionNumber, body.changeSummary ?? "Initial publication",
           rule.rows[0].enabling_authority, userId, reviewer]);

        // Record audit events
        await recordAuditEvent(db, { tenantId, actor: userId, action: "rule_published" as any,
          result: { ruleId: id, version: versionNumber, jurisdiction, statuteReference: rule.rows[0].statute_reference } });

        if (superseded.rows.length > 0) {
          await recordAuditEvent(db, { tenantId, actor: userId, action: "rule_superseded" as any,
            result: { newRuleId: id, supersededRuleIds: superseded.rows.map((r: any) => r.id) } });
        }

        return { id, status: "active", version: versionNumber, supersededRules: superseded.rows.map((r: any) => r.id) };
      });

      return c.json(result);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  // Impact preview: which active cases would be re-evaluated
  app.post("/api/rules/:id/impact-preview", async (c) => {
    try {
      const { tenantId } = await getPrincipal(db);
      const id = c.req.param("id");
      const rule = await db.query("SELECT jurisdiction, statute_reference FROM policy_rules WHERE id = $1", [id]);
      if (rule.rows.length === 0) return c.json({ error: "Rule not found" }, 404);

      const { rows } = await db.query(
        `SELECT c.id, c.jurisdiction, c.agency_case_number, c.as_of
         FROM cases c
         WHERE c.tenant_id = $1 AND c.jurisdiction = $2
         ORDER BY c.created_at DESC`, [tenantId, rule.rows[0].jurisdiction]);

      return c.json({ ruleId: id, affectedCases: rows, count: rows.length });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  // Evaluate a case against all active rules for its jurisdiction
  app.post("/api/cases/:id/evaluate-rules", async (c) => {
    try {
      const { tenantId, userId } = await getPrincipal(db);
      const caseId = c.req.param("id");

      // Get case info
      const caseResult = await db.query("SELECT id, jurisdiction, as_of FROM cases WHERE id = $1 AND tenant_id = $2", [caseId, tenantId]);
      if (caseResult.rows.length === 0) return c.json({ error: "Case not found" }, 404);
      const caseData = caseResult.rows[0];

      // Get active rules for this jurisdiction
      const rulesResult = await db.query(
        `SELECT id, statute_reference, trigger_event, comparison_event, comparison_operator,
          threshold_value, threshold_unit, severity_if_violated, plain_language_description
         FROM policy_rules
         WHERE tenant_id = $1 AND jurisdiction = $2 AND status = 'active'::rule_status
           AND (effective_start_date IS NULL OR effective_start_date <= $3)
           AND (effective_end_date IS NULL OR effective_end_date >= $3)`,
        [tenantId, caseData.jurisdiction, caseData.as_of]);

      if (rulesResult.rows.length === 0) {
        return c.json({ caseId, evaluated: 0, results: [], message: "No active rules found for this jurisdiction" });
      }

      // Get all verified facts for this case
      const factsResult = await db.query(
        "SELECT fact_key, fact_value FROM verified_facts WHERE case_id = $1", [caseId]);
      const factMap: Record<string, string> = {};
      for (const f of factsResult.rows) {
        factMap[f.fact_key] = f.fact_value;
      }

      const results: any[] = [];
      for (const rule of rulesResult.rows) {
        const triggerDateStr = factMap[rule.trigger_event];
        const comparisonDateStr = factMap[rule.comparison_event];

        let compliant = false;
        let violationDetail = "";
        let daysBetween: number | null = null;
        let triggerDate: string | null = null;
        let comparisonDate: string | null = null;

        if (!triggerDateStr || !comparisonDateStr) {
          violationDetail = `Missing event data: ${!triggerDateStr ? rule.trigger_event : rule.comparison_event} not found in case facts`;
        } else {
          triggerDate = triggerDateStr;
          comparisonDate = comparisonDateStr;
          const t1 = new Date(triggerDateStr);
          const t2 = new Date(comparisonDateStr);
          const diffMs = t2.getTime() - t1.getTime();
          daysBetween = Math.round(diffMs / (1000 * 60 * 60 * 24));

          if (rule.threshold_unit === "business_days") {
            // Approximate: business days = calendar days - weekends
            daysBetween = Math.round(daysBetween * 5 / 7);
          }

          switch (rule.comparison_operator) {
            case "at_most":   compliant = daysBetween <= rule.threshold_value; break;
            case "at_least":  compliant = daysBetween >= rule.threshold_value; break;
            case "exactly":   compliant = daysBetween === rule.threshold_value; break;
            case "before":    compliant = daysBetween < rule.threshold_value; break;
            case "after":     compliant = daysBetween > rule.threshold_value; break;
          }
          if (!compliant) {
            violationDetail = `${rule.comparison_event} occurred ${daysBetween} ${rule.threshold_unit} after ${rule.trigger_event}; rule requires ${rule.comparison_operator} ${rule.threshold_value} ${rule.threshold_unit}`;
          }
        }

        // Upsert evaluation result
        const evalId = randomUUID();
        await db.query(
          `INSERT INTO rule_evaluation_results (id, case_id, rule_id, tenant_id, trigger_event_date, comparison_event_date,
            days_between, threshold_value, threshold_unit, comparison_operator, compliant, violation_detail, severity, evaluated_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::threshold_unit, $10::comparison_operator, $11, $12, $13::rule_severity, $14)
           ON CONFLICT (case_id, rule_id) DO UPDATE SET
            trigger_event_date = EXCLUDED.trigger_event_date,
            comparison_event_date = EXCLUDED.comparison_event_date,
            days_between = EXCLUDED.days_between,
            threshold_value = EXCLUDED.threshold_value,
            compliant = EXCLUDED.compliant,
            violation_detail = EXCLUDED.violation_detail,
            evaluated_at = now()`,
          [evalId, caseId, rule.id, tenantId, triggerDate, comparisonDate, daysBetween,
           rule.threshold_value, rule.threshold_unit, rule.comparison_operator,
           compliant, violationDetail, rule.severity_if_violated, userId]);

        results.push({
          ruleId: rule.id, statuteReference: rule.statute_reference,
          plainLanguageDescription: rule.plain_language_description,
          triggerEvent: rule.trigger_event, comparisonEvent: rule.comparison_event,
          daysBetween, compliant, violationDetail,
          severity: rule.severity_if_violated
        });
      }

      // Record audit event
      await db.transaction(async (client) => {
        await recordAuditEvent(db, { tenantId, caseId, actor: userId, action: "case_evaluated" as any,
          result: { caseId, rulesEvaluated: results.length, compliant: results.filter(r => r.compliant).length,
                    nonCompliant: results.filter(r => !r.compliant).length } });
      });

      return c.json({ caseId, evaluated: results.length, results });
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });


  // ─── Audit Chain Verification ───


  app.get("/api/audit/verify-chain", async (c) => {
    try {
      const { tenantId } = await getPrincipal(db);
      const result = await verifyAuditChain(db, tenantId);
      return c.json(result);
    } catch (e: any) { return c.json({ error: e.message, stack: e.stack }, 500); }
  });

  return app;
}

// ─── Worker Entry ──────────────────────────────────────────────────
interface Env {
  DATABASE_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const db = new DatabaseAdapter(env.DATABASE_URL);
    const app = createApp(db);
    return app.fetch(request, env, ctx);
  },
};
