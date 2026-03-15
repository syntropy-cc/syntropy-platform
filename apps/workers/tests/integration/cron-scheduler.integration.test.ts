/**
 * Cron scheduler integration test (COMP-034.7).
 * Tests distributed lock with Redis and cron worker start/stop.
 * Run with WORKERS_INTEGRATION=true.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Redis from "ioredis";
import { acquireLock, releaseLock } from "../../src/scheduler/distributed-lock.js";
import { createCronScheduler } from "../../src/scheduler/cron-scheduler.js";
import { startIntegrationContainers } from "./setup.js";

const describeIntegration =
  process.env.WORKERS_INTEGRATION === "true" ? describe : describe.skip;

describeIntegration("Cron scheduler (COMP-034.7)", () => {
  let ctx: Awaited<ReturnType<typeof startIntegrationContainers>>;
  let redis: Redis;

  beforeAll(async () => {
    ctx = await startIntegrationContainers();
    process.env.REDIS_URL = ctx.env.REDIS_URL;
    process.env.DATABASE_URL = ctx.env.DATABASE_URL;
    redis = new Redis(ctx.env.REDIS_URL!);
  }, 90_000);

  afterAll(async () => {
    await redis?.quit();
    await ctx.stop();
  });

  it("distributed lock: first acquire succeeds, second fails until release", async () => {
    const key = "integration-test-lock";
    const acquired1 = await acquireLock(redis, key, 60);
    expect(acquired1).toBe(true);

    const acquired2 = await acquireLock(redis, key, 60);
    expect(acquired2).toBe(false);

    await releaseLock(redis, key);
    const acquired3 = await acquireLock(redis, key, 60);
    expect(acquired3).toBe(true);
    await releaseLock(redis, key);
  });

  it("cron scheduler worker starts and stops without error", async () => {
    const worker = createCronScheduler();
    await worker.start();
    const health = await worker.health();
    expect(health.status).toBe("ok");
    await worker.stop();
  });
});
