/**
 * Labs domain errors (COMP-022).
 * Architecture: ARCH-007 — domain errors returned as result.
 */

/** Base for Labs domain errors. */
export class LabsDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LabsDomainError";
    Object.setPrototypeOf(this, LabsDomainError.prototype);
  }
}

/** Raised when an article is not found (COMP-023.6). */
export class ArticleNotFoundError extends LabsDomainError {
  constructor(articleId: string) {
    super(`Article not found: ${articleId}`);
    this.name = "ArticleNotFoundError";
    Object.setPrototypeOf(this, ArticleNotFoundError.prototype);
  }
}

/** Raised when the actor is not allowed to perform the action on the article (COMP-023.6). */
export class ArticleForbiddenError extends LabsDomainError {
  constructor(articleId: string, action: string) {
    super(`Forbidden: ${action} on article ${articleId}`);
    this.name = "ArticleForbiddenError";
    Object.setPrototypeOf(this, ArticleForbiddenError.prototype);
  }
}

/** Raised when an article is not eligible for DOI registration (e.g. not published) (COMP-026.3). */
export class ArticleNotEligibleForDOIError extends LabsDomainError {
  constructor(articleId: string, reason: string) {
    super(`Article ${articleId} not eligible for DOI: ${reason}`);
    this.name = "ArticleNotEligibleForDOIError";
    Object.setPrototypeOf(this, ArticleNotEligibleForDOIError.prototype);
  }
}
