/**
 * ReviewRepositoryPort — persistence for Review aggregate (COMP-025.5).
 */

import type { ArticleId, ReviewId } from "@syntropy/types";
import type { Review } from "../review.js";

export interface ReviewRepositoryPort {
  save(review: Review): Promise<void>;
  findById(id: ReviewId): Promise<Review | null>;
  findByArticleId(articleId: ArticleId): Promise<Review[]>;
  /** Returns reviews with status embargoed and embargo_until <= asOf (due for publication). */
  findEmbargoedDueForPublication(asOf: Date): Promise<Review[]>;
}
