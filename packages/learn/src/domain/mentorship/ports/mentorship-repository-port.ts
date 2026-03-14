/**
 * Repository port for mentorship aggregates (COMP-018.4).
 * Architecture: mentorship-community.md, PAT-004.
 */

import type { MentorReviewId, MentorshipRelationshipId } from "@syntropy/types";

import type { MentorReview } from "../mentor-review.js";
import type { MentorshipRelationship } from "../mentorship-relationship.js";

export interface MentorshipRepositoryPort {
  findById(id: MentorshipRelationshipId): Promise<MentorshipRelationship | null>;
  findByMentor(mentorId: string): Promise<MentorshipRelationship[]>;
  findByLearner(learnerId: string): Promise<MentorshipRelationship[]>;
  countActiveByMentor(mentorId: string): Promise<number>;
  save(relationship: MentorshipRelationship): Promise<void>;

  saveReview(review: MentorReview): Promise<void>;
  findReviewByRelationship(
    relationshipId: MentorshipRelationshipId
  ): Promise<MentorReview | null>;
  findReviewById(id: MentorReviewId): Promise<MentorReview | null>;
}
