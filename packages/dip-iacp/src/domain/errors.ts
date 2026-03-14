/**
 * Domain errors for IACP Engine.
 * Architecture: COMP-005, DIP IACP Engine
 */

/**
 * Thrown when a state transition is not allowed from the current status.
 */
export class InvalidTransitionError extends Error {
  constructor(
    public readonly fromStatus: string,
    public readonly toStatus: string,
    public readonly recordId: string,
  ) {
    super(
      `Invalid IACP transition: cannot move record ${recordId} from "${fromStatus}" to "${toStatus}"`,
    );
    this.name = "InvalidTransitionError";
    Object.setPrototypeOf(this, InvalidTransitionError.prototype);
  }
}

/**
 * Thrown when a party has already submitted a signature (duplicate actorId).
 */
export class DuplicateSignatureError extends Error {
  constructor(public readonly actorId: string) {
    super(`Duplicate signature: party ${actorId} has already signed`);
    this.name = "DuplicateSignatureError";
    Object.setPrototypeOf(this, DuplicateSignatureError.prototype);
  }
}
