/**
 * MentorshipRelationship aggregate — lifecycle proposed → active | declined → concluded (COMP-018.1).
 * Architecture: mentorship-community.md, IMPLEMENTATION-PLAN Section 7.
 */

import type {
  MentorshipRelationshipId,
  TrackId,
} from "@syntropy/types";

import {
  MentorCapacityExceededError,
  InvalidMentorshipTransitionError,
  NotMentorError,
} from "../errors.js";
import type {
  MentorshipConcluded,
  MentorshipDeclined,
  MentorshipProposed,
  MentorshipStarted,
} from "./events.js";
import {
  canAccept,
  canConclude,
  canDecline,
  type MentorshipStatus,
} from "./mentorship-relationship-status.js";

export const MAX_ACTIVE_MENTORSHIPS_PER_MENTOR = 3;

export interface MentorshipRelationshipParams {
  id: MentorshipRelationshipId;
  mentorId: string;
  learnerId: string;
  trackId: TrackId;
  status: MentorshipStatus;
  scopeDescription?: string | null;
  proposedAt: Date;
  startedAt?: Date | null;
  concludedAt?: Date | null;
}

/**
 * MentorshipRelationship aggregate. Manages mentor–learner pairing lifecycle.
 * Proposed → Active (accept) or Declined; Active → Concluded.
 */
export class MentorshipRelationship {
  readonly id: MentorshipRelationshipId;
  readonly mentorId: string;
  readonly learnerId: string;
  readonly trackId: TrackId;
  private _status: MentorshipStatus;
  readonly scopeDescription: string | null;
  readonly proposedAt: Date;
  private _startedAt: Date | null;
  private _concludedAt: Date | null;

  private constructor(params: MentorshipRelationshipParams) {
    this.id = params.id;
    this.mentorId = params.mentorId;
    this.learnerId = params.learnerId;
    this.trackId = params.trackId;
    this._status = params.status;
    this.scopeDescription = params.scopeDescription ?? null;
    this.proposedAt = params.proposedAt;
    this._startedAt = params.startedAt ?? null;
    this._concludedAt = params.concludedAt ?? null;
  }

  /**
   * Create a new relationship in proposed state (learner has proposed).
   * Returns the aggregate and the event to publish.
   */
  static propose(params: {
    id: MentorshipRelationshipId;
    mentorId: string;
    learnerId: string;
    trackId: TrackId;
    scopeDescription?: string | null;
  }): { relationship: MentorshipRelationship; event: MentorshipProposed } {
    const now = new Date();
    const relationship = new MentorshipRelationship({
      ...params,
      status: "proposed",
      proposedAt: now,
    });
    const event: MentorshipProposed = {
      type: "learn.mentorship.proposed",
      relationshipId: params.id,
      mentorId: params.mentorId,
      learnerId: params.learnerId,
      trackId: params.trackId,
      occurredAt: now,
    };
    return { relationship, event };
  }

  /** Hydrate from persistence. */
  static fromStorage(params: MentorshipRelationshipParams): MentorshipRelationship {
    return new MentorshipRelationship(params);
  }

  get status(): MentorshipStatus {
    return this._status;
  }

  get startedAt(): Date | null {
    return this._startedAt;
  }

  get concludedAt(): Date | null {
    return this._concludedAt;
  }

  /** Mentor accepts; caller must be the mentor. Capacity enforced via activeCountForMentor. */
  accept(actorId: string, activeCountForMentor: number): MentorshipStarted {
    if (actorId !== this.mentorId) {
      throw new NotMentorError(actorId, this.id);
    }
    if (!canAccept(this._status)) {
      throw new InvalidMentorshipTransitionError(
        this._status,
        "active",
        "Only proposed relationships can be accepted"
      );
    }
    if (activeCountForMentor >= MAX_ACTIVE_MENTORSHIPS_PER_MENTOR) {
      throw new MentorCapacityExceededError(
        this.mentorId,
        activeCountForMentor,
        MAX_ACTIVE_MENTORSHIPS_PER_MENTOR
      );
    }

    const now = new Date();
    this._status = "active";
    this._startedAt = now;

    return {
      type: "learn.mentorship.started",
      relationshipId: this.id,
      mentorId: this.mentorId,
      learnerId: this.learnerId,
      trackId: this.trackId,
      occurredAt: now,
    };
  }

  /** Mentor declines; caller must be the mentor. */
  decline(actorId: string): MentorshipDeclined {
    if (actorId !== this.mentorId) {
      throw new NotMentorError(actorId, this.id);
    }
    if (!canDecline(this._status)) {
      throw new InvalidMentorshipTransitionError(
        this._status,
        "declined",
        "Only proposed relationships can be declined"
      );
    }

    const now = new Date();
    this._status = "declined";

    return {
      type: "learn.mentorship.declined",
      relationshipId: this.id,
      mentorId: this.mentorId,
      learnerId: this.learnerId,
      trackId: this.trackId,
      occurredAt: now,
    };
  }

  /** Conclude an active relationship. */
  conclude(): MentorshipConcluded {
    if (!canConclude(this._status)) {
      throw new InvalidMentorshipTransitionError(
        this._status,
        "concluded",
        "Only active relationships can be concluded"
      );
    }

    const now = new Date();
    this._status = "concluded";
    this._concludedAt = now;

    return {
      type: "learn.mentorship.concluded",
      relationshipId: this.id,
      mentorId: this.mentorId,
      learnerId: this.learnerId,
      trackId: this.trackId,
      occurredAt: now,
    };
  }

  /** Alias for conclude() per Section 7 "end()". */
  end(): MentorshipConcluded {
    return this.conclude();
  }
}

export type { MentorshipStatus } from "./mentorship-relationship-status.js";
