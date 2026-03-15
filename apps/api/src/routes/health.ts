/**
 * Health and server info routes (COMP-033.7).
 * Architecture: COMP-033.
 * GET /health — status, version, timestamp (no auth).
 * GET /health/ready — readiness (DB, Kafka, Redis connectivity).
 * GET /health/live — liveness (no dependency checks).
 */

import { createRequire } from "node:module";
import type { FastifyInstance } from "fastify";
import { runReadinessChecks } from "../lib/readiness.js";

const require = createRequire(import.meta.url);

function getVersion(): string {
  const fromEnv =
    process.env.APP_VERSION ?? process.env.VERSION ?? process.env.npm_package_version;
  if (fromEnv) return fromEnv;
  try {
    const pkg = require("../../package.json") as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

const cachedVersion = getVersion();

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/health", async (_request, reply) => {
    return reply.send({
      status: "ok",
      version: cachedVersion,
      timestamp: new Date().toISOString(),
    });
  });

  fastify.get("/health/live", async (_request, reply) => {
    return reply.send({ status: "ok" });
  });

  fastify.get("/health/ready", async (_request, reply) => {
    const result = await runReadinessChecks();
    if (result.status === "unhealthy") {
      return reply.status(503).send({
        status: "unhealthy",
        checks: result.checks,
        ...(result.errors ? { errors: result.errors } : {}),
        timestamp: new Date().toISOString(),
      });
    }
    return reply.send({
      status: "ok",
      checks: result.checks,
      timestamp: new Date().toISOString(),
    });
  });
}
