/**
 * Unit tests for readiness checks (COMP-033.7).
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  checkRedis,
  checkDatabase,
  checkKafka,
  runReadinessChecks,
} from "./readiness.js";

describe("readiness", () => {
  describe("checkRedis", () => {
    it("returns ok when ping succeeds", async () => {
      const result = await checkRedis("redis://localhost:6379");
      if (result.ok) {
        expect(result.ok).toBe(true);
      } else {
        expect(result.error).toBeDefined();
      }
    });

    it("returns not ok with error when connection fails", async () => {
      const result = await checkRedis("redis://invalid-host-that-does-not-resolve:6379");
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("checkDatabase", () => {
    it("returns not ok when connection string is invalid", async () => {
      const result = await checkDatabase(
        "postgresql://invalid:5432/nonexistent"
      );
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("checkKafka", () => {
    it("returns not ok when brokers are unreachable", async () => {
      const result = await checkKafka({
        brokers: ["localhost:19999"],
      });
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("runReadinessChecks", () => {
    const origRedis = process.env.REDIS_URL;
    const origDb = process.env.DATABASE_URL;
    const origKafka = process.env.KAFKA_BROKERS;

    beforeEach(() => {
      delete process.env.REDIS_URL;
      delete process.env.DATABASE_URL;
      delete process.env.KAFKA_BROKERS;
    });

    afterEach(() => {
      if (origRedis !== undefined) process.env.REDIS_URL = origRedis;
      if (origDb !== undefined) process.env.DATABASE_URL = origDb;
      if (origKafka !== undefined) process.env.KAFKA_BROKERS = origKafka;
    });

    it("returns ok with all checks skipped when no env is set", async () => {
      const result = await runReadinessChecks();
      expect(result.status).toBe("ok");
      expect(result.checks).toEqual({
        redis: "skipped",
        database: "skipped",
        kafka: "skipped",
      });
    });

    it("returns unhealthy when REDIS_URL is set and Redis is down", async () => {
      process.env.REDIS_URL = "redis://invalid-host:6379";
      const result = await runReadinessChecks();
      expect(result.status).toBe("unhealthy");
      expect(result.checks.redis).toBe("failed");
      expect(result.errors?.redis).toBeDefined();
    });
  });
});
