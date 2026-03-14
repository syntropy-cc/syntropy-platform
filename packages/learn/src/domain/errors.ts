/**
 * Learn domain errors (COMP-015.1).
 * Architecture: COMP-015 Learn Content Hierarchy, ARCH-007, CODE-010.
 */

/**
 * Base exception for Learn domain rule violations.
 * Infrastructure errors must be wrapped; do not leak external vocabulary.
 */
export class LearnDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LearnDomainError";
    Object.setPrototypeOf(this, LearnDomainError.prototype);
  }
}

/**
 * Thrown when Fragment.publish() is called but IL1 is not met:
 * at least one section (problem, theory, or artifact) is incomplete.
 * Architecture: COMP-016.1, fragment-artifact-engine.md IL1.
 */
export class IL1ViolationError extends LearnDomainError {
  constructor(message: string) {
    super(message);
    this.name = "IL1ViolationError";
    Object.setPrototypeOf(this, IL1ViolationError.prototype);
  }
}

/**
 * Thrown when approve/reject is called by a user who does not have reviewer role.
 * Architecture: COMP-016.6, fragment-artifact-engine.md.
 */
export class NotReviewerError extends LearnDomainError {
  constructor(userId: string) {
    super(`User ${userId} does not have reviewer role`);
    this.name = "NotReviewerError";
    Object.setPrototypeOf(this, NotReviewerError.prototype);
  }
}

/**
 * Thrown when CreatorWorkflow.transition() is called with a phase that is not
 * the immediate next phase in order (e.g. ideation → review, or same phase).
 * Architecture: COMP-017.1, creator-tools-copilot.md.
 */
export class InvalidPhaseTransitionError extends LearnDomainError {
  constructor(
    currentPhase: string,
    attemptedNextPhase: string,
    message?: string
  ) {
    super(
      message ??
        `Invalid phase transition: from "${currentPhase}" to "${attemptedNextPhase}". Only the immediate next phase is allowed.`
    );
    this.name = "InvalidPhaseTransitionError";
    Object.setPrototypeOf(this, InvalidPhaseTransitionError.prototype);
  }
}

/**
 * Thrown when a mentorship transition is invalid (e.g. accept when not proposed).
 * Architecture: COMP-018.1, mentorship-community.md.
 */
export class InvalidMentorshipTransitionError extends LearnDomainError {
  constructor(
    currentStatus: string,
    attemptedStatus: string,
    message?: string
  ) {
    super(
      message ??
        `Invalid mentorship transition: from "${currentStatus}" to "${attemptedStatus}".`
    );
    this.name = "InvalidMentorshipTransitionError";
    Object.setPrototypeOf(this, InvalidMentorshipTransitionError.prototype);
  }
}

/**
 * Thrown when mentor already has max active relationships (3).
 * Architecture: COMP-018.1, mentorship-community.md.
 */
export class MentorCapacityExceededError extends LearnDomainError {
  constructor(
    mentorId: string,
    currentCount: number,
    maxAllowed: number
  ) {
    super(
      `Mentor ${mentorId} has ${currentCount} active relationship(s); maximum allowed is ${maxAllowed}.`
    );
    this.name = "MentorCapacityExceededError";
    Object.setPrototypeOf(this, MentorCapacityExceededError.prototype);
  }
}

/**
 * Thrown when accept/decline is called by a user who is not the mentor.
 * Architecture: COMP-018.1, MentorRole check.
 */
export class NotMentorError extends LearnDomainError {
  constructor(
    actorId: string,
    relationshipId: { toString(): string }
  ) {
    super(
      `User ${actorId} is not the mentor for relationship ${relationshipId}.`
    );
    this.name = "NotMentorError";
    Object.setPrototypeOf(this, NotMentorError.prototype);
  }
}
