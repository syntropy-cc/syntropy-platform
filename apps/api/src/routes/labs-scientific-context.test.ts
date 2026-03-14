/**
 * API tests for Labs scientific context routes (COMP-022.5).
 * Verifies status codes and response shape for subject-areas, methodologies, hypotheses.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";
import type { LabsScientificContext } from "../types/labs-context.js";
import type { SubjectAreaTreeNode } from "@syntropy/labs-package";
import {
  createSubjectAreaId,
  HypothesisRecord,
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
const HYP_ID = "d4000001-0000-4000-8000-000000000001";

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

function createMockLabsContext(): LabsScientificContext {
  const tree: SubjectAreaTreeNode[] = [
    {
      id: createSubjectAreaId("a1000001-0000-4000-8000-000000000001"),
      parentId: null,
      name: "Computing methodologies",
      depthLevel: 1,
      children: [],
    },
  ];
  const hypotheses = new Map<string, HypothesisRecord>();
  return {
    subjectAreaRepository: {
      listAll: async () => [],
      getTree: async () => tree,
      findById: async () => null,
      save: async () => {},
    },
    methodologyRepository: {
      listAll: async () => [],
      findById: async () => null,
      save: async () => {},
    },
    hypothesisRecordRepository: {
      save: async (record) => {
        hypotheses.set(record.hypothesisId as string, record);
      },
      findById: async (id) => hypotheses.get(id as string) ?? null,
    },
  };
}

describe("labs scientific context routes", () => {
  describe("when labs is not configured", () => {
    it("GET /api/v1/labs/subject-areas returns 404", async () => {
      const app = await createApp({
        auth: createMockAuth(VALID_JWT),
        supabaseClient: null,
      });
      try {
        const res = await app.inject({
          method: "GET",
          url: "/api/v1/labs/subject-areas",
        });
        expect(res.statusCode).toBe(404);
      } finally {
        await app.close();
      }
    });
  });

  describe("when labs is configured", () => {
    let app: Awaited<ReturnType<typeof createApp>>;

    beforeAll(async () => {
      app = await createApp({
        auth: createMockAuth(VALID_JWT),
        supabaseClient: null,
        labs: createMockLabsContext(),
      });
    });

    afterAll(async () => {
      await app.close();
    });

    it("GET /api/v1/labs/subject-areas returns 200 and tree shape", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/labs/subject-areas",
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toBeDefined();
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
        expect(body.data[0]).toHaveProperty("name");
        expect(body.data[0]).toHaveProperty("depthLevel");
        expect(body.data[0]).toHaveProperty("children");
      }
    });

    it("GET /api/v1/labs/methodologies returns 200 and array", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/labs/methodologies",
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toBeDefined();
    });

    it("POST /api/v1/labs/hypotheses without auth returns 401", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/labs/hypotheses",
        payload: { statement: "H", projectId: "proj-1" },
      });
      expect(res.statusCode).toBe(401);
    });

    it("POST /api/v1/labs/hypotheses with auth returns 201 and body", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/labs/hypotheses",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { statement: "Increased X leads to Y.", projectId: "proj-1" },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(body.data.statement).toBe("Increased X leads to Y.");
      expect(body.data.projectId).toBe("proj-1");
      expect(body.data.status).toBe("proposed");
      expect(body.data.id).toBeDefined();
      expect(body.data.createdBy).toBe(TEST_USER_ID);
    });

    it("POST /api/v1/labs/hypotheses with empty statement returns 400", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/labs/hypotheses",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { statement: "", projectId: "proj-1" },
      });
      expect(res.statusCode).toBe(400);
    });

    it("GET /api/v1/labs/hypotheses/:id without auth returns 401", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/labs/hypotheses/${HYP_ID}`,
      });
      expect(res.statusCode).toBe(401);
    });

    it("GET /api/v1/labs/hypotheses/:id with auth and missing id returns 404", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/labs/hypotheses/${HYP_ID}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(404);
    });
  });
});
