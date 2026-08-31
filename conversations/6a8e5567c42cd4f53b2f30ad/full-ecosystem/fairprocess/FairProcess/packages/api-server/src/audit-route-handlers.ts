import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteOptions,
} from "fastify";
import {
  verifyAuditChain,
  type Database,
} from "@fairprocess/database";
import { requirePrincipal } from "./auth-plugin.js";

function includesMethod(
  method: RouteOptions["method"],
  expected: string,
): boolean {
  const methods = Array.isArray(method) ? method : [method];
  return methods.some((value) => String(value).toUpperCase() === expected);
}

export function installAuditRouteHandlers(
  app: FastifyInstance,
  database: Database,
): void {
  app.addHook("onRoute", (routeOptions) => {
    if (
      includesMethod(routeOptions.method, "GET") &&
      routeOptions.url === "/api/audit/verify-chain"
    ) {
      routeOptions.handler = async (
        request: FastifyRequest,
        reply: FastifyReply,
      ) => {
        const principal = requirePrincipal(request);
        const verification = await verifyAuditChain(
          database,
          principal.tenantId,
        );
        return reply.send(verification);
      };
    }

    if (
      includesMethod(routeOptions.method, "GET") &&
      routeOptions.url === "/api/cases/:id/audit-trail"
    ) {
      routeOptions.handler = async (
        request: FastifyRequest,
        reply: FastifyReply,
      ) => {
        const principal = requirePrincipal(request);
        const { id } = request.params as { id: string };
        const result = await database.query(
          `SELECT id, actor, action, source_hashes, policy_version,
                  extraction_version, result, human_authorized_by,
                  prior_event_hash, event_hash, chain_version,
                  sequence_number, occurred_at, canonicalization_version,
                  created_at
             FROM audit_events
            WHERE tenant_id = $1 AND case_id = $2
            ORDER BY created_at, id`,
          [principal.tenantId, id],
        );
        return reply.send({ events: result.rows });
      };
    }
  });
}
