/**
 * Prometheus metrics endpoint (COMP-038.4).
 *
 * GET /metrics — returns Prometheus text format. No auth.
 * Requires app to be decorated with metricsRegistry (set in server.ts).
 */

import type { FastifyInstance } from "fastify";

const METRICS_CONTENT_TYPE = "text/plain; version=0.0.4; charset=utf-8";

/** Registry-like interface so API does not depend on prom-client. */
interface MetricsRegistry {
  metrics(): Promise<string>;
}

declare module "fastify" {
  interface FastifyInstance {
    metricsRegistry: MetricsRegistry;
  }
}

export async function metricsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/metrics", async (_request, reply) => {
    const registry = fastify.metricsRegistry;
    try {
      const body = await registry.metrics();
      return reply.type(METRICS_CONTENT_TYPE).send(body);
    } catch (err) {
      fastify.log?.error?.(err, "Metrics collection failed");
      return reply
        .status(500)
        .type(METRICS_CONTENT_TYPE)
        .send(
          `# Error collecting metrics: ${err instanceof Error ? err.message : String(err)}`
        );
    }
  });
}
