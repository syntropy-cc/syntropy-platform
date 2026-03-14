/**
 * IDE Domain REST routes (COMP-030.8).
 *
 * POST /api/v1/ide/sessions — create session (auth, quota enforced).
 * GET  /api/v1/ide/sessions/:id — get session by id (auth).
 * POST /api/v1/ide/sessions/:id/start — provision container and start (auth).
 * POST /api/v1/ide/sessions/:id/suspend — stop container and save snapshot (auth).
 * All responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import {
  IDESession,
  QuotaExceededError,
  SessionNotFoundError,
  SessionNotSuspensibleError,
} from "@syntropy/ide";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { IDEContext } from "../types/ide-context.js";

/** Request body for POST /api/v1/ide/sessions */
interface CreateSessionBody {
  projectId?: string | null;
}

function isCreateSessionBody(value: unknown): value is CreateSessionBody {
  if (value === null || typeof value !== "object") return true;
  const o = value as Record<string, unknown>;
  if (o.projectId !== undefined && o.projectId !== null) {
    return typeof o.projectId === "string";
  }
  return true;
}

/** Request body for POST /api/v1/ide/sessions/:id/suspend */
interface SuspendSessionBody {
  files?: Array<{ path: string; content: string }>;
}

function isSuspendSessionBody(value: unknown): value is SuspendSessionBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (o.files === undefined) return true;
  if (!Array.isArray(o.files)) return false;
  return o.files.every(
    (item) =>
      item !== null &&
      typeof item === "object" &&
      "path" in item &&
      typeof (item as { path: unknown }).path === "string" &&
      "content" in item &&
      typeof (item as { content: unknown }).content === "string"
  );
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

function sessionToResponse(session: IDESession) {
  return {
    id: session.sessionId,
    sessionId: session.sessionId,
    userId: session.userId,
    projectId: session.projectId,
    status: session.status,
    containerId: session.containerId,
    workspaceId: session.workspaceId,
    startedAt: session.startedAt?.toISOString() ?? null,
    lastActiveAt: session.lastActiveAt?.toISOString() ?? null,
    terminatedAt: session.terminatedAt?.toISOString() ?? null,
  };
}

export async function ideRoutes(
  fastify: FastifyInstance,
  opts: { ide: IDEContext }
): Promise<void> {
  const { sessionRepository, provisioningService, quotaEnforcer } = opts.ide;
  const requireAuth = fastify.requireAuth;

  fastify.post<{ Body: unknown }>(
    "/api/v1/ide/sessions",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (!isCreateSessionBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body may optionally be { projectId?: string }.",
            getRequestId(request)
          )
        );
      }
      const userId = request.user!.userId;
      try {
        await quotaEnforcer.enforce(userId);
      } catch (err) {
        if (err instanceof QuotaExceededError) {
          return reply.status(429).send(
            errorEnvelope(
              "QUOTA_EXCEEDED",
              err.message,
              getRequestId(request),
              {
                userId: err.userId,
                currentUsage: err.currentUsage,
                limit: err.limit,
              }
            )
          );
        }
        throw err;
      }
      const sessionId = randomUUID();
      const session = IDESession.create({
        sessionId,
        userId,
        projectId: body?.projectId?.trim() ?? null,
      });
      await sessionRepository.save(session);
      return reply.status(201).send(
        successEnvelope(sessionToResponse(session), getRequestId(request))
      );
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/ide/sessions/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const sessionId = request.params.id;
      const session = await sessionRepository.findById(sessionId);
      if (!session) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            `IDE session not found: ${sessionId}`,
            getRequestId(request)
          )
        );
      }
      if (session.userId !== userId) {
        return reply.status(403).send(
          errorEnvelope(
            "FORBIDDEN",
            "Not authorized to access this session",
            getRequestId(request)
          )
        );
      }
      return reply
        .status(200)
        .send(successEnvelope(sessionToResponse(session), getRequestId(request)));
    }
  );

  fastify.post<{ Params: { id: string } }>(
    "/api/v1/ide/sessions/:id/start",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const sessionId = request.params.id;
      const session = await sessionRepository.findById(sessionId);
      if (!session) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            `IDE session not found: ${sessionId}`,
            getRequestId(request)
          )
        );
      }
      if (session.userId !== userId) {
        return reply.status(403).send(
          errorEnvelope(
            "FORBIDDEN",
            "Not authorized to access this session",
            getRequestId(request)
          )
        );
      }
      try {
        const updated = await provisioningService.start(sessionId);
        return reply
          .status(200)
          .send(
            successEnvelope(sessionToResponse(updated), getRequestId(request))
          );
      } catch (err) {
        if (err instanceof SessionNotFoundError) {
          return reply.status(404).send(
            errorEnvelope(
              "NOT_FOUND",
              err.message,
              getRequestId(request)
            )
          );
        }
        throw err;
      }
    }
  );

  fastify.post<{ Params: { id: string }; Body: unknown }>(
    "/api/v1/ide/sessions/:id/suspend",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const sessionId = request.params.id;
      const body = request.body;
      if (!isSuspendSessionBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { files?: Array<{ path: string, content: string }> }.",
            getRequestId(request)
          )
        );
      }
      const session = await sessionRepository.findById(sessionId);
      if (!session) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            `IDE session not found: ${sessionId}`,
            getRequestId(request)
          )
        );
      }
      if (session.userId !== userId) {
        return reply.status(403).send(
          errorEnvelope(
            "FORBIDDEN",
            "Not authorized to access this session",
            getRequestId(request)
          )
        );
      }
      const files = body.files ?? [];
      try {
        const suspended = await provisioningService.suspend(sessionId, files);
        return reply
          .status(200)
          .send(
            successEnvelope(
              sessionToResponse(suspended),
              getRequestId(request)
            )
          );
      } catch (err) {
        if (err instanceof SessionNotFoundError) {
          return reply.status(404).send(
            errorEnvelope("NOT_FOUND", err.message, getRequestId(request))
          );
        }
        if (err instanceof SessionNotSuspensibleError) {
          return reply.status(409).send(
            errorEnvelope(
              "CONFLICT",
              err.message,
              getRequestId(request)
            )
          );
        }
        throw err;
      }
    }
  );
}
