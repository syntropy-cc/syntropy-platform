/**
 * ReviewPassageLinkRepositoryPort — persistence for ReviewPassageLink (COMP-025.5).
 */

import type { ReviewId } from "@syntropy/types";
import type { ReviewPassageLink } from "../review-passage-link.js";

export interface ReviewPassageLinkRepositoryPort {
  save(link: ReviewPassageLink): Promise<void>;
  findByReviewId(reviewId: ReviewId): Promise<ReviewPassageLink[]>;
}
