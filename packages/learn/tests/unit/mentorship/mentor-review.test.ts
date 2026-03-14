/**
 * Unit tests for MentorReview entity (COMP-018.2).
 */

import {
  createFragmentId,
  createMentorReviewId,
  createMentorshipRelationshipId,
  createTrackId,
} from "@syntropy/types";
import { describe, it, expect } from "vitest";
import { MentorshipRelationship } from "../../../src/domain/mentorship/mentorship-relationship.js";
import { MentorReview } from "../../../src/domain/mentorship/mentor-review.js";
import {
  InvalidReviewRatingError,
  RelationshipNotConcludedError,
  ReviewerMustBeMentorError,
} from "../../../src/domain/mentorship/mentor-review.js";

const REL_ID = createMentorshipRelationshipId(
  "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
);
const TRACK_ID = createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
const MENTOR_ID = "mentor-1";
const LEARNER_ID = "learner-1";
const FRAGMENT_ID = createFragmentId("c3d4e5f6-a7b8-4c6d-8e1f-2a3b4c5d6e7f");
const REVIEW_ID = createMentorReviewId("d4e5f6a7-b8c9-4d7e-8f2a-3b4c5d6e7f8a");

function createConcludedRelationship(): MentorshipRelationship {
  const { relationship } = MentorshipRelationship.propose({
    id: REL_ID,
    mentorId: MENTOR_ID,
    learnerId: LEARNER_ID,
    trackId: TRACK_ID,
  });
  relationship.accept(MENTOR_ID, 0);
  relationship.conclude();
  return relationship;
}

describe("MentorReview", () => {
  it("create returns review with relationshipId reviewerId fragmentId rating feedback", () => {
    const relationship = createConcludedRelationship();

    const review = MentorReview.create(relationship, {
      id: REVIEW_ID,
      reviewerId: MENTOR_ID,
      fragmentId: FRAGMENT_ID,
      rating: 4,
      feedback: "Great progress on the project.",
    });

    expect(review.id).toBe(REVIEW_ID);
    expect(review.relationshipId).toBe(REL_ID);
    expect(review.reviewerId).toBe(MENTOR_ID);
    expect(review.fragmentId).toBe(FRAGMENT_ID);
    expect(review.rating).toBe(4);
    expect(review.feedback).toBe("Great progress on the project.");
    expect(review.createdAt).toBeInstanceOf(Date);
  });

  it("create rejects when reviewer is not the mentor", () => {
    const relationship = createConcludedRelationship();

    expect(() =>
      MentorReview.create(relationship, {
        id: REVIEW_ID,
        reviewerId: "other-user",
        fragmentId: FRAGMENT_ID,
        rating: 4,
        feedback: "Good",
      })
    ).toThrow(ReviewerMustBeMentorError);
    expect(() =>
      MentorReview.create(relationship, {
        id: REVIEW_ID,
        reviewerId: "other-user",
        fragmentId: FRAGMENT_ID,
        rating: 4,
        feedback: "Good",
      })
    ).toThrow(/not the mentor/);
  });

  it("create rejects when relationship is not concluded", () => {
    const { relationship } = MentorshipRelationship.propose({
      id: REL_ID,
      mentorId: MENTOR_ID,
      learnerId: LEARNER_ID,
      trackId: TRACK_ID,
    });
    relationship.accept(MENTOR_ID, 0);
    expect(relationship.status).toBe("active");

    expect(() =>
      MentorReview.create(relationship, {
        id: REVIEW_ID,
        reviewerId: MENTOR_ID,
        fragmentId: FRAGMENT_ID,
        rating: 4,
        feedback: "Good",
      })
    ).toThrow(RelationshipNotConcludedError);
    expect(() =>
      MentorReview.create(relationship, {
        id: REVIEW_ID,
        reviewerId: MENTOR_ID,
        fragmentId: FRAGMENT_ID,
        rating: 4,
        feedback: "Good",
      })
    ).toThrow(/not concluded/);
  });

  it("create rejects rating below 1", () => {
    const relationship = createConcludedRelationship();

    expect(() =>
      MentorReview.create(relationship, {
        id: REVIEW_ID,
        reviewerId: MENTOR_ID,
        fragmentId: FRAGMENT_ID,
        rating: 0,
        feedback: "",
      })
    ).toThrow(InvalidReviewRatingError);
    expect(() =>
      MentorReview.create(relationship, {
        id: REVIEW_ID,
        reviewerId: MENTOR_ID,
        fragmentId: FRAGMENT_ID,
        rating: 0,
        feedback: "",
      })
    ).toThrow(/between 1 and 5/);
  });

  it("create rejects rating above 5", () => {
    const relationship = createConcludedRelationship();

    expect(() =>
      MentorReview.create(relationship, {
        id: REVIEW_ID,
        reviewerId: MENTOR_ID,
        fragmentId: FRAGMENT_ID,
        rating: 6,
        feedback: "",
      })
    ).toThrow(InvalidReviewRatingError);
  });

  it("create accepts ratings 1 through 5", () => {
    const relationship = createConcludedRelationship();
    const ids = [
      "d4e5f6a7-b8c9-4d7e-8f21-3b4c5d6e7f81",
      "d4e5f6a7-b8c9-4d7e-8f22-3b4c5d6e7f82",
      "d4e5f6a7-b8c9-4d7e-8f23-3b4c5d6e7f83",
      "d4e5f6a7-b8c9-4d7e-8f24-3b4c5d6e7f84",
      "d4e5f6a7-b8c9-4d7e-8f25-3b4c5d6e7f85",
    ];

    [1, 2, 3, 4, 5].forEach((rating, i) => {
      const review = MentorReview.create(relationship, {
        id: createMentorReviewId(ids[i]!),
        reviewerId: MENTOR_ID,
        fragmentId: FRAGMENT_ID,
        rating,
        feedback: "",
      });
      expect(review.rating).toBe(rating);
    });
  });

  it("fromStorage hydrates entity from persistence", () => {
    const createdAt = new Date("2026-01-10T00:00:00Z");
    const review = MentorReview.fromStorage({
      id: REVIEW_ID,
      relationshipId: REL_ID,
      reviewerId: MENTOR_ID,
      fragmentId: FRAGMENT_ID,
      rating: 5,
      feedback: "Excellent",
      createdAt,
    });

    expect(review.id).toBe(REVIEW_ID);
    expect(review.relationshipId).toBe(REL_ID);
    expect(review.rating).toBe(5);
    expect(review.feedback).toBe("Excellent");
    expect(review.createdAt).toEqual(createdAt);
  });
});
