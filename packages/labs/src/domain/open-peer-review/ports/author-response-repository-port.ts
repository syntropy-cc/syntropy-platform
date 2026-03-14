/**
 * AuthorResponseRepositoryPort — persistence for AuthorResponse (COMP-025.5).
 */

import type { ReviewId } from "@syntropy/types";
import type { AuthorResponse } from "../author-response.js";

export interface AuthorResponseRepositoryPort {
  save(response: AuthorResponse): Promise<void>;
  findByReviewId(reviewId: ReviewId): Promise<AuthorResponse[]>;
}
