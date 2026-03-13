/**
 * Integration tests for REST API server (COMP-033.1).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "./server.js";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("API server", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health returns 200 and { status: 'ok' }", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ status: "ok" });
  });

  it("GET /health response includes X-Correlation-ID header", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    const correlationHeader = response.headers["x-correlation-id"];
    expect(correlationHeader).toBeDefined();
    expect(UUID_V4_REGEX.test(correlationHeader as string)).toBe(true);
  });

  it("GET /health echoes X-Correlation-ID when provided", async () => {
    const existingId = "550e8400-e29b-41d4-a716-446655440000";
    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: { "x-correlation-id": existingId },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["x-correlation-id"]).toBe(existingId);
  });
});
