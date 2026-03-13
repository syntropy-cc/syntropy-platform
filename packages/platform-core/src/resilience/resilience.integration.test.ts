/**
 * Integration tests for CircuitBreaker + RetryPolicy, Bulkhead under load, withTimeout (COMP-040.5).
 *
 * Uses real implementations; no mocks. Total runtime kept under 5s.
 */

import { describe, it, expect } from "vitest";
import { CircuitBreaker } from "./circuit-breaker.js";
import { CircuitOpenError } from "./errors.js";
import { RetryPolicy, isRetryableError } from "./retry-policy.js";
import { Bulkhead, BulkheadRejectedError } from "./bulkhead.js";
import { withTimeout } from "./timeout.js";
import { TimeoutError } from "./errors.js";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("CircuitBreaker + RetryPolicy integration", () => {
  it("retry_then_breaker_opens_after_failures_then_rejects_without_invoking_fn", async () => {
    let callCount = 0;
    const failingFn = () => {
      callCount += 1;
      return Promise.reject(new Error("transient"));
    };

    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      successThreshold: 1,
      resetTimeoutMs: 500,
      name: "integration",
    });
    const retry = new RetryPolicy({
      maxAttempts: 2,
      baseDelayMs: 20,
      jitterMs: 0,
    });

    const wrapped = () => retry.execute(() => breaker.execute(failingFn));

    await expect(wrapped()).rejects.toThrow(Error);
    expect(callCount).toBeGreaterThanOrEqual(2);

    callCount = 0;
    await expect(wrapped()).rejects.toThrow(CircuitOpenError);
    expect(callCount).toBe(0);
  });

  it("isRetryableError_returns_false_for_CircuitOpenError", () => {
    expect(isRetryableError(new CircuitOpenError("x"))).toBe(false);
  });
});

describe("Bulkhead under load", () => {
  it("limits_concurrent_executions_when_rejectOverflow_true", async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 2, rejectOverflow: true });
    const inFlight: number[] = [];
    const run = (id: number) =>
      bulkhead.execute(async () => {
        inFlight.push(id);
        await delay(50);
        inFlight.splice(inFlight.indexOf(id), 1);
        return id;
      });

    const p1 = run(1);
    const p2 = run(2);
    await delay(5);
    const p3 = run(3);
    await expect(p3).rejects.toThrow(BulkheadRejectedError);
    await expect(p1).resolves.toBe(1);
    await expect(p2).resolves.toBe(2);
  });

  it("queues_and_limits_concurrent_when_rejectOverflow_false", async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 2, rejectOverflow: false });
    let concurrent = 0;
    let maxSeen = 0;
    const run = () =>
      bulkhead.execute(async () => {
        concurrent += 1;
        if (concurrent > maxSeen) maxSeen = concurrent;
        await delay(30);
        concurrent -= 1;
        return concurrent;
      });

    await Promise.all([run(), run(), run(), run(), run()]);
    expect(maxSeen).toBeLessThanOrEqual(2);
  });
});

describe("withTimeout integration", () => {
  it("resolves_when_fn_completes_within_timeout", async () => {
    const result = await withTimeout(
      () => delay(20).then(() => 42),
      100,
      "fast"
    );
    expect(result).toBe(42);
  });

  it("throws_TimeoutError_when_fn_exceeds_timeout", async () => {
    await expect(
      withTimeout(() => delay(200), 50, "slow")
    ).rejects.toThrow(TimeoutError);
  });
});
