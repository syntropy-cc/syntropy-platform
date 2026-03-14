/**
 * ResourceQuotaEnforcer — enforces per-role session and resource limits (COMP-030.3).
 * Architecture: IDE domain, IIDE2
 */

import { QuotaExceededError } from "../errors.js";
import type { UsagePort } from "../ports/usage-port.js";
import type { RolePort } from "../ports/role-port.js";

export interface RoleQuotaConfig {
  maxConcurrentSessions: number;
  maxCpu?: number;
  maxMemoryMb?: number;
}

export type QuotaConfigByRole = Record<string, RoleQuotaConfig>;

const DEFAULT_ROLE = "default";

/**
 * Enforces resource quotas per user role. Uses UsagePort for current usage
 * and RolePort for role resolution; throws QuotaExceededError when exceeded.
 */
export class ResourceQuotaEnforcer {
  constructor(
    private readonly usagePort: UsagePort,
    private readonly rolePort: RolePort,
    private readonly quotaConfig: QuotaConfigByRole
  ) {}

  /**
   * Ensures the user is within their role's quota. Throws QuotaExceededError if not.
   */
  async enforce(userId: string): Promise<void> {
    const role = await this.rolePort.getRole(userId);
    const config = this.quotaConfig[role] ?? this.quotaConfig[DEFAULT_ROLE];
    if (!config) {
      return;
    }
    const usage = await this.usagePort.getUsage(userId);
    if (usage.activeSessionCount > config.maxConcurrentSessions) {
      throw new QuotaExceededError(
        `User has ${usage.activeSessionCount} active sessions; limit is ${config.maxConcurrentSessions}`,
        userId,
        {
          activeSessionCount: usage.activeSessionCount,
          cpuUsed: usage.cpuUsed,
          memoryMbUsed: usage.memoryMbUsed,
        },
        {
          maxConcurrentSessions: config.maxConcurrentSessions,
          maxCpu: config.maxCpu,
          maxMemoryMb: config.maxMemoryMb,
        }
      );
    }
    if (
      config.maxCpu != null &&
      usage.cpuUsed != null &&
      usage.cpuUsed > config.maxCpu
    ) {
      throw new QuotaExceededError(
        `User CPU usage ${usage.cpuUsed} exceeds limit ${config.maxCpu}`,
        userId,
        {
          activeSessionCount: usage.activeSessionCount,
          cpuUsed: usage.cpuUsed,
          memoryMbUsed: usage.memoryMbUsed,
        },
        {
          maxConcurrentSessions: config.maxConcurrentSessions,
          maxCpu: config.maxCpu,
          maxMemoryMb: config.maxMemoryMb,
        }
      );
    }
    if (
      config.maxMemoryMb != null &&
      usage.memoryMbUsed != null &&
      usage.memoryMbUsed > config.maxMemoryMb
    ) {
      throw new QuotaExceededError(
        `User memory usage ${usage.memoryMbUsed} MB exceeds limit ${config.maxMemoryMb}`,
        userId,
        {
          activeSessionCount: usage.activeSessionCount,
          cpuUsed: usage.cpuUsed,
          memoryMbUsed: usage.memoryMbUsed,
        },
        {
          maxConcurrentSessions: config.maxConcurrentSessions,
          maxCpu: config.maxCpu,
          maxMemoryMb: config.maxMemoryMb,
        }
      );
    }
  }
}
