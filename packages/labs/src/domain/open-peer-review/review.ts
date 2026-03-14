/**
 * Review aggregate — peer review lifecycle (COMP-025.1).
 * Architecture: open-peer-review.md
 */

import type { ArticleId, ReviewId } from "@syntropy/types";
import { isReviewStatus, type ReviewStatus } from "./review-status.js";

export interface ReviewParams {
  reviewId: ReviewId;
  articleId: ArticleId;
  reviewerId: string;
  status: ReviewStatus;
  content: string;
  submittedAt?: Date | null;
  publishedAt?: Date | null;
}

/**
 * Review aggregate — manages peer review lifecycle: in_progress → submitted → published.
 * Content is immutable after submit(). revise() returns to in_progress from submitted.
 */
export class Review {
  readonly reviewId: ReviewId;
  readonly articleId: ArticleId;
  readonly reviewerId: string;
  readonly status: ReviewStatus;
  readonly content: string;
  readonly submittedAt: Date | null;
  readonly publishedAt: Date | null;

  constructor(params: ReviewParams) {
    if (!params.reviewerId?.trim()) {
      throw new Error("Review reviewerId cannot be empty");
    }
    if (!isReviewStatus(params.status)) {
      throw new Error(
        `Invalid review status: ${params.status}. Must be in_progress, submitted, published, or embargoed.`
      );
    }
    if (typeof params.content !== "string") {
      throw new Error("Review content must be a string");
    }
    this.reviewId = params.reviewId;
    this.articleId = params.articleId;
    this.reviewerId = params.reviewerId.trim();
    this.status = params.status;
    this.content = params.content;
    this.submittedAt = params.submittedAt ?? null;
    this.publishedAt = params.publishedAt ?? null;
  }

  /** Transition to submitted (content locked from here). */
  submit(): Review {
    if (this.status !== "in_progress") {
      throw new Error(
        `Cannot submit: current status is ${this.status}, expected in_progress`
      );
    }
    return new Review({
      ...this,
      status: "submitted",
      submittedAt: new Date(),
    });
  }

  /** Transition back to in_progress from submitted (allows edits before re-submit). */
  revise(): Review {
    if (this.status !== "submitted") {
      throw new Error(
        `Cannot revise: current status is ${this.status}, expected submitted`
      );
    }
    return new Review({
      ...this,
      status: "in_progress",
      submittedAt: null,
    });
  }

  /** Transition to published (reviewer identity visible in open review). */
  publish(): Review {
    if (this.status !== "submitted" && this.status !== "embargoed") {
      throw new Error(
        `Cannot publish: current status is ${this.status}, expected submitted or embargoed`
      );
    }
    return new Review({
      ...this,
      status: "published",
      publishedAt: new Date(),
    });
  }
}
