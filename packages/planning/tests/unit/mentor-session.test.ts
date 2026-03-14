/**
 * Unit tests for MentorSession and scheduling service (COMP-029.4).
 */

import { describe, it, expect } from "vitest";
import {
  MentorSession,
  MentorSessionStatus,
} from "../../src/domain/mentor-session.js";
import {
  MentorSessionSchedulingService,
  MentorNotAvailableError,
} from "../../src/application/mentor-session-scheduling-service.js";
import type { MentorAvailabilityPort } from "../../src/domain/ports/mentor-availability-port.js";

describe("MentorSession entity (COMP-029.4)", () => {
  const scheduledAt = new Date("2025-06-01T14:00:00Z");

  it("create builds session in scheduled status", () => {
    const session = MentorSession.create({
      sessionId: "ms1",
      mentorId: "m1",
      learnerId: "l1",
      scheduledAt,
    });
    expect(session.sessionId).toBe("ms1");
    expect(session.mentorId).toBe("m1");
    expect(session.learnerId).toBe("l1");
    expect(session.scheduledAt).toBe(scheduledAt);
    expect(session.status).toBe(MentorSessionStatus.Scheduled);
  });

  it("create throws when sessionId or mentorId or learnerId is empty", () => {
    expect(() =>
      MentorSession.create({
        sessionId: "",
        mentorId: "m1",
        learnerId: "l1",
        scheduledAt,
      })
    ).toThrow("MentorSession.sessionId cannot be empty");
    expect(() =>
      MentorSession.create({
        sessionId: "ms1",
        mentorId: "  ",
        learnerId: "l1",
        scheduledAt,
      })
    ).toThrow("MentorSession.mentorId cannot be empty");
    expect(() =>
      MentorSession.create({
        sessionId: "ms1",
        mentorId: "m1",
        learnerId: "",
        scheduledAt,
      })
    ).toThrow("MentorSession.learnerId cannot be empty");
  });

  it("complete transitions scheduled to completed", () => {
    const session = MentorSession.create({
      sessionId: "ms1",
      mentorId: "m1",
      learnerId: "l1",
      scheduledAt,
    });
    const completed = session.complete();
    expect(completed.status).toBe(MentorSessionStatus.Completed);
  });

  it("complete throws when not scheduled", () => {
    const completed = MentorSession.fromPersistence({
      sessionId: "ms1",
      mentorId: "m1",
      learnerId: "l1",
      scheduledAt,
      status: MentorSessionStatus.Completed,
    });
    expect(() => completed.complete()).toThrow(/Cannot complete session/);
  });

  it("cancel transitions scheduled to cancelled", () => {
    const session = MentorSession.create({
      sessionId: "ms1",
      mentorId: "m1",
      learnerId: "l1",
      scheduledAt,
    });
    const cancelled = session.cancel();
    expect(cancelled.status).toBe(MentorSessionStatus.Cancelled);
  });

  it("cancel throws when not scheduled", () => {
    const cancelled = MentorSession.fromPersistence({
      sessionId: "ms1",
      mentorId: "m1",
      learnerId: "l1",
      scheduledAt,
      status: MentorSessionStatus.Cancelled,
    });
    expect(() => cancelled.cancel()).toThrow(/Cannot cancel session/);
  });
});

describe("MentorSessionSchedulingService (COMP-029.4)", () => {
  const scheduledAt = new Date("2025-06-01T14:00:00Z");

  it("schedule returns MentorSession when mentor is available", async () => {
    const port: MentorAvailabilityPort = {
      isAvailable: async () => true,
    };
    const service = new MentorSessionSchedulingService(port);
    const session = await service.schedule({
      sessionId: "ms1",
      mentorId: "m1",
      learnerId: "l1",
      scheduledAt,
      durationMinutes: 30,
    });
    expect(session.sessionId).toBe("ms1");
    expect(session.mentorId).toBe("m1");
    expect(session.learnerId).toBe("l1");
    expect(session.status).toBe(MentorSessionStatus.Scheduled);
  });

  it("schedule throws MentorNotAvailableError when mentor not available", async () => {
    const port: MentorAvailabilityPort = {
      isAvailable: async () => false,
    };
    const service = new MentorSessionSchedulingService(port);
    await expect(
      service.schedule({
        sessionId: "ms1",
        mentorId: "m1",
        learnerId: "l1",
        scheduledAt,
        durationMinutes: 30,
      })
    ).rejects.toThrow(MentorNotAvailableError);
  });
});
