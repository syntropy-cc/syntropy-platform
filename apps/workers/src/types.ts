/**
 * Worker and health types for the background services process.
 *
 * Architecture: COMP-034, platform/background-services/ARCHITECTURE.md
 */

/** Health status reported by a worker. */
export type WorkerHealthStatus = "ok" | "degraded" | "unhealthy";

/** Health report for a single worker. */
export interface WorkerHealth {
  status: WorkerHealthStatus;
  message?: string;
}

/**
 * Contract for a background worker registered with WorkerRegistry.
 *
 * Workers are started concurrently at process boot and stopped on SIGTERM/SIGINT.
 */
export interface Worker {
  /** Unique name for logging and health reporting. */
  readonly name: string;

  /** Start the worker. Called once at process startup. */
  start(): Promise<void>;

  /** Stop the worker gracefully. Should complete within shutdown timeout. */
  stop(): Promise<void>;

  /** Report current health. Called by health checks. */
  health(): Promise<WorkerHealth>;
}
