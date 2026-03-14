/**
 * Unit tests for ResourceQuotaEnforcer (COMP-030.3).
 */

import { describe, it, expect } from "vitest";
import { QuotaExceededError, ResourceQuotaEnforcer } from "../../src/index.js";
import type { UsagePort } from "../../src/domain/ports/usage-port.js";
import type { RolePort } from "../../src/domain/ports/role-port.js";

function createStubUsagePort(usage: {
  activeSessionCount: number;
  cpuUsed?: number;
  memoryMbUsed?: number;
}): UsagePort {
  return {
    async getUsage() {
      return usage;
    },
  };
}

function createStubRolePort(role: string): RolePort {
  return {
    async getRole() {
      return role;
    },
  };
}

describe("ResourceQuotaEnforcer (COMP-030.3)", () => {
  it("does not throw when active session count is under quota", async () => {
    const enforcer = new ResourceQuotaEnforcer(
      createStubUsagePort({ activeSessionCount: 1 }),
      createStubRolePort("default"),
      { default: { maxConcurrentSessions: 2 } }
    );
    await expect(enforcer.enforce("user-1")).resolves.toBeUndefined();
  });

  it("does not throw when active session count equals quota", async () => {
    const enforcer = new ResourceQuotaEnforcer(
      createStubUsagePort({ activeSessionCount: 2 }),
      createStubRolePort("default"),
      { default: { maxConcurrentSessions: 2 } }
    );
    await expect(enforcer.enforce("user-1")).resolves.toBeUndefined();
  });

  it("throws QuotaExceededError when active session count exceeds quota", async () => {
    const enforcer = new ResourceQuotaEnforcer(
      createStubUsagePort({ activeSessionCount: 3 }),
      createStubRolePort("default"),
      { default: { maxConcurrentSessions: 2 } }
    );
    await expect(enforcer.enforce("user-1")).rejects.toThrow(QuotaExceededError);
    try {
      await enforcer.enforce("user-1");
    } catch (err) {
      expect(err).toBeInstanceOf(QuotaExceededError);
      const e = err as QuotaExceededError;
      expect(e.userId).toBe("user-1");
      expect(e.currentUsage.activeSessionCount).toBe(3);
      expect(e.limit.maxConcurrentSessions).toBe(2);
    }
  });

  it("uses role from RolePort to select quota", async () => {
    const enforcer = new ResourceQuotaEnforcer(
      createStubUsagePort({ activeSessionCount: 2 }),
      createStubRolePort("admin"),
      {
        default: { maxConcurrentSessions: 2 },
        admin: { maxConcurrentSessions: 5 },
      }
    );
    await expect(enforcer.enforce("user-1")).resolves.toBeUndefined();
  });

  it("throws when role quota is exceeded for non-default role", async () => {
    const enforcer = new ResourceQuotaEnforcer(
      createStubUsagePort({ activeSessionCount: 2 }),
      createStubRolePort("default"),
      { default: { maxConcurrentSessions: 1 } }
    );
    await expect(enforcer.enforce("user-1")).rejects.toThrow(QuotaExceededError);
  });

  it("does nothing when role has no config and default is missing", async () => {
    const enforcer = new ResourceQuotaEnforcer(
      createStubUsagePort({ activeSessionCount: 10 }),
      createStubRolePort("unknown"),
      {}
    );
    await expect(enforcer.enforce("user-1")).resolves.toBeUndefined();
  });

  it("throws when CPU usage exceeds role limit", async () => {
    const enforcer = new ResourceQuotaEnforcer(
      createStubUsagePort({
        activeSessionCount: 1,
        cpuUsed: 3,
        memoryMbUsed: 1024,
      }),
      createStubRolePort("default"),
      {
        default: {
          maxConcurrentSessions: 2,
          maxCpu: 2,
          maxMemoryMb: 2048,
        },
      }
    );
    await expect(enforcer.enforce("user-1")).rejects.toThrow(QuotaExceededError);
  });

  it("throws when memory usage exceeds role limit", async () => {
    const enforcer = new ResourceQuotaEnforcer(
      createStubUsagePort({
        activeSessionCount: 1,
        cpuUsed: 1,
        memoryMbUsed: 3000,
      }),
      createStubRolePort("default"),
      {
        default: {
          maxConcurrentSessions: 2,
          maxCpu: 4,
          maxMemoryMb: 2048,
        },
      }
    );
    await expect(enforcer.enforce("user-1")).rejects.toThrow(QuotaExceededError);
  });
});
