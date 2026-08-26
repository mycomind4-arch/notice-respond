import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getDatabase, recordAuditEvent, type Database } from "@fairprocess/database";
import { requirePrincipal } from "./auth-plugin.js";

const db: Database = getDatabase();
const CREATABLE_POLICY_STATUSES = new Set(["draft", "legal_review_required"]);

type PolicyActivation = {
  jurisdiction: string;
  policyVersion: string;
  previousStatus: string;
  supersededPolicyIds: string[];
};

function requireTenant(request: FastifyRequest): { tenantId: string; actorId: string } {
  const principal = requirePrincipal(request);
  return { tenantId: principal.tenantId, actorId: principal.userId };
}

export async function policyRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/policies", async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = await db.query(
      `SELECT id, jurisdiction, policy_version, activation_status, created_at
       FROM policy_bundles
       ORDER BY created_at DESC`,
    );
    return reply.send({ policies: result.rows });
  });

  app.get("/api/policies/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const result = await db.query("SELECT * FROM policy_bundles WHERE id = $1", [id]);
    if (result.rows.length === 0) return reply.code(404).send({ error: "Policy not found" });
    return reply.send(result.rows[0]);
  });

  app.post("/api/policies", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId, actorId } = requireTenant(request);
    const body = request.body as Record<string, unknown>;
    const id = crypto.randomUUID();
    const activationStatus = (body.activationStatus as string | undefined) ?? "draft";

    if (!CREATABLE_POLICY_STATUSES.has(activationStatus)) {
      return reply.code(400).send({
        error: "invalid_request",
        message: "Policy creation cannot bypass governed activation",
        fields: [
          {
            field: "activationStatus",
            message: "must be one of: draft, legal_review_required",
          },
        ],
      });
    }

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO policy_bundles
         (id, jurisdiction, policy_version, activation_status, rules)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          body.jurisdiction,
          body.policyVersion,
          activationStatus,
          JSON.stringify(body.rules ?? []),
        ],
      );

      await recordAuditEvent(db, {
        tenantId,
        actor: actorId,
        action: "policy_created",
        policyVersion: body.policyVersion as string,
        result: { policyBundleId: id, activationStatus },
      });
    });

    return reply.code(201).send({ id, status: activationStatus });
  });

  app.patch("/api/policies/:id/activate", async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId, actorId } = requireTenant(request);
    const { id } = request.params as { id: string };

    const activation = await db.transaction<PolicyActivation | null>(async (client) => {
      const location = await client.query<{ jurisdiction: string }>(
        "SELECT jurisdiction FROM policy_bundles WHERE id = $1",
        [id],
      );
      const jurisdiction = location.rows[0]?.jurisdiction;
      if (!jurisdiction) return null;

      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended('fairprocess-policy:' || $1, 0))",
        [jurisdiction],
      );

      const target = await client.query<{
        jurisdiction: string;
        policy_version: string;
        activation_status: string;
      }>(
        `SELECT jurisdiction, policy_version, activation_status
         FROM policy_bundles
         WHERE id = $1
         FOR UPDATE`,
        [id],
      );
      const row = target.rows[0];
      if (!row) return null;

      const superseded = await client.query<{ id: string }>(
        `UPDATE policy_bundles
         SET activation_status = 'superseded'
         WHERE jurisdiction = $1
           AND id <> $2
           AND activation_status = 'active'
         RETURNING id`,
        [row.jurisdiction, id],
      );

      await client.query(
        `UPDATE policy_bundles
         SET activation_status = 'active', activated_at = now(), activated_by = $1
         WHERE id = $2`,
        [actorId, id],
      );

      const result = {
        jurisdiction: row.jurisdiction,
        policyVersion: row.policy_version,
        previousStatus: row.activation_status,
        supersededPolicyIds: superseded.rows.map((policy) => policy.id),
      };

      await recordAuditEvent(db, {
        tenantId,
        actor: actorId,
        action: "policy_activated",
        policyVersion: result.policyVersion,
        result: {
          policyBundleId: id,
          jurisdiction: result.jurisdiction,
          previousStatus: result.previousStatus,
          supersededPolicyIds: result.supersededPolicyIds,
        },
      });

      return result;
    });

    if (!activation) return reply.code(404).send({ error: "Policy not found" });

    return reply.send({
      id,
      status: "active",
      supersededPolicyIds: activation.supersededPolicyIds,
    });
  });
}
