/**
 * Integration tests for Project REST API (COMP-006.6).
 *
 * Uses Testcontainers Postgres, real DIP project stack (repository + event publisher noop).
 * Asserts POST create, GET by id, GET dag (nodes+edges), and auth required.
 *
 * Requires Docker for Testcontainers.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
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
  CreateProjectUseCase,
  PgArtifactDbClient,
  PgContractDbClient,
  PgProjectDbClient,
  PostgresArtifactRepository,
  PostgresContractRepository,
  PostgresProjectRepository,
  ArtifactLifecycleService,
  type ArtifactLifecycleEventPublisher,
} from "@syntropy/dip";
import { ContractDSLParser, SmartContractEvaluator } from "@syntropy/dip-contracts";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-test-jwt";

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

function createNoopEventPublisher(): ArtifactLifecycleEventPublisher {
  return { async publish() {} };
}

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigrations(pool: Pool, migrationsDir: string): Promise<void> {
  const files = [
    "20260313220000_dip_artifacts.sql",
    "20260313230000_dip_artifacts_type_and_tags.sql",
    "20260313240000_dip_governance_contracts.sql",
    "20260313260000_dip_digital_projects.sql",
  ];
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await pool.query(sql);
  }
}

describe("project API integration (COMP-006.6)", () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let app: Awaited<ReturnType<typeof createApp>>;

    beforeAll(async () => {
      container = await new PostgreSqlContainer().start();
      const connectionUri = container.getConnectionUri();
      pool = new Pool({ connectionString: connectionUri });

      const migrationsDir = getMigrationsDir();
      await runMigrations(pool, migrationsDir);

      const dbClient = new PgArtifactDbClient(pool);
      const artifactRepository = new PostgresArtifactRepository(dbClient);
      const contractDbClient = new PgContractDbClient(pool);
      const contractRepository = new PostgresContractRepository(contractDbClient);
      const lifecycleService = new ArtifactLifecycleService(
        artifactRepository,
        createNoopEventPublisher(),
      );

      const projectDbClient = new PgProjectDbClient(pool);
      const projectRepository = new PostgresProjectRepository(projectDbClient);
      const noopProjectPublisher = {
        async publishProjectCreated() {},
        async publishProjectManifestUpdated() {},
      };
      const createProjectUseCase = new CreateProjectUseCase(
        projectRepository,
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
          projectRepository,
          createProjectUseCase,
          iacpRepository: {} as import("@syntropy/dip-iacp").IACPRepository,
        },
      });
    });

    afterAll(async () => {
      if (app) await app.close();
      if (pool) await pool.end();
      if (container) await container.stop();
    });

    it("POST /api/v1/projects with valid body returns 201 and project DTO", async () => {
      const institutionId = randomUUID();
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/projects",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {
          institutionId,
          title: "Test Project",
          description: "A test description",
        },
      });
      expect(createRes.statusCode).toBe(201);
      const body = createRes.json() as {
        data: {
          id: string;
          institutionId: string;
          manifestId: string;
          title: string;
          description: string;
          createdAt: string;
          updatedAt: string;
        };
      };
      expect(body.data).toBeDefined();
      expect(body.data.institutionId).toBe(institutionId);
      expect(body.data.title).toBe("Test Project");
      expect(body.data.description).toBe("A test description");
      expect(body.data.id).toBeDefined();
      expect(body.data.manifestId).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
      expect(body.data.updatedAt).toBeDefined();
    });

    it("GET /api/v1/projects/:id returns 200 and same project after create", async () => {
      const institutionId = randomUUID();
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/projects",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { institutionId, title: "Get Test Project" },
      });
      expect(createRes.statusCode).toBe(201);
      const createBody = createRes.json() as { data: { id: string } };
      const projectId = createBody.data.id;

      const getRes = await app.inject({
        method: "GET",
        url: `/api/v1/projects/${projectId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(getRes.statusCode).toBe(200);
      const getBody = getRes.json() as { data: { id: string; title: string; institutionId: string } };
      expect(getBody.data.id).toBe(projectId);
      expect(getBody.data.title).toBe("Get Test Project");
      expect(getBody.data.institutionId).toBe(institutionId);
    });

    it("GET /api/v1/projects/:id for nonexistent id returns 404", async () => {
      const nonexistentId = randomUUID();
      const getRes = await app.inject({
        method: "GET",
        url: `/api/v1/projects/${nonexistentId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(getRes.statusCode).toBe(404);
      const body = getRes.json() as { error?: { code: string } };
      expect(body.error?.code).toBe("NOT_FOUND");
    });

    it("GET /api/v1/projects/:id/dag returns 200 with nodes and edges", async () => {
      const institutionId = randomUUID();
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/projects",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { institutionId, title: "DAG Test Project" },
      });
      expect(createRes.statusCode).toBe(201);
      const createBody = createRes.json() as { data: { id: string } };
      const projectId = createBody.data.id;

      const dagRes = await app.inject({
        method: "GET",
        url: `/api/v1/projects/${projectId}/dag`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(dagRes.statusCode).toBe(200);
      const dagBody = dagRes.json() as { data: { nodes: string[]; edges: Array<{ from: string; to: string }> } };
      expect(Array.isArray(dagBody.data.nodes)).toBe(true);
      expect(Array.isArray(dagBody.data.edges)).toBe(true);
      expect(dagBody.data.nodes).toHaveLength(0);
      expect(dagBody.data.edges).toHaveLength(0);
    });

    it("POST /api/v1/projects without auth returns 401", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/projects",
        payload: { institutionId: randomUUID(), title: "No Auth" },
      });
      expect(response.statusCode).toBe(401);
    });

    it("GET /api/v1/projects/:id without auth returns 401", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/v1/projects/${randomUUID()}`,
      });
      expect(response.statusCode).toBe(401);
    });
});
