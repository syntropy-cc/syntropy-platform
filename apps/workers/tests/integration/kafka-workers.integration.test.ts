/**
 * Kafka workers integration test (COMP-034.7).
 * Tests stub Kafka workers start, health, and stop (no real Kafka needed).
 * Run with WORKERS_INTEGRATION=true.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getKafkaWorkers } from "../../src/workers/kafka-workers.js";
import { startIntegrationContainers } from "./setup.js";

const describeIntegration =
  process.env.WORKERS_INTEGRATION === "true" ? describe : describe.skip;

describeIntegration("Kafka workers (COMP-034.7)", () => {
  let ctx: Awaited<ReturnType<typeof startIntegrationContainers>>;

  beforeAll(async () => {
    ctx = await startIntegrationContainers();
  }, 90_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("stub Kafka workers start, report health, and stop", async () => {
    const workers = getKafkaWorkers();
    expect(workers.length).toBeGreaterThanOrEqual(5);

    for (const worker of workers) {
      await worker.start();
      const health = await worker.health();
      expect(health.status).toBe("ok");
      await worker.stop();
    }
  });
});
