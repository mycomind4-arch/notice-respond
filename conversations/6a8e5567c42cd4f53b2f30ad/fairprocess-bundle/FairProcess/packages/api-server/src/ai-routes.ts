import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AiClient } from "./ai-client.js";
import { requirePrincipal } from "./auth-plugin.js";

function requireTenant(request: FastifyRequest): { tenantId: string; actorId: string } {
  const principal = requirePrincipal(request);
  return { tenantId: principal.tenantId, actorId: principal.userId };
}

export async function aiRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/ai/classify-document", async (request: FastifyRequest, reply: FastifyReply) => {
    requireTenant(request);
    const aiClient = AiClient.fromEnv();
    if (!aiClient) {
      return reply.code(503).send({ error: "AI client is not configured" });
    }

    const body = request.body as {
      documentText: string;
      caseContext?: { jurisdiction?: string; agency?: string };
    };

    try {
      const result = await aiClient.classifyDocument(body);
      return reply.send(result);
    } catch (err) {
      request.log.error(err, "classifyDocument failed");
      return reply.code(500).send({ error: (err as Error).message });
    }
  });

  app.post("/api/ai/deadline-watchdog", async (request: FastifyRequest, reply: FastifyReply) => {
    requireTenant(request);
    const aiClient = AiClient.fromEnv();
    if (!aiClient) {
      return reply.code(503).send({ error: "AI client is not configured" });
    }

    const body = request.body as {
      facts: Array<{ factType: string; dataType: string; proposedValue: string; normalizedValue: string; excerpt: string; confidence: number }>;
      jurisdiction: string;
      policyRules?: Array<{ citation: string; instrumentKind: string; triggerField: string; earliestCalendarDaysAfterTrigger: number | null; maximumCalendarDaysAfterTrigger: number | null }>;
      asOfDate?: string;
    };

    try {
      const result = await aiClient.deadlineWatchdog(body);
      return reply.send(result);
    } catch (err) {
      request.log.error(err, "deadlineWatchdog failed");
      return reply.code(500).send({ error: (err as Error).message });
    }
  });

  app.post("/api/ai/draft-narrative", async (request: FastifyRequest, reply: FastifyReply) => {
    requireTenant(request);
    const aiClient = AiClient.fromEnv();
    if (!aiClient) {
      return reply.code(503).send({ error: "AI client is not configured" });
    }

    const body = request.body as {
      reportJson: Record<string, unknown>;
      caseContext?: { jurisdiction?: string; agency?: string; agencyCaseNumber?: string; apns?: string[] };
      format: 'legal_brief' | 'summary_memo' | 'public_statement';
    };

    try {
      const result = await aiClient.draftNarrative(body);
      return reply.send(result);
    } catch (err) {
      request.log.error(err, "draftNarrative failed");
      return reply.code(500).send({ error: (err as Error).message });
    }
  });

  app.post("/api/ai/ingest-ordinance", async (request: FastifyRequest, reply: FastifyReply) => {
    requireTenant(request);
    const aiClient = AiClient.fromEnv();
    if (!aiClient) {
      return reply.code(503).send({ error: "AI client is not configured" });
    }

    const body = request.body as {
      ordinanceText: string;
      jurisdiction: string;
      agency?: string;
      sourceUrl?: string;
    };

    try {
      const result = await aiClient.ingestOrdinance(body);
      return reply.send(result);
    } catch (err) {
      request.log.error(err, "ingestOrdinance failed");
      return reply.code(500).send({ error: (err as Error).message });
    }
  });
}
