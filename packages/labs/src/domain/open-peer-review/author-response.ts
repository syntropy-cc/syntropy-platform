/**
 * AuthorResponse entity — author reply to a review or passage comment (COMP-025.3).
 * Architecture: open-peer-review.md
 */

import type { ArticleId, ReviewId } from "@syntropy/types";

export interface AuthorResponseParams {
  id: string;
  reviewId: ReviewId;
  articleId: ArticleId;
  reviewPassageLinkId: string | null;
  responderId: string;
  responseText: string;
  createdAt: Date;
}

/**
 * Entity linking an author's reply to a review (or to a specific passage comment).
 * Only the article author may create a response; enforced via create().
 */
export class AuthorResponse {
  readonly id: string;
  readonly reviewId: ReviewId;
  readonly articleId: ArticleId;
  readonly reviewPassageLinkId: string | null;
  readonly responderId: string;
  readonly responseText: string;
  readonly createdAt: Date;

  constructor(params: AuthorResponseParams) {
    if (!params.id?.trim()) {
      throw new Error("AuthorResponse id cannot be empty");
    }
    if (!params.responderId?.trim()) {
      throw new Error("AuthorResponse responderId cannot be empty");
    }
    if (typeof params.responseText !== "string") {
      throw new Error("AuthorResponse responseText must be a string");
    }
    this.id = params.id.trim();
    this.reviewId = params.reviewId;
    this.articleId = params.articleId;
    this.reviewPassageLinkId = params.reviewPassageLinkId ?? null;
    this.responderId = params.responderId.trim();
    this.responseText = params.responseText;
    this.createdAt =
      params.createdAt instanceof Date ? params.createdAt : new Date(params.createdAt);
  }

  /**
   * Creates an AuthorResponse only when responderId is the article author.
   * @throws Error if responderId is not the article author
   */
  static create(
    params: Omit<AuthorResponseParams, "createdAt"> & { createdAt?: Date },
    articleAuthorId: string
  ): AuthorResponse {
    const authorId = articleAuthorId?.trim();
    if (!authorId) {
      throw new Error("Article authorId cannot be empty");
    }
    if (params.responderId?.trim() !== authorId) {
      throw new Error(
        "AuthorResponse can only be created by the article author"
      );
    }
    return new AuthorResponse({
      ...params,
      createdAt: params.createdAt ?? new Date(),
    });
  }
}
