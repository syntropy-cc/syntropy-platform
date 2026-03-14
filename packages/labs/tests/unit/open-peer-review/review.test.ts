/**
 * Unit tests for Review aggregate (COMP-025.1).
 */

import { describe, it, expect } from "vitest";
import { createArticleId, createReviewId } from "@syntropy/types";
import { Review } from "../../../src/domain/open-peer-review/review.js";

const REVIEW_ID = createReviewId("a2000001-0000-4000-8000-000000000001");
const ARTICLE_ID = createArticleId("a1000001-0000-4000-8000-000000000001");

function createReview(overrides: Partial<{
  reviewId: ReturnType<typeof createReviewId>;
  articleId: ReturnType<typeof createArticleId>;
  reviewerId: string;
  status: "in_progress" | "submitted" | "published" | "embargoed";
  content: string;
  submittedAt: Date | null;
  publishedAt: Date | null;
}> = {}) {
  return new Review({
    reviewId: REVIEW_ID,
    articleId: ARTICLE_ID,
    reviewerId: "reviewer-uuid-1",
    status: "in_progress",
    content: "The methodology is sound.",
    ...overrides,
  });
}

describe("Review", () => {
  it("creates aggregate with required fields", () => {
    const review = createReview();
    expect(review.reviewId).toBe(REVIEW_ID);
    expect(review.articleId).toBe(ARTICLE_ID);
    expect(review.reviewerId).toBe("reviewer-uuid-1");
    expect(review.status).toBe("in_progress");
    expect(review.content).toBe("The methodology is sound.");
    expect(review.submittedAt).toBeNull();
    expect(review.publishedAt).toBeNull();
  });

  it("submit transitions from in_progress to submitted and sets submittedAt", () => {
    const review = createReview();
    const submitted = review.submit();
    expect(submitted.status).toBe("submitted");
    expect(submitted.submittedAt).toBeInstanceOf(Date);
    expect(submitted.publishedAt).toBeNull();
  });

  it("publish transitions from submitted to published and sets publishedAt", () => {
    const review = createReview({ status: "submitted", submittedAt: new Date() });
    const published = review.publish();
    expect(published.status).toBe("published");
    expect(published.publishedAt).toBeInstanceOf(Date);
  });

  it("publish transitions from embargoed to published", () => {
    const review = createReview({
      status: "embargoed",
      submittedAt: new Date(),
    });
    const published = review.publish();
    expect(published.status).toBe("published");
    expect(published.publishedAt).toBeInstanceOf(Date);
  });

  it("revise transitions from submitted back to in_progress and clears submittedAt", () => {
    const submitted = createReview({
      status: "submitted",
      submittedAt: new Date(),
    });
    const revised = submitted.revise();
    expect(revised.status).toBe("in_progress");
    expect(revised.submittedAt).toBeNull();
  });

  it("submit throws when status is not in_progress", () => {
    const submitted = createReview({ status: "submitted" });
    expect(() => submitted.submit()).toThrow("Cannot submit");
  });

  it("publish throws when status is in_progress", () => {
    const review = createReview();
    expect(() => review.publish()).toThrow("Cannot publish");
  });

  it("revise throws when status is not submitted", () => {
    const review = createReview();
    expect(() => review.revise()).toThrow("Cannot revise");
  });

  it("constructor throws when reviewerId is empty", () => {
    expect(() =>
      createReview({ reviewerId: "" })
    ).toThrow("reviewerId cannot be empty");
  });

  it("constructor throws when status is invalid", () => {
    expect(() =>
      createReview({ status: "invalid" as "in_progress" })
    ).toThrow("Invalid review status");
  });
});
