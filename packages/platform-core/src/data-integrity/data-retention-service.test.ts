/**
 * Unit tests for DataRetentionService (COMP-039.5).
 */

import { describe, it, expect } from "vitest";
import {
  DataRetentionService,
  DEFAULT_DATA_RETENTION_POLICY,
  type PurgeAuditSink,
} from "./data-retention-service.js";

describe("DataRetentionService", () => {
  const auditRecords: Array<{ entityType: string; purgedCount: number }> = [];
  const audit: PurgeAuditSink = {
    async recordPurge(result) {
      auditRecords.push({
        entityType: result.entityType,
        purgedCount: result.purgedCount,
      });
    },
  };

  it("runRetentionPurge returns results and does not touch event_log", async () => {
    const service = new DataRetentionService({
      policy: DEFAULT_DATA_RETENTION_POLICY,
      audit,
    });
    const results = await service.runRetentionPurge();
    expect(Array.isArray(results)).toBe(true);
    expect(results.every((r) => r.entityType !== "event_log")).toBe(true);
  });

  it("getPolicy returns the configured policy", () => {
    const service = new DataRetentionService({
      policy: DEFAULT_DATA_RETENTION_POLICY,
      audit: { async recordPurge() {} },
    });
    const policy = service.getPolicy();
    expect(policy).toBeDefined();
    expect(policy.sessionLog.days).toBe(90);
  });

  it("purgeUserData records audit entry", async () => {
    auditRecords.length = 0;
    const service = new DataRetentionService({
      policy: DEFAULT_DATA_RETENTION_POLICY,
      audit,
    });
    await service.purgeUserData("user-123");
    expect(auditRecords.some((r) => r.entityType === "user_purge")).toBe(true);
  });

  it("runRetentionPurge calls repository when provided and records audit", async () => {
    auditRecords.length = 0;
    const service = new DataRetentionService({
      policy: DEFAULT_DATA_RETENTION_POLICY,
      audit,
      repositories: {
        purgeExpiredSessions: async () => 5,
        purgeExpiredModerationLogs: async () => 0,
      },
    });
    const results = await service.runRetentionPurge();
    expect(results.length).toBeGreaterThanOrEqual(1);
    const sessionResult = results.find((r) => r.entityType === "session_log");
    expect(sessionResult?.purgedCount).toBe(5);
    expect(auditRecords.some((r) => r.entityType === "session_log" && r.purgedCount === 5)).toBe(
      true
    );
  });
});
