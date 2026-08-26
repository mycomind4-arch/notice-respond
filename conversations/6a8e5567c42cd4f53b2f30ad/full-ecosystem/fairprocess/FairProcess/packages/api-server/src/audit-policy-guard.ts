import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Database } from "@fairprocess/database";

export function installAuditPolicyGuard(app: FastifyInstance, database: Database): void {
  app.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    const routeKey = `${request.method.toUpperCase()} ${request.routeOptions.url}`;
    if (routeKey !== "POST /api/cases/:id/audit") return;

    const body = request.body as { policyBundleId?: unknown } | null;
    if (body?.policyBundleId === undefined) return;
    if (typeof body.policyBundleId !== "string" || body.policyBundleId.length === 0) return;

    const { id: caseId } = request.params as { id: string };
    const result = await database.query(
      `SELECT 1
       FROM policy_bundles policy
       JOIN cases audit_case
         ON audit_case.id = $2
        AND audit_case.jurisdiction = policy.jurisdiction
       WHERE policy.id = $1
         AND policy.activation_status = 'active'`,
      [body.policyBundleId, caseId],
    );
    if (result.rows.length > 0) return;

    return reply.code(404).send({
      error: "No active policy bundle found for this case's jurisdiction",
    });
  });
}
