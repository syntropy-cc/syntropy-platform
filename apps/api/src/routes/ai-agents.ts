/**
 * AI Agents REST routes (COMP-012.8).
 *
 * POST /api/v1/ai-agents/sessions — create session, return sessionId.
 * GET /api/v1/ai-agents/sessions/:id — get session state.
 * POST /api/v1/ai-agents/sessions/:id/invoke — invoke agent (SSE streaming or JSON).
 * All require auth; invoke is rate-limited to 20 concurrent per user.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { AgentSession } from "@syntropy/ai-agents";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { AiAgentsContext } from "../types/ai-agents-context.js";

const MAX_CONCURRENT_INVOKE_PER_USER = 20;

/** Per-user concurrency count for invoke. */
const invokeConcurrency = new Map<string, number>();

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

interface CreateSessionBody {
  agentId?: string;
}

function isCreateSessionBody(value: unknown): value is CreateSessionBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return o.agentId === undefined || typeof o.agentId === "string";
}

interface InvokeBody {
  message?: string;
}

function isInvokeBody(value: unknown): value is InvokeBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return o.message === undefined || typeof o.message === "string";
}

function sessionToDto(session: AgentSession) {
  return {
    sessionId: session.sessionId,
    userId: session.userId,
    agentId: session.agentId,
    status: session.status,
    historyLength: session.history.length,
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt?.toISOString() ?? null,
  };
}

export async function aiAgentsRoutes(
  fastify: FastifyInstance,
  opts: { aiAgents: AiAgentsContext }
): Promise<void> {
  const { sessionStore, eventPublisher, orchestrator } = opts.aiAgents;
  const requireAuth = fastify.requireAuth;

  fastify.post<{ Body: unknown }>(
    "/api/v1/ai-agents/sessions",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const body = request.body;
      if (body !== undefined && body !== null && !isCreateSessionBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { agentId?: string } or empty.",
            getRequestId(request)
          )
        );
      }
      const agentId = body?.agentId ?? "default";
      const session = AgentSession.create({ userId, agentId });
      await sessionStore.save(session);
      await eventPublisher.publishSessionStarted(
        session.sessionId,
        userId,
        agentId,
        { correlationId: getRequestId(request) }
      );
      return reply.status(201).send(
        successEnvelope({ sessionId: session.sessionId }, getRequestId(request))
      );
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/ai-agents/sessions/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const session = await sessionStore.get(id);
      if (!session) {
        return reply.status(404).send(
          errorEnvelope("NOT_FOUND", "Session not found.", getRequestId(request))
        );
      }
      if (session.userId !== request.user!.userId) {
        return reply.status(403).send(
          errorEnvelope(
            "FORBIDDEN",
            "You do not have access to this session.",
            getRequestId(request)
          )
        );
      }
      return reply
        .status(200)
        .send(successEnvelope(sessionToDto(session), getRequestId(request)));
    }
  );

  fastify.post<{
    Params: { id: string };
    Body: unknown;
  }>(
    "/api/v1/ai-agents/sessions/:id/invoke",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const { id: sessionId } = request.params;
      const body = request.body;
      if (body !== undefined && body !== null && !isInvokeBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { message?: string } or empty.",
            getRequestId(request)
          )
        );
      }
      const message = body?.message ?? "";

      const count = invokeConcurrency.get(userId) ?? 0;
      if (count >= MAX_CONCURRENT_INVOKE_PER_USER) {
        return reply.status(429).send(
          errorEnvelope(
            "RATE_LIMITED",
            "Too many concurrent agent invocations (max 20 per user).",
            getRequestId(request)
          )
        );
      }
      invokeConcurrency.set(userId, count + 1);
      try {
        const stream = orchestrator.invokeStreaming(sessionId, message);
        reply.raw.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        reply.raw.flushHeaders?.();
        for await (const chunk of stream) {
          reply.raw.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
        await eventPublisher.publishInvoked(sessionId, userId, {
          correlationId: getRequestId(request),
        });
        reply.raw.write("data: [DONE]\n\n");
        reply.raw.end();
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes("not found") || err.message.includes("Session not found")) {
            return reply.status(404).send(
              errorEnvelope("NOT_FOUND", err.message, getRequestId(request))
            );
          }
          if (err.message.includes("not active")) {
            return reply.status(409).send(
              errorEnvelope("CONFLICT", err.message, getRequestId(request))
            );
          }
          if (err.message.includes("does not support streaming")) {
            const response = await orchestrator.invoke(sessionId, message);
            await eventPublisher.publishInvoked(sessionId, userId, {
              correlationId: getRequestId(request),
            });
            return reply
              .status(200)
              .send(successEnvelope({ content: response.content }, getRequestId(request)));
          }
        }
        throw err;
      } finally {
        const n = (invokeConcurrency.get(userId) ?? 1) - 1;
        if (n <= 0) invokeConcurrency.delete(userId);
        else invokeConcurrency.set(userId, n);
      }
    }
  );
}
