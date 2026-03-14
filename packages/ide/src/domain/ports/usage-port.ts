/**
 * Port for current resource usage per user (COMP-030.3).
 * Implementations query IDE session repository or metrics.
 */

export interface UserUsage {
  activeSessionCount: number;
  cpuUsed?: number;
  memoryMbUsed?: number;
}

export interface UsagePort {
  getUsage(userId: string): Promise<UserUsage>;
}
