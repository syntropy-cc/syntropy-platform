/**
 * Tests for GET /metrics (COMP-038.4).
 */

import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import { metricsRoutes } from "./metrics.js";

describe("metricsRoutes", () => {
  it("GET /metrics returns 200 and Prometheus content type with metrics body", async () => {
    const app = Fastify({ logger: false });
    app.decorate("metricsRegistry", {
      metrics: async () => "# Minimal metrics\n",
    });
    await app.register(metricsRoutes);

    const res = await app.inject({ method: "GET", url: "/metrics" });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/plain");
    expect(res.payload).toContain("# Minimal metrics");
  });
});
