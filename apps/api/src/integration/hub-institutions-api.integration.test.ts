/**
 * Integration tests for Hub institution orchestration REST API (COMP-020.6).
 *
 * Uses Testcontainers Postgres, hub + DIP governance migrations,
 * Hub context with institution orchestration and Governance context.
 * Run with HUB_INTEGRATION=true. Requires Docker.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";
import {
  InMemoryContractTemplateRepository,
  PostgresInstitutionWorkflowRepository,
  PostgresIssueRepository,
  PostgresContributionRepository,
  DIPContributionAdapter,
  ContributionIntegrationService,
  InstitutionOrchestrationService,
  InstitutionProfileProjector,
  type HubCollaborationDbClient,
} from "@syntropy/hub-package";
import type { HubCollaborationContext } from "../types/hub-context.js";
import {
  PgGovernanceDbClient,
  PostgresDigitalInstitutionRepository,
  PostgresProposalRepository,
  PostgresVoteStore,
  VotingService,
  GovernanceQueryService,
} from "@syntropy/dip-governance";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";
import { createDIPInstitutionAdapter } from "../adapters/dip-institution-adapter.js";
import { createInstitutionProfileReader } from "../adapters/institution-profile-reader-adapter.js";

const TEST_USER_ID = "user-hub-inst-" + randomUUID().slice(0, 8);
const VALID_JWT = "valid-hub-institutions-test-jwt";

function createMockAuth(validJwt: string): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: TEST_USER_ID,
    actor_id: createActorId(TEST_USER_ID),
    roles: ["User"],
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

async function runMigration(
  pool: Pool,
  migrationsDir: string,
  name: string
): Promise<void> {
  const sql = readFileSync(join(migrationsDir, name), "utf8");
  await pool.query(sql);
}

function createHubDbClient(pool: Pool): HubCollaborationDbClient {
  return {
    execute: (sql: string, params: unknown[]) =>
      pool.query(sql, params).then(() => {}),
    query: <T = Record<string, unknown>>(sql: string, params: unknown[]) =>
      pool.query(sql, params).then((r) => r.rows as T[]),
  };
}

const describeHubInstitutions =
  process.env.CI !== "true" && process.env.HUB_INTEGRATION === "true"
    ? describe
    : describe.skip;

describeHubInstitutions("Hub institutions API (COMP-020.6)", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    pool = new Pool({ connectionString: container.getConnectionUri() });
    const migrationsDir = getMigrationsDir();

    await runMigration(
      pool,
      migrationsDir,
      "20260319000000_hub_collaboration.sql"
    );
    await runMigration(
      pool,
      migrationsDir,
      "20260320000000_hub_institution_orchestration.sql"
    );
    await runMigration(
      pool,
      migrationsDir,
      "20260313240000_dip_governance_contracts.sql"
    );
    await runMigration(
      pool,
      migrationsDir,
      "20260314200000_dip_institutional_governance.sql"
    );

    const hubClient = createHubDbClient(pool);
    const governanceDb = new PgGovernanceDbClient(pool);
    const institutionRepo = new PostgresDigitalInstitutionRepository(governanceDb);
    const proposalRepo = new PostgresProposalRepository(governanceDb);
    const voteStore = new PostgresVoteStore(governanceDb);
    const votingService = new VotingService(proposalRepo, voteStore, async () => true);
    const governanceQueryService = new GovernanceQueryService(
      institutionRepo,
      proposalRepo,
      voteStore
    );

    const contractTemplateRepository = new InMemoryContractTemplateRepository();
    const institutionWorkflowRepository = new PostgresInstitutionWorkflowRepository(hubClient);
    const dipAdapter = createDIPInstitutionAdapter(institutionRepo);
    const institutionOrchestrationService = new InstitutionOrchestrationService(
      contractTemplateRepository,
      institutionWorkflowRepository,
      dipAdapter
    );
    const profileReader = createInstitutionProfileReader(
      institutionRepo,
      governanceQueryService
    );
    const institutionProfileProjector = new InstitutionProfileProjector(profileReader);

    const issueRepository = new PostgresIssueRepository(hubClient);
    const contributionRepository = new PostgresContributionRepository(hubClient);
    const mockDipClient = { publish: async () => `dip-artifact-${randomUUID()}` };
    const contributionIntegrationService = new ContributionIntegrationService(
      new DIPContributionAdapter(mockDipClient),
      contributionRepository,
      issueRepository
    );

    const hubContext: HubCollaborationContext = {
      issueRepository,
      contributionRepository,
      contributionIntegrationService,
      contractTemplateRepository,
      institutionWorkflowRepository,
      institutionOrchestrationService,
      institutionProfileProjector,
    };

    app = await createApp({
      auth: createMockAuth(VALID_JWT),
      supabaseClient: null,
      governance: {
        institutionRepo,
        proposalRepo,
        voteStore,
        votingService,
        governanceQueryService,
      },
      hub: hubContext,
    });
  }, 60_000);

  afterAll(async () => {
    if (app) await app.close();
    if (pool) await pool.end();
    if (container) await container.stop();
  });

  it("GET /api/v1/hub/contract-templates returns list of templates", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/hub/contract-templates",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { data: Array<{ templateId: string; name: string; type: string }> };
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data[0]).toHaveProperty("templateId");
    expect(body.data[0]).toHaveProperty("name");
    expect(body.data[0]).toHaveProperty("type");
  });

  it("POST /api/v1/hub/institutions/create creates institution and GET returns profile", async () => {
    const templateId = "template-open-source-v1";
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/hub/institutions/create",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: { templateId, founderIds: [TEST_USER_ID] },
    });
    expect(createRes.statusCode).toBe(201);
    const createBody = createRes.json() as {
      data: { institutionId: string; workflowId: string; status: string };
    };
    expect(createBody.data.institutionId).toBeDefined();
    expect(createBody.data.workflowId).toBeDefined();
    expect(createBody.data.status).toBe("institution_created");

    const institutionId = createBody.data.institutionId;
    const getRes = await app.inject({
      method: "GET",
      url: `/api/v1/hub/institutions/${institutionId}`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(getRes.statusCode).toBe(200);
    const profileBody = getRes.json() as {
      data: { institutionId: string; name: string; institutionType: string };
    };
    expect(profileBody.data.institutionId).toBe(institutionId);
    expect(profileBody.data.name).toBe("Open Source Project");
    expect(profileBody.data.institutionType).toBe("open_source_project");
  });

  it("GET /api/v1/hub/institutions/:id returns 404 for unknown id", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/hub/institutions/inst-nonexistent",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(404);
  });

  it("POST /api/v1/hub/institutions/create returns 401 when not authenticated", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/hub/institutions/create",
      payload: { templateId: "template-open-source-v1" },
    });
    expect(res.statusCode).toBe(401);
  });
});
