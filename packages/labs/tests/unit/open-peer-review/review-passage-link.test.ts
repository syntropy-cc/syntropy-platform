/**
 * Unit tests for ReviewPassageLink and getLinkedText (COMP-025.2).
 */

import { describe, it, expect } from "vitest";
import { createArticleId, createReviewId } from "@syntropy/types";
import {
  ReviewPassageLink,
  getLinkedText,
} from "../../../src/domain/open-peer-review/review-passage-link.js";

const REVIEW_ID = createReviewId("a2000001-0000-4000-8000-000000000001");
const ARTICLE_ID = createArticleId("a1000001-0000-4000-8000-000000000001");

const SAMPLE_CONTENT = "The quick brown fox jumps over the lazy dog.";

function createLink(overrides: Partial<{
  reviewId: ReturnType<typeof createReviewId>;
  articleId: ReturnType<typeof createArticleId>;
  startOffset: number;
  endOffset: number;
  comment: string;
}> = {}) {
  return new ReviewPassageLink({
    reviewId: REVIEW_ID,
    articleId: ARTICLE_ID,
    startOffset: 10,
    endOffset: 19,
    comment: "Consider rephrasing.",
    ...overrides,
  });
}

describe("ReviewPassageLink", () => {
  it("creates value object with required fields", () => {
    const link = createLink();
    expect(link.id).toBeNull();
    expect(link.reviewId).toBe(REVIEW_ID);
    expect(link.articleId).toBe(ARTICLE_ID);
    expect(link.startOffset).toBe(10);
    expect(link.endOffset).toBe(19);
    expect(link.comment).toBe("Consider rephrasing.");
  });

  it("throws when startOffset is negative", () => {
    expect(() => createLink({ startOffset: -1 })).toThrow(
      "startOffset and endOffset must be non-negative"
    );
  });

  it("throws when startOffset exceeds endOffset", () => {
    expect(() => createLink({ startOffset: 20, endOffset: 10 })).toThrow(
      "startOffset must not exceed endOffset"
    );
  });
});

describe("getLinkedText", () => {
  const article = { content: SAMPLE_CONTENT };

  it("returns correct substring for valid offsets", () => {
    const link = createLink({ startOffset: 10, endOffset: 19 });
    expect(getLinkedText(article, link)).toBe("brown fox");
  });

  it("returns full content when link spans entire content", () => {
    const link = createLink({
      startOffset: 0,
      endOffset: SAMPLE_CONTENT.length,
    });
    expect(getLinkedText(article, link)).toBe(SAMPLE_CONTENT);
  });

  it("returns empty string when startOffset equals endOffset", () => {
    const link = createLink({ startOffset: 5, endOffset: 5 });
    expect(getLinkedText(article, link)).toBe("");
  });

  it("clamps out-of-range offsets to content length", () => {
    const link = createLink({
      startOffset: 0,
      endOffset: 999,
    });
    expect(getLinkedText(article, link)).toBe(SAMPLE_CONTENT);
  });

  it("returns empty string for empty article content", () => {
    const link = createLink({ startOffset: 0, endOffset: 10 });
    expect(getLinkedText({ content: "" }, link)).toBe("");
  });

  it("handles partial overlap when start is beyond content length", () => {
    const link = createLink({ startOffset: 100, endOffset: 110 });
    expect(getLinkedText(article, link)).toBe("");
  });
});
