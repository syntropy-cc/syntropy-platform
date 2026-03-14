/**
 * Labs domain errors (COMP-022).
 * Architecture: ARCH-007 — domain errors returned as result.
 */

/** Base for Labs domain errors. */
export class LabsDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LabsDomainError";
    Object.setPrototypeOf(this, LabsDomainError.prototype);
  }
}
