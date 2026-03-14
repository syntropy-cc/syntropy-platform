/**
 * MentorSession entity — scheduled mentor–learner interaction (COMP-029.4).
 * Architecture: Planning domain
 */

export const MentorSessionStatus = {
  Scheduled: "scheduled",
  Completed: "completed",
  Cancelled: "cancelled",
} as const;

export type MentorSessionStatusValue =
  (typeof MentorSessionStatus)[keyof typeof MentorSessionStatus];

export interface MentorSessionParams {
  sessionId: string;
  mentorId: string;
  learnerId: string;
  scheduledAt: Date;
  status: MentorSessionStatusValue;
}

/**
 * MentorSession entity. Lifecycle: scheduled → completed | cancelled.
 */
export class MentorSession {
  readonly sessionId: string;
  readonly mentorId: string;
  readonly learnerId: string;
  readonly scheduledAt: Date;
  readonly status: MentorSessionStatusValue;

  private constructor(params: MentorSessionParams) {
    this.sessionId = params.sessionId;
    this.mentorId = params.mentorId;
    this.learnerId = params.learnerId;
    this.scheduledAt = params.scheduledAt;
    this.status = params.status;
  }

  static create(params: {
    sessionId: string;
    mentorId: string;
    learnerId: string;
    scheduledAt: Date;
  }): MentorSession {
    if (!params.sessionId?.trim()) {
      throw new Error("MentorSession.sessionId cannot be empty");
    }
    if (!params.mentorId?.trim()) {
      throw new Error("MentorSession.mentorId cannot be empty");
    }
    if (!params.learnerId?.trim()) {
      throw new Error("MentorSession.learnerId cannot be empty");
    }
    return new MentorSession({
      sessionId: params.sessionId.trim(),
      mentorId: params.mentorId.trim(),
      learnerId: params.learnerId.trim(),
      scheduledAt: params.scheduledAt,
      status: MentorSessionStatus.Scheduled,
    });
  }

  static fromPersistence(params: MentorSessionParams): MentorSession {
    return new MentorSession(params);
  }

  complete(): MentorSession {
    if (this.status !== MentorSessionStatus.Scheduled) {
      throw new Error(
        `Cannot complete session ${this.sessionId} in status ${this.status}`
      );
    }
    return new MentorSession({
      sessionId: this.sessionId,
      mentorId: this.mentorId,
      learnerId: this.learnerId,
      scheduledAt: this.scheduledAt,
      status: MentorSessionStatus.Completed,
    });
  }

  cancel(): MentorSession {
    if (this.status !== MentorSessionStatus.Scheduled) {
      throw new Error(
        `Cannot cancel session ${this.sessionId} in status ${this.status}`
      );
    }
    return new MentorSession({
      sessionId: this.sessionId,
      mentorId: this.mentorId,
      learnerId: this.learnerId,
      scheduledAt: this.scheduledAt,
      status: MentorSessionStatus.Cancelled,
    });
  }
}
