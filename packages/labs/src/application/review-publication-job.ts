/**
 * Review publication job — publishes embargoed reviews when embargo period expires (COMP-025.6).
 * Intended to run on a schedule (e.g. every 15 min) via CronScheduler.
 */

import type { ReviewRepositoryPort } from "../domain/open-peer-review/ports/review-repository-port.js";

/**
 * Finds all reviews with status embargoed and embargo_until <= now, transitions each to
 * published, and persists them. Idempotent for already-published reviews.
 */
export async function runReviewPublication(
  reviewRepository: ReviewRepositoryPort
): Promise<void> {
  const asOf = new Date();
  const due = await reviewRepository.findEmbargoedDueForPublication(asOf);
  for (const review of due) {
    const published = review.publish();
    await reviewRepository.save(published);
  }
}
