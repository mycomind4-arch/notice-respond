import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  AuthenticationError,
  type TokenVerifier,
  type VerifiedIdentity,
} from "./oidc.js";
import type { Database } from "@fairprocess/database";

export interface AuthPrincipal {
  userId: string;
  tenantId: string;
  issuer: string;
  subject: string;
  email: string | null;
  displayName: string | null;
  roles: string[];
  permissions: string[];
}

declare module "fastify" {
  interface FastifyRequest {
    authPrincipal: AuthPrincipal | null;
  }
}

export interface AuthenticationOptions {
  database: Database;
  tokenVerifier: TokenVerifier;
  policyGovernanceTenantId: string | null;
}

type PrincipalRow = {
  id: string;
  tenant_id: string;
  email: string | null;
  display_name: string | null;
  roles: string[];
  permissions: string[];
};

const PUBLIC_ROUTES = new Set(["GET /health", "GET /api"]);

const ROUTE_PERMISSIONS = new Map<string, string>([
  ["GET /api/me", "authenticated"],
  ["GET /api/cases", "case:read"],
  ["POST /api/cases", "case:write"],
  ["GET /api/cases/:id", "case:read"],
  ["POST /api/cases/:id/expectations", "case:write"],
  ["POST /api/cases/:id/recorder-csv", "case:write"],
  ["POST /api/cases/:id/audit", "audit:run"],
  ["POST /api/cases/:id/evidence", "evidence:write"],
  ["GET /api/cases/:id/audit-trail", "audit:read"],
  ["GET /api/reports/:id", "report:read"],
  ["GET /api/reports/:id/markdown", "report:read"],
  ["POST /api/reports/:id/authorize", "report:authorize"],
  ["POST /api/reports/:id/publish", "report:publish"],
  ["GET /api/policies", "policy:read"],
  ["GET /api/policies/:id", "policy:read"],
  ["POST /api/policies", "policy:write"],
  ["PATCH /api/policies/:id/activate", "policy:activate"],
  ["GET /api/records-requests", "records:read"],
  ["POST /api/records-requests", "records:write"],
  ["PATCH /api/records-requests/:id", "records:write"],
  ["POST /api/cases/:id/correspondence", "correspondence:write"],
  ["POST /api/correspondence/:id/authorize", "correspondence:authorize"],
  ["GET /api/audit/verify-chain", "audit:read"],
  ["POST /api/ai/classify-document", "case:write"],
  ["POST /api/ai/deadline-watchdog", "audit:run"],
  ["POST /api/ai/draft-narrative", "case:write"],
  ["POST /api/ai/ingest-ordinance", "policy:write"],
]);

const CASE_SCOPED_ROUTES = new Set([
  "GET /api/cases/:id",
  "POST /api/cases/:id/expectations",
  "POST /api/cases/:id/recorder-csv",
  "POST /api/cases/:id/audit",
  "POST /api/cases/:id/evidence",
  "GET /api/cases/:id/audit-trail",
  "POST /api/cases/:id/correspondence",
]);

const POLICY_MUTATION_ROUTES = new Set([
  "POST /api/policies",
  "PATCH /api/policies/:id/activate",
]);

function bearerToken(request: FastifyRequest): string | null {
  const authorization = request.headers.authorization;
  if (!authorization) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match?.[1]?.trim() || null;
}

function routeKey(request: FastifyRequest): string {
  return `${request.method.toUpperCase()} ${request.routeOptions.url}`;
}

function can(principal: AuthPrincipal, permission: string): boolean {
  return (
    permission === "authenticated" ||
    principal.permissions.includes("*") ||
    principal.permissions.includes(permission)
  );
}

export async function resolvePrincipal(
  database: Database,
  identity: VerifiedIdentity,
): Promise<AuthPrincipal | null> {
  const result = await database.query<PrincipalRow>(
    `SELECT
       u.id,
       u.tenant_id,
       u.email,
       u.display_name,
       COALESCE(
         array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL),
         ARRAY[]::TEXT[]
       ) AS roles,
       COALESCE(
         array_agg(DISTINCT permission.permission) FILTER (WHERE permission.permission IS NOT NULL),
         ARRAY[]::TEXT[]
       ) AS permissions
     FROM users u
     LEFT JOIN user_roles ur
       ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
     LEFT JOIN roles r
       ON r.id = ur.role_id AND r.tenant_id = u.tenant_id
     LEFT JOIN LATERAL unnest(r.permissions) AS permission(permission) ON TRUE
     WHERE u.oidc_issuer = $1
       AND u.oidc_subject = $2
       AND u.status = 'active'
     GROUP BY u.id, u.tenant_id, u.email, u.display_name`,
    [identity.issuer, identity.subject],
  );

  const row = result.rows[0];
  if (!row) return null;

  await database.query(
    `UPDATE users
     SET last_login_at = now()
     WHERE id = $1
       AND (last_login_at IS NULL OR last_login_at < now() - interval '15 minutes')`,
    [row.id],
  );

  return {
    userId: row.id,
    tenantId: row.tenant_id,
    issuer: identity.issuer,
    subject: identity.subject,
    email: row.email,
    displayName: row.display_name,
    roles: row.roles,
    permissions: row.permissions,
  };
}

function authenticationFailure(
  reply: FastifyReply,
  statusCode: 401 | 403,
  error: string,
  message: string,
): FastifyReply {
  return reply.code(statusCode).send({ error, message });
}

function enforcePolicyGovernance(
  reply: FastifyReply,
  key: string,
  principal: AuthPrincipal,
  policyGovernanceTenantId: string | null,
): FastifyReply | undefined {
  if (!POLICY_MUTATION_ROUTES.has(key)) return undefined;
  if (!policyGovernanceTenantId) {
    return authenticationFailure(
      reply,
      403,
      "policy_governance_not_configured",
      "Policy mutation is disabled until a governance tenant is configured",
    );
  }
  if (principal.tenantId !== policyGovernanceTenantId) {
    return authenticationFailure(
      reply,
      403,
      "policy_governance_tenant_required",
      "Policy mutation is restricted to the configured governance tenant",
    );
  }
  return undefined;
}

async function caseBelongsToTenant(
  database: Database,
  caseId: string,
  tenantId: string,
): Promise<boolean> {
  const result = await database.query(
    "SELECT 1 FROM cases WHERE id = $1 AND tenant_id = $2",
    [caseId, tenantId],
  );
  return result.rows.length > 0;
}

async function enforceObjectAccess(
  database: Database,
  request: FastifyRequest,
  reply: FastifyReply,
  key: string,
  principal: AuthPrincipal,
): Promise<unknown> {
  if (CASE_SCOPED_ROUTES.has(key)) {
    const params = request.params as { id?: unknown };
    const caseId = typeof params.id === "string" ? params.id : "";
    if (!caseId || !(await caseBelongsToTenant(database, caseId, principal.tenantId))) {
      return reply.code(404).send({ error: "Case not found" });
    }
  }

  if (key === "POST /api/records-requests") {
    const body = request.body as { caseId?: unknown } | null;
    if (
      body?.caseId !== undefined &&
      (typeof body.caseId !== "string" ||
        !(await caseBelongsToTenant(database, body.caseId, principal.tenantId)))
    ) {
      return reply.code(404).send({ error: "Case not found" });
    }
  }

  return undefined;
}

export async function installAuthentication(
  app: FastifyInstance,
  options: AuthenticationOptions,
): Promise<void> {
  app.decorateRequest("authPrincipal", null);

  app.addHook("preHandler", async (request, reply) => {
    const key = routeKey(request);
    if (PUBLIC_ROUTES.has(key)) return;

    const token = bearerToken(request);
    if (!token) {
      return authenticationFailure(
        reply,
        401,
        "authentication_required",
        "A Bearer access token is required",
      );
    }

    let identity: VerifiedIdentity;
    try {
      identity = await options.tokenVerifier.verify(token);
    } catch (error) {
      const message =
        error instanceof AuthenticationError
          ? error.message
          : "Access token verification failed";
      request.log.warn({ err: error }, "Bearer token rejected");
      return authenticationFailure(reply, 401, "invalid_access_token", message);
    }

    const principal = await resolvePrincipal(options.database, identity);
    if (!principal) {
      return authenticationFailure(
        reply,
        403,
        "user_not_provisioned",
        "The authenticated identity is not provisioned for FairProcess",
      );
    }
    request.authPrincipal = principal;

    const permission = ROUTE_PERMISSIONS.get(key);
    if (!permission) {
      request.log.error({ route: key }, "Protected route has no authorization policy");
      return authenticationFailure(
        reply,
        403,
        "authorization_policy_missing",
        "Access is denied",
      );
    }
    if (!can(principal, permission)) {
      return authenticationFailure(
        reply,
        403,
        "permission_denied",
        `Permission ${permission} is required`,
      );
    }

    const policyGovernanceFailure = enforcePolicyGovernance(
      reply,
      key,
      principal,
      options.policyGovernanceTenantId,
    );
    if (policyGovernanceFailure) return policyGovernanceFailure;

    return enforceObjectAccess(options.database, request, reply, key, principal);
  });
}

export function requirePrincipal(request: FastifyRequest): AuthPrincipal {
  if (!request.authPrincipal) {
    throw new Error("Authenticated principal was not installed on the request");
  }
  return request.authPrincipal;
}
