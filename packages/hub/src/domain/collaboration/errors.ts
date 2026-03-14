/**
 * Hub collaboration domain errors (COMP-019).
 * Architecture: Hub Collaboration Layer
 */

/**
 * Thrown when an Issue state transition is not allowed.
 */
export class InvalidIssueTransitionError extends Error {
  constructor(
    public readonly fromStatus: string,
    public readonly toStatus: string,
    public readonly issueId: string
  ) {
    super(
      `Invalid issue transition: cannot move issue ${issueId} from "${fromStatus}" to "${toStatus}"`
    );
    this.name = "InvalidIssueTransitionError";
    Object.setPrototypeOf(this, InvalidIssueTransitionError.prototype);
  }
}

/**
 * Thrown when a Contribution state transition is not allowed.
 */
export class InvalidContributionTransitionError extends Error {
  constructor(
    public readonly fromStatus: string,
    public readonly toStatus: string,
    public readonly contributionId: string
  ) {
    super(
      `Invalid contribution transition: cannot move contribution ${contributionId} from "${fromStatus}" to "${toStatus}"`
    );
    this.name = "InvalidContributionTransitionError";
    Object.setPrototypeOf(this, InvalidContributionTransitionError.prototype);
  }
}
