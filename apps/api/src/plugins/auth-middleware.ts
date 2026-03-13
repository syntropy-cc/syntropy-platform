/**
 * Auth middleware: verify Bearer token, set request.user, 401 on invalid (COMP-033.2).
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { InvalidTokenError, AuthProviderError } from "@syntropy/identity";
import { errorEnvelope } from "../types/api-envelope.js";
import { inMemoryTokenCache } from "../lib/token-cache.js";

function getBearerToken(request: FastifyRequest): string | null {
  const auth = request.headers.authorization;
  if (typeof auth !== "string" || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

async function authMiddlewarePlugin(
  fastify: FastifyInstance,
  _opts: Record<string, unknown>
): Promise<void> {
  const cache = inMemoryTokenCache;

  async function requireAuth(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const auth = fastify.auth;
    if (!auth) {
      return reply.status(503).send(
        errorEnvelope(
          "SERVICE_UNAVAILABLE",
          "Auth is not configured.",
          request.correlationId
        )
      );
    }

    const token = getBearerToken(request);
    if (!token) {
      return reply.status(401).send(
        errorEnvelope(
          "UNAUTHORIZED",
          "Missing or invalid Authorization header (expected Bearer <token>).",
          request.correlationId
        )
      );
    }

    const cached = cache.get(token);
    if (cached) {
      request.user = cached;
      return;
    }

    try {
      const identityToken = await auth.verifyToken(token);
      const user = {
        userId: identityToken.userId,
        actorId: identityToken.actorId,
        roles: [...identityToken.roles],
      };
      cache.set(token, user);
      request.user = user;
    } catch (err) {
      if (err instanceof InvalidTokenError || err instanceof AuthProviderError) {
        return reply.status(401).send(
          errorEnvelope("UNAUTHORIZED", err.message, request.correlationId)
        );
      }
      throw err;
    }
  }

  fastify.decorate("requireAuth", requireAuth);
}

declare module "fastify" {
  interface FastifyInstance {
    requireAuth: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

export const authMiddlewarePluginFp = fp(authMiddlewarePlugin, {
  name: "auth-middleware",
});
