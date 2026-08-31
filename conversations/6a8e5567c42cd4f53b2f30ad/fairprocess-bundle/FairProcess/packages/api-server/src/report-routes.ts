import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getDatabase, recordAuditEvent, type Database } from "@fairprocess/database";
import { requirePrincipal } from "./auth-plugin.js";
import { notifyRuthOfAuthorizedReport } from "./ruth-notifier.js";

const db: Database = getDatabase();

type AuthorizedReport = {
  case_id: string;
  authorized_by: string;
};

function requireTenant(request: FastifyRequest): { tenantId: string; actorId: string } {
  const principal = requirePrincipal(request);
  return { tenantId: principal.tenantId, actorId: principal.userId };
}

export async function reportRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/reports/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = requireTenant(request);
    const { id } = request.params as { id: string };
    const result = await db.query(
      "SELECT * FROM integrity_reports WHERE id = $1 AND tenant_id = $2",
      [id, tenantId],
    );
    if (result.rows.length === 0) return reply.code(404).send({ error: "Report not found" });
    return reply.send(result.rows[0]);
  });

  app.get("/api/reports/:id/markdown", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = requireTenant(request);
    const { id } = request.params as { id: string };
    const result = await db.query<{ report_markdown: string }>(
      "SELECT report_markdown FROM integrity_reports WHERE id = $1 AND tenant_id = $2",
      [id, tenantId],
    );
    if (result.rows.length === 0) return reply.code(404).send({ error: "Report not found" });
    return reply.type("text/markdown").send(result.rows[0]!.report_markdown);
  });

  app.post("/api/reports/:id/authorize", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId, actorId } = requireTenant(request);
    const { id } = request.params as { id: string };

    const authorized = await db.transaction<AuthorizedReport | null>(async (client) => {
      const result = await client.query<AuthorizedReport>(
        `UPDATE integrity_reports
         SET status = 'authorized', authorized_by = $1, authorized_at = now()
         WHERE id = $2
           AND tenant_id = $3
           AND status IN ('generated', 'human_review')
         RETURNING case_id, authorized_by`,
        [actorId, id, tenantId],
      );
      const row = result.rows[0];
      if (!row) return null;

      await recordAuditEvent(db, {
        tenantId,
        caseId: row.case_id,
        actor: actorId,
        action: "report_authorized",
        humanAuthorizedBy: row.authorized_by,
        result: { reportId: id, status: "authorized" },
      });

      return row;
    });

    if (!authorized) {
      return reply.code(404).send({ error: "Report not found or not eligible for authorization" });
    }

    notifyRuthOfAuthorizedReport({ caseId: authorized.case_id, reportId: id }).catch(() => {});

    return reply.send({ id, status: "authorized" });
  });

  app.post("/api/reports/:id/publish", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId, actorId } = requireTenant(request);
    const { id } = request.params as { id: string };

    const published = await db.transaction<AuthorizedReport | null>(async (client) => {
      const location = await client.query<{ case_id: string }>(
        "SELECT case_id FROM integrity_reports WHERE id = $1 AND tenant_id = $2",
        [id, tenantId],
      );
      const caseId = location.rows[0]?.case_id;
      if (!caseId) return null;

      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended('fairprocess-report:' || $1, 0))",
        [caseId],
      );

      const result = await client.query<AuthorizedReport>(
        `UPDATE integrity_reports
         SET status = 'published', published_at = now()
         WHERE id = $1
           AND tenant_id = $2
           AND status = 'authorized'
           AND authorized_by IS NOT NULL
           AND authorized_at IS NOT NULL
         RETURNING case_id, authorized_by`,
        [id, tenantId],
      );
      const row = result.rows[0];
      if (!row) return null;

      await client.query(
        `UPDATE integrity_reports
         SET status = 'superseded', superseded_by = $1
         WHERE case_id = $2
           AND tenant_id = $3
           AND id <> $1
           AND status = 'published'`,
        [id, row.case_id, tenantId],
      );

      await recordAuditEvent(db, {
        tenantId,
        caseId: row.case_id,
        actor: actorId,
        action: "report_published",
        humanAuthorizedBy: row.authorized_by,
        result: { reportId: id, status: "published" },
      });

      return row;
    });

    if (!published) {
      return reply.code(404).send({ error: "Report not found or not authorized" });
    }

    return reply.send({ id, status: "published" });
  });
}
