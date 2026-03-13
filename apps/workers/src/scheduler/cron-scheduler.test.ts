/**
 * Unit tests for CronScheduler (COMP-034.4).
 */

import { describe, it, expect } from "vitest";
import { createCronScheduler } from "./cron-scheduler.js";

describe("CronScheduler", () => {
  it("creates a worker with name cron-scheduler", () => {
    const worker = createCronScheduler();
    expect(worker.name).toBe("cron-scheduler");
  });

  it("health returns ok", async () => {
    const worker = createCronScheduler();
    const health = await worker.health();
    expect(health.status).toBe("ok");
  });
});
