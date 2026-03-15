/**
 * Unit tests for createMetrics factory (COMP-038.4).
 */

import { describe, it, expect } from "vitest";
import { createMetrics } from "./metrics.js";

describe("createMetrics", () => {
  it("returns registry and metric accessors for the given service name", () => {
    const metrics = createMetrics("test-service");

    expect(metrics.registry).toBeDefined();
    expect(typeof metrics.registry.metrics).toBe("function");
    expect(metrics.httpRequestDurationSeconds).toBeDefined();
    expect(metrics.httpRequestsTotal).toBeDefined();
    expect(metrics.dbQueryDurationSeconds).toBeDefined();
    expect(metrics.artifactPublicationsTotal).toBeDefined();
    expect(metrics.aiAgentInvocationsTotal).toBeDefined();
    expect(metrics.ideSessionsActiveTotal).toBeDefined();
  });

  it("registry.metrics() includes http_request_duration_seconds and http_requests_total", async () => {
    const metrics = createMetrics("test-service");
    const output = await metrics.registry.metrics();

    expect(output).toContain("http_request_duration_seconds");
    expect(output).toContain("http_requests_total");
    expect(output).toContain("db_query_duration_seconds");
    expect(output).toContain("artifact_publications_total");
    expect(output).toContain("ai_agent_invocations_total");
    expect(output).toContain("ide_sessions_active_total");
  });

  it("collects default Node.js metrics (process_cpu or process_resident_memory)", async () => {
    const metrics = createMetrics("test-service");
    const output = await metrics.registry.metrics();

    const hasDefaultMetrics =
      output.includes("process_cpu") ||
      output.includes("process_resident_memory_bytes") ||
      output.includes("nodejs_");
    expect(hasDefaultMetrics).toBe(true);
  });

  it("custom counters can be incremented and appear in output", async () => {
    const metrics = createMetrics("test-service");

    metrics.artifactPublicationsTotal.inc({ status: "success" });
    metrics.artifactPublicationsTotal.inc({ status: "success" });
    metrics.aiAgentInvocationsTotal.inc({ agent: "recommend", status: "ok" });
    metrics.ideSessionsActiveTotal.set(3);

    const output = await metrics.registry.metrics();
    expect(output).toContain("artifact_publications_total");
    expect(output).toContain("ai_agent_invocations_total");
    expect(output).toContain("ide_sessions_active_total");
  });

  it("http_requests_total can be incremented with labels", async () => {
    const metrics = createMetrics("api");

    metrics.httpRequestsTotal.inc({ method: "GET", route: "/health", status_code: "200" });
    metrics.httpRequestDurationSeconds.observe(
      { method: "GET", route: "/health", status_code: "200" },
      0.05
    );

    const output = await metrics.registry.metrics();
    expect(output).toContain("http_requests_total");
    expect(output).toContain("http_request_duration_seconds");
  });

  it("each call creates an independent registry", async () => {
    const a = createMetrics("service-a");
    const b = createMetrics("service-b");

    a.httpRequestsTotal.inc({ method: "GET", route: "/", status_code: "200" });
    const outputB = await b.registry.metrics();
    expect(outputB).not.toContain("service-a");
    const outputA = await a.registry.metrics();
    expect(outputA).toContain("service");
  });
});
