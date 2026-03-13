/**
 * Rate limiting plugin (COMP-033.3).
 *
 * Sliding-window style: 1000 req/min per user, 20 req/min per IP when unauthenticated.
 * Keys by request.user.userId when set (after optional-auth), else by request.ip.
 * Returns 429 with Retry-After when exceeded. Skips /health* paths.
 * Uses Redis store when REDIS_URL is set; otherwise in-memory.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import { Redis } from "ioredis";
import { errorEnvelope } from "../types/api-envelope.js";

const TIME_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_AUTHENTICATED = 1000;
const MAX_UNAUTHENTICATED = 20;

const SKIP_PATHS = ["/health", "/health/ready", "/health/live", "/internal"];

function shouldSkipRateLimit(request: FastifyRequest): boolean {
  const path = request.url?.split("?")[0] ?? "";
  return SKIP_PATHS.some(
    (p) => path === p || path.startsWith(p + "/") || path.startsWith(p)
  );
}

function rateLimitKeyGenerator(request: FastifyRequest): string {
  if (request.user?.userId) {
    return `user:${request.user.userId}`;
  }
  const ip = request.ip ?? request.headers["x-forwarded-for"] ?? request.socket?.remoteAddress ?? "unknown";
  const firstIp = typeof ip === "string" ? ip : Array.isArray(ip) ? ip[0] : "unknown";
  return `ip:${firstIp}`;
}

function getMaxForKey(_request: FastifyRequest, key: string): number {
  const testMax = process.env.RATE_LIMIT_TEST_MAX;
  if (typeof testMax === "string") {
    const n = parseInt(testMax, 10);
    if (Number.isInteger(n) && n >= 0) {
      return key.startsWith("user:") ? Math.max(n, MAX_AUTHENTICATED) : n;
    }
  }
  if (process.env.NODE_ENV === "test") {
    return key.startsWith("user:") ? MAX_AUTHENTICATED : 10_000;
  }
  return key.startsWith("user:") ? MAX_AUTHENTICATED : MAX_UNAUTHENTICATED;
}

/** Error thrown when rate limit is exceeded; plugin sets headers then throws this. */
export interface RateLimitExceededError extends Error {
  statusCode: 429;
  rateLimitBody: ReturnType<typeof errorEnvelope>;
}

async function rateLimitPlugin(
  fastify: FastifyInstance,
  _opts: Record<string, unknown>
): Promise<void> {
  const redisUrl = process.env.REDIS_URL;
  let redis: Redis | null = null;
  if (redisUrl) {
    redis = new Redis(redisUrl, { maxRetriesPerRequest: null });
    fastify.addHook("onClose", (_instance, done) => {
      redis?.quit().then(() => done(), done);
    });
  }

  await fastify.register(rateLimit, {
    global: true,
    hook: "preHandler",
    timeWindow: TIME_WINDOW_MS,
    max: getMaxForKey,
    keyGenerator: rateLimitKeyGenerator,
    allowList: (req) => shouldSkipRateLimit(req),
    redis: redis ?? undefined,
    addHeaders: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
      "retry-after": true,
    },
    errorResponseBuilder: (request, _context) => {
      const body = errorEnvelope(
        "RATE_LIMITED",
        "Rate limit exceeded, retry later.",
        request.correlationId
      );
      const err = new Error("Rate limit exceeded") as RateLimitExceededError;
      err.statusCode = 429;
      err.rateLimitBody = body;
      return err;
    },
  });

  const createRateLimit = fastify.createRateLimit();
  fastify.addHook("preHandler", async (request, reply) => {
    if (shouldSkipRateLimit(request)) return;
    if (process.env.NODE_ENV === "test" && !process.env.RATE_LIMIT_TEST_MAX) return;
    const result = await createRateLimit(request);
    if (result.isAllowed) return;
    reply.header("x-ratelimit-limit", result.max);
    reply.header("x-ratelimit-remaining", 0);
    reply.header("x-ratelimit-reset", result.ttlInSeconds);
    reply.header("retry-after", result.ttlInSeconds);
    const body = errorEnvelope(
      "RATE_LIMITED",
      "Rate limit exceeded, retry later.",
      request.correlationId
    );
    const err = new Error("Rate limit exceeded") as RateLimitExceededError;
    err.statusCode = 429;
    err.rateLimitBody = body;
    throw err;
  });

  fastify.setErrorHandler((err: unknown, _request, reply) => {
    const rateErr = err as RateLimitExceededError;
    if (rateErr?.statusCode === 429 && rateErr.rateLimitBody) {
      return reply.status(429).send(rateErr.rateLimitBody);
    }
    reply.send(err as Error);
  });
}

export const rateLimitPluginFp = fp(rateLimitPlugin, {
  name: "rate-limit",
});

export { rateLimitKeyGenerator, getMaxForKey, shouldSkipRateLimit };
