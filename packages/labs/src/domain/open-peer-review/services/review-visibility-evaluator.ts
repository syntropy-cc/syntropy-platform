/**
 * ReviewVisibilityEvaluator — enforces blind review rules (COMP-025.4).
 * Architecture: open-peer-review.md
 */

import type { Review } from "../review.js";

/**
 * Domain service that enforces open peer review visibility rules.
 * Reviewer identity is hidden until the review is published; after publication
 * it is visible to all (open review).
 */
export class ReviewVisibilityEvaluator {
  /**
   * Returns true if the reviewer identity may be shown to the requesting actor.
   * Blind review: identity hidden until publication; after status is published, visible to all.
   */
  isReviewerIdentityVisible(
    review: Review,
    _requestingActorId: string | null
  ): boolean {
    return review.status === "published";
  }

  /**
   * Returns true if the review content (excluding reviewer identity) is visible.
   * Submitted and published reviews are visible; in_progress and embargoed are not.
   */
  isReviewContentVisible(review: Review): boolean {
    return review.status === "submitted" || review.status === "published";
  }
}
