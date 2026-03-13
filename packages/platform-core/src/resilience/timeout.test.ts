/**
 * Unit tests for withTimeout (COMP-040.3).
 * Verifies timeout rejection, success path, and TimeoutError fields.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withTimeout, DEFAULT_HTTP_TIMEOUT_MS, DEFAULT_DB_TIMEOUT_MS, DEFAULT_JOB_TIMEOUT_MS } from "./timeout.js";
import { TimeoutError } from "./errors.js";

describe("withTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves with value when fn completes before timeout", async () => {
    const result = await withTimeout(() => Promise.resolve("ok"), 5000);
    expect(result).toBe("ok");
  });

  it("rejects with TimeoutError when fn exceeds timeout", async () => {
    const slowFn = () => new Promise<string>((resolve) => setTimeout(() => resolve("late"), 200));
    const promise = withTimeout(slowFn, 100, "slowOp");

    const expectation = expect(promise).rejects.toThrow(TimeoutError);
    await vi.advanceTimersByTimeAsync(150);
    await expectation;
  });

  it("TimeoutError includes operation and timeoutMs when operation is provided", async () => {
    const neverResolves = () => new Promise<never>(() => {});
    const promise = withTimeout(neverResolves, 200, "customOp");

    const expectation = expect(promise).rejects.toMatchObject({
      operation: "customOp",
      timeoutMs: 200,
    });
    await vi.advanceTimersByTimeAsync(250);
    await expectation;
  });

  it("rejects with inner error when fn rejects before timeout", async () => {
    const err = new Error("inner failure");
    const failingFn = () => Promise.reject(err);
    const promise = withTimeout(failingFn, 5000);

    await expect(promise).rejects.toThrow("inner failure");
    await expect(promise).rejects.toBe(err);
  });
});

describe("timeout constants", () => {
  it("DEFAULT_HTTP_TIMEOUT_MS is 30 seconds", () => {
    expect(DEFAULT_HTTP_TIMEOUT_MS).toBe(30_000);
  });

  it("DEFAULT_DB_TIMEOUT_MS is 10 seconds", () => {
    expect(DEFAULT_DB_TIMEOUT_MS).toBe(10_000);
  });

  it("DEFAULT_JOB_TIMEOUT_MS is 5 minutes", () => {
    expect(DEFAULT_JOB_TIMEOUT_MS).toBe(300_000);
  });
});
