/**
 * Unit tests for MentorshipRelationship aggregate (COMP-018.1).
 */

import {
  createMentorshipRelationshipId,
  createTrackId,
} from "@syntropy/types";
import { describe, it, expect } from "vitest";
import { MentorshipRelationship } from "../../../src/domain/mentorship/mentorship-relationship.js";
import {
  InvalidMentorshipTransitionError,
  MentorCapacityExceededError,
  NotMentorError,
} from "../../../src/domain/errors.js";
import { MAX_ACTIVE_MENTORSHIPS_PER_MENTOR } from "../../../src/domain/mentorship/mentorship-relationship.js";

const REL_ID = createMentorshipRelationshipId(
  "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
);
const TRACK_ID = createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
const MENTOR_ID = "mentor-1";
const LEARNER_ID = "learner-1";

describe("MentorshipRelationship", () => {
  describe("propose", () => {
    it("creates relationship in proposed state and returns proposed event", () => {
      const { relationship, event } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
      });

      expect(relationship.id).toBe(REL_ID);
      expect(relationship.mentorId).toBe(MENTOR_ID);
      expect(relationship.learnerId).toBe(LEARNER_ID);
      expect(relationship.trackId).toBe(TRACK_ID);
      expect(relationship.status).toBe("proposed");
      expect(relationship.proposedAt).toBeInstanceOf(Date);
      expect(relationship.startedAt).toBeNull();
      expect(relationship.concludedAt).toBeNull();

      expect(event.type).toBe("learn.mentorship.proposed");
      expect(event.relationshipId).toBe(REL_ID);
      expect(event.mentorId).toBe(MENTOR_ID);
      expect(event.learnerId).toBe(LEARNER_ID);
      expect(event.trackId).toBe(TRACK_ID);
      expect(event.occurredAt).toBeInstanceOf(Date);
    });

    it("accepts optional scopeDescription", () => {
      const { relationship } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
        scopeDescription: "Help with TypeScript",
      });
      expect(relationship.scopeDescription).toBe("Help with TypeScript");
    });
  });

  describe("accept", () => {
    it("transitions proposed to active when mentor accepts and capacity allows", () => {
      const { relationship } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
      });

      const event = relationship.accept(MENTOR_ID, 0);

      expect(relationship.status).toBe("active");
      expect(relationship.startedAt).toBeInstanceOf(Date);
      expect(event.type).toBe("learn.mentorship.started");
      expect(event.relationshipId).toBe(REL_ID);
      expect(event.occurredAt).toBeInstanceOf(Date);
    });

    it("accept succeeds when mentor has 2 active (under limit)", () => {
      const { relationship } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
      });
      relationship.accept(MENTOR_ID, 2);
      expect(relationship.status).toBe("active");
    });

    it("accept throws MentorCapacityExceededError when mentor already has 3 active", () => {
      const { relationship } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
      });

      expect(() =>
        relationship.accept(MENTOR_ID, MAX_ACTIVE_MENTORSHIPS_PER_MENTOR)
      ).toThrow(MentorCapacityExceededError);
      expect(() =>
        relationship.accept(MENTOR_ID, MAX_ACTIVE_MENTORSHIPS_PER_MENTOR)
      ).toThrow(/maximum allowed is 3/);
      expect(relationship.status).toBe("proposed");
    });

    it("accept throws NotMentorError when caller is not the mentor", () => {
      const { relationship } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
      });

      expect(() => relationship.accept("other-user", 0)).toThrow(NotMentorError);
      expect(() => relationship.accept("other-user", 0)).toThrow(/not the mentor/);
      expect(relationship.status).toBe("proposed");
    });

    it("accept throws InvalidMentorshipTransitionError when not in proposed state", () => {
      const { relationship } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
      });
      relationship.accept(MENTOR_ID, 0);

      expect(() => relationship.accept(MENTOR_ID, 0)).toThrow(
        InvalidMentorshipTransitionError
      );
      expect(() => relationship.accept(MENTOR_ID, 0)).toThrow(
        /Only proposed relationships can be accepted/
      );
    });
  });

  describe("decline", () => {
    it("transitions proposed to declined when mentor declines", () => {
      const { relationship } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
      });

      const event = relationship.decline(MENTOR_ID);

      expect(relationship.status).toBe("declined");
      expect(event.type).toBe("learn.mentorship.declined");
      expect(event.relationshipId).toBe(REL_ID);
    });

    it("decline throws NotMentorError when caller is not the mentor", () => {
      const { relationship } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
      });

      expect(() => relationship.decline("other-user")).toThrow(NotMentorError);
      expect(relationship.status).toBe("proposed");
    });

    it("decline throws when not in proposed state", () => {
      const { relationship } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
      });
      relationship.accept(MENTOR_ID, 0);

      expect(() => relationship.decline(MENTOR_ID)).toThrow(
        InvalidMentorshipTransitionError
      );
      expect(() => relationship.decline(MENTOR_ID)).toThrow(
        /Only proposed relationships can be declined/
      );
    });
  });

  describe("conclude and end", () => {
    it("conclude transitions active to concluded", () => {
      const { relationship } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
      });
      relationship.accept(MENTOR_ID, 0);

      const event = relationship.conclude();

      expect(relationship.status).toBe("concluded");
      expect(relationship.concludedAt).toBeInstanceOf(Date);
      expect(event.type).toBe("learn.mentorship.concluded");
      expect(event.relationshipId).toBe(REL_ID);
    });

    it("end is alias for conclude", () => {
      const { relationship } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
      });
      relationship.accept(MENTOR_ID, 0);

      const event = relationship.end();

      expect(relationship.status).toBe("concluded");
      expect(event.type).toBe("learn.mentorship.concluded");
    });

    it("conclude throws when not in active state", () => {
      const { relationship } = MentorshipRelationship.propose({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
      });

      expect(() => relationship.conclude()).toThrow(
        InvalidMentorshipTransitionError
      );
      expect(() => relationship.conclude()).toThrow(
        /Only active relationships can be concluded/
      );
    });
  });

  describe("fromStorage", () => {
    it("hydrates aggregate from persistence", () => {
      const proposedAt = new Date("2026-01-01T00:00:00Z");
      const startedAt = new Date("2026-01-02T00:00:00Z");

      const relationship = MentorshipRelationship.fromStorage({
        id: REL_ID,
        mentorId: MENTOR_ID,
        learnerId: LEARNER_ID,
        trackId: TRACK_ID,
        status: "active",
        proposedAt,
        startedAt,
      });

      expect(relationship.id).toBe(REL_ID);
      expect(relationship.status).toBe("active");
      expect(relationship.proposedAt).toEqual(proposedAt);
      expect(relationship.startedAt).toEqual(startedAt);
    });
  });
});
