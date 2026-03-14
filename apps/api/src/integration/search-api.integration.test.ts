/**
 * Integration tests for Search & Recommendation REST API (COMP-011.7).
 *
 * Uses Testcontainers Postgres (pgvector image), platform_core migrations,
 * SearchService, RecommendationService, RecommendationRepository. Asserts
 * GET /api/v1/search and GET /api/v1/recommendations/:userId return correct shape.
 *
 * Requires Docker for Testcontainers.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { createApp } from "../server.js";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";
import {
  PgEventLogClient,
  PostgresSearchRepository,
  PostgresPortfolioRepository,
  PostgresRecommendationRepository,
  SearchService,
  RecommendationService,
  SearchIndex,
  Portfolio,
  XPTotal,
  ReputationScore,
  createSkillRecord,
} from "@syntropy/platform-core";

const TEST_USER_ID = "search-test-user-id";
const VALID_JWT = "valid-search-test-jwt";

function createMockAuth(validJwt: string): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: TEST_USER_ID,
    actor_id: createActorId(TEST_USER_ID),
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

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runSqlFile(pool: Pool, filename: string, migrationsDir: string): Promise<void> {
  const sql = readFileSync(join(migrationsDir, filename), "utf8");
  await pool.query(sql);
}

describe("search and recommendations API integration (COMP-011.7)", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("pgvector/pgvector:pg15").start();
    const connectionUri = container.getConnectionUri();
    pool = new Pool({ connectionString: connectionUri });

    const migrationsDir = getMigrationsDir();
    await runSqlFile(pool, "20260314220000_platform_core_portfolio_aggregation.sql", migrationsDir);
    await runSqlFile(pool, "20260314230000_platform_core_search_index.sql", migrationsDir);
    await runSqlFile(pool, "20260315000000_platform_core_search_index_embedding.sql", migrationsDir);
    await runSqlFile(pool, "20260315010000_platform_core_recommendations.sql", migrationsDir);

    const client = new PgEventLogClient(pool);
    const searchRepository = new PostgresSearchRepository(client);
    const portfolioRepository = new PostgresPortfolioRepository(client);
    const recommendationRepository = new PostgresRecommendationRepository(client);

    await searchRepository.upsert(
      SearchIndex.create({
        indexId: "track:t1",
        entityType: "track",
        entityId: "t1",
        tsvectorContent: "machine learning",
      })
    );
    await searchRepository.upsert(
      SearchIndex.create({
        indexId: "article:a1",
        entityType: "article",
        entityId: "a1",
        tsvectorContent: "machine learning",
      })
    );

    const portfolio = Portfolio.create({
      userId: TEST_USER_ID,
      xp: XPTotal.create(50),
      reputationScore: ReputationScore.create(0.5),
      achievements: [],
      skills: [createSkillRecord("machine learning", "beginner", [])],
    });
    await portfolioRepository.save(portfolio);

    const searchService = new SearchService(searchRepository);
    const recommendationService = new RecommendationService(portfolioRepository, searchRepository);

    app = await createApp({
      auth: createMockAuth(VALID_JWT),
      supabaseClient: null,
      portfolio: { portfolioRepository },
      search: {
        searchService,
        recommendationService,
        recommendationRepository,
      },
    });
  }, 60_000);

  afterAll(async () => {
    if (app) await app.close();
    if (pool) await pool.end();
    if (container) await container.stop();
  });

  it("GET /api/v1/search?q=... returns paginated search results", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/search?q=machine+learning",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      data: { items: Array<{ indexId: string; entityType: string; entityId: string }>; page: number; limit: number; total: number };
      meta: unknown;
    };
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data.items)).toBe(true);
    expect(body.data.items.length).toBeGreaterThanOrEqual(0);
    expect(body.data.page).toBe(1);
    expect(body.data.limit).toBeDefined();
    expect(body.meta).toBeDefined();
  });

  it("GET /api/v1/search returns 400 when q is missing", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/search",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json() as { error: { code: string } };
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET /api/v1/recommendations/:userId returns recommendation list", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/recommendations/${TEST_USER_ID}`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      data: { userId: string; generatedAt: string; recommendations: unknown[] };
      meta: unknown;
    };
    expect(body.data.userId).toBe(TEST_USER_ID);
    expect(body.data.generatedAt).toBeDefined();
    expect(Array.isArray(body.data.recommendations)).toBe(true);
    expect(body.meta).toBeDefined();
  });

  it("GET /api/v1/search returns 401 when not authenticated", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/search?q=test",
    });
    expect(res.statusCode).toBe(401);
  });

  it("GET /api/v1/recommendations/:userId returns 401 when not authenticated", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/recommendations/${TEST_USER_ID}`,
    });
    expect(res.statusCode).toBe(401);
  });
});
