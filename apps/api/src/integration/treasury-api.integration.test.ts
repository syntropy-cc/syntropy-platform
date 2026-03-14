/**
 * Integration tests for Treasury API (COMP-008.8).
 *
 * GET /api/v1/treasury/:institutionId returns balance and history.
 * POST /api/v1/treasury/:institutionId/distribute triggers distribution.
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
  TreasuryAccount,
  PgTreasuryDbClient,
  PostgresTreasuryAccountRepository,
  PostgresAVUJournal,
  PostgresAVUTransactionQuery,
  ValueDistributionService,
  AVUAccountingService,
  TreasuryDistributionExecutor,
  type ContributorScoreQueryPort,
} from "@syntropy/dip-treasury";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-treasury-test-jwt";

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

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runTreasuryMigration(pool: Pool, migrationsDir: string): Promise<void> {
  const file = "20260314210000_dip_treasury.sql";
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  await pool.query(sql);
}

/** Stub: no contributors, so distribution returns empty. */
const stubNoContributorScores: ContributorScoreQueryPort = {
  async getContributorScores(): Promise<{ contributorId: string; score: number }[]> {
    return [];
  },
};

describe("treasury API integration (COMP-008.8)", () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let app: Awaited<ReturnType<typeof createApp>>;
    const INSTITUTION_ID = "inst-treasury-test-1";
    const ACCOUNT_ID = "acc-treasury-test-1";

    beforeAll(async () => {
      container = await new PostgreSqlContainer().start();
      const connectionUri = container.getConnectionUri();
      pool = new Pool({ connectionString: connectionUri });

      const migrationsDir = getMigrationsDir();
      await runTreasuryMigration(pool, migrationsDir);

      const db = new PgTreasuryDbClient(pool);
      const accountRepository = new PostgresTreasuryAccountRepository(db);
      const journal = new PostgresAVUJournal(db);
      const transactionQuery = new PostgresAVUTransactionQuery(db);
      const distributionService = new ValueDistributionService(
        accountRepository,
        stubNoContributorScores
      );
      const accountingService = new AVUAccountingService(accountRepository, journal);
      const distributionExecutor = new TreasuryDistributionExecutor(
        accountRepository,
        distributionService,
        accountingService
      );

      const account = TreasuryAccount.create({
        accountId: ACCOUNT_ID,
        institutionId: INSTITUTION_ID,
      });
      await accountRepository.save(account);

      app = await createApp({
        auth: createMockAuth(VALID_JWT),
        supabaseClient: null,
        treasury: {
          accountRepository,
          transactionQuery,
          distributionService,
          distributionExecutor,
        },
      });
    });

    afterAll(async () => {
      if (app) await app.close();
      if (pool) await pool.end();
      if (container) await container.stop();
    });

    it("GET /api/v1/treasury/:institutionId returns balance and history", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/treasury/${INSTITUTION_ID}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as {
        data: { institutionId: string; accountId: string; balance: number; history: unknown[] };
      };
      expect(body.data.institutionId).toBe(INSTITUTION_ID);
      expect(body.data.accountId).toBe(ACCOUNT_ID);
      expect(body.data.balance).toBe(0);
      expect(Array.isArray(body.data.history)).toBe(true);
      expect(body.data.history.length).toBe(0);
    });

    it("GET /api/v1/treasury/nonexistent returns 404", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/treasury/nonexistent-institution-id",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(404);
      const body = res.json() as { error?: { code: string } };
      expect(body.error?.code).toBe("NOT_FOUND");
    });

    it("POST /api/v1/treasury/:institutionId/distribute returns result shape", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/treasury/${INSTITUTION_ID}/distribute`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {},
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as {
        data: { allocations: { contributorId: string; amount: number }[]; totalDistributed: number };
      };
      expect(Array.isArray(body.data.allocations)).toBe(true);
      expect(typeof body.data.totalDistributed).toBe("number");
      expect(body.data.totalDistributed).toBe(0);
    });

    it("POST /api/v1/treasury/:institutionId/distribute with period body returns 200", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/treasury/${INSTITUTION_ID}/distribute`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {
          start: "2026-01-01T00:00:00.000Z",
          end: "2026-12-31T23:59:59.999Z",
        },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { data: { totalDistributed: number } };
      expect(body.data.totalDistributed).toBe(0);
    });
});
