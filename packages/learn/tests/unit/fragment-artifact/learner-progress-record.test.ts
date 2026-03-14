/**
 * Unit tests for LearnerProgressRecord (COMP-016.3).
 */

import { describe, it, expect } from "vitest";
import { LearnerProgressRecord } from "../../../src/domain/fragment-artifact/learner-progress-record.js";

describe("LearnerProgressRecord", () => {
  it("create builds record with userId entityId entityType and default status", () => {
    const record = LearnerProgressRecord.create({
      userId: "user-1",
      entityId: "frag-1",
      entityType: "fragment",
    });
    expect(record.userId).toBe("user-1");
    expect(record.entityId).toBe("frag-1");
    expect(record.entityType).toBe("fragment");
    expect(record.status).toBe("not_started");
    expect(record.isCompleted).toBe(false);
    expect(record.completedAt).toBeNull();
  });

  it("markStarted sets status to in_progress and startedAt", () => {
    const record = LearnerProgressRecord.create({
      userId: "u1",
      entityId: "e1",
      entityType: "fragment",
    });
    record.markStarted();
    expect(record.status).toBe("in_progress");
    expect(record.startedAt.getTime()).toBeGreaterThan(0);
  });

  it("complete sets status to completed and completedAt", () => {
    const record = LearnerProgressRecord.create({
      userId: "u1",
      entityId: "e1",
      entityType: "fragment",
    });
    record.complete(85);
    expect(record.status).toBe("completed");
    expect(record.isCompleted).toBe(true);
    expect(record.completedAt).not.toBeNull();
    expect(record.score).toBe(85);
  });

  it("complete is idempotent when already completed", () => {
    const record = LearnerProgressRecord.create({
      userId: "u1",
      entityId: "e1",
      entityType: "fragment",
    });
    record.complete(80);
    const firstCompletedAt = record.completedAt;
    record.complete(90);
    expect(record.status).toBe("completed");
    expect(record.completedAt).toBe(firstCompletedAt);
    expect(record.score).toBe(90);
  });
});
