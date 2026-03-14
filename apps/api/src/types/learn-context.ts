/**
 * Learn context for REST API (COMP-015.6).
 * Injects repositories and progress port so routes can serve content hierarchy with fog-of-war.
 */

import type {
  CareerRepository,
  CourseRepository,
  TrackRepository,
} from "@syntropy/learn-package";

/** Returns completed course IDs for a user (stub until COMP-016.3). */
export type GetCompletedCourseIds = (userId: string) => Promise<string[]>;

export interface LearnContext {
  careerRepository: CareerRepository;
  trackRepository: TrackRepository;
  courseRepository: CourseRepository;
  getCompletedCourseIds: GetCompletedCourseIds;
}
