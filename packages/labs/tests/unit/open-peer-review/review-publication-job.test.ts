/**
 * Unit tests for review publication job (COMP-025.6).
 */

import { describe, it, expect, vi } from "vitest";
import { createArticleId, createReviewId } from "@syntropy/types";
import { Review } from "../../../src/domain/open-peer-review/review.js";
import { runReviewPublication } from "../../../src/application/review-publication-job.js";
import type { ReviewRepositoryPort } from "../../../src/domain/open-peer-review/ports/review-repository-port.js";

const REVIEW_ID = createReviewId("a2000001-0000-4000-8000-000000000001");
const ARTICLE_ID = createArticleId("a1000001-0000-4000-8000-000000000001");

function createEmbargoedReview(embargoUntil: Date): Review {
  return new Review({
    reviewId: REVIEW_ID,
    articleId: ARTICLE_ID,
    reviewerId: "reviewer-1",
    status: "embargoed",
    content: "Review content",
    submittedAt: new Date(),
    publishedAt: null,
    embargoUntil,
  });
}

describe("runReviewPublication", () => {
  it("publishes all embargoed reviews due for publication and saves them", async () => {
    const past = new Date(Date.now() - 60_000);
    const review1 = createEmbargoedReview(past);
    const review2 = createEmbargoedReview(past);
    const save = vi.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined);
    const findEmbargoedDueForPublication = vi
      .fn<(...args: unknown[]) => Promise<Review[]>>()
      .mockResolvedValue([review1, review2]);

    const repo: ReviewRepositoryPort = {
      save,
      findById: vi.fn(),
      findByArticleId: vi.fn(),
      findEmbargoedDueForPublication,
    };

    await runReviewPublication(repo);

    expect(findEmbargoedDueForPublication).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(2);
    const saved1 = save.mock.calls[0]![0] as Review;
    const saved2 = save.mock.calls[1]![0] as Review;
    expect(saved1.status).toBe("published");
    expect(saved2.status).toBe("published");
    expect(saved1.publishedAt).toBeInstanceOf(Date);
    expect(saved2.publishedAt).toBeInstanceOf(Date);
  });

  it("calls save with no invocations when no embargoed reviews are due", async () => {
    const save = vi.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined);
    const findEmbargoedDueForPublication = vi
      .fn<(...args: unknown[]) => Promise<Review[]>>()
      .mockResolvedValue([]);

    const repo: ReviewRepositoryPort = {
      save,
      findById: vi.fn(),
      findByArticleId: vi.fn(),
      findEmbargoedDueForPublication,
    };

    await runReviewPublication(repo);

    expect(findEmbargoedDueForPublication).toHaveBeenCalledTimes(1);
    expect(save).not.toHaveBeenCalled();
  });

  it("publishes a single due review and persists it", async () => {
    const past = new Date(Date.now() - 1000);
    const review = createEmbargoedReview(past);
    const save = vi.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined);
    const findEmbargoedDueForPublication = vi
      .fn<(...args: unknown[]) => Promise<Review[]>>()
      .mockResolvedValue([review]);

    const repo: ReviewRepositoryPort = {
      save,
      findById: vi.fn(),
      findByArticleId: vi.fn(),
      findEmbargoedDueForPublication,
    };

    await runReviewPublication(repo);

    expect(save).toHaveBeenCalledTimes(1);
    const saved = save.mock.calls[0]![0] as Review;
    expect(saved.status).toBe("published");
    expect(saved.reviewId).toBe(REVIEW_ID);
  });
});
