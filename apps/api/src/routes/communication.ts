/**
 * Communication REST routes (COMP-028.6).
 *
 * GET  /api/v1/notifications — list notifications for current user (paginated, auth).
 * PUT  /api/v1/notifications/:id/read — mark notification as read (auth).
 * POST /api/v1/messages/threads — create message thread (auth).
 * GET  /api/v1/messages/threads/:id — get thread by id (auth, participant only).
 * All responses use CONV-017 envelope.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import {
  Thread,
  type Notification,
  type Message,
} from "@syntropy/communication";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { CommunicationContext } from "../types/communication-context.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** Request body for POST /api/v1/messages/threads */
interface CreateThreadBody {
  participantIds?: string[];
}

function isCreateThreadBody(value: unknown): value is CreateThreadBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (o.participantIds !== undefined) {
    if (!Array.isArray(o.participantIds)) return false;
    if (!o.participantIds.every((id): id is string => typeof id === "string"))
      return false;
  }
  return true;
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

export async function communicationRoutes(
  fastify: FastifyInstance,
  opts: { communication: CommunicationContext }
): Promise<void> {
  const {
    notificationRepository,
    threadRepository,
    messageRepository,
  } = opts.communication;
  const requireAuth = fastify.requireAuth;

  fastify.get<{
    Querystring: { limit?: string; offset?: string };
  }>(
    "/api/v1/notifications",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      let limit = DEFAULT_LIMIT;
      let offset = 0;
      const limitParam = request.query.limit;
      if (limitParam !== undefined) {
        const n = parseInt(limitParam, 10);
        if (!Number.isNaN(n) && n >= 1) {
          limit = Math.min(n, MAX_LIMIT);
        }
      }
      const offsetParam = request.query.offset;
      if (offsetParam !== undefined) {
        const n = parseInt(offsetParam, 10);
        if (!Number.isNaN(n) && n >= 0) {
          offset = n;
        }
      }
      const items = await notificationRepository.findByUserId(userId, {
        limit,
        offset,
      });
      return reply.status(200).send(
        successEnvelope(
          {
            items: items.map((n: Notification) => ({
              id: n.id,
              userId: n.userId,
              notificationType: n.notificationType,
              sourceEventType: n.sourceEventType,
              payload: n.payload,
              isRead: n.isRead,
              createdAt: n.createdAt.toISOString(),
            })),
            limit,
            offset,
          },
          getRequestId(request)
        )
      );
    }
  );

  fastify.put<{ Params: { id: string } }>(
    "/api/v1/notifications/:id/read",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const userId = request.user!.userId;
      const updated = await notificationRepository.markAsRead(id, userId);
      if (!updated) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Notification not found or access denied.",
            getRequestId(request)
          )
        );
      }
      return reply.status(200).send(
        successEnvelope({ id, read: true }, getRequestId(request))
      );
    }
  );

  fastify.post<{ Body: unknown }>(
    "/api/v1/messages/threads",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body;
      if (!isCreateThreadBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { participantIds?: string[] }.",
            getRequestId(request)
          )
        );
      }
      const currentUserId = request.user!.userId;
      const participantIds = body.participantIds ?? [];
      const allParticipants = [
        currentUserId,
        ...participantIds.filter((id) => id.trim().length > 0),
      ];
      const uniqueParticipants = [...new Set(allParticipants)];
      const type =
        uniqueParticipants.length === 2 ? "direct" : "group";
      const threadId = randomUUID();
      const thread = new Thread({
        threadId,
        participants: uniqueParticipants,
        type,
      });
      await threadRepository.save(thread);
      return reply.status(201).send(
        successEnvelope(
          {
            threadId: thread.threadId,
            participants: [...thread.participants],
            type: thread.type,
          },
          getRequestId(request)
        )
      );
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/messages/threads/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const userId = request.user!.userId;
      const thread = await threadRepository.findById(id);
      if (thread == null) {
        return reply.status(404).send(
          errorEnvelope(
            "NOT_FOUND",
            "Thread not found.",
            getRequestId(request)
          )
        );
      }
      if (!thread.participants.includes(userId)) {
        return reply.status(403).send(
          errorEnvelope(
            "FORBIDDEN",
            "You are not a participant of this thread.",
            getRequestId(request)
          )
        );
      }
      const messages = await messageRepository.findByThreadId(id);
      return reply.status(200).send(
        successEnvelope(
          {
            threadId: thread.threadId,
            participants: [...thread.participants],
            type: thread.type,
            messages: messages.map((m: Message) => ({
              messageId: m.messageId,
              threadId: m.threadId,
              authorId: m.authorId,
              content: m.content,
              sentAt: m.sentAt.toISOString(),
            })),
          },
          getRequestId(request)
        )
      );
    }
  );
}
