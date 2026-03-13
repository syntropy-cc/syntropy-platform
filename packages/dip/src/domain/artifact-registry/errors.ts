/**
 * Domain errors for Artifact Registry.
 * Architecture: COMP-003, DIP Artifact Registry
 */

/**
 * Thrown when a lifecycle transition is not allowed from the current status.
 */
export class InvalidLifecycleTransitionError extends Error {
  constructor(
    public readonly fromStatus: string,
    public readonly attemptedAction: string,
    public readonly artifactId: string,
  ) {
    super(
      `Invalid lifecycle transition: cannot ${attemptedAction} artifact ${artifactId} from status "${fromStatus}"`,
    );
    this.name = "InvalidLifecycleTransitionError";
    Object.setPrototypeOf(this, InvalidLifecycleTransitionError.prototype);
  }
}
