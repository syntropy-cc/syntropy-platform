/**
 * Unit tests for ProgressTrackingService (COMP-016.3).
 */

import { createCourseId, createFragmentId, createTrackId } from "@syntropy/types";
import { describe, it, expect, vi } from "vitest";
import { LearnerProgressRecord } from "../../../src/domain/fragment-artifact/learner-progress-record.js";
import { ProgressTrackingService } from "../../../src/domain/fragment-artifact/services/progress-tracking-service.js";

function createServiceWithMocks() {
  const savedRecords: LearnerProgressRecord[] = [];
  const progressRepository = {
    findByUserAndEntity: vi.fn(
      async (userId: string, entityId: string, entityType: "fragment" | "course" | "track") => {
        return savedRecords.find(
          (r) =>
            r.userId === userId &&
            r.entityId === entityId &&
            r.entityType === entityType
        ) ?? null;
      }
    ),
    save: vi.fn(async (record: LearnerProgressRecord) => {
      const idx = savedRecords.findIndex(
        (r) =>
          r.userId === record.userId &&
          r.entityId === record.entityId &&
          r.entityType === record.entityType
      );
      if (idx >= 0) savedRecords[idx] = record;
      else savedRecords.push(record);
    }),
  };
  const eventsPort = {
    publishFragmentCompleted: vi.fn(async () => {}),
    publishTrackCompleted: vi.fn(async () => {}),
  };
  const hierarchyPort = {
    getCourseIdForFragment: vi.fn(async () => null),
    getFragmentIdsForCourse: vi.fn(async () => []),
    getTrackIdForCourse: vi.fn(async () => null),
    getCourseIdsForTrack: vi.fn(async () => []),
  };
  const service = new ProgressTrackingService({
    progressRepository,
    eventsPort,
    hierarchyPort,
  });
  return {
    service,
    progressRepository,
    eventsPort,
    hierarchyPort,
    savedRecords: () => [...savedRecords],
  };
}

describe("ProgressTrackingService", () => {
  it("markFragmentStarted creates record and saves with in_progress", async () => {
    const { service, progressRepository, savedRecords } =
      createServiceWithMocks();
    const userId = "user-1";
    const fragmentId = createFragmentId(
      "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
    );

    await service.markFragmentStarted(userId, fragmentId);

    expect(progressRepository.findByUserAndEntity).toHaveBeenCalledWith(
      userId,
      fragmentId,
      "fragment"
    );
    expect(progressRepository.save).toHaveBeenCalled();
    const records = savedRecords();
    expect(records).toHaveLength(1);
    expect(records[0].status).toBe("in_progress");
  });

  it("markFragmentCompleted saves record and publishes fragment completed event", async () => {
    const { service, eventsPort, savedRecords } = createServiceWithMocks();
    const userId = "user-1";
    const fragmentId = createFragmentId(
      "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
    );

    await service.markFragmentCompleted(userId, fragmentId, 90);

    expect(eventsPort.publishFragmentCompleted).toHaveBeenCalledWith(
      userId,
      fragmentId,
      expect.any(Date),
      90
    );
    const records = savedRecords();
    expect(records).toHaveLength(1);
    expect(records[0].isCompleted).toBe(true);
  });

  it("markFragmentCompleted triggers track completed when all courses in track are complete", async () => {
    const courseId = createCourseId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
    const trackId = createTrackId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");
    const fragmentId = createFragmentId(
      "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
    );
    const { service, progressRepository, eventsPort, hierarchyPort } =
      createServiceWithMocks();

    hierarchyPort.getCourseIdForFragment.mockResolvedValue(courseId);
    hierarchyPort.getFragmentIdsForCourse.mockResolvedValue([fragmentId]);
    hierarchyPort.getTrackIdForCourse.mockResolvedValue(trackId);
    hierarchyPort.getCourseIdsForTrack.mockResolvedValue([courseId]);

    await service.markFragmentCompleted("user-1", fragmentId);

    expect(eventsPort.publishFragmentCompleted).toHaveBeenCalled();
    expect(eventsPort.publishTrackCompleted).toHaveBeenCalledWith(
      "user-1",
      trackId,
      expect.any(Date)
    );
  });
});
