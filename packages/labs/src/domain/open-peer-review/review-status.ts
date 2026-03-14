/**
 * ReviewStatus — lifecycle status for Review aggregate (COMP-025.1).
 * Architecture: open-peer-review.md
 */

/** Lifecycle status for a peer review. */
export type ReviewStatus =
  | "in_progress"
  | "submitted"
  | "published"
  | "embargoed";

const REVIEW_STATUSES: ReviewStatus[] = [
  "in_progress",
  "submitted",
  "published",
  "embargoed",
];

export function isReviewStatus(value: string): value is ReviewStatus {
  return REVIEW_STATUSES.includes(value as ReviewStatus);
}
