/**
 * Mentorship domain events (COMP-018.1).
 * Architecture: mentorship-community.md, PAT-009.
 */

import type {
  MentorshipRelationshipId,
  TrackId,
} from "@syntropy/types";

/**
 * Emitted when a learner proposes a mentorship.
 * Application layer publishes to event bus.
 */
export interface MentorshipProposed {
  readonly type: "learn.mentorship.proposed";
  readonly relationshipId: MentorshipRelationshipId;
  readonly mentorId: string;
  readonly learnerId: string;
  readonly trackId: TrackId;
  readonly occurredAt: Date;
}

/**
 * Emitted when the mentor accepts the relationship.
 */
export interface MentorshipStarted {
  readonly type: "learn.mentorship.started";
  readonly relationshipId: MentorshipRelationshipId;
  readonly mentorId: string;
  readonly learnerId: string;
  readonly trackId: TrackId;
  readonly occurredAt: Date;
}

/**
 * Emitted when the relationship is concluded.
 */
export interface MentorshipConcluded {
  readonly type: "learn.mentorship.concluded";
  readonly relationshipId: MentorshipRelationshipId;
  readonly mentorId: string;
  readonly learnerId: string;
  readonly trackId: TrackId;
  readonly occurredAt: Date;
}

/**
 * Emitted when the mentor declines the relationship.
 */
export interface MentorshipDeclined {
  readonly type: "learn.mentorship.declined";
  readonly relationshipId: MentorshipRelationshipId;
  readonly mentorId: string;
  readonly learnerId: string;
  readonly trackId: TrackId;
  readonly occurredAt: Date;
}

export type MentorshipDomainEvent =
  | MentorshipProposed
  | MentorshipStarted
  | MentorshipConcluded
  | MentorshipDeclined;
