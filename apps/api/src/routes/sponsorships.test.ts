/**
 * API tests for Sponsorship routes (COMP-027.6).
 * Verifies POST/GET /api/v1/sponsorships and payment-intent with mock context.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";
import type { SponsorshipContext } from "../types/sponsorship-context.js";
import {
  Sponsorship,
  MockPaymentGateway,
  ImpactMetric,
} from "@syntropy/sponsorship";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-sponsorship-test-jwt";
const SPONSORSHIP_ID = "b2c3d4e5-f6a7-4890-b123-456789012345";
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

function createMockSponsorshipContext(): SponsorshipContext {
  const sponsorships = new Map<string, Sponsorship>();
  const impactMetrics = new Map<string, ImpactMetric>();
  const mockGateway = new MockPaymentGateway();

  const pendingSponsorship = new Sponsorship({
    id: SPONSORSHIP_ID,
    sponsorId: TEST_USER_ID,
    sponsoredId: SPONSORED_ID,
    type: "recurring",
    amount: 25,
    status: "pending",
  });
  sponsorships.set(SPONSORSHIP_ID, pendingSponsorship);

  const impactMetric = new ImpactMetric({
    sponsorshipId: SPONSORSHIP_ID,
    artifactViews: 100,
    portfolioGrowth: 5,
    contributionActivity: 3,
  });
  impactMetrics.set(SPONSORSHIP_ID, impactMetric);

  return {
    sponsorshipRepository: {
      save: async (s: Sponsorship) => {
        sponsorships.set(s.id, s);
      },
      findById: async (id: string) => sponsorships.get(id) ?? null,
      findBySponsor: async (sponsorId: string) =>
        Array.from(sponsorships.values()).filter((s) => s.sponsorId === sponsorId),
    },
    impactMetricRepository: {
      save: async (metric: ImpactMetric, _period: Date) => {
        impactMetrics.set(metric.sponsorshipId, metric);
      },
      findBySponsorship: async (id: string) => impactMetrics.get(id) ?? null,
    },
    paymentGateway: mockGateway,
  };
}

describe("sponsorship routes (COMP-027.6)", () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  const mockContext = createMockSponsorshipContext();

  beforeAll(async () => {
    app = await createApp({
      auth: createMockAuth(VALID_JWT),
      supabaseClient: null,
      sponsorship: mockContext,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /api/v1/sponsorships without auth returns 401", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/sponsorships",
      payload: {
        sponsoredId: SPONSORED_ID,
        type: "recurring",
        amount: 10,
      },
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/v1/sponsorships with auth and valid body returns 201", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/sponsorships",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {
        sponsoredId: SPONSORED_ID,
        type: "one_time",
        amount: 50,
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json() as { data?: { id?: string; sponsorId?: string; amount?: number; status?: string } };
    expect(body.data?.id).toBeDefined();
    expect(body.data?.sponsorId).toBe(TEST_USER_ID);
    expect(body.data?.sponsoredId).toBe(SPONSORED_ID);
    expect(body.data?.amount).toBe(50);
    expect(body.data?.status).toBe("pending");
  });

  it("POST /api/v1/sponsorships with invalid body returns 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/sponsorships",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: { sponsoredId: "", type: "recurring", amount: 10 },
    });
    expect(res.statusCode).toBe(400);
  });

  it("GET /api/v1/sponsorships/:id without auth returns 401", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/sponsorships/${SPONSORSHIP_ID}`,
    });
    expect(res.statusCode).toBe(401);
  });

  it("GET /api/v1/sponsorships/:id with auth and existing id returns 200", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/sponsorships/${SPONSORSHIP_ID}`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { data?: { id?: string; amount?: number; status?: string } };
    expect(body.data?.id).toBe(SPONSORSHIP_ID);
    expect(body.data?.amount).toBe(25);
    expect(body.data?.status).toBe("pending");
  });

  it("GET /api/v1/sponsorships/:id returns 404 for unknown id", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/sponsorships/00000000-0000-4000-8000-000000000000",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(404);
    const body = res.json() as { error?: { code?: string } };
    expect(body.error?.code).toBe("NOT_FOUND");
  });

  it("GET /api/v1/sponsorships/:id/impact returns 200 and metric", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/sponsorships/${SPONSORSHIP_ID}/impact`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      data?: { sponsorshipId?: string; artifactViews?: number; portfolioGrowth?: number; contributionActivity?: number };
    };
    expect(body.data?.sponsorshipId).toBe(SPONSORSHIP_ID);
    expect(body.data?.artifactViews).toBe(100);
    expect(body.data?.portfolioGrowth).toBe(5);
    expect(body.data?.contributionActivity).toBe(3);
  });

  it("GET /api/v1/sponsorships/:id/impact returns 404 when sponsorship not found", async () => {
    const unknownId = "d4e5f6a7-b8c9-4012-d345-678901234567";
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/sponsorships/${unknownId}/impact`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(404);
  });

  it("POST /api/v1/sponsorships/:id/payment-intent returns 200 and clientSecret", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/sponsorships/${SPONSORSHIP_ID}/payment-intent`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { data?: { id?: string; clientSecret?: string } };
    expect(body.data?.id).toBe("pi_mock_123");
    expect(body.data?.clientSecret).toBe("pi_mock_123_secret_xyz");
  });

  it("POST /api/v1/sponsorships/:id/payment-intent returns 404 for unknown id", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/sponsorships/00000000-0000-4000-8000-000000000000/payment-intent",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(404);
  });
});
