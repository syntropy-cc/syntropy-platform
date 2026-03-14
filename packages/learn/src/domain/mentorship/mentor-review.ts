/**
 * MentorReview entity — post-relationship feedback from mentor on learner's fragment (COMP-018.2).
 * Architecture: mentorship-community.md.
 */

import type { FragmentId, MentorReviewId, MentorshipRelationshipId } from "@syntropy/types";

import { LearnDomainError } from "../errors.js";
import type { MentorshipRelationship } from "./mentorship-relationship.js";

const MIN_RATING = 1;
const MAX_RATING = 5;

/**
 * Thrown when reviewer is not the mentor of the relationship.
 */
export class ReviewerMustBeMentorError extends LearnDomainError {
  constructor(reviewerId: string, relationshipId: string) {
    super(
      `Reviewer ${reviewerId} is not the mentor for relationship ${relationshipId}.`
    );
    this.name = "ReviewerMustBeMentorError";
    Object.setPrototypeOf(this, ReviewerMustBeMentorError.prototype);
  }
}

/**
 * Thrown when relationship is not concluded (reviews only after conclusion).
 */
export class RelationshipNotConcludedError extends LearnDomainError {
  constructor(relationshipId: string) {
    super(
      `Cannot submit review for relationship ${relationshipId}: relationship is not concluded.`
    );
    this.name = "RelationshipNotConcludedError";
    Object.setPrototypeOf(this, RelationshipNotConcludedError.prototype);
  }
}

/**
 * Thrown when rating is outside 1–5.
 */
export class InvalidReviewRatingError extends LearnDomainError {
  constructor(rating: number) {
    super(
      `Rating must be between ${MIN_RATING} and ${MAX_RATING}, got ${rating}.`
    );
    this.name = "InvalidReviewRatingError";
    Object.setPrototypeOf(this, InvalidReviewRatingError.prototype);
  }
}

export interface MentorReviewParams {
  id: MentorReviewId;
  relationshipId: MentorshipRelationshipId;
  reviewerId: string;
  fragmentId: FragmentId;
  rating: number;
  feedback: string;
  createdAt: Date;
}

/**
 * MentorReview entity. One review per concluded relationship; mentor reviews learner's fragment.
 */
export class MentorReview {
  readonly id: MentorReviewId;
  readonly relationshipId: MentorshipRelationshipId;
  readonly reviewerId: string;
  readonly fragmentId: FragmentId;
  readonly rating: number;
  readonly feedback: string;
  readonly createdAt: Date;

  private constructor(params: MentorReviewParams) {
    this.id = params.id;
    this.relationshipId = params.relationshipId;
    this.reviewerId = params.reviewerId;
    this.fragmentId = params.fragmentId;
    this.rating = params.rating;
    this.feedback = params.feedback;
    this.createdAt = params.createdAt;
  }

  /**
   * Create a review. Caller must be the mentor; relationship must be concluded.
   */
  static create(
    relationship: MentorshipRelationship,
    params: {
      id: MentorReviewId;
      reviewerId: string;
      fragmentId: FragmentId;
      rating: number;
      feedback: string;
    }
  ): MentorReview {
    if (relationship.status !== "concluded") {
      throw new RelationshipNotConcludedError(relationship.id);
    }
    if (params.reviewerId !== relationship.mentorId) {
      throw new ReviewerMustBeMentorError(params.reviewerId, relationship.id);
    }
    if (
      typeof params.rating !== "number" ||
      params.rating < MIN_RATING ||
      params.rating > MAX_RATING ||
      !Number.isInteger(params.rating)
    ) {
      throw new InvalidReviewRatingError(params.rating);
    }

    return new MentorReview({
      id: params.id,
      relationshipId: relationship.id,
      reviewerId: params.reviewerId,
      fragmentId: params.fragmentId,
      rating: params.rating,
      feedback: params.feedback ?? "",
      createdAt: new Date(),
    });
  }

  /** Hydrate from persistence. */
  static fromStorage(params: MentorReviewParams): MentorReview {
    return new MentorReview(params);
  }
}
