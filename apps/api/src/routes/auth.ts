/**
 * Auth REST routes (COMP-002.6).
 *
 * POST /api/v1/auth/login — sign in with email/password, returns token and claims.
 * POST /api/v1/auth/logout — sign out (client should discard token).
 * GET /api/v1/auth/me — return current user from Bearer token.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { AuthProviderError } from "@syntropy/identity";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";

interface LoginBody {
  email?: string;
  password?: string;
}

function isLoginBody(value: unknown): value is LoginBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.email === "string" && typeof o.password === "string";
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const auth = fastify.auth;
  const supabase = fastify.supabaseClient;

  fastify.post<{ Body: unknown }>(
    "/api/v1/auth/login",
    async (request, reply) => {
      if (!isLoginBody(request.body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { email: string, password: string }.",
            getRequestId(request)
          )
        );
      }
      if (!auth || !supabase) {
        return reply.status(503).send(
          errorEnvelope(
            "SERVICE_UNAVAILABLE",
            "Auth is not configured (missing SUPABASE_URL or SUPABASE_ANON_KEY).",
            getRequestId(request)
          )
        );
      }
      const email = request.body.email as string;
      const password = request.body.password as string;
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return reply.status(401).send(
            errorEnvelope("UNAUTHORIZED", error.message, getRequestId(request))
          );
        }
        if (!session?.access_token) {
          return reply.status(401).send(
            errorEnvelope(
              "UNAUTHORIZED",
              "Sign in did not return a session.",
              getRequestId(request)
            )
          );
        }
        const token = await auth.verifyToken(session.access_token);
        return reply.status(200).send(
          successEnvelope(
            {
              token: session.access_token,
              userId: token.userId,
              actorId: token.actorId,
              roles: [...token.roles],
            },
            getRequestId(request)
          )
        );
      } catch (err) {
        if (err instanceof AuthProviderError) {
          return reply.status(401).send(
            errorEnvelope("UNAUTHORIZED", err.message, getRequestId(request))
          );
        }
        throw err;
      }
    }
  );

  fastify.post("/api/v1/auth/logout", async (request, reply) => {
    if (!auth) {
      return reply.status(503).send(
        errorEnvelope(
          "SERVICE_UNAVAILABLE",
          "Auth is not configured.",
          getRequestId(request)
        )
      );
    }
    try {
      await auth.signOut("");
    } catch (_err) {
      // Adapter may no-op when no server-side session; still return success
    }
    return reply.status(204).send();
  });

  fastify.get(
    "/api/v1/auth/me",
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send(
          errorEnvelope("UNAUTHORIZED", "Not authenticated", getRequestId(request))
        );
      }
      return reply.status(200).send(
        successEnvelope(
          {
            userId: request.user.userId,
            actorId: request.user.actorId,
            roles: request.user.roles,
          },
          getRequestId(request)
        )
      );
    }
  );

  fastify.get(
    "/api/v1/protected",
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      return reply.status(200).send(
        successEnvelope(
          { ok: true, user: request.user },
          getRequestId(request)
        )
      );
    }
  );
}
