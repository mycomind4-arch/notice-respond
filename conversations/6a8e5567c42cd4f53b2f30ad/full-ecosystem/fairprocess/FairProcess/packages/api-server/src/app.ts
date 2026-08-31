import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import {
  createOidcTokenVerifierFromEnv,
  type TokenVerifier,
} from "./oidc.js";
import { Database, getDatabase, setDatabase } from "@fairprocess/database";
import { installAuthentication, requirePrincipal } from "./auth-plugin.js";
import { installAuditRouteHandlers } from "./audit-route-handlers.js";
import { installAuditPolicyGuard } from "./audit-policy-guard.js";
import { installRequestValidation } from "./request-validation.js";

export interface BuildAppOptions {
  database?: Database;
  tokenVerifier?: TokenVerifier;
  corsOrigins?: string[];
  policyGovernanceTenantId?: string | null;
  logger?: boolean;
}

function configuredCorsOrigins(): string[] {
  return (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function configuredPolicyGovernanceTenantId(): string | null {
  const value = process.env.POLICY_GOVERNANCE_TENANT_ID?.trim();
  return value || null;
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const database = options.database ?? getDatabase();
  setDatabase(database);

  const tokenVerifier = options.tokenVerifier ?? createOidcTokenVerifierFromEnv();
  const corsOrigins = options.corsOrigins ?? configuredCorsOrigins();
  const policyGovernanceTenantId =
    options.policyGovernanceTenantId === undefined
      ? configuredPolicyGovernanceTenantId()
      : options.policyGovernanceTenantId;
  const app = Fastify({ logger: options.logger ?? true });

  await app.register(cors, {
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  });

  await installAuthentication(app, {
    database,
    tokenVerifier,
    policyGovernanceTenantId,
  });
  installRequestValidation(app);
  installAuditPolicyGuard(app, database);
  installAuditRouteHandlers(app, database);

  const [{ caseWorkflowRoutes }, { reportRoutes }, { policyRoutes }, { aiRoutes }] = await Promise.all([
    import("./case-workflow-routes.js"),
    import("./report-routes.js"),
    import("./policy-routes.js"),
    import("./ai-routes.js"),
  ]);
  await app.register(caseWorkflowRoutes);
  await app.register(reportRoutes);
  await app.register(policyRoutes);
  await app.register(aiRoutes);

  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  app.get("/api", async () => ({
    name: "FairProcess API",
    version: "0.3.0",
    authentication: "OIDC Bearer token",
    endpoints: [
      "GET    /api/me",
      "GET    /api/cases",
      "POST   /api/cases",
      "GET    /api/cases/:id",
      "POST   /api/cases/:id/expectations",
      "POST   /api/cases/:id/recorder-csv",
      "POST   /api/cases/:id/audit",
      "POST   /api/cases/:id/evidence",
      "GET    /api/cases/:id/audit-trail",
      "GET    /api/reports/:id",
      "GET    /api/reports/:id/markdown",
      "POST   /api/reports/:id/authorize",
      "POST   /api/reports/:id/publish",
      "GET    /api/policies",
      "POST   /api/policies",
      "GET    /api/policies/:id",
      "PATCH  /api/policies/:id/activate",
      "GET    /api/records-requests",
      "POST   /api/records-requests",
      "PATCH  /api/records-requests/:id",
      "POST   /api/cases/:id/correspondence",
      "POST   /api/correspondence/:id/authorize",
      "GET    /api/audit/verify-chain",
      "POST   /api/ai/classify-document",
      "POST   /api/ai/deadline-watchdog",
      "POST   /api/ai/draft-narrative",
      "POST   /api/ai/ingest-ordinance",
      "GET    /health",
    ],
  }));

  app.get("/api/me", async (request) => {
    const principal = requirePrincipal(request);
    return {
      userId: principal.userId,
      tenantId: principal.tenantId,
      email: principal.email,
      displayName: principal.displayName,
      roles: principal.roles,
      permissions: principal.permissions,
    };
  });

  return app;
}
