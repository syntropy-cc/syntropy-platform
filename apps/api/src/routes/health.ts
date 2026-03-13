/**
 * Minimal health route for S4 verification (COMP-033.1).
 * Full /health/ready and /health/live are implemented in COMP-033.7.
 */

import type { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/health", async (_request, reply) => {
    return reply.send({ status: "ok" });
  });
}
