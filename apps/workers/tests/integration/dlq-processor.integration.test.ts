/**
 * DLQ processor integration test (COMP-034.7).
 * Uses Testcontainers Kafka + Postgres. Run with WORKERS_INTEGRATION=true.
 */

import { createKafkaClient } from "@syntropy/event-bus";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createDlqProcessor } from "../../src/workers/dlq-processor.js";
import { startIntegrationContainers } from "./setup.js";

const describeIntegration =
  process.env.WORKERS_INTEGRATION === "true" ? describe : describe.skip;

describeIntegration("DLQ processor (COMP-034.7)", () => {
  let ctx: Awaited<ReturnType<typeof startIntegrationContainers>>;
  let worker: ReturnType<typeof createDlqProcessor>;

  beforeAll(async () => {
    ctx = await startIntegrationContainers();
    process.env.KAFKA_BROKERS = ctx.env.KAFKA_BROKERS;
    process.env.DATABASE_URL = ctx.env.DATABASE_URL;
    process.env.DLQ_TOPICS = "default.dlq";
  }, 90_000);

  afterAll(async () => {
    if (worker) {
      await worker.stop();
    }
    await ctx.stop();
  });

  it(
    "archives message to dlq_archive after retries when processing fails",
    async () => {
    const client = createKafkaClient({
      brokers: [ctx.env.KAFKA_BROKERS],
    });
    await client.producer.connect();
    await client.producer.publish("default.dlq", {
      eventType: "dlq.test",
      payload: { test: true },
    });
    await client.producer.disconnect();

    worker = createDlqProcessor();
    await worker.start();

    const maxWaitMs = 50_000;
    const pollIntervalMs = 2_000;
    let row: { topic: string; retry_count: number } | null = null;
    const deadline = Date.now() + maxWaitMs;
    while (Date.now() < deadline) {
      const result = await ctx.pool.query(
        `SELECT topic, retry_count FROM platform_core.dlq_archive WHERE topic = $1 ORDER BY created_at DESC LIMIT 1`,
        ["default.dlq"]
      );
      if (result.rows.length > 0) {
        row = result.rows[0] as { topic: string; retry_count: number };
        break;
      }
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }

    expect(row).not.toBeNull();
    expect(row!.topic).toBe("default.dlq");
    expect(row!.retry_count).toBe(3);

    await Promise.race([
      worker.stop(),
      new Promise<void>((r) => setTimeout(r, 10_000)),
    ]);
    worker = null!;
    },
    70_000
  );
});
