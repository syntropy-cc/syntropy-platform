/**
 * Users REST routes (COMP-002.6).
 *
 * GET /api/v1/users/:id — return user profile (403 if id !== current user).
 * PUT /api/v1/users/:id/roles — update roles (stub: 501 until RBAC service exists).
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { InvalidTokenError, AuthProviderError } from "@syntropy/identity";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";

function getBearerToken(request: FastifyRequest): string | null {
  const auth = request.headers.authorization;
  if (typeof auth !== "string" || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

export async function usersRoutes(fastify: FastifyInstance): Promise<void> {
  const auth = fastify.auth;

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/users/:id",
    async (request, reply) => {
      if (!auth) {
        return reply.status(503).send(
          errorEnvelope(
            "SERVICE_UNAVAILABLE",
            "Auth is not configured.",
            getRequestId(request)
          )
        );
      }
      const tokenStr = getBearerToken(request);
      if (!tokenStr) {
        return reply.status(401).send(
          errorEnvelope(
            "UNAUTHORIZED",
            "Missing or invalid Authorization header (expected Bearer <token>).",
            getRequestId(request)
          )
        );
      }
      try {
        const token = await auth.verifyToken(tokenStr);
        const { id } = request.params;
        if (id !== token.userId) {
          return reply.status(403).send(
            errorEnvelope(
              "FORBIDDEN",
              "You may only access your own profile.",
              getRequestId(request)
            )
          );
        }
        return reply.status(200).send(
          successEnvelope(
            {
              id: token.userId,
              actorId: token.actorId,
              roles: [...token.roles],
            },
            getRequestId(request)
          )
        );
      } catch (err) {
        if (
          err instanceof InvalidTokenError ||
          err instanceof AuthProviderError
        ) {
          return reply.status(401).send(
            errorEnvelope("UNAUTHORIZED", err.message, getRequestId(request))
          );
        }
        throw err;
      }
    }
  );

  fastify.put<{
    Params: { id: string };
    Body: unknown;
  }>("/api/v1/users/:id/roles", async (request, reply) => {
    if (!auth) {
      return reply.status(503).send(
        errorEnvelope(
          "SERVICE_UNAVAILABLE",
          "Auth is not configured.",
          getRequestId(request)
        )
      );
    }
    const tokenStr = getBearerToken(request);
    if (!tokenStr) {
      return reply.status(401).send(
        errorEnvelope(
          "UNAUTHORIZED",
          "Missing or invalid Authorization header (expected Bearer <token>).",
          getRequestId(request)
        )
      );
    }
    try {
      await auth.verifyToken(tokenStr);
    } catch (err) {
      if (
        err instanceof InvalidTokenError ||
        err instanceof AuthProviderError
      ) {
        return reply.status(401).send(
          errorEnvelope("UNAUTHORIZED", err.message, getRequestId(request))
        );
      }
      throw err;
    }
    // Stub: role assignment requires RBAC service (COMP-037.1) and UserRepository.
    return reply.status(501).send(
      errorEnvelope(
        "NOT_IMPLEMENTED",
        "PUT /api/v1/users/:id/roles is not yet implemented (requires RBAC and user store).",
        getRequestId(request)
      )
    );
  });
}
