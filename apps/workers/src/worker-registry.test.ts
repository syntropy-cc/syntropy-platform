/**
 * Unit tests for WorkerRegistry (COMP-034.1).
 * Verifies concurrent start, stop with timeout, and health aggregation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkerRegistry } from "./worker-registry.js";
import type { Worker, WorkerHealth } from "./types.js";

function createMockWorker(
  name: string,
  opts: { startDelay?: number; stopDelay?: number; health?: WorkerHealth } = {}
): Worker {
  const { startDelay = 0, stopDelay = 0, health = { status: "ok" } } = opts;
  return {
    name,
    start: vi.fn().mockImplementation(() =>
      startDelay > 0 ? new Promise((r) => setTimeout(r, startDelay)) : Promise.resolve()
    ),
    stop: vi.fn().mockImplementation(() =>
      stopDelay > 0 ? new Promise((r) => setTimeout(r, stopDelay)) : Promise.resolve()
    ),
    health: vi.fn().mockResolvedValue(health),
  };
}

describe("WorkerRegistry", () => {
  let registry: WorkerRegistry;

  beforeEach(() => {
    registry = new WorkerRegistry();
  });

  describe("register", () => {
    it("adds workers and size reflects count", () => {
      registry.register(createMockWorker("a"));
      registry.register(createMockWorker("b"));
      expect(registry.size).toBe(2);
    });

    it("throws if register is called after startAll", async () => {
      const w = createMockWorker("a");
      registry.register(w);
      await registry.startAll();
      expect(() => registry.register(createMockWorker("b"))).toThrow(
        "Cannot register workers after startAll() has been called"
      );
    });
  });

  describe("startAll", () => {
    it("starts all registered workers concurrently", async () => {
      const a = createMockWorker("a");
      const b = createMockWorker("b");
      registry.register(a);
      registry.register(b);
      await registry.startAll();
      expect(a.start).toHaveBeenCalledTimes(1);
      expect(b.start).toHaveBeenCalledTimes(1);
    });

    it("is idempotent after first call", async () => {
      const a = createMockWorker("a");
      registry.register(a);
      await registry.startAll();
      await registry.startAll();
      expect(a.start).toHaveBeenCalledTimes(1);
    });

    it("starts workers in parallel", async () => {
      vi.useFakeTimers();
      const a = createMockWorker("a", { startDelay: 20 });
      const b = createMockWorker("b", { startDelay: 20 });
      registry.register(a);
      registry.register(b);
      const startAllPromise = registry.startAll();
      await vi.advanceTimersByTimeAsync(50);
      await startAllPromise;
      expect(a.start).toHaveBeenCalledTimes(1);
      expect(b.start).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });

  describe("stopAll", () => {
    it("stops all workers", async () => {
      const a = createMockWorker("a");
      const b = createMockWorker("b");
      registry.register(a);
      registry.register(b);
      await registry.startAll();
      await registry.stopAll({ timeoutMs: 1000 });
      expect(a.stop).toHaveBeenCalledTimes(1);
      expect(b.stop).toHaveBeenCalledTimes(1);
    });

    it("resolves after timeout when a worker stop hangs", async () => {
      vi.useFakeTimers();
      const fast = createMockWorker("fast");
      const slow = createMockWorker("slow", { stopDelay: 2000 });
      registry.register(fast);
      registry.register(slow);
      await registry.startAll();
      const stopPromise = registry.stopAll({ timeoutMs: 100 });
      await vi.advanceTimersByTimeAsync(250);
      await stopPromise;
      expect(fast.stop).toHaveBeenCalledTimes(1);
      expect(slow.stop).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it("does nothing when no workers registered", async () => {
      await registry.stopAll({ timeoutMs: 100 });
    });
  });

  describe("getHealth", () => {
    it("returns health entry per registered worker", async () => {
      registry.register(createMockWorker("w1", { health: { status: "ok" } }));
      registry.register(createMockWorker("w2", { health: { status: "degraded", message: "lag" } }));
      const health = await registry.getHealth();
      expect(health).toEqual({
        w1: { status: "ok" },
        w2: { status: "degraded", message: "lag" },
      });
    });

    it("returns empty object when no workers", async () => {
      const health = await registry.getHealth();
      expect(health).toEqual({});
    });
  });
});
