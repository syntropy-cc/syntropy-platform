/**
 * Unit tests for correlation-id middleware (COMP-033.1).
 */

import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import fp from "fastify-plugin";
import { correlationIdPlugin } from "./correlation-id.js";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("correlationIdPlugin", () => {
  it("generates UUID v4 and sets X-Correlation-ID when header is missing", async () => {
    const app = Fastify();
    await app.register(fp(correlationIdPlugin));
    app.get("/", async (request, reply) => {
      expect(request.correlationId).toBeDefined();
      expect(UUID_V4_REGEX.test(request.correlationId)).toBe(true);
      return reply.send({ ok: true });
    });

    const response = await app.inject({ method: "GET", url: "/" });
    expect(response.statusCode).toBe(200);
    const correlationHeader = response.headers["x-correlation-id"];
    expect(correlationHeader).toBeDefined();
    expect(UUID_V4_REGEX.test(correlationHeader as string)).toBe(true);
  });

  it("reuses valid X-Correlation-ID when header is sent", async () => {
    const app = Fastify();
    await app.register(fp(correlationIdPlugin));
    const existingId = "550e8400-e29b-41d4-a716-446655440000";
    app.get("/", async (request) => {
      expect(request.correlationId).toBe(existingId);
      return { ok: true };
    });

    const response = await app.inject({
      method: "GET",
      url: "/",
      headers: { "x-correlation-id": existingId },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["x-correlation-id"]).toBe(existingId);
  });

  it("generates new UUID when X-Correlation-ID is invalid", async () => {
    const app = Fastify();
    await app.register(fp(correlationIdPlugin));
    app.get("/", async (request) => {
      expect(UUID_V4_REGEX.test(request.correlationId)).toBe(true);
      expect(request.correlationId).not.toBe("not-a-uuid");
      return { ok: true };
    });

    const response = await app.inject({
      method: "GET",
      url: "/",
      headers: { "x-correlation-id": "not-a-uuid" },
    });
    expect(response.statusCode).toBe(200);
    expect(UUID_V4_REGEX.test(response.headers["x-correlation-id"] as string)).toBe(true);
  });
});
