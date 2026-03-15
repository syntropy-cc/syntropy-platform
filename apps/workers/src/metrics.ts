/**
 * Prometheus metrics for background workers (COMP-034.2, COMP-038.4).
 *
 * When initWorkerMetrics(registry) is called with a registry from
 * createMetrics('workers'), all counters use that registry. Otherwise
 * counters are created on the default prom-client register (e.g. in tests).
 *
 * Architecture: COMP-034, COMP-038, platform/background-services/ARCHITECTURE.md
 */

import { Counter, register } from "prom-client";
import type { Registry } from "prom-client";

let workerRegistry: Registry = register;
let processedCounter: Counter<string>;
let errorsCounter: Counter<string>;
let ideSessionsActiveCounter: Counter<string>;
let ideSessionsSuspendedCounter: Counter<string>;
let initialized = false;

function createCountersOnRegistry(reg: Registry): void {
  processedCounter = new Counter({
    name: "worker_messages_processed_total",
    help: "Total number of messages processed by each worker",
    labelNames: ["worker"],
    registers: [reg],
  });
  errorsCounter = new Counter({
    name: "worker_message_errors_total",
    help: "Total number of message processing errors per worker",
    labelNames: ["worker"],
    registers: [reg],
  });
  ideSessionsActiveCounter = new Counter({
    name: "ide_sessions_active_total",
    help: "Total number of active IDE sessions scanned by supervisor",
    labelNames: ["worker"],
    registers: [reg],
  });
  ideSessionsSuspendedCounter = new Counter({
    name: "ide_sessions_suspended_total",
    help: "Total number of IDE sessions suspended by supervisor",
    labelNames: ["worker"],
    registers: [reg],
  });
  workerRegistry = reg;
  initialized = true;
}

function ensureCounters(): void {
  if (!initialized) {
    createCountersOnRegistry(register);
  }
}

/**
 * Initialize worker metrics with the given registry (from createMetrics('workers')).
 * Call once at startup before any worker uses getWorkerCounters / getIDESupervisorCounters.
 */
export function initWorkerMetrics(registry: Registry): void {
  if (initialized) {
    return;
  }
  createCountersOnRegistry(registry);
}

/** Registry used for worker metrics (for tests and for /metrics response). */
export function getMetricsRegister(): Registry {
  ensureCounters();
  return workerRegistry;
}

/** @deprecated Use getMetricsRegister() for tests. Kept for backward compatibility. */
export const metricsRegister = {
  metrics: () => getMetricsRegister().metrics(),
  resetMetrics: () => getMetricsRegister().resetMetrics(),
};

/**
 * Get counter accessors for a named worker. Use when processing messages
 * or handling errors so Prometheus can scrape per-worker metrics.
 */
export function getWorkerCounters(workerName: string): {
  recordProcessed(): void;
  recordError(): void;
} {
  ensureCounters();
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
  ensureCounters();
  return {
    recordActiveScanned(count: number): void {
      ideSessionsActiveCounter.inc({ worker: workerName }, count);
    },
    recordSuspended(count: number): void {
      ideSessionsSuspendedCounter.inc({ worker: workerName }, count);
    },
  };
}
