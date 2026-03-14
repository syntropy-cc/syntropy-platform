/**
 * Planning domain package.
 * Architecture: COMP-029
 */
export { Task } from "./domain/task.js";
export { TaskStatus, isTaskStatus, type TaskStatusValue } from "./domain/task-status.js";
export { Goal, GoalStatus, type GoalStatusValue } from "./domain/goal.js";
export { Sprint, SprintTaskDateOutOfRangeError } from "./domain/sprint.js";
export { StudyPlan } from "./domain/study-plan.js";
export { MentorSession, MentorSessionStatus, type MentorSessionStatusValue, } from "./domain/mentor-session.js";
export { InvalidTaskTransitionError } from "./domain/errors.js";
export type { TaskRepository } from "./domain/ports/task-repository.js";
export type { GoalRepository } from "./domain/ports/goal-repository.js";
export type { SprintRepository } from "./domain/ports/sprint-repository.js";
export type { StudyPlanRepository } from "./domain/ports/study-plan-repository.js";
export type { MentorSessionRepository } from "./domain/ports/mentor-session-repository.js";
export type { LearnerProgressPort, SuggestedStep, LearnerProgressInput, } from "./domain/ports/learner-progress-port.js";
export type { MentorAvailabilityPort, AvailabilityWindow, } from "./domain/ports/mentor-availability-port.js";
export { StudyPlanService } from "./application/study-plan-service.js";
export { MentorSessionSchedulingService, MentorNotAvailableError, } from "./application/mentor-session-scheduling-service.js";
//# sourceMappingURL=index.d.ts.map