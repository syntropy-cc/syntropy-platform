/**
 * MentorshipService — orchestrates mentorship lifecycle (COMP-018.5).
 * Architecture: mentorship-community.md.
 */

import type { FragmentId } from "@syntropy/types";
import {
  createMentorReviewId,
  createMentorshipRelationshipId,
  createTrackId,
} from "@syntropy/types";
import { randomUUID } from "node:crypto";
import { MentorReview } from "../domain/mentorship/mentor-review.js";
import { MentorshipRelationship } from "../domain/mentorship/mentorship-relationship.js";
import type { MentorshipRepositoryPort } from "../domain/mentorship/ports/mentorship-repository-port.js";

export interface MentorshipServiceDeps {
  readonly repository: MentorshipRepositoryPort;
}

/**
 * Application service for mentorship: propose, accept, decline, conclude, submit review.
 */
export class MentorshipService {
  constructor(private readonly deps: MentorshipServiceDeps) {}

  /**
   * Learner proposes a mentorship. Creates relationship in proposed state and saves.
   */
  async propose(params: {
    mentorId: string;
    learnerId: string;
    trackId: string;
    scopeDescription?: string | null;
  }): Promise<MentorshipRelationship> {
    const id = createMentorshipRelationshipId(randomUUID());
    const trackId = createTrackId(params.trackId);
    const { relationship } = MentorshipRelationship.propose({
      id,
      mentorId: params.mentorId,
      learnerId: params.learnerId,
      trackId,
      scopeDescription: params.scopeDescription,
    });
    await this.deps.repository.save(relationship);
    return relationship;
  }

  /**
   * Mentor accepts. Loads relationship, checks capacity, accepts, saves.
   */
  async accept(relationshipId: string, actorId: string): Promise<MentorshipRelationship> {
    const id = createMentorshipRelationshipId(relationshipId);
    const relationship = await this.deps.repository.findById(id);
    if (relationship === null) {
      throw new Error(`Mentorship not found: ${relationshipId}`);
    }
    const activeCount = await this.deps.repository.countActiveByMentor(
      relationship.mentorId
    );
    relationship.accept(actorId, activeCount);
    await this.deps.repository.save(relationship);
    return relationship;
  }

  /**
   * Mentor declines. Loads relationship, declines, saves.
   */
  async decline(relationshipId: string, actorId: string): Promise<MentorshipRelationship> {
    const id = createMentorshipRelationshipId(relationshipId);
    const relationship = await this.deps.repository.findById(id);
    if (relationship === null) {
      throw new Error(`Mentorship not found: ${relationshipId}`);
    }
    relationship.decline(actorId);
    await this.deps.repository.save(relationship);
    return relationship;
  }

  /**
   * Conclude active relationship. Saves.
   */
  async conclude(relationshipId: string): Promise<MentorshipRelationship> {
    const id = createMentorshipRelationshipId(relationshipId);
    const relationship = await this.deps.repository.findById(id);
    if (relationship === null) {
      throw new Error(`Mentorship not found: ${relationshipId}`);
    }
    relationship.conclude();
    await this.deps.repository.save(relationship);
    return relationship;
  }

  /**
   * Submit a mentor review for a concluded relationship. Saves review.
   */
  async submitReview(params: {
    relationshipId: string;
    reviewerId: string;
    fragmentId: string;
    rating: number;
    feedback?: string;
  }): Promise<MentorReview> {
    const id = createMentorshipRelationshipId(params.relationshipId);
    const relationship = await this.deps.repository.findById(id);
    if (relationship === null) {
      throw new Error(`Mentorship not found: ${params.relationshipId}`);
    }
    const review = MentorReview.create(relationship, {
      id: createMentorReviewId(randomUUID()),
      reviewerId: params.reviewerId,
      fragmentId: params.fragmentId as FragmentId,
      rating: params.rating,
      feedback: params.feedback ?? "",
    });
    await this.deps.repository.saveReview(review);
    return review;
  }

  async findById(relationshipId: string): Promise<MentorshipRelationship | null> {
    return this.deps.repository.findById(
      createMentorshipRelationshipId(relationshipId)
    );
  }

  async findByMentor(mentorId: string): Promise<MentorshipRelationship[]> {
    return this.deps.repository.findByMentor(mentorId);
  }

  async findByLearner(learnerId: string): Promise<MentorshipRelationship[]> {
    return this.deps.repository.findByLearner(learnerId);
  }
}
