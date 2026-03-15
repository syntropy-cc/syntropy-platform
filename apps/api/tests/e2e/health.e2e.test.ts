/**
 * E2E test: Health and readiness endpoints (COMP-033.7).
 * Run with E2E=true to execute. Verifies app boots and responds.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../../src/server.js";

const runE2E = process.env.E2E === "true";
const describeE2E = runE2E ? describe : describe.skip;

describeE2E("E2E health", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health returns 200 with status, version, and timestamp", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload) as {
      status: string;
      version?: string;
      timestamp?: string;
    };
    expect(body.status).toBe("ok");
    expect(body.version).toBeDefined();
    expect(typeof body.version).toBe("string");
    expect(body.timestamp).toBeDefined();
  });

  it("GET /health/live returns 200 with minimal body", async () => {
    const response = await app.inject({ method: "GET", url: "/health/live" });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload) as { status: string };
    expect(body.status).toBe("ok");
  });
});
