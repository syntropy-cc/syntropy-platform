/**
 * Prometheus metrics for background workers.
 *
 * Registers per-worker counters for messages processed and errors.
 * Used by Kafka consumer workers when COMP-009.1 is implemented (COMP-034.2).
 *
 * Architecture: COMP-034, platform/background-services/ARCHITECTURE.md
 */

import { Counter, register } from "prom-client";

const processedCounter = new Counter({
  name: "worker_messages_processed_total",
  help: "Total number of messages processed by each worker",
  labelNames: ["worker"],
  registers: [register],
});

const errorsCounter = new Counter({
  name: "worker_message_errors_total",
  help: "Total number of message processing errors per worker",
  labelNames: ["worker"],
  registers: [register],
});

const ideSessionsActiveCounter = new Counter({
  name: "ide_sessions_active_total",
  help: "Total number of active IDE sessions scanned by supervisor",
  labelNames: ["worker"],
  registers: [register],
});

const ideSessionsSuspendedCounter = new Counter({
  name: "ide_sessions_suspended_total",
  help: "Total number of IDE sessions suspended by supervisor",
  labelNames: ["worker"],
  registers: [register],
});

export { register as metricsRegister };

/**
 * Get counter accessors for a named worker. Use when processing messages
 * or handling errors so Prometheus can scrape per-worker metrics.
 */
export function getWorkerCounters(workerName: string): {
  recordProcessed(): void;
  recordError(): void;
} {
  return {
    recordProcessed(): void {
      processedCounter.inc({ worker: workerName });
    },
    recordError(): void {
      errorsCounter.inc({ worker: workerName });
    },
  };
}

export function getIDESupervisorCounters(workerName: string): {
  recordActiveScanned(count: number): void;
  recordSuspended(count: number): void;
} {
  return {
    recordActiveScanned(count: number): void {
      ideSessionsActiveCounter.inc({ worker: workerName }, count);
    },
    recordSuspended(count: number): void {
      ideSessionsSuspendedCounter.inc({ worker: workerName }, count);
    },
  };
}
