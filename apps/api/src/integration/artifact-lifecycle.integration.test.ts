/**
 * Integration tests for Artifact Registry (COMP-003.8).
 *
 * Uses Testcontainers Postgres, real DIP stack (repository + lifecycle service),
 * and a capturing event publisher. Drives full lifecycle via REST API and asserts
 * status at each step, emitted events, and Nostr anchor storage.
 *
 * Requires Docker for Testcontainers.
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
  PgProjectDbClient,
  PostgresArtifactRepository,
  PostgresContractRepository,
  PostgresProjectRepository,
  createArtifactId,
  createNostrEventId,
  type ArtifactLifecycleEvent,
  type ArtifactLifecycleEventPublisher,
} from "@syntropy/dip";
import { ContractDSLParser, SmartContractEvaluator } from "@syntropy/dip-contracts";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-test-jwt";

/** 64-char hex for NostrEventId (fake anchor). */
const FAKE_NOSTR_EVENT_ID =
  "abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234";

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

function createCapturingEventPublisher(): ArtifactLifecycleEventPublisher & {
  events: ArtifactLifecycleEvent[];
  clear(): void;
} {
  const events: ArtifactLifecycleEvent[] = [];
  return {
    events,
    clear() {
      events.length = 0;
    },
    async publish(event: ArtifactLifecycleEvent): Promise<void> {
      events.push(event);
    },
  };
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

describe("artifact lifecycle integration (COMP-003.8)", () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let app: Awaited<ReturnType<typeof createApp>>;
    let artifactRepository: PostgresArtifactRepository;
    let capturingPublisher: ReturnType<typeof createCapturingEventPublisher>;

    beforeAll(async () => {
      container = await new PostgreSqlContainer().start();
      const connectionUri = container.getConnectionUri();
      pool = new Pool({ connectionString: connectionUri });

      const migrationsDir = getMigrationsDir();
      await runMigrations(pool, migrationsDir);

      const dbClient = new PgArtifactDbClient(pool);
      artifactRepository = new PostgresArtifactRepository(dbClient);
      const contractDbClient = new PgContractDbClient(pool);
      const contractRepository = new PostgresContractRepository(contractDbClient);
      capturingPublisher = createCapturingEventPublisher();
      const lifecycleService = new ArtifactLifecycleService(
        artifactRepository,
        capturingPublisher,
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

    it("full lifecycle draft then submit then publish returns correct status at each step", async () => {
      capturingPublisher.clear();

      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/artifacts",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { content: "test content" },
      });
      expect(createRes.statusCode).toBe(201);
      const createBody = createRes.json() as { data: { id: string; status: string } };
      expect(createBody.data.status).toBe("draft");
      const artifactId = createBody.data.id;
      expect(artifactId).toBeDefined();

      const getDraftRes = await app.inject({
        method: "GET",
        url: `/api/v1/artifacts/${artifactId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(getDraftRes.statusCode).toBe(200);
      const getDraftBody = getDraftRes.json() as { data: { status: string } };
      expect(getDraftBody.data.status).toBe("draft");

      const submitRes = await app.inject({
        method: "PUT",
        url: `/api/v1/artifacts/${artifactId}/submit`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(submitRes.statusCode).toBe(200);
      const submitBody = submitRes.json() as { data: { status: string } };
      expect(submitBody.data.status).toBe("submitted");

      const publishRes = await app.inject({
        method: "PUT",
        url: `/api/v1/artifacts/${artifactId}/publish`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(publishRes.statusCode).toBe(200);
      const publishBody = publishRes.json() as {
        data: { status: string; publishedAt: string | null };
      };
      expect(publishBody.data.status).toBe("published");
      expect(publishBody.data.publishedAt).toBeDefined();
      expect(typeof publishBody.data.publishedAt).toBe("string");
      expect(new Date(publishBody.data.publishedAt as string).getTime()).not.toBeNaN();

      const getPublishedRes = await app.inject({
        method: "GET",
        url: `/api/v1/artifacts/${artifactId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(getPublishedRes.statusCode).toBe(200);
      const getPublishedBody = getPublishedRes.json() as { data: { status: string } };
      expect(getPublishedBody.data.status).toBe("published");
    });

    it("artifact lifecycle emits drafted submitted and published events", async () => {
      capturingPublisher.clear();

      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/artifacts",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {},
      });
      expect(createRes.statusCode).toBe(201);
      const createBody = createRes.json() as { data: { id: string } };
      const artifactId = createBody.data.id;

      await app.inject({
        method: "PUT",
        url: `/api/v1/artifacts/${artifactId}/submit`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      await app.inject({
        method: "PUT",
        url: `/api/v1/artifacts/${artifactId}/publish`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });

      expect(capturingPublisher.events.length).toBe(3);
      expect(capturingPublisher.events[0].type).toBe("dip.artifact.drafted");
      expect(capturingPublisher.events[0].artifactId).toBe(artifactId);
      expect(capturingPublisher.events[1].type).toBe("dip.artifact.submitted");
      expect(capturingPublisher.events[1].artifactId).toBe(artifactId);
      expect(capturingPublisher.events[2].type).toBe("dip.artifact.published");
      expect(capturingPublisher.events[2].artifactId).toBe(artifactId);
    });

    it("nostr anchor stored and returned by API", async () => {
      capturingPublisher.clear();

      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/artifacts",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {},
      });
      expect(createRes.statusCode).toBe(201);
      const createBody = createRes.json() as { data: { id: string } };
      const artifactId = createBody.data.id;

      await app.inject({
        method: "PUT",
        url: `/api/v1/artifacts/${artifactId}/submit`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      await app.inject({
        method: "PUT",
        url: `/api/v1/artifacts/${artifactId}/publish`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });

      const artifact = await artifactRepository.findById(createArtifactId(artifactId));
      expect(artifact).not.toBeNull();
      const updated = artifact!.withNostrEventId(createNostrEventId(FAKE_NOSTR_EVENT_ID));
      await artifactRepository.save(updated);

      const getRes = await app.inject({
        method: "GET",
        url: `/api/v1/artifacts/${artifactId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(getRes.statusCode).toBe(200);
      const getBody = getRes.json() as { data: { nostrEventId: string | null } };
      expect(getBody.data.nostrEventId).toBe(FAKE_NOSTR_EVENT_ID);
    });
  },
);
