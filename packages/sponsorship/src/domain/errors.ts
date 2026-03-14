/**
 * Sponsorship domain errors (COMP-027).
 * Architecture: ARCH-007, sponsorship domain
 */

/** Base for sponsorship domain errors. */
export class SponsorshipDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SponsorshipDomainError";
    Object.setPrototypeOf(this, SponsorshipDomainError.prototype);
  }
}

/** Raised when an invalid status transition is attempted. */
export class InvalidSponsorshipTransitionError extends SponsorshipDomainError {
  constructor(
    public readonly from: string,
    public readonly to: string,
    public readonly sponsorshipId: string
  ) {
    super(
      `Invalid sponsorship transition: cannot move from ${from} to ${to} (sponsorship ${sponsorshipId})`
    );
    this.name = "InvalidSponsorshipTransitionError";
    Object.setPrototypeOf(this, InvalidSponsorshipTransitionError.prototype);
  }
}
