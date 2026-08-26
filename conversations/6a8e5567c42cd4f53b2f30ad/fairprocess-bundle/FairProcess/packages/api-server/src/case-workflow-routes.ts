import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Database, getDatabase, recordAuditEvent } from "@fairprocess/database";
import {
  generateIntegrityReport,
  parseAuditCase,
  parsePolicyBundle,
  parseRecorderCsv,
  renderIntegrityReportMarkdown,
  type ImportedRecorderInstrument,
  type InstrumentKind,
} from "@fairprocess/audit-engine";
import { requirePrincipal } from "./auth-plugin.js";

const db: Database = getDatabase();

function requireTenant(request: FastifyRequest): { tenantId: string; actorId: string } {
  const principal = requirePrincipal(request);
  return { tenantId: principal.tenantId, actorId: principal.userId };
}

export async function caseWorkflowRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/cases", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = requireTenant(request);
    const { rows } = await db.query(
      "SELECT * FROM case_dashboard WHERE tenant_id = $1 ORDER BY created_at DESC",
      [tenantId],
    );
    return reply.send({ cases: rows });
  });

  app.post("/api/cases", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId, actorId } = requireTenant(request);
    const body = request.body as Record<string, unknown>;
    const id = (body.id as string) ?? crypto.randomUUID();

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO cases (id, tenant_id, jurisdiction, agency, agency_case_number, as_of, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'open')`,
        [
          id,
          tenantId,
          body.jurisdiction,
          body.agency ?? null,
          body.agencyCaseNumber ?? null,
          body.asOf,
        ],
      );

      if (Array.isArray(body.apns)) {
        for (const apn of body.apns as string[]) {
          const normalized = apn.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
          await client.query(
            `INSERT INTO case_apns (case_id, apn, normalized)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [id, apn, normalized],
          );
        }
      }

      await recordAuditEvent(db, {
        tenantId,
        caseId: id,
        actor: actorId,
        action: "case_created",
        result: { caseId: id },
      });
    });

    return reply.code(201).send({ id });
  });

  app.get("/api/cases/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = requireTenant(request);
    const { id } = request.params as { id: string };

    const caseResult = await db.query(
      "SELECT * FROM case_dashboard WHERE case_id = $1 AND tenant_id = $2",
      [id, tenantId],
    );
    if (caseResult.rows.length === 0) {
      return reply.code(404).send({ error: "Case not found" });
    }

    const [apns, evidence, facts, expectations, recorderInstruments] = await Promise.all([
      db.query("SELECT * FROM case_apns WHERE case_id = $1", [id]),
      db.query(
        `SELECT id, filename, content_type, size_bytes, sha256, uploaded_by, uploaded_at
         FROM evidence_documents
         WHERE case_id = $1`,
        [id],
      ),
      db.query("SELECT * FROM verified_facts WHERE case_id = $1", [id]),
      db.query("SELECT * FROM instrument_expectations WHERE case_id = $1", [id]),
      db.query("SELECT * FROM recorder_instruments WHERE case_id = $1", [id]),
    ]);

    return reply.send({
      case: caseResult.rows[0],
      apns: apns.rows,
      evidence: evidence.rows,
      facts: facts.rows,
      expectations: expectations.rows,
      recorderInstruments: recorderInstruments.rows,
    });
  });

  app.post(
    "/api/cases/:id/expectations",
    async (request: FastifyRequest, reply: FastifyReply) => {
      requireTenant(request);
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, unknown>;

      const result = await db.query(
        `INSERT INTO instrument_expectations
         (case_id, rule_id, instrument_kind, served_on, became_final_on, resolved_on)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          id,
          body.ruleId,
          body.instrumentKind,
          body.servedOn ?? null,
          body.becameFinalOn ?? null,
          body.resolvedOn ?? null,
        ],
      );

      return reply.code(201).send({ id: result.rows[0]!.id });
    },
  );

  app.post(
    "/api/cases/:id/recorder-csv",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tenantId, actorId } = requireTenant(request);
      const { id } = request.params as { id: string };
      const body = request.body as {
        csv: string;
        searchedOn: string;
        source: string;
        scope: string;
        notes?: string;
      };

      const instruments = parseRecorderCsv(body.csv);

      await db.transaction(async (client) => {
        await client.query(
          `INSERT INTO recorder_searches
           (case_id, searched_on, source, scope, notes, instrument_count)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, body.searchedOn, body.source, body.scope, body.notes ?? null, instruments.length],
        );

        for (const instrument of instruments) {
          await client.query(
            `INSERT INTO recorder_instruments
             (case_id, tenant_id, instrument_number, recorded_on, apn,
              instrument_kind, party, import_source)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              id,
              tenantId,
              instrument.instrumentNumber,
              instrument.recordedOn,
              instrument.apns[0] ?? null,
              instrument.instrumentKind,
              instrument.parties.join(", ") || null,
              "csv_upload",
            ],
          );
        }

        await recordAuditEvent(db, {
          tenantId,
          caseId: id,
          actor: actorId,
          action: "recorder_imported",
          result: { instrumentCount: instruments.length },
        });
      });

      return reply.code(201).send({ imported: instruments.length });
    },
  );

  app.post("/api/cases/:id/audit", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId, actorId } = requireTenant(request);
    const { id } = request.params as { id: string };
    const body = request.body as { policyBundleId?: string };

    let policyResult;
    if (body.policyBundleId) {
      policyResult = await db.query("SELECT * FROM policy_bundles WHERE id = $1", [
        body.policyBundleId,
      ]);
    } else {
      policyResult = await db.query(
        `SELECT *
         FROM policy_bundles
         WHERE jurisdiction = (SELECT jurisdiction FROM cases WHERE id = $1)
           AND activation_status = 'active'
         ORDER BY created_at DESC
         LIMIT 1`,
        [id],
      );
    }

    if (policyResult.rows.length === 0) {
      return reply
        .code(404)
        .send({ error: "No active policy bundle found for this case's jurisdiction" });
    }

    const policyRow = policyResult.rows[0] as Record<string, unknown>;
    const policyBundle = {
      id: policyRow.id as string,
      jurisdiction: policyRow.jurisdiction as string,
      policyVersion: policyRow.policy_version as string,
      activationStatus: policyRow.activation_status as string,
      rules: policyRow.rules as unknown[],
    };

    const caseResult = await db.query(
      "SELECT * FROM cases WHERE id = $1 AND tenant_id = $2",
      [id, tenantId],
    );
    if (caseResult.rows.length === 0) {
      return reply.code(404).send({ error: "Case not found" });
    }
    const caseRow = caseResult.rows[0] as Record<string, unknown>;

    const apnRows = (await db.query("SELECT apn FROM case_apns WHERE case_id = $1", [id])).rows;
    const expectationRows = (
      await db.query("SELECT * FROM instrument_expectations WHERE case_id = $1", [id])
    ).rows;
    const recorderRows = (
      await db.query("SELECT * FROM recorder_instruments WHERE case_id = $1", [id])
    ).rows;
    const searchResult = await db.query(
      `SELECT *
       FROM recorder_searches
       WHERE case_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [id],
    );
    const searchRow = searchResult.rows[0] as Record<string, unknown> | undefined;
    const searchDate = searchRow?.searched_on;
    const searchDateStr =
      searchDate instanceof Date
        ? searchDate.toISOString().slice(0, 10)
        : (searchDate as string | undefined);

    const auditCaseInput = {
      caseId: id,
      jurisdiction: caseRow.jurisdiction as string,
      agencyCaseNumber: (caseRow.agency_case_number as string) ?? undefined,
      asOf:
        caseRow.as_of instanceof Date
          ? caseRow.as_of.toISOString().slice(0, 10)
          : (caseRow.as_of as string),
      apns: apnRows.map((row) => (row as Record<string, string>).apn),
      recorderSearch: {
        searchedOn: searchDateStr ?? new Date().toISOString().slice(0, 10),
        source: (searchRow?.source as string) ?? "database",
        scope: (searchRow?.scope as string) ?? "agency_export",
        notes: (searchRow?.notes as string | null) || undefined,
      },
      expectations: expectationRows.map((expectation) => {
        const row = expectation as Record<string, unknown>;
        const toDateString = (value: unknown): string | undefined =>
          value instanceof Date
            ? value.toISOString().slice(0, 10)
            : typeof value === "string"
              ? value
              : undefined;
        return {
          ruleId: row.rule_id as string,
          instrumentKind: row.instrument_kind as InstrumentKind,
          servedOn: toDateString(row.served_on),
          becameFinalOn: toDateString(row.became_final_on),
          resolvedOn: toDateString(row.resolved_on),
        };
      }),
    };

    const recorderInstruments: ImportedRecorderInstrument[] = recorderRows.map((record) => {
      const row = record as Record<string, unknown>;
      const toDateString = (value: unknown): string =>
        value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
      const apn = row.apn as string | null;
      return {
        instrumentNumber: row.instrument_number as string,
        recordedOn: toDateString(row.recorded_on),
        apns: apn ? [apn] : [],
        instrumentKind: row.instrument_kind as InstrumentKind,
        parties: row.party ? String(row.party).split(", ") : [],
      };
    });

    const parsedCase = parseAuditCase(auditCaseInput);
    const parsedPolicy = parsePolicyBundle(policyBundle);
    const report = generateIntegrityReport(
      parsedCase,
      recorderInstruments,
      parsedPolicy,
      new Date().toISOString(),
    );
    const markdown = renderIntegrityReportMarkdown(report);

    const reportId = await db.transaction(async (client) => {
      const reportResult = await client.query<{ id: string }>(
        `INSERT INTO integrity_reports
         (case_id, tenant_id, policy_bundle_id, report_json, report_markdown, status, summary)
         VALUES ($1, $2, $3, $4, $5, 'generated', $6)
         RETURNING id`,
        [
          id,
          tenantId,
          policyBundle.id,
          JSON.stringify(report),
          markdown,
          JSON.stringify(report.summary),
        ],
      );
      const createdReportId = reportResult.rows[0]!.id;

      await recordAuditEvent(db, {
        tenantId,
        caseId: id,
        actor: actorId,
        action: "audit_run",
        policyVersion: policyBundle.policyVersion,
        result: { reportId: createdReportId, summary: report.summary },
      });

      return createdReportId;
    });

    return reply.code(201).send({
      reportId,
      summary: report.summary,
      findings: report.findings.length,
    });
  });

  app.post("/api/cases/:id/evidence", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId, actorId } = requireTenant(request);
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const evidenceId = crypto.randomUUID();

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO evidence_documents
         (id, case_id, tenant_id, filename, content_type, size_bytes, sha256, storage_path, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          evidenceId,
          id,
          tenantId,
          body.filename,
          body.contentType,
          body.sizeBytes,
          body.sha256,
          body.storagePath,
          actorId,
        ],
      );

      await recordAuditEvent(db, {
        tenantId,
        caseId: id,
        actor: actorId,
        action: "evidence_uploaded",
        sourceHashes: [body.sha256 as string],
        result: { documentId: evidenceId, filename: body.filename },
      });
    });

    return reply.code(201).send({ id: evidenceId });
  });

  app.get(
    "/api/cases/:id/audit-trail",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tenantId } = requireTenant(request);
      const { id } = request.params as { id: string };
      const result = await db.query(
        `SELECT id, actor, action, source_hashes, policy_version, result,
                human_authorized_by, event_hash, created_at
         FROM audit_events
         WHERE tenant_id = $1 AND case_id = $2
         ORDER BY created_at`,
        [tenantId, id],
      );
      return reply.send({ events: result.rows });
    },
  );

  app.get("/api/audit/verify-chain", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = requireTenant(request);
    const priorEvents = await db.query<{
      event_hash: string;
      prior_event_hash: string | null;
      id: string;
    }>(
      `SELECT id, event_hash, prior_event_hash
       FROM audit_events
       WHERE tenant_id = $1
       ORDER BY created_at`,
      [tenantId],
    );

    let valid = true;
    let brokenAt: string | undefined;
    let previousHash: string | null = null;
    for (const row of priorEvents.rows) {
      if (row.prior_event_hash !== previousHash) {
        valid = false;
        brokenAt = row.id;
        break;
      }
      previousHash = row.event_hash;
    }
    return reply.send({ valid, brokenAt, totalEvents: priorEvents.rows.length });
  });

  app.get("/api/records-requests", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = requireTenant(request);
    const result = await db.query(
      `SELECT *
       FROM public_records_requests
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tenantId],
    );
    return reply.send({ requests: result.rows });
  });

  app.post("/api/records-requests", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId, actorId } = requireTenant(request);
    const body = request.body as Record<string, unknown>;
    const id = crypto.randomUUID();

    await db.query(
      `INSERT INTO public_records_requests
       (id, case_id, tenant_id, agency, submitted_on, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        body.caseId ?? null,
        tenantId,
        body.agency,
        body.submittedOn ?? null,
        body.status ?? "draft",
        body.notes ?? null,
      ],
    );

    await recordAuditEvent(db, {
      tenantId,
      caseId: (body.caseId as string) ?? undefined,
      actor: actorId,
      action: "records_request_created",
      result: { requestId: id },
    });

    return reply.code(201).send({ id });
  });

  app.patch(
    "/api/records-requests/:id",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tenantId, actorId } = requireTenant(request);
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, unknown>;

      const updates: string[] = [];
      const values: unknown[] = [];
      let parameter = 1;

      for (const field of ["status", "notes", "submitted_on"]) {
        if (body[field] !== undefined) {
          updates.push(`${field} = $${parameter++}`);
          values.push(body[field]);
        }
      }

      if (updates.length === 0) {
        return reply.code(400).send({ error: "No fields to update" });
      }

      values.push(id, tenantId);
      const result = await db.query(
        `UPDATE public_records_requests
         SET ${updates.join(", ")}
         WHERE id = $${parameter++} AND tenant_id = $${parameter++}
         RETURNING case_id`,
        values,
      );
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: "Request not found" });
      }

      await recordAuditEvent(db, {
        tenantId,
        caseId: (result.rows[0] as Record<string, string | null>).case_id ?? undefined,
        actor: actorId,
        action: "records_request_updated",
        result: { requestId: id, changes: body },
      });

      return reply.send({ id, updated: true });
    },
  );

  app.post(
    "/api/cases/:id/correspondence",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tenantId, actorId } = requireTenant(request);
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, unknown>;
      const correspondenceId = crypto.randomUUID();

      await db.query(
        `INSERT INTO correspondence
         (id, case_id, tenant_id, direction, channel, subject, body, drafted_by_ai, ai_version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          correspondenceId,
          id,
          tenantId,
          body.direction ?? "outgoing",
          body.channel ?? "email",
          body.subject,
          body.body,
          body.draftedByAi ?? true,
          body.aiVersion ?? null,
        ],
      );

      await recordAuditEvent(db, {
        tenantId,
        caseId: id,
        actor: actorId,
        action: "correspondence_drafted",
        result: { correspondenceId, direction: body.direction },
      });

      return reply.code(201).send({ id: correspondenceId });
    },
  );

  app.post(
    "/api/correspondence/:id/authorize",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tenantId, actorId } = requireTenant(request);
      const { id } = request.params as { id: string };

      const result = await db.query(
        `UPDATE correspondence
         SET authorized_by = $1, authorized_at = now()
         WHERE id = $2 AND tenant_id = $3
         RETURNING case_id`,
        [actorId, id, tenantId],
      );
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: "Correspondence not found" });
      }

      await recordAuditEvent(db, {
        tenantId,
        caseId: (result.rows[0] as Record<string, string | null>).case_id ?? undefined,
        actor: actorId,
        action: "correspondence_authorized",
        humanAuthorizedBy: actorId,
        result: { correspondenceId: id },
      });

      return reply.send({ id, authorized: true });
    },
  );
}
