/**
 * Unit tests for data retention policy (COMP-039.5).
 */

import { describe, it, expect } from "vitest";
import {
  DEFAULT_DATA_RETENTION_POLICY,
  type DataRetentionPolicy,
} from "./data-retention-policy.js";

describe("DEFAULT_DATA_RETENTION_POLICY", () => {
  it("defines session log retention of 90 days", () => {
    expect(DEFAULT_DATA_RETENTION_POLICY.sessionLog.days).toBe(90);
  });

  it("defines moderation log retention of 3 years", () => {
    expect(DEFAULT_DATA_RETENTION_POLICY.moderationLog.days).toBe(3 * 365);
  });

  it("defines personal data after deletion retention of 7 years", () => {
    expect(DEFAULT_DATA_RETENTION_POLICY.personalDataAfterDeletion.days).toBe(
      7 * 365
    );
  });
});

describe("DataRetentionPolicy", () => {
  it("session log can be soft-delete only", () => {
    const policy: DataRetentionPolicy = DEFAULT_DATA_RETENTION_POLICY;
    expect(policy.sessionLog.softDeleteOnly).toBe(true);
  });
});
