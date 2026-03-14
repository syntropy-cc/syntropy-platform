/**
 * Moderation REST routes (COMP-031.6).
 *
 * POST /api/v1/moderation/flags — report content (auth).
 * GET  /api/v1/moderation/flags — list flags, moderator only (auth + role).
 * POST /api/v1/moderation/actions — take moderation action (auth + moderator).
 * All responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { isActionType } from "@syntropy/governance-moderation";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { GovernanceModerationContext } from "../types/governance-moderation-context.js";

const MODERATOR_ROLE = "PlatformModerator";

/** Request body for POST /api/v1/moderation/flags */
interface CreateFlagBody {
  entityType: string;
  entityId: string;
  reason: string;
}

function isCreateFlagBody(value: unknown): value is CreateFlagBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.entityType === "string" &&
    o.entityType.trim().length > 0 &&
    typeof o.entityId === "string" &&
    o.entityId.trim().length > 0 &&
    typeof o.reason === "string" &&
    o.reason.trim().length > 0
  );
}

/** Request body for POST /api/v1/moderation/actions */
interface CreateActionBody {
  flagId: string;
  actionType: string;
  reason: string;
}

function isCreateActionBody(value: unknown): value is CreateActionBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.flagId !== "string" || !o.flagId.trim()) return false;
  if (typeof o.actionType !== "string" || !isActionType(o.actionType)) return false;
  if (typeof o.reason !== "string" || !o.reason.trim()) return false;
  return true;
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

export async function moderationRoutes(
  fastify: FastifyInstance,
  opts: { governanceModeration: GovernanceModerationContext }
): Promise<void> {
  const ctx = opts.governanceModeration;
  const requireAuth = fastify.requireAuth;

  async function requireModerator(
    request: FastifyRequest,
    reply: Parameters<typeof requireAuth>[1]
  ): Promise<void> {
    await requireAuth(request, reply);
    if (reply.sent) return;
    const roles = request.user?.roles ?? [];
    if (!roles.includes(MODERATOR_ROLE)) {
      return reply.status(403).send(
        errorEnvelope(
          "FORBIDDEN",
          "PlatformModerator role required to access moderation.",
          getRequestId(request)
        )
      );
    }
  }

  fastify.post<{ Body: unknown }>(
    "/api/v1/moderation/flags",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (!isCreateFlagBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { entityType: string, entityId: string, reason: string }.",
            getRequestId(request)
          )
        );
      }
      const reporterId = request.user!.userId;
      const saved = await ctx.recordFlag({
        entityType: body.entityType.trim(),
        entityId: body.entityId.trim(),
        reason: body.reason.trim(),
        reporterId,
      });
      return reply.status(201).send(
        successEnvelope(
          {
            flagId: saved.flagId,
            entityType: saved.entityType,
            entityId: saved.entityId,
            reason: saved.reason,
            status: saved.status,
            createdAt: saved.createdAt.toISOString(),
          },
          getRequestId(request)
        )
      );
    }
  );

  fastify.get<{ Querystring: { status?: string; limit?: string; offset?: string } }>(
    "/api/v1/moderation/flags",
    { preHandler: [requireModerator] },
    async (request, reply) => {
      const status = request.query.status?.trim();
      const limit = request.query.limit != null ? Number(request.query.limit) : 20;
      const offset = request.query.offset != null ? Number(request.query.offset) : 0;
      const flags = await ctx.listFlags({
        ...(status && { status }),
        limit: Number.isFinite(limit) ? Math.min(limit, 100) : 20,
        offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
      });
      return reply.status(200).send(
        successEnvelope(
          flags.map((f) => ({
            flagId: f.flagId,
            entityType: f.entityType,
            entityId: f.entityId,
            reason: f.reason,
            status: f.status,
            createdAt: f.createdAt.toISOString(),
          })),
          getRequestId(request)
        )
      );
    }
  );

  fastify.post<{ Body: unknown }>(
    "/api/v1/moderation/actions",
    { preHandler: [requireModerator] },
    async (request, reply) => {
      const body = request.body;
      if (!isCreateActionBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { flagId: string, actionType: 'approve'|'remove'|'warn'|'ban', reason: string }.",
            getRequestId(request)
          )
        );
      }
      const moderatorId = request.user!.userId;
      const action = await ctx.recordAction({
        flagId: body.flagId.trim(),
        moderatorId,
        actionType: body.actionType as "approve" | "remove" | "warn" | "ban",
        reason: body.reason.trim(),
      });
      return reply.status(201).send(
        successEnvelope(
          {
            id: action.id,
            flagId: action.flagId,
            moderatorId: action.moderatorId,
            actionType: action.actionType,
            reason: action.reason,
            createdAt: action.createdAt.toISOString(),
          },
          getRequestId(request)
        )
      );
    }
  );
}
