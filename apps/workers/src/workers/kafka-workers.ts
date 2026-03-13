/**
 * Kafka consumer worker definitions for the background services process.
 *
 * Eight workers are bootstrapped with unique consumer group IDs and stub
 * start/stop/health until COMP-009.1 and domain packages provide real
 * Kafka consumers. Prometheus counters are registered per worker for
 * worker_messages_processed_total and worker_message_errors_total.
 *
 * Architecture: COMP-034, platform/background-services/ARCHITECTURE.md
 */

import { createLogger } from "@syntropy/platform-core";
import { getWorkerCounters } from "../metrics.js";
import type { Worker } from "../types.js";

const log = createLogger("workers:kafka");

/** Consumer group ID and display name for each worker (COMP-034.2). */
export const KAFKA_WORKER_CONFIG: ReadonlyArray<{ name: string; consumerGroupId: string }> = [
  { name: "audit-log", consumerGroupId: "audit-log" },
  { name: "portfolio-agg", consumerGroupId: "portfolio-agg" },
  { name: "search-index", consumerGroupId: "search-index" },
  { name: "usage-registered", consumerGroupId: "usage-registered" },
  { name: "governance-proposal", consumerGroupId: "governance-proposal" },
  { name: "public-square-indexer", consumerGroupId: "public-square-indexer" },
  { name: "notifications", consumerGroupId: "notifications" },
  { name: "context-refresh", consumerGroupId: "context-refresh" },
];

/**
 * Create a stub worker for the given config. Real Kafka subscribe/consume
 * will be wired when COMP-009.1 and domain packages provide consumers.
 */
function createStubKafkaWorker(config: { name: string; consumerGroupId: string }): Worker {
  return {
    name: config.name,
    async start(): Promise<void> {
      log.debug({ worker: config.name, consumerGroupId: config.consumerGroupId }, "Kafka worker started (stub)");
    },
    async stop(): Promise<void> {
      log.debug({ worker: config.name }, "Kafka worker stopped (stub)");
    },
    async health() {
      return { status: "ok" };
    },
  };
}

/** Expose counters for a worker by name (for real consumers to use later). */
export function getCountersForWorker(workerName: string): ReturnType<typeof getWorkerCounters> {
  return getWorkerCounters(workerName);
}

/**
 * Return all 8 Kafka consumer workers for registration in WorkerRegistry.
 * Started in parallel by the registry; each has a unique consumer group ID.
 */
export function getKafkaWorkers(): Worker[] {
  return KAFKA_WORKER_CONFIG.map((config) => createStubKafkaWorker(config));
}
