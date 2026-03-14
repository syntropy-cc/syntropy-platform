/**
 * Open peer review domain — Review aggregate, passage links, author responses (COMP-025).
 * Architecture: open-peer-review.md
 */

export { Review, type ReviewParams } from "./review.js";
export { isReviewStatus, type ReviewStatus } from "./review-status.js";
export {
  ReviewPassageLink,
  getLinkedText,
  type ReviewPassageLinkParams,
  type ArticleContent,
} from "./review-passage-link.js";
export {
  AuthorResponse,
  type AuthorResponseParams,
} from "./author-response.js";
export { ReviewVisibilityEvaluator } from "./services/review-visibility-evaluator.js";
export type { ReviewRepositoryPort } from "./ports/review-repository-port.js";
export type { ReviewPassageLinkRepositoryPort } from "./ports/review-passage-link-repository-port.js";
export type { AuthorResponseRepositoryPort } from "./ports/author-response-repository-port.js";
