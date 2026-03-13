/**
 * Unit tests for Kafka worker bootstrapping (COMP-034.2).
 * Verifies 8 workers, unique names and consumer group IDs, and Worker contract.
 */

import { describe, it, expect } from "vitest";
import { getKafkaWorkers, KAFKA_WORKER_CONFIG } from "./kafka-workers.js";

const EXPECTED_NAMES = [
  "audit-log",
  "portfolio-agg",
  "search-index",
  "usage-registered",
  "governance-proposal",
  "public-square-indexer",
  "notifications",
  "context-refresh",
];

describe("getKafkaWorkers", () => {
  it("returns exactly 8 workers", () => {
    const workers = getKafkaWorkers();
    expect(workers).toHaveLength(8);
  });

  it("each worker has a unique name", () => {
    const workers = getKafkaWorkers();
    const names = workers.map((w) => w.name);
    const unique = new Set(names);
    expect(unique.size).toBe(8);
    expect(names).toEqual(EXPECTED_NAMES);
  });

  it("each worker has start, stop, and health methods", () => {
    const workers = getKafkaWorkers();
    for (const worker of workers) {
      expect(typeof worker.start).toBe("function");
      expect(typeof worker.stop).toBe("function");
      expect(typeof worker.health).toBe("function");
    }
  });

  it("each worker start resolves and health returns ok", async () => {
    const workers = getKafkaWorkers();
    for (const worker of workers) {
      await worker.start();
      const h = await worker.health();
      expect(h.status).toBe("ok");
    }
  });

  it("each worker stop resolves", async () => {
    const workers = getKafkaWorkers();
    for (const worker of workers) {
      await worker.stop();
    }
  });
});

describe("KAFKA_WORKER_CONFIG", () => {
  it("has 8 entries with unique consumer group IDs", () => {
    const ids = KAFKA_WORKER_CONFIG.map((c) => c.consumerGroupId);
    expect(new Set(ids).size).toBe(8);
    expect(ids).toEqual(EXPECTED_NAMES);
  });

  it("name and consumerGroupId match for each entry", () => {
    for (const config of KAFKA_WORKER_CONFIG) {
      expect(config.name).toBe(config.consumerGroupId);
    }
  });
});
