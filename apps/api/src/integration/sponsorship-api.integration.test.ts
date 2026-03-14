/**
 * Integration tests for Sponsorship API (COMP-027.7).
 *
 * Full flow: create sponsorship → GET by id → payment intent (mock Stripe);
 * optional impact metric. Uses real Postgres (Testcontainers) and MockPaymentGateway.
 * Run when SPONSORSHIP_INTEGRATION=true or always (Testcontainers).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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
  PostgresSponsorshipRepository,
  PostgresImpactMetricRepository,
  MockPaymentGateway,
  ImpactMetric,
} from "@syntropy/sponsorship";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-sponsorship-integration-jwt";
const SPONSORED_ID = "c3d4e5f6-a7b8-4901-c234-567890123456";

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

async function runSponsorshipMigration(
  pool: Pool,
  migrationsDir: string
): Promise<void> {
  const sql = readFileSync(
    join(migrationsDir, "20260328000000_sponsorship.sql"),
    "utf8"
  );
  await pool.query(sql);
}

const describeIntegration =
  process.env.SPONSORSHIP_INTEGRATION === "true" ? describe : describe.skip;

describeIntegration("sponsorship API integration (COMP-027.7)", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let app: Awaited<ReturnType<typeof createApp>>;
  let mockGateway: MockPaymentGateway;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    const connectionUri = container.getConnectionUri();
    pool = new Pool({ connectionString: connectionUri });

    const migrationsDir = getMigrationsDir();
    await runSponsorshipMigration(pool, migrationsDir);

    const sponsorshipRepository = new PostgresSponsorshipRepository(pool);
    const impactMetricRepository = new PostgresImpactMetricRepository(pool);
    mockGateway = new MockPaymentGateway();

    app = await createApp({
      auth: createMockAuth(VALID_JWT),
      supabaseClient: null,
      sponsorship: {
        sponsorshipRepository,
        impactMetricRepository,
        paymentGateway: mockGateway,
      },
    });
  }, 60_000);

  afterAll(async () => {
    if (app) await app.close();
    if (pool) await pool.end();
    if (container) await container.stop();
  });

  it("full flow: POST create → GET by id → POST payment-intent", async () => {
    mockGateway.reset();

    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/sponsorships",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {
        sponsoredId: SPONSORED_ID,
        type: "recurring",
        amount: 30,
      },
    });
    expect(createRes.statusCode).toBe(201);
    const createBody = createRes.json() as {
      data?: { id?: string; sponsorId?: string; amount?: number; status?: string };
    };
    expect(createBody.data?.id).toBeDefined();
    expect(createBody.data?.sponsorId).toBe(TEST_USER_ID);
    expect(createBody.data?.amount).toBe(30);
    expect(createBody.data?.status).toBe("pending");
    const sponsorshipId = createBody.data!.id!;

    const getRes = await app.inject({
      method: "GET",
      url: `/api/v1/sponsorships/${sponsorshipId}`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(getRes.statusCode).toBe(200);
    const getBody = getRes.json() as { data?: { id?: string; amount?: number } };
    expect(getBody.data?.id).toBe(sponsorshipId);
    expect(getBody.data?.amount).toBe(30);

    const intentRes = await app.inject({
      method: "POST",
      url: `/api/v1/sponsorships/${sponsorshipId}/payment-intent`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(intentRes.statusCode).toBe(200);
    const intentBody = intentRes.json() as {
      data?: { id?: string; clientSecret?: string };
    };
    expect(intentBody.data?.id).toBe("pi_mock_123");
    expect(intentBody.data?.clientSecret).toBeDefined();

    expect(mockGateway.createPaymentIntentCalls.length).toBe(1);
    expect(mockGateway.createPaymentIntentCalls[0]?.amount).toBe(3000);
    expect(mockGateway.createPaymentIntentCalls[0]?.currency).toBe("usd");
  });

  it("GET /api/v1/sponsorships/:id/impact returns 200 and metric when saved", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/sponsorships",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {
        sponsoredId: SPONSORED_ID,
        type: "one_time",
        amount: 15,
      },
    });
    expect(createRes.statusCode).toBe(201);
    const createBody = createRes.json() as { data?: { id?: string } };
    const sponsorshipId = createBody.data!.id!;

    const impactMetricRepository = new PostgresImpactMetricRepository(pool);
    const metric = new ImpactMetric({
      sponsorshipId,
      artifactViews: 42,
      portfolioGrowth: 7,
      contributionActivity: 2,
    });
    await impactMetricRepository.save(metric, new Date("2026-03-01"));

    const impactRes = await app.inject({
      method: "GET",
      url: `/api/v1/sponsorships/${sponsorshipId}/impact`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(impactRes.statusCode).toBe(200);
    const impactBody = impactRes.json() as {
      data?: {
        sponsorshipId?: string;
        artifactViews?: number;
        portfolioGrowth?: number;
        contributionActivity?: number;
      };
    };
    expect(impactBody.data?.sponsorshipId).toBe(sponsorshipId);
    expect(impactBody.data?.artifactViews).toBe(42);
    expect(impactBody.data?.portfolioGrowth).toBe(7);
    expect(impactBody.data?.contributionActivity).toBe(2);
  });
});
