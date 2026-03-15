/**
 * Integration tests for OpenAPI and Swagger UI (COMP-033.6).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "./server.js";

describe("OpenAPI endpoints", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/v1/openapi.json returns 200 and OpenAPI 3.1 spec", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/openapi.json",
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    const spec = JSON.parse(res.payload);
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.info).toBeDefined();
    expect(spec.info.title).toBe("Syntropy Platform API");
    expect(spec.paths).toBeDefined();
  });

  it("GET /api/v1/docs returns 200 (Swagger UI)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/docs",
    });
    expect(res.statusCode).toBe(200);
  });
});
