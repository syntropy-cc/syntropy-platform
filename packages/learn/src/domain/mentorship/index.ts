/**
 * Learn mentorship domain (COMP-018).
 * Architecture: mentorship-community.md.
 */

export {
  MentorshipRelationship,
  MAX_ACTIVE_MENTORSHIPS_PER_MENTOR,
  type MentorshipRelationshipParams,
  type MentorshipStatus,
} from "./mentorship-relationship.js";
export {
  MentorReview,
  InvalidReviewRatingError,
  RelationshipNotConcludedError,
  ReviewerMustBeMentorError,
  type MentorReviewParams,
} from "./mentor-review.js";
export {
  canAccept,
  canConclude,
  canDecline,
  isMentorshipStatus,
  MENTORSHIP_STATUSES,
} from "./mentorship-relationship-status.js";
export type { MentorshipRepositoryPort } from "./ports/mentorship-repository-port.js";
export type {
  ArtifactGallery,
  ArtifactGalleryItem,
} from "./artifact-gallery.js";
export type {
  MentorshipConcluded,
  MentorshipDeclined,
  MentorshipDomainEvent,
  MentorshipProposed,
  MentorshipStarted,
} from "./events.js";
