/**
 * API tests for Labs article routes (COMP-023.7).
 * Verifies auth required, create, get, put, submit, versions.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";
import type { LabsScientificContext } from "../types/labs-context.js";
import { createArticleId } from "@syntropy/types";
import {
  createSubjectAreaId,
  ScientificArticle,
  ArticleVersion,
} from "@syntropy/labs-package";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-test-jwt";
const ARTICLE_ID = "b2000001-0000-4000-8000-000000000001";
const SUBJECT_AREA_ID = createSubjectAreaId(
  "51000001-0000-4000-8000-000000000001"
);

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
      if (jwt !== validJwt) throw new InvalidTokenError("Invalid or expired token");
      return token;
    },
    async signIn() {
      return token;
    },
    async signOut() {},
  };
}

function createMockLabsContextWithArticles(): LabsScientificContext {
  const articles = new Map<string, ScientificArticle>();
  const versions = new Map<string, ArticleVersion[]>();

  const articleId = createArticleId(ARTICLE_ID);
  const draft = new ScientificArticle({
    articleId,
    title: "Test Article",
    content: "# Intro\n\nContent.",
    subjectAreaId: SUBJECT_AREA_ID,
    authorId: TEST_USER_ID,
    status: "draft",
  });
  articles.set(ARTICLE_ID, draft);

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
    scientificArticleRepository: {
      save: async (article) => {
        articles.set(article.articleId as string, article);
      },
      findById: async (id) => articles.get(id as string) ?? null,
      findByAuthor: async (authorId) =>
        Array.from(articles.values()).filter((a) => a.authorId === authorId),
    },
    articleVersionRepository: {
      appendVersion: async (v) => {
        const key = v.articleId as string;
        const list = versions.get(key) ?? [];
        list.push(v);
        versions.set(key, list);
      },
      getLatest: async (id) => {
        const list = versions.get(id as string) ?? [];
        return ArticleVersion.getLatest(list);
      },
      listByArticleId: async (id) => versions.get(id as string) ?? [],
    },
    articleSubmissionService: {
      submit: async (id, actorId) => {
        const art = articles.get(id as string);
        if (!art) throw new Error("Article not found");
        const submitted = art.submitForReview();
        articles.set(id as string, submitted);
      },
      retract: async () => {},
      accept: async () => {},
    },
  };
}

describe("labs article routes", () => {
  describe("when article context is configured", () => {
    let app: Awaited<ReturnType<typeof createApp>>;

    beforeAll(async () => {
      app = await createApp({
        auth: createMockAuth(VALID_JWT),
        supabaseClient: null,
        labs: createMockLabsContextWithArticles(),
      });
    });

    afterAll(async () => {
      await app.close();
    });

    it("POST /api/v1/labs/articles without auth returns 401", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/labs/articles",
        payload: {
          title: "New Article",
          content: "# Content",
          subjectAreaId: "51000001-0000-4000-8000-000000000001",
        },
      });
      expect(res.statusCode).toBe(401);
    });

    it("POST /api/v1/labs/articles with auth returns 201 and article", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/labs/articles",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {
          title: "New Article",
          content: "# Content",
          subjectAreaId: "51000001-0000-4000-8000-000000000001",
        },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(body.data.title).toBe("New Article");
      expect(body.data.status).toBe("draft");
      expect(body.data.authorId).toBe(TEST_USER_ID);
    });

    it("GET /api/v1/labs/articles/:id with auth returns 200 and article", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/labs/articles/${ARTICLE_ID}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.id).toBe(ARTICLE_ID);
      expect(body.data.title).toBe("Test Article");
      expect(body.data.status).toBe("draft");
    });

    it("GET /api/v1/labs/articles/:id with missing id returns 404", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/labs/articles/c0000000-0000-4000-8000-000000000000",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(404);
    });

    it("PUT /api/v1/labs/articles/:id with auth updates draft", async () => {
      const res = await app.inject({
        method: "PUT",
        url: `/api/v1/labs/articles/${ARTICLE_ID}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { title: "Updated Title", content: "# Updated content" },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.title).toBe("Updated Title");
      expect(body.data.content).toBe("# Updated content");
    });

    it("POST /api/v1/labs/articles/:id/submit with auth returns 200", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/labs/articles/${ARTICLE_ID}/submit`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.submitted).toBe(true);
    });

    it("GET /api/v1/labs/articles/:id/versions with auth returns 200 and array", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/labs/articles/${ARTICLE_ID}/versions`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});
