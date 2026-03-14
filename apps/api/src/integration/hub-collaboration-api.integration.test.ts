/**
 * Integration tests for Hub collaboration REST API (COMP-019.8).
 *
 * Uses Testcontainers Postgres, hub collaboration migration,
 * HubCollaborationContext with repositories and ContributionIntegrationService (mock artifact publisher).
 * Requires Docker for Testcontainers. Run with HUB_INTEGRATION=true.
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
  ContributionIntegrationService,
  DIPContributionAdapter,
  PostgresIssueRepository,
  PostgresContributionRepository,
  type HubCollaborationDbClient,
} from "@syntropy/hub-package";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901237";
const VALID_JWT = "valid-hub-api-test-jwt";

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

function createDbClient(pool: Pool): HubCollaborationDbClient {
  return {
    execute: (sql: string, params: unknown[]) =>
      pool.query(sql, params).then(() => {}),
    query: <T = Record<string, unknown>>(sql: string, params: unknown[]) =>
      pool.query(sql, params).then((r) => r.rows as T[]),
  };
}

const describeHubApi =
  process.env.CI !== "true" && process.env.HUB_INTEGRATION === "true"
    ? describe
    : describe.skip;

describeHubApi("Hub collaboration API (COMP-019.8)", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let app: Awaited<ReturnType<typeof createApp>>;
  let contributionRepository: PostgresContributionRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    pool = new Pool({ connectionString: container.getConnectionUri() });
    const migrationsDir = getMigrationsDir();
    await runMigration(
      pool,
      migrationsDir,
      "20260319000000_hub_collaboration.sql"
    );

    const client = createDbClient(pool);
    const issueRepository = new PostgresIssueRepository(client);
    contributionRepository = new PostgresContributionRepository(client);
    const mockDipClient = {
      publish: async () => `dip-artifact-${randomUUID()}`,
    };
    const artifactPublisher = new DIPContributionAdapter(mockDipClient);
    const contributionIntegrationService = new ContributionIntegrationService(
      artifactPublisher,
      contributionRepository,
      issueRepository
    );

    app = await createApp({
      auth: createMockAuth(VALID_JWT),
      supabaseClient: null,
      hub: {
        issueRepository,
        contributionRepository,
        contributionIntegrationService,
      },
    });
  }, 60_000);

  afterAll(async () => {
    if (app) await app.close();
    if (pool) await pool.end();
    if (container) await container.stop();
  });

  it("GET /api/v1/hub/issues returns 401 when not authenticated", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/hub/issues",
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/v1/hub/issues returns 401 when not authenticated", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/hub/issues",
      payload: { projectId: "proj-1", title: "Test", type: "feature" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/v1/hub/issues creates issue and GET /api/v1/hub/issues returns list", async () => {
    const projectId = `proj-${randomUUID()}`;
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/hub/issues",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: { projectId, title: "New Hub Issue", type: "bug" },
    });
    expect(createRes.statusCode).toBe(201);
    const createBody = createRes.json() as {
      data: { id: string; projectId: string; title: string; type: string; status: string };
      meta: unknown;
    };
    expect(createBody.data).toBeDefined();
    expect(createBody.data.id).toBeDefined();
    expect(createBody.data.projectId).toBe(projectId);
    expect(createBody.data.title).toBe("New Hub Issue");
    expect(createBody.data.type).toBe("bug");
    expect(createBody.data.status).toBe("open");
    expect(createBody.meta).toBeDefined();

    const listRes = await app.inject({
      method: "GET",
      url: "/api/v1/hub/issues",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(listRes.statusCode).toBe(200);
    const listBody = listRes.json() as { data: unknown[]; meta: unknown };
    expect(Array.isArray(listBody.data)).toBe(true);
    expect(listBody.data.length).toBeGreaterThanOrEqual(1);
    const found = (listBody.data as Array<{ id: string }>).find(
      (i) => i.id === createBody.data.id
    );
    expect(found).toBeDefined();
    expect((found as { id: string; title: string }).title).toBe("New Hub Issue");

    const listByProjectRes = await app.inject({
      method: "GET",
      url: `/api/v1/hub/issues?projectId=${encodeURIComponent(projectId)}`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(listByProjectRes.statusCode).toBe(200);
    const byProjectBody = listByProjectRes.json() as { data: unknown[] };
    expect(byProjectBody.data.length).toBe(1);
    expect((byProjectBody.data[0] as { id: string }).id).toBe(createBody.data.id);
  });

  it("POST /api/v1/hub/contributions creates contribution", async () => {
    const projectId = `proj-${randomUUID()}`;
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/hub/contributions",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {
        projectId,
        title: "My Contribution",
        description: "Description here",
        content: { patch: "diff" },
      },
    });
    expect(createRes.statusCode).toBe(201);
    const body = createRes.json() as {
      data: { id: string; projectId: string; title: string; contributorId: string; status: string };
      meta: unknown;
    };
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.projectId).toBe(projectId);
    expect(body.data.title).toBe("My Contribution");
    expect(body.data.contributorId).toBe(TEST_USER_ID);
    expect(body.data.status).toBe("submitted");
    expect(body.meta).toBeDefined();
  });

  it("POST /api/v1/hub/contributions/:id/merge returns 409 when contribution not accepted", async () => {
    const projectId = `proj-${randomUUID()}`;
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/hub/contributions",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: { projectId, title: "Not Accepted", description: "" },
    });
    expect(createRes.statusCode).toBe(201);
    const createBody = createRes.json() as { data: { id: string } };
    const contributionId = createBody.data.id;

    const mergeRes = await app.inject({
      method: "POST",
      url: `/api/v1/hub/contributions/${contributionId}/merge`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(mergeRes.statusCode).toBe(409);
    const errBody = mergeRes.json() as { error: { code: string; message: string } };
    expect(errBody.error.code).toBe("CONFLICT");
    expect(errBody.error.message).toContain("cannot be merged");
  });

  it("POST /api/v1/hub/contributions/:id/merge succeeds when contribution is accepted", async () => {
    const projectId = `proj-${randomUUID()}`;
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/hub/contributions",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: { projectId, title: "Accepted Contribution", description: "" },
    });
    expect(createRes.statusCode).toBe(201);
    const createBody = createRes.json() as { data: { id: string } };
    const contributionId = createBody.data.id;

    const { createContributionId } = await import("@syntropy/hub-package");
    const contribution = await contributionRepository.getById(createContributionId(contributionId));
    expect(contribution).not.toBeNull();
    const inReview = contribution!.assignReviewer(TEST_USER_ID);
    const accepted = inReview.accept(TEST_USER_ID);
    await contributionRepository.save(accepted);

    const mergeRes = await app.inject({
      method: "POST",
      url: `/api/v1/hub/contributions/${contributionId}/merge`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(mergeRes.statusCode).toBe(200);
    const mergeBody = mergeRes.json() as {
      data: { contributionId: string; dipArtifactId: string; closedIssueIds: string[] };
      meta: unknown;
    };
    expect(mergeBody.data).toBeDefined();
    expect(mergeBody.data.contributionId).toBe(contributionId);
    expect(mergeBody.data.dipArtifactId).toBeDefined();
    expect(Array.isArray(mergeBody.data.closedIssueIds)).toBe(true);
    expect(mergeBody.meta).toBeDefined();
  });
});
