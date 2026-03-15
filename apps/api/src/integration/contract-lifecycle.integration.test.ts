/**
 * Integration tests for Smart Contract API (COMP-004.6).
 *
 * Uses Testcontainers Postgres, real DIP contract stack (repository, evaluator, parser),
 * and artifact stack for full DipContext. Drives full lifecycle via REST API and
 * asserts create, get, evaluate, and DSL validation.
 *
 * Requires Docker for Testcontainers.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
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
  ArtifactLifecycleService,
  CreateProjectUseCase,
  PgArtifactDbClient,
  PgContractDbClient,
  PgProjectDbClient,
  PostgresArtifactRepository,
  PostgresContractRepository,
  PostgresProjectRepository,
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

describe("contract lifecycle integration (COMP-004.6)", () => {
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

    it("full lifecycle create then get then evaluate returns correct results", async () => {
      const contractId = randomUUID();
      const institutionId = "inst-" + randomUUID().slice(0, 8);
      const validDsl = JSON.stringify({
        id: contractId,
        institutionId,
        clauses: [],
      });

      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/contracts",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { dsl: validDsl },
      });
      expect(createRes.statusCode).toBe(201);
      const createBody = createRes.json() as {
        data: { id: string; institutionId: string; clauses: unknown[] };
      };
      expect(createBody.data.id).toBe(contractId);
      expect(createBody.data.institutionId).toBe(institutionId);
      expect(Array.isArray(createBody.data.clauses)).toBe(true);

      const getRes = await app.inject({
        method: "GET",
        url: `/api/v1/contracts/${contractId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(getRes.statusCode).toBe(200);
      const getBody = getRes.json() as { data: { id: string; institutionId: string } };
      expect(getBody.data.id).toBe(contractId);
      expect(getBody.data.institutionId).toBe(institutionId);

      const evaluateRes = await app.inject({
        method: "POST",
        url: `/api/v1/contracts/${contractId}/evaluate`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { institutionId },
      });
      expect(evaluateRes.statusCode).toBe(200);
      const evaluateBody = evaluateRes.json() as { data: { permitted: boolean } };
      expect(evaluateBody.data.permitted).toBe(true);
    });

    it("POST /api/v1/contracts returns 400 when dsl is invalid", async () => {
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

    it("POST /api/v1/contracts returns 400 when dsl is empty object", async () => {
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

    it("evaluate returns permitted false when institutionId does not match", async () => {
      const contractId = randomUUID();
      const institutionId = "inst-" + randomUUID().slice(0, 8);
      const validDsl = JSON.stringify({
        id: contractId,
        institutionId,
        clauses: [],
      });

      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/contracts",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { dsl: validDsl },
      });
      expect(createRes.statusCode).toBe(201);

      const evaluateRes = await app.inject({
        method: "POST",
        url: `/api/v1/contracts/${contractId}/evaluate`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { institutionId: "other-institution" },
      });
      expect(evaluateRes.statusCode).toBe(200);
      const evaluateBody = evaluateRes.json() as { data: { permitted: boolean; details?: string } };
      expect(evaluateBody.data.permitted).toBe(false);
      expect(typeof evaluateBody.data.details).toBe("string");
    });
  },
);
