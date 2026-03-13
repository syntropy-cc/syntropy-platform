/**
 * Unit tests for structured logger (COMP-038.1).
 * Verifies redaction, correlation ID propagation, and level behaviour.
 */

import { describe, it, expect } from "vitest";
import { createLogger, withCorrelationId } from "./logger";

function captureLogger(options?: { level?: string }) {
  const chunks: string[] = [];
  const logger = createLogger("test", {
    ...options,
    destination: { write: (chunk: string) => chunks.push(chunk) },
  });
  return { logger, chunks };
}

describe("createLogger", () => {
  it("returns a logger with the given service name in output", () => {
    const { logger, chunks } = captureLogger({ level: "info" });

    logger.info({ msg: "hello" });

    const out = JSON.parse(chunks[0]!);
    expect(out.service).toBe("test");
    expect(out.msg).toBe("hello");
    expect(out.level).toBe("info");
    expect(out.time).toBeDefined();
  });

  it("sets level from options when provided", () => {
    const { logger, chunks } = captureLogger({ level: "debug" });

    logger.debug({ msg: "debug message" });

    expect(chunks.length).toBe(1);
    const out = JSON.parse(chunks[0]!);
    expect(out.level).toBe("debug");
  });
});

describe("logger redaction", () => {
  it("redacts secret keys in log output and does not contain literal values", () => {
    const { logger, chunks } = captureLogger({ level: "info" });

    logger.info({
      msg: "user login",
      password: "super-secret",
      token: "jwt-xyz",
      apiKey: "key-123",
      safe: "visible",
    });

    const out = JSON.parse(chunks[0]!);
    expect(out.password).toBe("[REDACTED]");
    expect(out.token).toBe("[REDACTED]");
    expect(out.apiKey).toBe("[REDACTED]");
    expect(out.safe).toBe("visible");

    const raw = chunks[0]!;
    expect(raw).not.toContain("super-secret");
    expect(raw).not.toContain("jwt-xyz");
    expect(raw).not.toContain("key-123");
  });
});

describe("withCorrelationId", () => {
  it("includes correlation_id in every log record from child logger", () => {
    const { logger, chunks } = captureLogger({ level: "info" });
    const child = withCorrelationId(logger, "corr-123");

    child.info({ msg: "request processed" });

    const out = JSON.parse(chunks[0]!);
    expect(out.correlation_id).toBe("corr-123");
    expect(out.msg).toBe("request processed");
  });

  it("includes causation_id in every log record when provided", () => {
    const { logger, chunks } = captureLogger({ level: "info" });
    const child = withCorrelationId(logger, "corr-456", "cause-789");

    child.info({ msg: "event handled" });

    const out = JSON.parse(chunks[0]!);
    expect(out.correlation_id).toBe("corr-456");
    expect(out.causation_id).toBe("cause-789");
  });
});
