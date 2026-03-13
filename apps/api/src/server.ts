/**
 * REST API server factory (COMP-033.1).
 *
 * Builds Fastify app with CORS, correlation-id, request logging, and health route.
 * Does not call .listen(); see main.ts for bootstrap and graceful shutdown.
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import fp from "fastify-plugin";
import { correlationIdPlugin } from "./middleware/correlation-id.js";
import { requestLoggerPlugin } from "./middleware/request-logger.js";
import { healthRoutes } from "./routes/health.js";

const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

function getCorsOrigins(): string[] | true {
  const env = process.env.CORS_ORIGIN;
  if (!env) return DEFAULT_ORIGINS;
  return env.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function createApp() {
  const app = Fastify({ logger: false });

  await app.register(cors, {
    origin: getCorsOrigins(),
  });
  await app.register(fp(correlationIdPlugin));
  await app.register(fp(requestLoggerPlugin));
  await app.register(healthRoutes);

  return app;
}
