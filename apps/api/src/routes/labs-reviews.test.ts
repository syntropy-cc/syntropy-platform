/**
 * API tests for Labs peer review routes (COMP-025.7).
 * Verifies create review, list reviews with visibility, create author response.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";
import type { LabsScientificContext } from "../types/labs-context.js";
import { createArticleId, createReviewId } from "@syntropy/types";
import { Review, AuthorResponse, ReviewVisibilityEvaluator } from "@syntropy/labs-package";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-test-jwt";
const ARTICLE_ID = "a1000001-0000-4000-8000-000000000001";
const REVIEW_ID = "a2000001-0000-4000-8000-000000000001";

function createMockAuth(validJwt: string): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: TEST_USER_ID,
    actor_id: TEST_ACTOR_ID,
    roles: ["Learner"],
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  });
  return {
    async verifyToken(jwt: string) {
      if (jwt !== validJwt)
        throw new InvalidTokenError("Invalid or expired token");
      return token;
    },
    async signIn() {
      return token;
    },
    async signOut() {},
  };
}

function createMockLabsContextWithReviews(): LabsScientificContext {
  const reviews = new Map<string, Review>();
  const responses = new Map<string, AuthorResponse>();

  return {
    subjectAreaRepository: {
      listAll: async () => [],
      getTree: async () => [],
      findById: async () => null,
      save: async () => {},
    },
    methodologyRepository: {
      listAll: async () => [],
      findById: async () => null,
      save: async () => {},
    },
    hypothesisRecordRepository: {
      save: async () => {},
      findById: async () => null,
    },
    reviewRepository: {
      save: async (r) => {
        reviews.set(r.reviewId as string, r);
      },
      findById: async (id) => reviews.get(id as string) ?? null,
      findByArticleId: async (aid) =>
        Array.from(reviews.values()).filter((r) => r.articleId === aid),
      findEmbargoedDueForPublication: async () => [],
    },
    authorResponseRepository: {
      save: async (resp) => {
        responses.set(resp.id, resp);
      },
      findByReviewId: async () => Array.from(responses.values()),
    },
    reviewVisibilityEvaluator: new ReviewVisibilityEvaluator(),
  };
}

describe("labs review routes", () => {
  describe("when review context is configured", () => {
    let app: Awaited<ReturnType<typeof createApp>>;

    beforeAll(async () => {
      app = await createApp({
        auth: createMockAuth(VALID_JWT),
        supabaseClient: null,
        labs: createMockLabsContextWithReviews(),
      });
    });

    afterAll(async () => {
      await app.close();
    });

    it("POST /api/v1/labs/articles/:id/reviews without auth returns 401", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/labs/articles/${ARTICLE_ID}/reviews`,
        payload: { content: "The methodology is sound." },
      });
      expect(res.statusCode).toBe(401);
    });

    it("POST /api/v1/labs/articles/:id/reviews with auth returns 201 and review", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/labs/articles/${ARTICLE_ID}/reviews`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { content: "The methodology is sound." },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(body.data.status).toBe("submitted");
      expect(body.data.content).toBe("The methodology is sound.");
      // reviewerId omitted until review is published (visibility enforced)
      expect(body.data.id).toBeDefined();
    });

    it("GET /api/v1/labs/articles/:id/reviews with auth returns 200 and list", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/labs/articles/${ARTICLE_ID}/reviews`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body.data)).toBe(true);
    });

    it("POST /api/v1/labs/reviews/:id/responses without auth returns 401", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/labs/reviews/${REVIEW_ID}/responses`,
        payload: { responseText: "We have revised the methodology." },
      });
      expect(res.statusCode).toBe(401);
    });

    it("POST /api/v1/labs/reviews/:id/responses with auth returns 404 when review not found", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/labs/reviews/a2009999-0000-4000-8000-000000000099/responses",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { responseText: "We have revised the methodology." },
      });
      expect(res.statusCode).toBe(404);
    });

    it("POST review then POST response returns 201 for response", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: `/api/v1/labs/articles/${ARTICLE_ID}/reviews`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { content: "Review for response test." },
      });
      expect(createRes.statusCode).toBe(201);
      const reviewData = createRes.json().data;
      const reviewId = reviewData.id;

      const responseRes = await app.inject({
        method: "POST",
        url: `/api/v1/labs/reviews/${reviewId}/responses`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { responseText: "Thank you, we have addressed this." },
      });
      expect(responseRes.statusCode).toBe(201);
      const responseData = responseRes.json().data;
      expect(responseData.responseText).toBe("Thank you, we have addressed this.");
      expect(responseData.responderId).toBe(TEST_USER_ID);
    });
  });
});
