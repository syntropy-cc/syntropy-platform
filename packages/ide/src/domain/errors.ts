/**
 * IDE domain errors (COMP-030.3).
 * Architecture: IDE domain, ARCH-007
 */

/**
 * Thrown when a user exceeds their resource quota (sessions, CPU, memory).
 */
export class QuotaExceededError extends Error {
  constructor(
    message: string,
    public readonly userId: string,
    public readonly currentUsage: {
      activeSessionCount: number;
      cpuUsed?: number;
      memoryMbUsed?: number;
    },
    public readonly limit: {
      maxConcurrentSessions: number;
      maxCpu?: number;
      maxMemoryMb?: number;
    }
  ) {
    super(message);
    this.name = "QuotaExceededError";
    Object.setPrototypeOf(this, QuotaExceededError.prototype);
  }
}
