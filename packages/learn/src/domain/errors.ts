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
