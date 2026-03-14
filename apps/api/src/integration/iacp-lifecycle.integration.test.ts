/**
 * Integration tests for IACP REST API (COMP-005.8).
 *
 * Uses Testcontainers Postgres, real DIP IACP repository, drives full lifecycle
 * via REST: create → get → sign → activate. Requires Docker for Testcontainers.
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
  ArtifactLifecycleService,
  CreateProjectUseCase,
  PgArtifactDbClient,
  PgContractDbClient,
  PgIacpDbClient,
  PgProjectDbClient,
  PostgresArtifactRepository,
  PostgresContractRepository,
  PostgresIACPRepository,
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
    "20260313270000_dip_iacp.sql",
  ];
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await pool.query(sql);
  }
}

describe(
  "IACP lifecycle integration (COMP-005.8)",
  { timeout: 30_000, hookTimeout: 60_000 },
  () => {
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

      const iacpDbClient = new PgIacpDbClient(pool);
      const iacpRepository = new PostgresIACPRepository(iacpDbClient);

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
          iacpRepository,
        },
      });
    });

    afterAll(async () => {
      if (app) await app.close();
      if (pool) await pool.end();
      if (container) await container.stop();
    });

    it("full lifecycle create then get then sign then activate returns active status", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/iacp",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {
          type: "usage_agreement",
          partyActorIds: [TEST_ACTOR_ID],
        },
      });
      expect(createRes.statusCode).toBe(201);
      const createBody = createRes.json() as {
        data: { id: string; type: string; status: string; partyActorIds: string[] };
      };
      expect(createBody.data.type).toBe("usage_agreement");
      expect(createBody.data.status).toBe("pending_signatures");
      expect(createBody.data.partyActorIds).toContain(TEST_ACTOR_ID);
      const iacpId = createBody.data.id;

      const getRes = await app.inject({
        method: "GET",
        url: `/api/v1/iacp/${iacpId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(getRes.statusCode).toBe(200);
      const getBody = getRes.json() as { data: { id: string; status: string } };
      expect(getBody.data.id).toBe(iacpId);
      expect(getBody.data.status).toBe("pending_signatures");

      const signRes = await app.inject({
        method: "POST",
        url: `/api/v1/iacp/${iacpId}/sign`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { signature: "test-signature-payload" },
      });
      expect(signRes.statusCode).toBe(200);
      const signBody = signRes.json() as { data: { status: string } };
      expect(signBody.data.status).toBe("active");

      const getAfterRes = await app.inject({
        method: "GET",
        url: `/api/v1/iacp/${iacpId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(getAfterRes.statusCode).toBe(200);
      const getAfterBody = getAfterRes.json() as { data: { status: string } };
      expect(getAfterBody.data.status).toBe("active");
    });

    it("POST /api/v1/iacp returns 400 when body is invalid", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/iacp",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { type: 123 },
      });
      expect(response.statusCode).toBe(400);
      const body = response.json() as { error?: { code: string } };
      expect(body.error?.code).toBe("BAD_REQUEST");
    });

    it("GET /api/v1/iacp/:id returns 404 for unknown id", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/iacp/00000000-0000-4000-8000-000000000000",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(response.statusCode).toBe(404);
      const body = response.json() as { error?: { code: string } };
      expect(body.error?.code).toBe("NOT_FOUND");
    });
  },
);
