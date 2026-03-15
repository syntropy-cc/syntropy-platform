/**
 * Unit tests for tracing init (COMP-038.3).
 * Uses no-op exporter to avoid network in unit tests.
 */

import { describe, it, expect } from "vitest";
import { trace } from "@opentelemetry/api";
import { initTracing } from "./tracing.js";

const noopExporter = {
  export: () => Promise.resolve({ code: 0 }),
  shutdown: () => Promise.resolve(),
  forceFlush: () => Promise.resolve(),
};

describe("tracing", () => {
  it("initTracing registers tracer and span creation does not throw", () => {
    initTracing({ serviceName: "test", spanExporter: noopExporter });
    const tracer = trace.getTracer("test", "1.0.0");
    const span = tracer.startSpan("test-span");
    expect(span).toBeDefined();
    span.end();
  });

  it("initTracing is idempotent", () => {
    initTracing({ serviceName: "test", spanExporter: noopExporter });
    initTracing({ serviceName: "other", spanExporter: noopExporter });
    const tracer = trace.getTracer("test");
    const span = tracer.startSpan("span");
    span.end();
  });
});
