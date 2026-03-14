/**
 * Integration tests for Governance API (COMP-007.9).
 *
 * Uses Testcontainers Postgres, real DIP contract and governance stacks.
 * Drives full voting lifecycle via REST API: create contract → create institution →
 * get institution → create proposal → cast vote → get institution (proposalCount).
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
import {
  PgGovernanceDbClient,
  PostgresDigitalInstitutionRepository,
  PostgresProposalRepository,
  PostgresVoteStore,
  VotingService,
  GovernanceQueryService,
} from "@syntropy/dip-governance";

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
    "20260314200000_dip_institutional_governance.sql",
  ];
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await pool.query(sql);
  }
}

describe(
  "governance lifecycle integration (COMP-007.9)",
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

      const governanceDb = new PgGovernanceDbClient(pool);
      const institutionRepo = new PostgresDigitalInstitutionRepository(governanceDb);
      const proposalRepo = new PostgresProposalRepository(governanceDb);
      const voteStore = new PostgresVoteStore(governanceDb);
      const eligibilityChecker = async (): Promise<boolean> => true;
      const votingService = new VotingService(
        proposalRepo,
        voteStore,
        eligibilityChecker,
      );
      const governanceQueryService = new GovernanceQueryService(
        institutionRepo,
        proposalRepo,
        voteStore,
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
        governance: {
          institutionRepo,
          proposalRepo,
          voteStore,
          votingService,
          governanceQueryService,
        },
      });
    });

    afterAll(async () => {
      if (app) await app.close();
      if (pool) await pool.end();
      if (container) await container.stop();
    });

    it("full voting lifecycle: create contract → institution → proposal → vote → get institution", async () => {
      const contractId = randomUUID();
      const institutionIdForContract = "inst-" + randomUUID().slice(0, 8);
      const validDsl = JSON.stringify({
        id: contractId,
        institutionId: institutionIdForContract,
        clauses: [],
      });

      const createContractRes = await app.inject({
        method: "POST",
        url: "/api/v1/contracts",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { dsl: validDsl },
      });
      expect(createContractRes.statusCode).toBe(201);

      const createInstRes = await app.inject({
        method: "POST",
        url: "/api/v1/institutions",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {
          name: "Test Institution",
          type: "laboratory",
          governanceContract: contractId,
        },
      });
      expect(createInstRes.statusCode).toBe(201);
      const instBody = createInstRes.json() as {
        data: { institutionId: string; name: string; status: string };
      };
      expect(instBody.data.name).toBe("Test Institution");
      expect(instBody.data.status).toBe("forming");
      const institutionId = instBody.data.institutionId;

      const getInstRes = await app.inject({
        method: "GET",
        url: `/api/v1/institutions/${institutionId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(getInstRes.statusCode).toBe(200);
      const summaryBody = getInstRes.json() as {
        data: { institutionId: string; name: string; status: string; proposalCount: number };
      };
      expect(summaryBody.data.institutionId).toBe(institutionId);
      expect(summaryBody.data.proposalCount).toBe(0);

      const createProposalRes = await app.inject({
        method: "POST",
        url: `/api/v1/institutions/${institutionId}/proposals`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { type: "amendment" },
      });
      expect(createProposalRes.statusCode).toBe(201);
      const propBody = createProposalRes.json() as {
        data: { proposalId: string; institutionId: string; type: string; status: string };
      };
      expect(propBody.data.institutionId).toBe(institutionId);
      expect(propBody.data.type).toBe("amendment");
      expect(propBody.data.status).toBe("open");
      const proposalId = propBody.data.proposalId;

      const voteRes = await app.inject({
        method: "POST",
        url: `/api/v1/proposals/${proposalId}/vote`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { vote: "for" },
      });
      expect(voteRes.statusCode).toBe(200);
      const voteResponseBody = voteRes.json() as { data: { ok: boolean } };
      expect(voteResponseBody.data.ok).toBe(true);

      const getInstAfterRes = await app.inject({
        method: "GET",
        url: `/api/v1/institutions/${institutionId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(getInstAfterRes.statusCode).toBe(200);
      const summaryAfter = getInstAfterRes.json() as {
        data: { proposalCount: number };
      };
      expect(summaryAfter.data.proposalCount).toBeGreaterThanOrEqual(1);
    });

    it("GET /api/v1/institutions/nonexistent returns 404", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/institutions/nonexistent-id-12345",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(404);
      const body = res.json() as { error?: { code: string } };
      expect(body.error?.code).toBe("NOT_FOUND");
    });

    it("POST /api/v1/proposals/:id/vote twice with same user returns 409 on second vote", async () => {
      const contractId = randomUUID();
      const validDsl = JSON.stringify({
        id: contractId,
        institutionId: "inst-" + randomUUID().slice(0, 8),
        clauses: [],
      });
      await app.inject({
        method: "POST",
        url: "/api/v1/contracts",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { dsl: validDsl },
      });

      const createInstRes = await app.inject({
        method: "POST",
        url: "/api/v1/institutions",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {
          name: "Dup Vote Test",
          type: "laboratory",
          governanceContract: contractId,
        },
      });
      expect(createInstRes.statusCode).toBe(201);
      const instBody = createInstRes.json() as { data: { institutionId: string } };
      const institutionId = instBody.data.institutionId;

      const createProposalRes = await app.inject({
        method: "POST",
        url: `/api/v1/institutions/${institutionId}/proposals`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { type: "amendment" },
      });
      expect(createProposalRes.statusCode).toBe(201);
      const propBody = createProposalRes.json() as { data: { proposalId: string } };
      const proposalId = propBody.data.proposalId;

      const firstVote = await app.inject({
        method: "POST",
        url: `/api/v1/proposals/${proposalId}/vote`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { vote: "for" },
      });
      expect(firstVote.statusCode).toBe(200);

      const secondVote = await app.inject({
        method: "POST",
        url: `/api/v1/proposals/${proposalId}/vote`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { vote: "against" },
      });
      expect(secondVote.statusCode).toBe(409);
      const body = secondVote.json() as { error?: { code: string } };
      expect(body.error?.code).toBe("CONFLICT");
    });
  },
);
