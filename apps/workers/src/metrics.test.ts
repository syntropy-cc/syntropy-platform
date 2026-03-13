/**
 * Unit tests for worker Prometheus metrics (COMP-034.2).
 * Verifies counters are registered and getWorkerCounters returns working accessors.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { metricsRegister, getWorkerCounters } from "./metrics.js";

describe("getWorkerCounters", () => {
  beforeEach(() => {
    metricsRegister.resetMetrics();
  });

  it("returns recordProcessed and recordError functions for a worker name", () => {
    const counters = getWorkerCounters("test-worker");
    expect(typeof counters.recordProcessed).toBe("function");
    expect(typeof counters.recordError).toBe("function");
  });

  it("recordProcessed increments worker_messages_processed_total", async () => {
    const counters = getWorkerCounters("test-worker");
    counters.recordProcessed();
    counters.recordProcessed();
    const metrics = await metricsRegister.metrics();
    expect(metrics).toContain("worker_messages_processed_total");
    expect(metrics).toContain('worker="test-worker"');
  });

  it("recordError increments worker_message_errors_total", async () => {
    const counters = getWorkerCounters("other-worker");
    counters.recordError();
    const metrics = await metricsRegister.metrics();
    expect(metrics).toContain("worker_message_errors_total");
    expect(metrics).toContain('worker="other-worker"');
  });
});
