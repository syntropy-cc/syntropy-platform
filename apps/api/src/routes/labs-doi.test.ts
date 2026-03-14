/**
 * API tests for Labs DOI routes (COMP-026.5).
 * Verifies POST/GET /api/v1/labs/articles/:id/doi with mock DataCite.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";
import type { LabsScientificContext } from "../types/labs-context.js";
import { createArticleId } from "@syntropy/types";
import {
  createSubjectAreaId,
  ScientificArticle,
  DOIRegistrationService,
  type DOIRecord,
  type DOIProvider,
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
const ARTICLE_ID = "d3000001-0000-4000-8000-000000000001";
const DRAFT_ARTICLE_ID = "d3000002-0000-4000-8000-000000000002";
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

function createMockLabsContextWithDoi(): LabsScientificContext {
  const articles = new Map<string, ScientificArticle>();
  const doiRecords = new Map<string, DOIRecord>();

  const articleId = createArticleId(ARTICLE_ID);
  const publishedArticle = new ScientificArticle({
    articleId,
    title: "Published Paper",
    content: "# Abstract\n\nContent.",
    subjectAreaId: SUBJECT_AREA_ID,
    authorId: TEST_USER_ID,
    status: "published",
    publishedArtifactId: "dip-artifact-789",
    publishedAt: new Date("2025-02-01"),
  });
  articles.set(ARTICLE_ID, publishedArticle);

  const draftArticleId = createArticleId(DRAFT_ARTICLE_ID);
  const draftArticle = new ScientificArticle({
    articleId: draftArticleId,
    title: "Draft Paper",
    content: "# Draft",
    subjectAreaId: SUBJECT_AREA_ID,
    authorId: TEST_USER_ID,
    status: "draft",
  });
  articles.set(DRAFT_ARTICLE_ID, draftArticle);

  const articleRepository = {
    save: async (article: ScientificArticle) => {
      articles.set(article.articleId as string, article);
    },
    findById: async (id: ReturnType<typeof createArticleId>) =>
      articles.get(id as string) ?? null,
    findByAuthor: async (authorId: string) =>
      Array.from(articles.values()).filter((a) => a.authorId === authorId),
  };

  const doiRecordRepository = {
    findByArticleId: async (id: ReturnType<typeof createArticleId>) =>
      doiRecords.get(id as string) ?? null,
    save: async (record: DOIRecord) => {
      doiRecords.set(record.articleId as string, record);
    },
  };

  const mockDoiProvider: DOIProvider = {
    register: async () => ({ doi: "10.1234/mock-test-001" }),
    deactivate: async () => {},
  };
  const doiRegistrationService = new DOIRegistrationService({
    articleRepository,
    doiRecordRepository,
    doiProvider: mockDoiProvider,
  });

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
    scientificArticleRepository: articleRepository,
    doiRegistrationService,
    doiRecordRepository,
  };
}

describe("labs DOI routes", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp({
      auth: createMockAuth(VALID_JWT),
      supabaseClient: null,
      labs: createMockLabsContextWithDoi(),
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /api/v1/labs/articles/:id/doi without auth returns 401", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/labs/articles/${ARTICLE_ID}/doi`,
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/v1/labs/articles/:id/doi with auth returns 201 and DOI", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/labs/articles/${ARTICLE_ID}/doi`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json() as { data?: { doi?: string; status?: string } };
    expect(body.data?.doi).toBeDefined();
    expect(body.data?.doi).toMatch(/^10\.1234\//);
    expect(body.data?.status).toBe("registered");
  });

  it("GET /api/v1/labs/articles/:id/doi returns 200 and DOI after registration", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/labs/articles/${ARTICLE_ID}/doi`,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { data?: { doi?: string; status?: string } };
    expect(body.data?.doi).toMatch(/^10\.1234\//);
    expect(body.data?.status).toBe("registered");
  });

  it("POST /api/v1/labs/articles/:id/doi idempotent: second call returns 201 with same DOI", async () => {
    const res1 = await app.inject({
      method: "POST",
      url: `/api/v1/labs/articles/${ARTICLE_ID}/doi`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res1.statusCode).toBe(201);
    const doi1 = (res1.json() as { data?: { doi?: string } }).data?.doi;

    const res2 = await app.inject({
      method: "POST",
      url: `/api/v1/labs/articles/${ARTICLE_ID}/doi`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res2.statusCode).toBe(201);
    const doi2 = (res2.json() as { data?: { doi?: string } }).data?.doi;
    expect(doi2).toBe(doi1);
  });

  it("GET /api/v1/labs/articles/:id/doi returns 404 when no DOI", async () => {
    const unknownId = "e4000001-0000-4000-8000-000000000001";
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/labs/articles/${unknownId}/doi`,
    });
    expect(res.statusCode).toBe(404);
    const body = res.json() as { error?: { code?: string } };
    expect(body.error?.code).toBe("NOT_FOUND");
  });

  it("POST /api/v1/labs/articles/:id/doi returns 404 for unknown article", async () => {
    const unknownId = "e5000001-0000-4000-8000-000000000001";
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/labs/articles/${unknownId}/doi`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(404);
  });

  it("POST /api/v1/labs/articles/:id/doi returns 400 for invalid article id", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/labs/articles/not-a-uuid/doi",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(400);
  });

  it("GET /api/v1/labs/articles/:id/doi returns 400 for invalid article id", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/labs/articles/not-a-uuid/doi",
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /api/v1/labs/articles/:id/doi returns 400 when article is not published", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/labs/articles/${DRAFT_ARTICLE_ID}/doi`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json() as { error?: { code?: string } };
    expect(body.error?.code).toBe("VALIDATION_ERROR");
  });
});
