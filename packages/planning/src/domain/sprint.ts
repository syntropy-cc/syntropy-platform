/**
 * Sprint entity — time-bounded iteration with tasks (COMP-029.2).
 * Architecture: Planning domain
 */

export interface SprintParams {
  id: string;
  startDate: Date;
  endDate: Date;
  taskIds: string[];
}

/**
 * Thrown when a task's due date is outside the sprint's date range.
 */
export class SprintTaskDateOutOfRangeError extends Error {
  constructor(
    public readonly sprintId: string,
    public readonly taskId: string,
    public readonly dueDate: Date,
    public readonly sprintStart: Date,
    public readonly sprintEnd: Date
  ) {
    super(
      `Task ${taskId} due date ${dueDate.toISOString()} is outside sprint ${sprintId} range ${sprintStart.toISOString()}–${sprintEnd.toISOString()}`
    );
    this.name = "SprintTaskDateOutOfRangeError";
    Object.setPrototypeOf(this, SprintTaskDateOutOfRangeError.prototype);
  }
}

/**
 * Sprint entity. Groups tasks within a date range; addTask validates task due date.
 */
export class Sprint {
  readonly id: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly taskIds: readonly string[];

  private constructor(params: SprintParams) {
    this.id = params.id;
    this.startDate = params.startDate;
    this.endDate = params.endDate;
    this.taskIds = [...params.taskIds];
  }

  static create(params: {
    id: string;
    startDate: Date;
    endDate: Date;
  }): Sprint {
    if (!params.id?.trim()) {
      throw new Error("Sprint.id cannot be empty");
    }
    if (params.startDate >= params.endDate) {
      throw new Error("Sprint.startDate must be before endDate");
    }
    return new Sprint({
      id: params.id.trim(),
      startDate: params.startDate,
      endDate: params.endDate,
      taskIds: [],
    });
  }

  static fromPersistence(params: SprintParams): Sprint {
    return new Sprint(params);
  }

  /**
   * Adds a task to the sprint. Validates that dueDate (if provided) is within sprint range.
   */
  addTask(taskId: string, taskDueDate?: Date): Sprint {
    if (taskDueDate != null) {
      const t = taskDueDate.getTime();
      const start = this.startDate.getTime();
      const end = this.endDate.getTime();
      if (t < start || t > end) {
        throw new SprintTaskDateOutOfRangeError(
          this.id,
          taskId,
          taskDueDate,
          this.startDate,
          this.endDate
        );
      }
    }
    if (this.taskIds.includes(taskId)) {
      return this;
    }
    return new Sprint({
      id: this.id,
      startDate: this.startDate,
      endDate: this.endDate,
      taskIds: [...this.taskIds, taskId],
    });
  }
}
