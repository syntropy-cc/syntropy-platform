/**
 * Unit tests for ReviewVisibilityEvaluator (COMP-025.4).
 */

import { describe, it, expect } from "vitest";
import { createArticleId, createReviewId } from "@syntropy/types";
import { Review } from "../../../src/domain/open-peer-review/review.js";
import { ReviewVisibilityEvaluator } from "../../../src/domain/open-peer-review/services/review-visibility-evaluator.js";

const REVIEW_ID = createReviewId("a2000001-0000-4000-8000-000000000001");
const ARTICLE_ID = createArticleId("a1000001-0000-4000-8000-000000000001");

function createReview(status: "in_progress" | "submitted" | "published" | "embargoed") {
  return new Review({
    reviewId: REVIEW_ID,
    articleId: ARTICLE_ID,
    reviewerId: "reviewer-uuid-1",
    status,
    content: "The methodology is sound.",
    submittedAt: status !== "in_progress" ? new Date() : null,
    publishedAt: status === "published" ? new Date() : null,
  });
}

describe("ReviewVisibilityEvaluator", () => {
  const evaluator = new ReviewVisibilityEvaluator();

  describe("isReviewerIdentityVisible", () => {
    it("returns true when review is published", () => {
      const review = createReview("published");
      expect(evaluator.isReviewerIdentityVisible(review, "any-user")).toBe(true);
      expect(evaluator.isReviewerIdentityVisible(review, null)).toBe(true);
    });

    it("returns false when review is submitted", () => {
      const review = createReview("submitted");
      expect(evaluator.isReviewerIdentityVisible(review, "any-user")).toBe(false);
    });

    it("returns false when review is in_progress", () => {
      const review = createReview("in_progress");
      expect(evaluator.isReviewerIdentityVisible(review, "reviewer-uuid-1")).toBe(
        false
      );
    });

    it("returns false when review is embargoed", () => {
      const review = createReview("embargoed");
      expect(evaluator.isReviewerIdentityVisible(review, "any-user")).toBe(false);
    });
  });

  describe("isReviewContentVisible", () => {
    it("returns true when review is submitted", () => {
      const review = createReview("submitted");
      expect(evaluator.isReviewContentVisible(review)).toBe(true);
    });

    it("returns true when review is published", () => {
      const review = createReview("published");
      expect(evaluator.isReviewContentVisible(review)).toBe(true);
    });

    it("returns false when review is in_progress", () => {
      const review = createReview("in_progress");
      expect(evaluator.isReviewContentVisible(review)).toBe(false);
    });

    it("returns false when review is embargoed", () => {
      const review = createReview("embargoed");
      expect(evaluator.isReviewContentVisible(review)).toBe(false);
    });
  });
});
