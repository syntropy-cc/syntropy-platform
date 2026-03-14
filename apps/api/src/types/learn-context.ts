/**
 * Learn context for REST API (COMP-015.6, COMP-016.7).
 * Injects repositories and services for content hierarchy and fragment/review workflow.
 */

import type { FragmentId } from "@syntropy/types";
import type {
  CareerRepository,
  CourseRepository,
  FragmentRepositoryPort,
  FragmentReviewService,
  TrackRepository,
} from "@syntropy/learn-package";

/** Returns completed course IDs for a user (stub until COMP-016.3). */
export type GetCompletedCourseIds = (userId: string) => Promise<string[]>;

/** Marks fragment as completed for the learner (COMP-016.7). */
export type MarkFragmentComplete = (
  userId: string,
  fragmentId: FragmentId
) => Promise<void>;

export interface LearnContext {
  careerRepository: CareerRepository;
  trackRepository: TrackRepository;
  courseRepository: CourseRepository;
  getCompletedCourseIds: GetCompletedCourseIds;
  fragmentRepository: FragmentRepositoryPort;
  fragmentReviewService: FragmentReviewService;
  markFragmentComplete: MarkFragmentComplete;
}
