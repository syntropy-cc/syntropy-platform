/**
 * API tests for contract routes (COMP-004.6).
 *
 * Uses mocked ContractRepository and real SmartContractEvaluator, ContractDSLParser.
 * Verifies auth required, envelope shape, and status codes.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";
import {
  ArtifactLifecycleService,
  CreateProjectUseCase,
  type ArtifactLifecycleEventPublisher,
  type ArtifactRepository,
  type ProjectRepository,
} from "@syntropy/dip";
import {
  ContractDSLParser,
  GovernanceContract,
  SmartContractEvaluator,
  type ContractRepository,
} from "@syntropy/dip-contracts";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-test-jwt";
const CONTRACT_ID = "e7f8a9b0-c1d2-4789-a012-345678901234";
const VALID_DSL = JSON.stringify({
  id: CONTRACT_ID,
  institutionId: "inst-1",
  clauses: [],
});

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

function createMockContractRepository(): ContractRepository & {
  contracts: Map<string, GovernanceContract>;
} {
  const contracts = new Map<string, GovernanceContract>();
  return {
    contracts,
    async findById(id: string) {
      return contracts.get(id) ?? null;
    },
    async save(contract: GovernanceContract) {
      contracts.set(contract.id, contract);
    },
    async findByInstitution() {
      return [...contracts.values()];
    },
  };
}

function createMockArtifactRepository(): ArtifactRepository {
  return {
    async findById() {
      return null;
    },
    async save() {},
    async findByAuthor() {
      return [];
    },
    async findPublished() {
      return { items: [] };
    },
  };
}

function createMockEventPublisher(): ArtifactLifecycleEventPublisher {
  return { async publish() {} };
}

describe("contract routes", () => {
  describe("when DIP is not configured", () => {
    it("POST /api/v1/contracts is not registered (404)", async () => {
      const app = await createApp({
        auth: createMockAuth(VALID_JWT),
        supabaseClient: null,
        dip: null,
      });
      try {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/contracts",
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: { dsl: VALID_DSL },
        });
        expect(response.statusCode).toBe(404);
      } finally {
        await app.close();
      }
    });
  });

  describe("when DIP is configured", () => {
    let app: Awaited<ReturnType<typeof createApp>>;
    let contractRepository: ReturnType<typeof createMockContractRepository>;

    beforeAll(async () => {
      contractRepository = createMockContractRepository();
      const artifactRepository = createMockArtifactRepository();
      const lifecycleService = new ArtifactLifecycleService(
        artifactRepository,
        createMockEventPublisher(),
        () => CONTRACT_ID
      );
      const mockProjectRepository: ProjectRepository = {
        save: async () => {},
        findById: async () => null,
        findByInstitution: async () => [],
        getDagEdges: async () => [],
      };
      const noopProjectPublisher = {
        async publishProjectCreated() {},
        async publishProjectManifestUpdated() {},
      };
      const createProjectUseCase = new CreateProjectUseCase(
        mockProjectRepository,
        noopProjectPublisher,
      );

      app = await createApp({
        auth: createMockAuth(VALID_JWT),
        supabaseClient: null,
        dip: {
          lifecycleService,
          artifactRepository,
          contractRepository,
          smartContractEvaluator: new SmartContractEvaluator(),
          contractDSLParser: new ContractDSLParser(),
          projectRepository: mockProjectRepository,
          createProjectUseCase,
        },
      });
    });

    afterAll(async () => {
      await app.close();
    });

    describe("POST /api/v1/contracts", () => {
      it("returns 401 when Authorization header is missing", async () => {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/contracts",
          payload: { dsl: VALID_DSL },
        });
        expect(response.statusCode).toBe(401);
      });

      it("returns 400 when body is missing dsl", async () => {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/contracts",
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: {},
        });
        expect(response.statusCode).toBe(400);
        const body = response.json() as { error?: { code: string } };
        expect(body.error?.code).toBe("BAD_REQUEST");
      });

      it("returns 400 when dsl is invalid", async () => {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/contracts",
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: { dsl: "not json" },
        });
        expect(response.statusCode).toBe(400);
        const body = response.json() as { error?: { code: string } };
        expect(body.error?.code).toBe("BAD_REQUEST");
      });

      it("returns 400 when dsl is valid JSON but missing required fields", async () => {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/contracts",
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: { dsl: "{}" },
        });
        expect(response.statusCode).toBe(400);
        const body = response.json() as { error?: { code: string } };
        expect(body.error?.code).toBe("BAD_REQUEST");
      });

      it("returns 201 and contract DTO when dsl is valid", async () => {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/contracts",
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: { dsl: VALID_DSL },
        });
        expect(response.statusCode).toBe(201);
        const body = response.json() as { data: { id: string; institutionId: string; clauses: unknown[] }; meta?: unknown };
        expect(body.data.id).toBe(CONTRACT_ID);
        expect(body.data.institutionId).toBe("inst-1");
        expect(Array.isArray(body.data.clauses)).toBe(true);
        expect(body.meta?.timestamp).toBeDefined();
      });
    });

    describe("GET /api/v1/contracts/:id", () => {
      it("returns 401 when Authorization header is missing", async () => {
        const response = await app.inject({
          method: "GET",
          url: `/api/v1/contracts/${CONTRACT_ID}`,
        });
        expect(response.statusCode).toBe(401);
      });

      it("returns 404 when contract does not exist", async () => {
        const response = await app.inject({
          method: "GET",
          url: "/api/v1/contracts/00000000-0000-4000-8000-000000000000",
          headers: { authorization: `Bearer ${VALID_JWT}` },
        });
        expect(response.statusCode).toBe(404);
        const body = response.json() as { error?: { code: string } };
        expect(body.error?.code).toBe("NOT_FOUND");
      });

      it("returns 200 and contract DTO when contract exists", async () => {
        const contract = GovernanceContract.create({
          id: CONTRACT_ID,
          institutionId: "inst-1",
          clauses: [],
        });
        await contractRepository.save(contract);

        const response = await app.inject({
          method: "GET",
          url: `/api/v1/contracts/${CONTRACT_ID}`,
          headers: { authorization: `Bearer ${VALID_JWT}` },
        });
        expect(response.statusCode).toBe(200);
        const body = response.json() as { data: { id: string; institutionId: string }; meta?: unknown };
        expect(body.data.id).toBe(CONTRACT_ID);
        expect(body.data.institutionId).toBe("inst-1");
        expect(body.meta?.timestamp).toBeDefined();
      });
    });

    describe("POST /api/v1/contracts/:id/evaluate", () => {
      it("returns 401 when Authorization header is missing", async () => {
        const response = await app.inject({
          method: "POST",
          url: `/api/v1/contracts/${CONTRACT_ID}/evaluate`,
          payload: { institutionId: "inst-1" },
        });
        expect(response.statusCode).toBe(401);
      });

      it("returns 400 when body is missing institutionId", async () => {
        const response = await app.inject({
          method: "POST",
          url: `/api/v1/contracts/${CONTRACT_ID}/evaluate`,
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: {},
        });
        expect(response.statusCode).toBe(400);
        const body = response.json() as { error?: { code: string } };
        expect(body.error?.code).toBe("BAD_REQUEST");
      });

      it("returns 404 when contract does not exist", async () => {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/contracts/00000000-0000-4000-8000-000000000000/evaluate",
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: { institutionId: "inst-1" },
        });
        expect(response.statusCode).toBe(404);
        const body = response.json() as { error?: { code: string } };
        expect(body.error?.code).toBe("NOT_FOUND");
      });

      it("returns 200 and permitted true when context matches contract", async () => {
        const contract = GovernanceContract.create({
          id: CONTRACT_ID,
          institutionId: "inst-1",
          clauses: [],
        });
        await contractRepository.save(contract);

        const response = await app.inject({
          method: "POST",
          url: `/api/v1/contracts/${CONTRACT_ID}/evaluate`,
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: { institutionId: "inst-1" },
        });
        expect(response.statusCode).toBe(200);
        const body = response.json() as { data: { permitted: boolean }; meta?: unknown };
        expect(body.data.permitted).toBe(true);
        expect(body.meta?.timestamp).toBeDefined();
      });

      it("returns 200 and permitted false when institutionId does not match", async () => {
        const contract = GovernanceContract.create({
          id: CONTRACT_ID,
          institutionId: "inst-1",
          clauses: [],
        });
        await contractRepository.save(contract);

        const response = await app.inject({
          method: "POST",
          url: `/api/v1/contracts/${CONTRACT_ID}/evaluate`,
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: { institutionId: "other-inst" },
        });
        expect(response.statusCode).toBe(200);
        const body = response.json() as { data: { permitted: boolean; details?: string } };
        expect(body.data.permitted).toBe(false);
        expect(typeof body.data.details).toBe("string");
      });
    });
  });
});
