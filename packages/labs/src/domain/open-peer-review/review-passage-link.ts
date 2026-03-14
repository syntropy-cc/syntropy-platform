/**
 * ReviewPassageLink value object — links review comment to article passage (COMP-025.2).
 * Architecture: open-peer-review.md
 */

import type { ArticleId, ReviewId } from "@syntropy/types";

export interface ReviewPassageLinkParams {
  id?: string | null;
  reviewId: ReviewId;
  articleId: ArticleId;
  startOffset: number;
  endOffset: number;
  comment: string;
}

/**
 * Value object linking a review comment to a specific passage in article content
 * by character offsets (startOffset inclusive, endOffset exclusive).
 * Optional id set when loaded from persistence.
 */
export class ReviewPassageLink {
  readonly id: string | null;
  readonly reviewId: ReviewId;
  readonly articleId: ArticleId;
  readonly startOffset: number;
  readonly endOffset: number;
  readonly comment: string;

  constructor(params: ReviewPassageLinkParams) {
    if (params.startOffset < 0 || params.endOffset < 0) {
      throw new Error(
        "ReviewPassageLink startOffset and endOffset must be non-negative"
      );
    }
    if (params.startOffset > params.endOffset) {
      throw new Error(
        "ReviewPassageLink startOffset must not exceed endOffset"
      );
    }
    this.id = params.id?.trim() ?? null;
    this.reviewId = params.reviewId;
    this.articleId = params.articleId;
    this.startOffset = params.startOffset;
    this.endOffset = params.endOffset;
    this.comment = params.comment;
  }
}

/** Minimal article shape for passage extraction (avoids coupling to ScientificArticle). */
export interface ArticleContent {
  content: string;
}

/**
 * Returns the passage text for the given link from the article content.
 * Bounds are clamped to content length; out-of-range offsets yield empty or partial string.
 */
export function getLinkedText(
  article: ArticleContent,
  link: ReviewPassageLink
): string {
  const content = article.content ?? "";
  const len = content.length;
  const start = Math.max(0, Math.min(link.startOffset, len));
  const end = Math.max(start, Math.min(link.endOffset, len));
  return content.slice(start, end);
}
