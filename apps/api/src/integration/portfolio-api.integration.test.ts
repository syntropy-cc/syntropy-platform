/**
 * Integration tests for Portfolio REST API (COMP-010.8).
 *
 * Uses Testcontainers Postgres, platform_core portfolio migration,
 * PostgresPortfolioRepository, and mock auth. Seeds a portfolio and asserts
 * GET /api/v1/portfolios/:userId and GET /api/v1/portfolios/:userId/achievements
 * return correct shape.
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
  Portfolio,
  XPTotal,
  ReputationScore,
  createAchievement,
  createSkillRecord,
  PgEventLogClient,
  PostgresPortfolioRepository,
} from "@syntropy/platform-core";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901235";
const VALID_JWT = "valid-portfolio-test-jwt";

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

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runPortfolioMigration(pool: Pool, migrationsDir: string): Promise<void> {
  const sql = readFileSync(
    join(migrationsDir, "20260314220000_platform_core_portfolio_aggregation.sql"),
    "utf8"
  );
  await pool.query(sql);
}

describe("portfolio API integration (COMP-010.8)", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let app: Awaited<ReturnType<typeof createApp>>;
  let portfolioRepository: PostgresPortfolioRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    const connectionUri = container.getConnectionUri();
    pool = new Pool({ connectionString: connectionUri });

    const migrationsDir = getMigrationsDir();
    await runPortfolioMigration(pool, migrationsDir);

    const eventLogClient = new PgEventLogClient(pool);
    portfolioRepository = new PostgresPortfolioRepository(eventLogClient);

    const portfolio = Portfolio.create({
      userId: TEST_USER_ID,
      xp: XPTotal.create(100),
      reputationScore: ReputationScore.create(0.75),
      achievements: [
        createAchievement("first_fragment"),
        createAchievement("first_contribution"),
      ],
      skills: [
        createSkillRecord("typescript", "intermediate", ["evt-1"]),
        createSkillRecord("testing", "beginner", []),
      ],
    });
    await portfolioRepository.save(portfolio);

    app = await createApp({
      auth: createMockAuth(VALID_JWT),
      supabaseClient: null,
      portfolio: { portfolioRepository },
    });
  }, 60_000);

  afterAll(async () => {
    if (app) await app.close();
    if (pool) await pool.end();
    if (container) await container.stop();
  });

  it("GET /api/v1/portfolios/:userId returns full portfolio when portfolio exists", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/portfolios/${TEST_USER_ID}`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { data: { userId: string; xp: number; reputationScore: number; skills: unknown[]; achievements: unknown[] }; meta: unknown };
    expect(body.data).toBeDefined();
    expect(body.data.userId).toBe(TEST_USER_ID);
    expect(body.data.xp).toBe(100);
    expect(body.data.reputationScore).toBe(0.75);
    expect(Array.isArray(body.data.achievements)).toBe(true);
    expect(body.data.achievements).toHaveLength(2);
    expect(body.data.achievements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ achievementType: "first_fragment" }),
        expect.objectContaining({ achievementType: "first_contribution" }),
      ])
    );
    expect(Array.isArray(body.data.skills)).toBe(true);
    expect(body.data.skills).toHaveLength(2);
    expect(body.data.skills).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ skillName: "typescript", level: "intermediate" }),
        expect.objectContaining({ skillName: "testing", level: "beginner" }),
      ])
    );
    expect(body.meta).toBeDefined();
  });

  it("GET /api/v1/portfolios/:userId/achievements returns achievements array when portfolio exists", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/portfolios/${TEST_USER_ID}/achievements`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { data: { achievements: Array<{ achievementType: string; unlockedAt: string }> }; meta: unknown };
    expect(body.data.achievements).toHaveLength(2);
    expect(body.data.achievements.map((a) => a.achievementType).sort()).toEqual([
      "first_contribution",
      "first_fragment",
    ]);
    body.data.achievements.forEach((a) => {
      expect(a.unlockedAt).toBeDefined();
      expect(new Date(a.unlockedAt).toISOString()).toBe(a.unlockedAt);
    });
  });

  it("GET /api/v1/portfolios/:userId returns 404 when portfolio does not exist", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/portfolios/nonexistent-user-id",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(404);
    const body = res.json() as { error: { code: string; message: string } };
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toContain("nonexistent-user-id");
  });

  it("GET /api/v1/portfolios/:userId returns 401 when not authenticated", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/portfolios/${TEST_USER_ID}`,
    });
    expect(res.statusCode).toBe(401);
  });
});
