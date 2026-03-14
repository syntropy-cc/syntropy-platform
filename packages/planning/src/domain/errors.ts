/**
 * Domain errors for Planning aggregate transitions (COMP-029).
 * Architecture: Planning domain, ARCH-007
 */

/**
 * Thrown when a task transition is not allowed from the current status.
 */
export class InvalidTaskTransitionError extends Error {
  constructor(
    public readonly fromStatus: string,
    public readonly toStatus: string,
    public readonly taskId: string
  ) {
    super(
      `Invalid task transition: cannot move task ${taskId} from "${fromStatus}" to "${toStatus}"`
    );
    this.name = "InvalidTaskTransitionError";
    Object.setPrototypeOf(this, InvalidTaskTransitionError.prototype);
  }
}
