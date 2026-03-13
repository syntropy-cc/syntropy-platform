/**
 * Bulkhead pattern: limits concurrent executions via a semaphore.
 *
 * When rejectOverflow is false, excess calls wait in queue until a slot is
 * free. When true, excess calls are rejected immediately with BulkheadRejectedError.
 *
 * Architecture: COMP-040.4, cross-cutting/resilience/ARCHITECTURE.md
 */

/** Thrown when the bulkhead is full and rejectOverflow is true. */
export class BulkheadRejectedError extends Error {
  readonly maxConcurrent: number;

  constructor(maxConcurrent: number, message?: string) {
    super(
      message ??
        `Bulkhead limit reached (maxConcurrent=${maxConcurrent}); call rejected`
    );
    this.name = "BulkheadRejectedError";
    this.maxConcurrent = maxConcurrent;
    Object.setPrototypeOf(this, BulkheadRejectedError.prototype);
  }
}

export interface BulkheadConfig {
  /** Maximum number of concurrent executions. */
  maxConcurrent: number;
  /** If true, reject immediately when at capacity; otherwise queue. Default false. */
  rejectOverflow?: boolean;
}

/**
 * Bulkhead: limits parallel executions to maxConcurrent.
 * execute(fn) acquires a slot, runs fn, and releases in finally.
 */
export class Bulkhead {
  private readonly maxConcurrent: number;
  private readonly rejectOverflow: boolean;
  private inUse = 0;
  private readonly waitQueue: Array<() => void> = [];

  constructor(config: BulkheadConfig) {
    if (config.maxConcurrent < 1) {
      throw new RangeError("Bulkhead maxConcurrent must be >= 1");
    }
    this.maxConcurrent = config.maxConcurrent;
    this.rejectOverflow = config.rejectOverflow ?? false;
  }

  /**
   * Executes fn with a concurrency slot. When at capacity and rejectOverflow
   * is true, throws BulkheadRejectedError. Otherwise waits until a slot is free.
   *
   * @param fn - Async function to run.
   * @returns The result of fn().
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.inUse < this.maxConcurrent) {
      this.inUse += 1;
      return Promise.resolve();
    }
    if (this.rejectOverflow) {
      throw new BulkheadRejectedError(this.maxConcurrent);
    }
    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  private release(): void {
    this.inUse -= 1;
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      if (next) {
        this.inUse += 1;
        next();
      }
    }
  }
}
