/**
 * Unit tests for API version middleware (COMP-033.5).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import fp from "fastify-plugin";
import { apiVersionPluginFp } from "./api-version.js";

describe("api-version middleware", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  async function buildApp() {
    const fastify = Fastify({ logger: false });
    await fastify.register(fp(apiVersionPluginFp));
    fastify.get("/api/v1/foo", async (request, reply) => {
      return reply.send({ version: request.apiVersion });
    });
    fastify.get("/api/v2/bar", async (request, reply) => {
      return reply.send({ version: request.apiVersion });
    });
    fastify.get("/health", async (request, reply) => {
      return reply.send({ version: request.apiVersion });
    });
    return fastify;
  }

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("sets apiVersion from URL path /api/v1/*", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/foo" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.version).toBe("v1");
    expect(res.headers["api-version"]).toBe("v1");
  });

  it("sets apiVersion from URL path /api/v2/*", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v2/bar" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.version).toBe("v2");
    expect(res.headers["api-version"]).toBe("v2");
  });

  it("defaults to v1 when path has no version prefix", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.version).toBe("v1");
    expect(res.headers["api-version"]).toBe("v1");
  });

  it("accepts Accept header application/vnd.syntropy.v1+json when path has no version", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/health",
      headers: { accept: "application/vnd.syntropy.v1+json" },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.version).toBe("v1");
    expect(res.headers["api-version"]).toBe("v1");
  });
});
