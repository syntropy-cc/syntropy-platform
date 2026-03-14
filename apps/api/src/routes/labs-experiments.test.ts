/**
 * API tests for Labs experiment routes (COMP-024.5).
 * Verifies create experiment, get by id, submit result with anonymization.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";
import type { LabsScientificContext } from "../types/labs-context.js";
import { createArticleId, createExperimentId } from "@syntropy/types";
import { ExperimentDesign, ExperimentResult } from "@syntropy/labs-package";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-test-jwt";
const ARTICLE_ID = "c3000001-0000-4000-8000-000000000001";
const EXPERIMENT_ID = "e3000001-0000-4000-8000-000000000001";

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

function createMockLabsContextWithExperiments(): LabsScientificContext {
  const designs = new Map<string, ExperimentDesign>();
  const results = new Map<string, ExperimentResult>();
  const articleId = createArticleId(ARTICLE_ID);
  const experimentId = createExperimentId(EXPERIMENT_ID);
  const design = new ExperimentDesign({
    experimentId,
    articleId,
    researcherId: TEST_USER_ID,
    title: "Test Experiment",
    methodologyId: "71000001-0000-4000-8000-000000000001",
    hypothesisRecordId: null,
    protocol: { steps: ["measure"] },
    variables: {},
    ethicalApprovalStatus: "approved",
    status: "designing",
  });
  designs.set(EXPERIMENT_ID, design);

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
    experimentDesignRepository: {
      save: async (d) => {
        designs.set(d.experimentId as string, d);
      },
      findById: async (id) => designs.get(id as string) ?? null,
    },
    experimentResultRepository: {
      save: async (r) => {
        results.set(r.id as string, r);
      },
      findById: async (id) => results.get(id as string) ?? null,
      findByExperimentId: async (expId) =>
        Array.from(results.values()).filter(
          (r) => r.experimentId === expId
        ),
    },
  };
}

describe("labs experiment routes", () => {
  describe("when experiment context is configured", () => {
    let app: Awaited<ReturnType<typeof createApp>>;

    beforeAll(async () => {
      app = await createApp({
        auth: createMockAuth(VALID_JWT),
        supabaseClient: null,
        labs: createMockLabsContextWithExperiments(),
      });
    });

    afterAll(async () => {
      await app.close();
    });

    it("POST /api/v1/labs/experiments without auth returns 401", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/labs/experiments",
        payload: {
          articleId: ARTICLE_ID,
          title: "New Experiment",
          methodologyId: "71000001-0000-4000-8000-000000000001",
        },
      });
      expect(res.statusCode).toBe(401);
    });

    it("POST /api/v1/labs/experiments with auth returns 201 and experiment", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/labs/experiments",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {
          articleId: ARTICLE_ID,
          title: "New Experiment",
          methodologyId: "71000001-0000-4000-8000-000000000001",
        },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(body.data.title).toBe("New Experiment");
      expect(body.data.status).toBe("designing");
      expect(body.data.researcherId).toBe(TEST_USER_ID);
    });

    it("GET /api/v1/labs/experiments/:id with auth returns 200 and experiment", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/labs/experiments/${EXPERIMENT_ID}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.id).toBe(EXPERIMENT_ID);
      expect(body.data.title).toBe("Test Experiment");
      expect(body.data.status).toBe("designing");
    });

    it("GET /api/v1/labs/experiments/:id with missing id returns 404", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/labs/experiments/c0000000-0000-4000-8000-000000000000",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(404);
    });

    it("POST /api/v1/labs/experiments/:id/results with PII returns 201 with redacted data", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/labs/experiments/${EXPERIMENT_ID}/results`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {
          rawDataLocation: "s3://bucket/result.json",
          statisticalSummary: {
            mean: 0.5,
            n: 100,
            email: "participant@example.com",
            participantId: "user-123",
          },
          pValue: 0.03,
        },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(body.data.rawDataLocation).toBe("s3://bucket/result.json");
      expect(body.data.statisticalSummary.mean).toBe(0.5);
      expect(body.data.statisticalSummary.n).toBe(100);
      expect(body.data.statisticalSummary.email).toBe("[REDACTED]");
      expect(body.data.statisticalSummary.participantId).toBe("[REDACTED]");
    });
  });
});
