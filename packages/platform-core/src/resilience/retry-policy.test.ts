/**
 * Unit tests for RetryPolicy (COMP-040.2).
 * Verifies retries on transient errors, no retry on non-retryable, backoff and jitter.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RetryPolicy, isRetryableError } from "./retry-policy.js";
import { CircuitOpenError } from "./errors.js";

describe("isRetryableError", () => {
  it("returns false for CircuitOpenError", () => {
    expect(isRetryableError(new CircuitOpenError("x"))).toBe(false);
  });

  it("returns true for network error codes", () => {
    expect(isRetryableError(Object.assign(new Error("net"), { code: "ECONNRESET" }))).toBe(true);
    expect(isRetryableError(Object.assign(new Error("net"), { code: "ETIMEDOUT" }))).toBe(true);
    expect(isRetryableError(Object.assign(new Error("net"), { code: "ENOTFOUND" }))).toBe(true);
  });

  it("returns true for 429 and 5xx status", () => {
    expect(isRetryableError(Object.assign(new Error("rate"), { status: 429 }))).toBe(true);
    expect(isRetryableError(Object.assign(new Error("server"), { status: 500 }))).toBe(true);
    expect(isRetryableError(Object.assign(new Error("server"), { statusCode: 502 }))).toBe(true);
  });

  it("returns false for 4xx except 429", () => {
    expect(isRetryableError(Object.assign(new Error("bad"), { status: 400 }))).toBe(false);
    expect(isRetryableError(Object.assign(new Error("auth"), { status: 401 }))).toBe(false);
    expect(isRetryableError(Object.assign(new Error("forbidden"), { status: 403 }))).toBe(false);
  });

  it("returns true for unknown errors (transient by default)", () => {
    expect(isRetryableError(new Error("generic"))).toBe(true);
  });
});

describe("RetryPolicy", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("success on first call", () => {
    it("returns result without retrying", async () => {
      const policy = new RetryPolicy({ maxAttempts: 3, baseDelayMs: 100 });
      const fn = vi.fn().mockResolvedValue("ok");
      const p = policy.execute(fn);
      await expect(p).resolves.toBe("ok");
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("success after transient failure", () => {
    it("retries and returns result on second attempt", async () => {
      const policy = new RetryPolicy({
        maxAttempts: 3,
        baseDelayMs: 100,
        backoffMultiplier: 2,
        jitterMs: 0,
      });
      const err = Object.assign(new Error("transient"), { code: "ECONNRESET" });
      const fn = vi.fn().mockRejectedValueOnce(err).mockResolvedValueOnce("ok");
      const p = policy.execute(fn);
      await vi.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(100);
      await expect(p).resolves.toBe("ok");
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe("failure after max attempts", () => {
    it("throws the last error after max attempts exhausted", async () => {
      const policy = new RetryPolicy({
        maxAttempts: 3,
        baseDelayMs: 10,
        jitterMs: 0,
      });
      const err = Object.assign(new Error("transient"), { code: "ETIMEDOUT" });
      const fn = vi.fn().mockRejectedValue(err);
      const p = policy.execute(fn);
      const outcome = expect(p).rejects.toThrow("transient");
      await vi.advanceTimersByTimeAsync(50);
      await outcome;
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe("non-retryable errors", () => {
    it("does not retry on CircuitOpenError", async () => {
      const policy = new RetryPolicy({ maxAttempts: 3 });
      const fn = vi.fn().mockRejectedValue(new CircuitOpenError("c1"));
      await expect(policy.execute(fn)).rejects.toThrow(CircuitOpenError);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("does not retry on 400 Bad Request", async () => {
      const policy = new RetryPolicy({ maxAttempts: 3 });
      const err = Object.assign(new Error("bad request"), { status: 400 });
      const fn = vi.fn().mockRejectedValue(err);
      await expect(policy.execute(fn)).rejects.toThrow("bad request");
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("exponential backoff timing", () => {
    it("waits baseDelayMs before first retry and backoffMultiplier for next", async () => {
      const policy = new RetryPolicy({
        maxAttempts: 4,
        baseDelayMs: 100,
        backoffMultiplier: 2,
        jitterMs: 0,
      });
      const err = Object.assign(new Error("t"), { code: "ECONNRESET" });
      const fn = vi
        .fn()
        .mockRejectedValueOnce(err)
        .mockRejectedValueOnce(err)
        .mockRejectedValueOnce(err)
        .mockResolvedValueOnce("done");
      const p = policy.execute(fn);
      await vi.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(100);
      expect(fn).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(200);
      expect(fn).toHaveBeenCalledTimes(3);
      await vi.advanceTimersByTimeAsync(400);
      await expect(p).resolves.toBe("done");
      expect(fn).toHaveBeenCalledTimes(4);
    });
  });

  describe("jitter", () => {
    it("applies jitter within bounds when jitterMs > 0", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const policy = new RetryPolicy({
        maxAttempts: 2,
        baseDelayMs: 100,
        jitterMs: 20,
      });
      const err = Object.assign(new Error("t"), { code: "ETIMEDOUT" });
      const fn = vi.fn().mockRejectedValueOnce(err).mockResolvedValueOnce("ok");
      const p = policy.execute(fn);
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(120);
      await expect(p).resolves.toBe("ok");
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe("logger", () => {
    it("calls logger.warn on each retry with attempt and error", async () => {
      const logger = { warn: vi.fn() };
      const policy = new RetryPolicy({
        maxAttempts: 3,
        baseDelayMs: 10,
        jitterMs: 0,
        logger,
      });
      const err = Object.assign(new Error("transient"), { code: "ECONNRESET" });
      const fn = vi.fn().mockRejectedValueOnce(err).mockRejectedValueOnce(err).mockResolvedValueOnce("ok");
      const p = policy.execute(fn);
      await vi.advanceTimersByTimeAsync(0);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          attempt: 1,
          maxAttempts: 3,
          delayMs: 10,
          err: "transient",
        }),
        "RetryPolicy: retrying after transient error"
      );
      await vi.advanceTimersByTimeAsync(10);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ attempt: 2 }),
        "RetryPolicy: retrying after transient error"
      );
      await vi.advanceTimersByTimeAsync(20);
      await expect(p).resolves.toBe("ok");
      expect(logger.warn).toHaveBeenCalledTimes(2);
    });
  });

  describe("AbortSignal", () => {
    it("stops retrying when signal is aborted", async () => {
      const controller = new AbortController();
      const policy = new RetryPolicy({ maxAttempts: 5, baseDelayMs: 1000, jitterMs: 0 });
      const err = Object.assign(new Error("t"), { code: "ETIMEDOUT" });
      const fn = vi.fn().mockRejectedValue(err);
      const p = policy.execute(fn, { signal: controller.signal });
      await vi.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);
      controller.abort();
      await expect(p).rejects.toThrow("Aborted");
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
