/**
 * Registry for background workers: concurrent start, graceful stop with timeout.
 *
 * Workers are registered at startup and started in parallel. On SIGTERM/SIGINT,
 * stopAll() is called with a configurable timeout (default 30s); the process
 * exits after shutdown.
 *
 * Architecture: COMP-034, platform/background-services/ARCHITECTURE.md
 */

import type { Worker, WorkerHealth } from "./types.js";

const DEFAULT_SHUTDOWN_TIMEOUT_MS = 30_000;

export interface StopAllOptions {
  /** Max wait for all workers to stop (ms). Default 30s. */
  timeoutMs?: number;
}

/**
 * Registry of workers. Start all concurrently; stop all with optional timeout.
 */
export class WorkerRegistry {
  private readonly workers: Worker[] = [];
  private started = false;

  /**
   * Register a worker. Must be called before startAll().
   */
  register(worker: Worker): void {
    if (this.started) {
      throw new Error("Cannot register workers after startAll() has been called");
    }
    this.workers.push(worker);
  }

  /**
   * Start all registered workers concurrently.
   */
  async startAll(): Promise<void> {
    if (this.started) {
      return;
    }
    this.started = true;
    await Promise.all(this.workers.map((w) => w.start()));
  }

  /**
   * Stop all workers concurrently. Waits up to timeoutMs (default 30s);
   * after that, resolves without waiting further (workers may still be stopping in background).
   *
   * @param options.timeoutMs - Max wait in ms. Default 30_000.
   */
  async stopAll(options: StopAllOptions = {}): Promise<void> {
    const timeoutMs = options.timeoutMs ?? DEFAULT_SHUTDOWN_TIMEOUT_MS;
    if (this.workers.length === 0) {
      return;
    }

    const stopPromises = this.workers.map((w) => w.stop());
    const timeoutPromise = new Promise<void>((resolve) =>
      setTimeout(resolve, timeoutMs)
    );

    const completed = await Promise.race([
      Promise.all(stopPromises).then(() => true),
      timeoutPromise.then(() => false),
    ]);

    if (!completed) {
      console.error(
        `[WorkerRegistry] Shutdown timeout (${timeoutMs}ms); some workers may still be stopping`
      );
    }
  }

  /**
   * Return health status for each registered worker (by name).
   */
  async getHealth(): Promise<Record<string, WorkerHealth>> {
    const entries = await Promise.all(
      this.workers.map(async (w) => [w.name, await w.health()] as const)
    );
    return Object.fromEntries(entries);
  }

  /** Number of registered workers. */
  get size(): number {
    return this.workers.length;
  }
}
