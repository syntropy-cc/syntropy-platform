/**
 * Task aggregate — atomic unit of work with todo → in_progress → done | cancelled (COMP-029.1).
 * Architecture: Planning domain, PAT-004
 */

import { InvalidTaskTransitionError } from "./errors.js";
import { TaskStatus, type TaskStatusValue } from "./task-status.js";

export interface TaskParams {
  taskId: string;
  userId: string;
  title: string;
  status: TaskStatusValue;
}

/**
 * Task aggregate. Lifecycle: todo → in_progress → done; any non-done state → cancelled.
 */
export class Task {
  readonly taskId: string;
  readonly userId: string;
  readonly title: string;
  readonly status: TaskStatusValue;

  private constructor(params: TaskParams) {
    this.taskId = params.taskId;
    this.userId = params.userId;
    this.title = params.title;
    this.status = params.status;
  }

  /**
   * Creates a new Task in todo status.
   */
  static create(params: {
    taskId: string;
    userId: string;
    title: string;
  }): Task {
    if (!params.taskId?.trim()) {
      throw new Error("Task.taskId cannot be empty");
    }
    if (!params.userId?.trim()) {
      throw new Error("Task.userId cannot be empty");
    }
    if (!params.title?.trim()) {
      throw new Error("Task.title cannot be empty");
    }
    return new Task({
      taskId: params.taskId.trim(),
      userId: params.userId.trim(),
      title: params.title.trim(),
      status: TaskStatus.Todo,
    });
  }

  /**
   * Reconstructs from persistence (repository use).
   */
  static fromPersistence(params: TaskParams): Task {
    return new Task(params);
  }

  /**
   * Transitions from todo to in_progress.
   */
  start(): Task {
    if (this.status !== TaskStatus.Todo) {
      throw new InvalidTaskTransitionError(
        this.status,
        TaskStatus.InProgress,
        this.taskId
      );
    }
    return new Task({
      taskId: this.taskId,
      userId: this.userId,
      title: this.title,
      status: TaskStatus.InProgress,
    });
  }

  /**
   * Transitions from in_progress to done.
   */
  complete(): Task {
    if (this.status !== TaskStatus.InProgress) {
      throw new InvalidTaskTransitionError(
        this.status,
        TaskStatus.Done,
        this.taskId
      );
    }
    return new Task({
      taskId: this.taskId,
      userId: this.userId,
      title: this.title,
      status: TaskStatus.Done,
    });
  }

  /**
   * Transitions to cancelled. Allowed from todo or in_progress.
   */
  cancel(): Task {
    if (this.status === TaskStatus.Done || this.status === TaskStatus.Cancelled) {
      throw new InvalidTaskTransitionError(
        this.status,
        TaskStatus.Cancelled,
        this.taskId
      );
    }
    return new Task({
      taskId: this.taskId,
      userId: this.userId,
      title: this.title,
      status: TaskStatus.Cancelled,
    });
  }
}
