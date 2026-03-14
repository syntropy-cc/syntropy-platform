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
