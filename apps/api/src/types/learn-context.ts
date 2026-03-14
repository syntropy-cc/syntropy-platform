/**
 * Learn context for REST API (COMP-015.6, COMP-016.7, COMP-017.5, COMP-018.5).
 * Injects repositories and services for content hierarchy, fragment/review, creator tools, and mentorship.
 */

import type { FragmentId } from "@syntropy/types";
import type {
  ApprovalService,
  ArtifactGalleryService,
  CareerRepository,
  CourseRepository,
  CreatorCopilotService,
  CreatorWorkflowLoaderPort,
  CreatorWorkflowSavePort,
  FragmentRepositoryPort,
  FragmentReviewService,
  MentorshipService,
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
  /** Creator tools (COMP-017.5). When set, creator routes are registered. */
  creatorWorkflowLoader?: CreatorWorkflowLoaderPort;
  creatorWorkflowSave?: CreatorWorkflowSavePort;
  approvalService?: ApprovalService;
  creatorCopilotService?: CreatorCopilotService;
  /** Mentorship (COMP-018.5). When set, mentorship routes are registered. */
  mentorshipService?: MentorshipService;
  /** Gallery (COMP-018.5). When set, gallery route is registered. */
  artifactGalleryService?: ArtifactGalleryService;
}
