/**
 * Tests for metrics/health HTTP server (COMP-034.5).
 */

import { describe, it, expect } from "vitest";
import { createMetricsHealthServer, DEFAULT_HTTP_PORT } from "./http-server.js";
import { WorkerRegistry } from "./worker-registry.js";

const BASE_PORT = 19090;

describe("createMetricsHealthServer", () => {
  const registry = new WorkerRegistry();

  it("GET /metrics returns 200 and Prometheus content type", async () => {
    const server = createMetricsHealthServer(registry, BASE_PORT);
    try {
      const res = await fetch(`http://127.0.0.1:${BASE_PORT}/metrics`);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/plain");
      const text = await res.text();
      expect(text).toMatch(/^#/);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("GET /health returns 200 and JSON with status and workers", async () => {
    const server = createMetricsHealthServer(registry, BASE_PORT + 1);
    try {
      const res = await fetch(`http://127.0.0.1:${BASE_PORT + 1}/health`);
      expect(res.status).toBe(200);
      const json = (await res.json()) as { status: string; workers: unknown };
      expect(json.status).toBe("ok");
      expect(typeof json.workers).toBe("object");
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("GET /unknown returns 404", async () => {
    const server = createMetricsHealthServer(registry, BASE_PORT + 2);
    try {
      const res = await fetch(`http://127.0.0.1:${BASE_PORT + 2}/unknown`);
      expect(res.status).toBe(404);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

describe("DEFAULT_HTTP_PORT", () => {
  it("is 9090", () => {
    expect(DEFAULT_HTTP_PORT).toBe(9090);
  });
});
