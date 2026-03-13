/**
 * Unit tests for CircuitBreaker (COMP-040.1).
 * Verifies state transitions closed → open → half_open → closed and CircuitOpenError when open.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CircuitBreaker } from "./circuit-breaker.js";
import { CircuitOpenError } from "./errors.js";

describe("CircuitBreaker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("closed state", () => {
    it("returns result and resets failure count on success", async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 1,
        resetTimeoutMs: 100,
      });

      const result = await cb.execute(async () => "ok");
      expect(result).toBe("ok");
      expect(cb.getState()).toBe("closed");
    });

    it("opens after failure threshold consecutive failures", async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 1,
        resetTimeoutMs: 1000,
        name: "test",
      });

      for (let i = 0; i < 3; i++) {
        await expect(
          cb.execute(async () => {
            throw new Error("fail");
          })
        ).rejects.toThrow("fail");
      }
      expect(cb.getState()).toBe("open");
    });

    it("resets failure count on success before threshold", async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 1,
        resetTimeoutMs: 1000,
      });

      await expect(
        cb.execute(async () => {
          throw new Error("fail");
        })
      ).rejects.toThrow("fail");
      await expect(
        cb.execute(async () => {
          throw new Error("fail");
        })
      ).rejects.toThrow("fail");
      // success resets
      await cb.execute(async () => "ok");
      // one more failure doesn't open (count is 1 again)
      await expect(
        cb.execute(async () => {
          throw new Error("fail");
        })
      ).rejects.toThrow("fail");
      expect(cb.getState()).toBe("closed");
    });
  });

  describe("open state", () => {
    it("throws CircuitOpenError when open and does not invoke fn", async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 1,
        successThreshold: 1,
        resetTimeoutMs: 10_000,
        name: "my-circuit",
      });

      await expect(
        cb.execute(async () => {
          throw new Error("fail");
        })
      ).rejects.toThrow("fail");
      expect(cb.getState()).toBe("open");

      const fn = vi.fn().mockRejectedValue(new Error("never called"));
      await expect(cb.execute(fn)).rejects.toThrow(CircuitOpenError);
      expect(fn).not.toHaveBeenCalled();

      const err = await cb.execute(fn).catch((e: unknown) => e) as CircuitOpenError;
      expect(err).toBeInstanceOf(CircuitOpenError);
      expect(err.name).toBe("CircuitOpenError");
      expect(err.circuitName).toBe("my-circuit");
      expect(err.state).toBe("open");
    });

    it("transitions to half_open after resetTimeoutMs and runs one probe", async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 1,
        successThreshold: 1,
        resetTimeoutMs: 100,
        name: "test",
      });

      await expect(
        cb.execute(async () => {
          throw new Error("fail");
        })
      ).rejects.toThrow("fail");
      expect(cb.getState()).toBe("open");

      vi.advanceTimersByTime(150);

      const result = cb.execute(async () => "probe-ok");
      await expect(result).resolves.toBe("probe-ok");
      expect(cb.getState()).toBe("closed");
    });

    it("transitions back to open if half-open probe fails", async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 1,
        successThreshold: 1,
        resetTimeoutMs: 100,
      });

      await expect(
        cb.execute(async () => {
          throw new Error("fail");
        })
      ).rejects.toThrow("fail");
      vi.advanceTimersByTime(150);

      await expect(
        cb.execute(async () => {
          throw new Error("probe-fail");
        })
      ).rejects.toThrow("probe-fail");
      expect(cb.getState()).toBe("open");
    });
  });

  describe("half_open state", () => {
    it("closes after successThreshold consecutive successes", async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 1,
        successThreshold: 2,
        resetTimeoutMs: 100,
      });

      await expect(
        cb.execute(async () => {
          throw new Error("fail");
        })
      ).rejects.toThrow("fail");
      vi.advanceTimersByTime(150);

      await cb.execute(async () => "first");
      expect(cb.getState()).toBe("half_open");
      await cb.execute(async () => "second");
      expect(cb.getState()).toBe("closed");
    });

    it("opens on first failure in half_open", async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 1,
        successThreshold: 2,
        resetTimeoutMs: 100,
      });

      await expect(
        cb.execute(async () => {
          throw new Error("fail");
        })
      ).rejects.toThrow("fail");
      vi.advanceTimersByTime(150);

      await cb.execute(async () => "ok");
      expect(cb.getState()).toBe("half_open");
      await expect(
        cb.execute(async () => {
          throw new Error("again");
        })
      ).rejects.toThrow("again");
      expect(cb.getState()).toBe("open");
    });
  });

  describe("callbacks", () => {
    it("calls onStateChange on transitions", async () => {
      const onStateChange = vi.fn();
      const cb = new CircuitBreaker(
        {
          failureThreshold: 1,
          successThreshold: 1,
          resetTimeoutMs: 100,
        },
        { onStateChange }
      );

      await expect(
        cb.execute(async () => {
          throw new Error("fail");
        })
      ).rejects.toThrow("fail");
      expect(onStateChange).toHaveBeenCalledWith("closed", "open");

      vi.advanceTimersByTime(150);
      await cb.execute(async () => "ok");
      expect(onStateChange).toHaveBeenCalledWith("open", "half_open");
      expect(onStateChange).toHaveBeenCalledWith("half_open", "closed");
    });

    it("calls onCall with outcome", async () => {
      const onCall = vi.fn();
      const cb = new CircuitBreaker(
        {
          failureThreshold: 1,
          successThreshold: 1,
          resetTimeoutMs: 100,
        },
        { onCall }
      );

      await cb.execute(async () => "ok");
      expect(onCall).toHaveBeenCalledWith("success");

      await expect(
        cb.execute(async () => {
          throw new Error("fail");
        })
      ).rejects.toThrow("fail");
      expect(onCall).toHaveBeenCalledWith("failure");

      await expect(cb.execute(async () => "x")).rejects.toThrow(CircuitOpenError);
      expect(onCall).toHaveBeenCalledWith("rejected");
    });
  });
});
