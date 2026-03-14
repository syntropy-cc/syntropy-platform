/**
 * Unit tests for AuthorResponse entity (COMP-025.3).
 */

import { describe, it, expect } from "vitest";
import { createArticleId, createReviewId } from "@syntropy/types";
import { AuthorResponse } from "../../../src/domain/open-peer-review/author-response.js";

const REVIEW_ID = createReviewId("a2000001-0000-4000-8000-000000000001");
const ARTICLE_ID = createArticleId("a1000001-0000-4000-8000-000000000001");
const AUTHOR_ID = "author-uuid-1";

function createResponse(overrides: Partial<{
  id: string;
  reviewId: ReturnType<typeof createReviewId>;
  articleId: ReturnType<typeof createArticleId>;
  reviewPassageLinkId: string | null;
  responderId: string;
  responseText: string;
  createdAt: Date;
}> = {}) {
  return new AuthorResponse({
    id: "response-uuid-1",
    reviewId: REVIEW_ID,
    articleId: ARTICLE_ID,
    reviewPassageLinkId: null,
    responderId: AUTHOR_ID,
    responseText: "Thank you, we will address this in the revision.",
    createdAt: new Date(),
    ...overrides,
  });
}

describe("AuthorResponse", () => {
  it("creates entity with required fields", () => {
    const response = createResponse();
    expect(response.id).toBe("response-uuid-1");
    expect(response.reviewId).toBe(REVIEW_ID);
    expect(response.articleId).toBe(ARTICLE_ID);
    expect(response.reviewPassageLinkId).toBeNull();
    expect(response.responderId).toBe(AUTHOR_ID);
    expect(response.responseText).toBe(
      "Thank you, we will address this in the revision."
    );
    expect(response.createdAt).toBeInstanceOf(Date);
  });

  it("accepts reviewPassageLinkId for response to specific passage comment", () => {
    const response = createResponse({
      reviewPassageLinkId: "link-uuid-1",
    });
    expect(response.reviewPassageLinkId).toBe("link-uuid-1");
  });

  it("create() succeeds when responderId is article author", () => {
    const response = AuthorResponse.create(
      {
        id: "r1",
        reviewId: REVIEW_ID,
        articleId: ARTICLE_ID,
        reviewPassageLinkId: null,
        responderId: AUTHOR_ID,
        responseText: "We agree.",
      },
      AUTHOR_ID
    );
    expect(response.responderId).toBe(AUTHOR_ID);
    expect(response.responseText).toBe("We agree.");
    expect(response.createdAt).toBeInstanceOf(Date);
  });

  it("create() throws when responderId is not article author", () => {
    expect(() =>
      AuthorResponse.create(
        {
          id: "r1",
          reviewId: REVIEW_ID,
          articleId: ARTICLE_ID,
          reviewPassageLinkId: null,
          responderId: "other-user-uuid",
          responseText: "We agree.",
        },
        AUTHOR_ID
      )
    ).toThrow("AuthorResponse can only be created by the article author");
  });

  it("create() throws when articleAuthorId is empty", () => {
    expect(() =>
      AuthorResponse.create(
        {
          id: "r1",
          reviewId: REVIEW_ID,
          articleId: ARTICLE_ID,
          reviewPassageLinkId: null,
          responderId: AUTHOR_ID,
          responseText: "We agree.",
        },
        ""
      )
    ).toThrow("Article authorId cannot be empty");
  });

  it("constructor throws when id is empty", () => {
    expect(() => createResponse({ id: "" })).toThrow("id cannot be empty");
  });

  it("constructor throws when responderId is empty", () => {
    expect(() => createResponse({ responderId: "" })).toThrow(
      "responderId cannot be empty"
    );
  });
});
