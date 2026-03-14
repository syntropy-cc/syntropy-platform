/**
 * API tests for artifact routes (COMP-003.7).
 *
 * Uses mocked ArtifactLifecycleService and ArtifactRepository.
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
  Artifact,
  ArtifactLifecycleService,
  ArtifactStatus,
  CreateProjectUseCase,
  createArtifactId,
  createAuthorId,
  type ArtifactLifecycleEventPublisher,
  type ArtifactRepository,
  type ProjectRepository,
} from "@syntropy/dip";
import { ContractDSLParser, SmartContractEvaluator } from "@syntropy/dip-contracts";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-test-jwt";
/** Valid UUID v4 (version 4, variant 10xx): 3rd group [1-5], 4th group [89ab]. */
const ARTIFACT_ID = "e7f8a9b0-c1d2-4789-a012-345678901234";

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

function createMockArtifactRepository(): ArtifactRepository {
  const map = new Map<string, Artifact>();
  return {
    async findById(id) {
      return map.get(id) ?? null;
    },
    async save(artifact) {
      map.set(artifact.id, artifact);
    },
    async findByAuthor() {
      return [...map.values()];
    },
    async findPublished() {
      return { items: [...map.values()].filter((a) => a.status === ArtifactStatus.Published) };
    },
  };
}

function createMockEventPublisher(): ArtifactLifecycleEventPublisher {
  return {
    async publish() {},
  };
}

describe("artifact routes", () => {
  describe("when DIP is not configured", () => {
    it("POST /api/v1/artifacts is not registered (404)", async () => {
      const app = await createApp({
        auth: createMockAuth(VALID_JWT),
        supabaseClient: null,
        dip: null,
      });
      try {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/artifacts",
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: {},
        });
        expect(response.statusCode).toBe(404);
      } finally {
        await app.close();
      }
    });
  });

  describe("when DIP is configured", () => {
    let app: Awaited<ReturnType<typeof createApp>>;
    let lifecycleService: ArtifactLifecycleService;
    let artifactRepository: ArtifactRepository;

    beforeAll(async () => {
      artifactRepository = createMockArtifactRepository();
      const eventPublisher = createMockEventPublisher();
      lifecycleService = new ArtifactLifecycleService(
        artifactRepository,
        eventPublisher,
        () => ARTIFACT_ID
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
          contractRepository: {
            findById: async () => null,
            save: async () => {},
            findByInstitution: async () => [],
          },
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

    describe("POST /api/v1/artifacts", () => {
      it("returns 401 when Authorization header is missing", async () => {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/artifacts",
          payload: {},
        });
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload);
        expect(body.error?.code).toBe("UNAUTHORIZED");
        expect(body.meta?.timestamp).toBeDefined();
      });

      it("returns 201 and envelope with artifact in draft when authenticated", async () => {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/artifacts",
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: {},
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(ARTIFACT_ID);
        expect(body.data.status).toBe("draft");
        expect(body.data.authorId).toBe(TEST_USER_ID);
        expect(body.data.createdAt).toBeDefined();
        expect(body.data.publishedAt).toBeNull();
        expect(body.meta?.timestamp).toBeDefined();
      });

      it("returns 201 when body has optional content", async () => {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/artifacts",
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: { content: "hello" },
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.data.id).toBeDefined();
        expect(body.data.status).toBe("draft");
      });
    });

    describe("GET /api/v1/artifacts/:id", () => {
      it("returns 401 when Authorization header is missing", async () => {
        const response = await app.inject({
          method: "GET",
          url: `/api/v1/artifacts/${ARTIFACT_ID}`,
        });
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload);
        expect(body.error?.code).toBe("UNAUTHORIZED");
      });

      it("returns 404 when artifact does not exist", async () => {
        const response = await app.inject({
          method: "GET",
          url: "/api/v1/artifacts/00000000-0000-4000-8000-000000000000",
          headers: { authorization: `Bearer ${VALID_JWT}` },
        });
        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.payload);
        expect(body.error?.code).toBe("NOT_FOUND");
        expect(body.meta?.timestamp).toBeDefined();
      });

      it("returns 200 and envelope with artifact when artifact exists", async () => {
        const authorId = createAuthorId(TEST_USER_ID);
        const artifact = Artifact.draft({
          id: createArtifactId(ARTIFACT_ID),
          authorId,
        });
        await artifactRepository.save(artifact);

        const response = await app.inject({
          method: "GET",
          url: `/api/v1/artifacts/${ARTIFACT_ID}`,
          headers: { authorization: `Bearer ${VALID_JWT}` },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe(ARTIFACT_ID);
        expect(body.data.status).toBe("draft");
        expect(body.meta?.timestamp).toBeDefined();
      });
    });

    describe("PUT /api/v1/artifacts/:id/submit", () => {
      it("returns 401 when Authorization header is missing", async () => {
        const response = await app.inject({
          method: "PUT",
          url: `/api/v1/artifacts/${ARTIFACT_ID}/submit`,
        });
        expect(response.statusCode).toBe(401);
      });

      it("returns 200 and submitted status when transition is valid", async () => {
        const authorId = createAuthorId(TEST_USER_ID);
        const artifact = Artifact.draft({
          id: createArtifactId(ARTIFACT_ID),
          authorId,
        });
        await artifactRepository.save(artifact);

        const response = await app.inject({
          method: "PUT",
          url: `/api/v1/artifacts/${ARTIFACT_ID}/submit`,
          headers: { authorization: `Bearer ${VALID_JWT}` },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.data.status).toBe("submitted");
      });

      it("returns 409 when transition is invalid (already submitted)", async () => {
        const authorId = createAuthorId(TEST_USER_ID);
        const artifact = Artifact.draft({
          id: createArtifactId(ARTIFACT_ID),
          authorId,
        });
        const submitted = artifact.submit();
        await artifactRepository.save(submitted);

        const response = await app.inject({
          method: "PUT",
          url: `/api/v1/artifacts/${ARTIFACT_ID}/submit`,
          headers: { authorization: `Bearer ${VALID_JWT}` },
        });
        expect(response.statusCode).toBe(409);
        const body = JSON.parse(response.payload);
        expect(body.error?.code).toBe("CONFLICT");
      });
    });

    describe("PUT /api/v1/artifacts/:id/publish", () => {
      const publishableId = "f8a9b0c1-d2e3-4789-8012-345678901234";

      it("returns 401 when Authorization header is missing", async () => {
        const response = await app.inject({
          method: "PUT",
          url: `/api/v1/artifacts/${publishableId}/publish`,
        });
        expect(response.statusCode).toBe(401);
      });

      it("returns 409 when artifact is still draft (invalid transition)", async () => {
        const authorId = createAuthorId(TEST_USER_ID);
        const artifact = Artifact.draft({
          id: createArtifactId(publishableId),
          authorId,
        });
        await artifactRepository.save(artifact);

        const response = await app.inject({
          method: "PUT",
          url: `/api/v1/artifacts/${publishableId}/publish`,
          headers: { authorization: `Bearer ${VALID_JWT}` },
        });
        expect(response.statusCode).toBe(409);
        const body = JSON.parse(response.payload);
        expect(body.error?.code).toBe("CONFLICT");
      });

      it("returns 200 and published status when transition is valid", async () => {
        const authorId = createAuthorId(TEST_USER_ID);
        const artifact = Artifact.draft({
          id: createArtifactId(publishableId),
          authorId,
        });
        const submitted = artifact.submit();
        await artifactRepository.save(submitted);

        const response = await app.inject({
          method: "PUT",
          url: `/api/v1/artifacts/${publishableId}/publish`,
          headers: { authorization: `Bearer ${VALID_JWT}` },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.data.status).toBe("published");
        expect(body.data.publishedAt).toBeDefined();
      });
    });
  });
});
