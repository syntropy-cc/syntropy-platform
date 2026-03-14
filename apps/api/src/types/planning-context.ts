/**
 * Planning context for REST API planning routes (COMP-029.6).
 *
 * Injected when registering planning routes; provides task, goal, and
 * mentor-session repository ports plus study plan and mentor session services.
 */

import type {
  TaskRepository,
  GoalRepository,
  MentorSessionRepository,
  StudyPlanService,
  MentorSessionSchedulingService,
} from "@syntropy/planning";

export interface PlanningContext {
  taskRepository: TaskRepository;
  goalRepository: GoalRepository;
  mentorSessionRepository: MentorSessionRepository;
  studyPlanService: StudyPlanService;
  mentorSessionSchedulingService: MentorSessionSchedulingService;
}
