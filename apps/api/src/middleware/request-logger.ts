/**
 * Request/response logging middleware with correlation ID (COMP-033.1).
 *
 * Logs each request and response in structured JSON with correlation_id.
 * Registers after correlation-id plugin so request.correlationId is set.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  createLogger,
  withCorrelationId,
  type Logger,
} from "@syntropy/platform-core";

const log = createLogger("api");

export async function requestLoggerPlugin(
  fastify: FastifyInstance
): Promise<void> {
  fastify.decorateRequest("requestLog", null as Logger | null);

  fastify.addHook("preHandler", async (request: FastifyRequest) => {
    const correlationId =
      request.correlationId ?? "unknown";
    const requestLog = withCorrelationId(log, correlationId);
    request.requestLog = requestLog;
    requestLog.info(
      { method: request.method, url: request.url },
      "request started"
    );
  });

  fastify.addHook("onResponse", (request: FastifyRequest, reply: FastifyReply, done) => {
    const correlationId = request.correlationId ?? "unknown";
    const requestLog = withCorrelationId(log, correlationId);
    const responseTime = reply.elapsedTime;
    requestLog.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime,
      },
      "request completed"
    );
    done();
  });
}
