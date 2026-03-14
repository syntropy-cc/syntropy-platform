/**
 * Fragment & Artifact Engine domain (COMP-016).
 * Architecture: fragment-artifact-engine.md.
 */

export {
  CodeArtifact,
  QuizArtifact,
  TextArtifact,
  VideoArtifact,
  type ArtifactContentKind,
  type CodeArtifactParams,
  type QuizArtifactParams,
  type QuizQuestion,
  type TextArtifactParams,
  type VideoArtifactParams,
} from "./artifact-content-types.js";
export { Fragment, type FragmentParams } from "./fragment.js";
export {
  FragmentSection,
  type FragmentSectionParams,
  type FragmentSectionType,
} from "./fragment-section.js";
export { FragmentStatus } from "./fragment-status.js";
export {
  LearnerProgressRecord,
  type LearnerProgressRecordParams,
  type LearnerProgressStatus,
  type ProgressEntityType,
} from "./learner-progress-record.js";
export type { ArtifactPublisherPort } from "./ports/artifact-publisher-port.js";
export type { CourseHierarchyPort } from "./ports/course-hierarchy-port.js";
export type { FragmentRepositoryPort } from "./ports/fragment-repository-port.js";
export type {
  FragmentReviewAction,
  FragmentReviewRecordPort,
} from "./ports/fragment-review-record-port.js";
export type { LearnerProgressRepositoryPort } from "./ports/learner-progress-repository-port.js";
export type { ProgressEventsPort } from "./ports/progress-events-port.js";
export type { ReviewerRolePort } from "./ports/reviewer-role-port.js";
export {
  FragmentReviewService,
  type FragmentReviewServiceParams,
} from "./services/fragment-review-service.js";
export {
  ProgressTrackingService,
  type ProgressTrackingServiceParams,
} from "./services/progress-tracking-service.js";
