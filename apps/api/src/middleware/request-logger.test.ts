/**
 * Unit tests for request-logger middleware (COMP-033.1).
 */

import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import fp from "fastify-plugin";
import { correlationIdPlugin } from "./correlation-id.js";
import { requestLoggerPlugin } from "./request-logger.js";

describe("requestLoggerPlugin", () => {
  it("registers after correlation-id and sets requestLog with correlation_id", async () => {
    const app = Fastify();
    await app.register(fp(correlationIdPlugin));
    await app.register(fp(requestLoggerPlugin));

    let capturedCorrelationId: string | undefined;
    app.get("/", async (request) => {
      expect(request.requestLog).toBeDefined();
      expect(typeof request.requestLog?.info).toBe("function");
      capturedCorrelationId = request.correlationId;
      return { ok: true };
    });

    const correlationId = "550e8400-e29b-41d4-a716-446655440000";
    const response = await app.inject({
      method: "GET",
      url: "/",
      headers: { "x-correlation-id": correlationId },
    });

    expect(response.statusCode).toBe(200);
    expect(capturedCorrelationId).toBe(correlationId);
  });

  it("logs request and response without throwing", async () => {
    const app = Fastify();
    await app.register(fp(correlationIdPlugin));
    await app.register(fp(requestLoggerPlugin));
    app.get("/ping", async (_request, reply) => {
      return reply.send({ pong: true });
    });

    const response = await app.inject({ method: "GET", url: "/ping" });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ pong: true });
  });
});
