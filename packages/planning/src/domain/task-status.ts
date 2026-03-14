/**
 * TaskStatus — lifecycle status for Task aggregate (COMP-029.1).
 * Architecture: Planning domain
 */

export const TaskStatus = {
  Todo: "todo",
  InProgress: "in_progress",
  Done: "done",
  Cancelled: "cancelled",
} as const;

export type TaskStatusValue =
  (typeof TaskStatus)[keyof typeof TaskStatus];

export function isTaskStatus(value: string): value is TaskStatusValue {
  return Object.values(TaskStatus).includes(value as TaskStatusValue);
}
