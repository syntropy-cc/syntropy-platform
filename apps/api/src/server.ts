/**
 * REST API server factory (COMP-033.1).
 *
 * Builds Fastify app with CORS, correlation-id, request logging, and health route.
 * Route registration is centralized in router.ts (COMP-033.4).
 * Does not call .listen(); see main.ts for bootstrap and graceful shutdown.
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import fp from "fastify-plugin";
import { createMetrics } from "@syntropy/platform-core";
import { apiVersionPluginFp } from "./middleware/api-version.js";
import { correlationIdPlugin } from "./middleware/correlation-id.js";
import { requestLoggerPlugin } from "./middleware/request-logger.js";
import { authContextPluginFp } from "./plugins/auth-context.js";
import { authMiddlewarePluginFp } from "./plugins/auth-middleware.js";
import { rateLimitPluginFp } from "./plugins/rate-limit.js";
import fastifyWebsocket from "@fastify/websocket";
import { mtlsPlugin } from "./plugins/mtls.js";
import { securityHeadersPlugin } from "./plugins/security-headers.js";
import {
  registerOpenApiEndpoints,
  registerSwagger,
} from "./openapi.js";
import { registerApiRoutes } from "./router.js";
import type { CreateAppOptions } from "./types/create-app-options.js";

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

export type { DipContext } from "./types/dip-context.js";
export type { CreateAppOptions } from "./types/create-app-options.js";

export async function createApp(options?: CreateAppOptions) {
  const app = Fastify({ logger: false });

  const metrics = createMetrics("api");
  app.decorate("metricsRegistry", metrics.registry);

  await app.register(cors, {
    origin: getCorsOrigins(),
  });
  await app.register(securityHeadersPlugin);
  await app.register(mtlsPlugin);
  await app.register(fp(correlationIdPlugin));
  await app.register(fp(requestLoggerPlugin));
  await app.register(fp(apiVersionPluginFp));
  await app.register(fp(authContextPluginFp), options ?? {});
  await app.register(fp(authMiddlewarePluginFp));
  await app.register(fp(rateLimitPluginFp));
  await app.register(fastifyWebsocket);
  await registerSwagger(app);
  await registerApiRoutes(app, options);
  await registerOpenApiEndpoints(app);

  return app;
}
