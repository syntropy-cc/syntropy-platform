/**
 * Unit tests for Bulkhead (COMP-040.4).
 * Verifies concurrency limit, queue vs reject overflow, release on throw, no leak.
 */

import { describe, it, expect, vi } from "vitest";
import { Bulkhead, BulkheadRejectedError } from "./bulkhead.js";

describe("BulkheadRejectedError", () => {
  it("has name and maxConcurrent", () => {
    const err = new BulkheadRejectedError(5);
    expect(err.name).toBe("BulkheadRejectedError");
    expect(err.maxConcurrent).toBe(5);
    expect(err.message).toContain("5");
  });
});

describe("Bulkhead", () => {
  describe("maxConcurrent limit", () => {
    it("limits concurrent executions to maxConcurrent", async () => {
      const bulkhead = new Bulkhead({ maxConcurrent: 2 });
      let concurrent = 0;
      let maxConcurrent = 0;
      const run = (id: number) =>
        bulkhead.execute(async () => {
          concurrent += 1;
          if (concurrent > maxConcurrent) maxConcurrent = concurrent;
          await new Promise<void>((r) => setTimeout(r, 1));
          concurrent -= 1;
          return id;
        });
      const results = await Promise.all([run(1), run(2), run(3)]);
      expect(results.sort()).toEqual([1, 2, 3]);
      expect(maxConcurrent).toBe(2);
    });
  });

  describe("queue mode (rejectOverflow false)", () => {
    it("runs excess calls after slots free up", async () => {
      const bulkhead = new Bulkhead({ maxConcurrent: 1, rejectOverflow: false });
      const order: number[] = [];
      const run = (id: number) =>
        bulkhead.execute(async () => {
          order.push(id);
          await Promise.resolve();
          return id;
        });
      const r1 = run(1);
      const r2 = run(2);
      const r3 = run(3);
      const results = await Promise.all([r1, r2, r3]);
      expect(results).toEqual([1, 2, 3]);
      expect(order).toEqual([1, 2, 3]);
    });
  });

  describe("reject overflow mode", () => {
    it("rejects excess calls immediately with BulkheadRejectedError", async () => {
      const bulkhead = new Bulkhead({ maxConcurrent: 1, rejectOverflow: true });
      const hold = bulkhead.execute(() => new Promise<void>(() => {}));
      await Promise.resolve();
      await expect(
        bulkhead.execute(async () => "should not run")
      ).rejects.toThrow(BulkheadRejectedError);
      await expect(
        bulkhead.execute(async () => "should not run")
      ).rejects.toThrow(BulkheadRejectedError);
    });
  });

  describe("release on throw", () => {
    it("releases slot when fn throws", async () => {
      const bulkhead = new Bulkhead({ maxConcurrent: 1 });
      await expect(
        bulkhead.execute(async () => {
          throw new Error("fail");
        })
      ).rejects.toThrow("fail");
      const result = await bulkhead.execute(async () => "ok");
      expect(result).toBe("ok");
    });
  });

  describe("no leak", () => {
    it("concurrent count returns to zero after all complete", async () => {
      const bulkhead = new Bulkhead({ maxConcurrent: 2 });
      await Promise.all([
        bulkhead.execute(async () => "a"),
        bulkhead.execute(async () => "b"),
      ]);
      const result = await bulkhead.execute(async () => "c");
      expect(result).toBe("c");
    });
  });

  describe("constructor", () => {
    it("throws RangeError when maxConcurrent < 1", () => {
      expect(() => new Bulkhead({ maxConcurrent: 0 })).toThrow(RangeError);
      expect(() => new Bulkhead({ maxConcurrent: -1 })).toThrow(RangeError);
    });
  });
});
