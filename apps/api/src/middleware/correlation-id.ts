/**
 * Correlation ID middleware for the REST API (COMP-033, COMP-038.2).
 *
 * Generates or forwards X-Correlation-ID (UUID v4) per request, attaches it to
 * the request and response, and runs the rest of the request inside
 * AsyncLocalStorage so getCorrelationId() is available in handlers and Kafka.
 */

import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { setCorrelationContextForRequest } from "@syntropy/platform-core";

const HEADER_NAME = "x-correlation-id";
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuidV4(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

export async function correlationIdPlugin(
  fastify: FastifyInstance
): Promise<void> {
  fastify.decorateRequest("correlationId", "");
  fastify.addHook("preHandler", async (request, reply) => {
    const incoming = request.headers[HEADER_NAME];
    const value =
      typeof incoming === "string" && isValidUuidV4(incoming)
        ? incoming
        : randomUUID();
    request.correlationId = value;
    reply.header("X-Correlation-ID", value);
    setCorrelationContextForRequest(value);
  });
}
