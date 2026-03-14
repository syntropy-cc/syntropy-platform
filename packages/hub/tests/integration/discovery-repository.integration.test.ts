/**
 * Integration tests for PostgresDiscoveryRepository (COMP-021.4).
 * Run with HUB_INTEGRATION=true. Requires Docker for Testcontainers.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { HubCollaborationDbClient } from "../../src/infrastructure/hub-collaboration-db-client.js";
import { PostgresDiscoveryRepository } from "../../src/infrastructure/repositories/postgres-discovery-repository.js";
import { createEmptyDocument } from "../../src/domain/public-square/discovery-document.js";
import { withProminenceScore } from "../../src/domain/public-square/discovery-document.js";

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigrations(pool: Pool, migrationsDir: string): Promise<void> {
  const hubCollaboration = readFileSync(
    join(migrationsDir, "20260319000000_hub_collaboration.sql"),
    "utf8"
  );
  await pool.query(hubCollaboration);
  const discovery = readFileSync(
    join(migrationsDir, "20260321000000_hub_discovery_documents.sql"),
    "utf8"
  );
  await pool.query(discovery);
}

function createDbClient(pool: Pool): HubCollaborationDbClient {
  return {
    execute: (sql: string, params: unknown[]) =>
      pool.query(sql, params).then(() => {}),
    query: (sql: string, params: unknown[]) =>
      pool.query(sql, params).then((r) => r.rows as Record<string, unknown>[]),
  };
}

const describeIntegration =
  process.env.CI !== "true" && process.env.HUB_INTEGRATION === "true"
    ? describe
    : describe.skip;

describeIntegration("PostgresDiscoveryRepository (COMP-021.4)", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let repo: PostgresDiscoveryRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    pool = new Pool({
      host: container.getHost(),
      port: container.getPort(),
      user: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
    });
    await runMigrations(pool, getMigrationsDir());
    const client = createDbClient(pool);
    repo = new PostgresDiscoveryRepository(client);
  });

  afterAll(async () => {
    await pool?.end();
    await container?.stop();
  });

  it("upsert and findById return document", async () => {
    const doc = withProminenceScore(
      createEmptyDocument("inst-1", "Acme Lab"),
      42.5
    );
    await repo.upsert(doc);
    const loaded = await repo.findById("inst-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.institutionId).toBe("inst-1");
    expect(loaded!.name).toBe("Acme Lab");
    expect(loaded!.prominenceScore).toBe(42.5);
    expect(loaded!.projectCount).toBe(0);
    expect(loaded!.contributorCount).toBe(0);
    expect(loaded!.recentArtifacts).toEqual([]);
  });

  it("findTop returns documents ordered by prominence_score DESC", async () => {
    await repo.upsert(
      withProminenceScore(createEmptyDocument("low", "Low"), 10)
    );
    await repo.upsert(
      withProminenceScore(createEmptyDocument("high", "High"), 90)
    );
    await repo.upsert(
      withProminenceScore(createEmptyDocument("mid", "Mid"), 50)
    );
    const top = await repo.findTop(10);
    expect(top.length).toBe(3);
    expect(top[0]!.institutionId).toBe("high");
    expect(top[1]!.institutionId).toBe("mid");
    expect(top[2]!.institutionId).toBe("low");
  });

  it("findTop(limit) respects limit", async () => {
    const top = await repo.findTop(2);
    expect(top.length).toBe(2);
  });

  it("upsert updates existing document", async () => {
    await repo.upsert(
      withProminenceScore(createEmptyDocument("inst-update", "Old"), 1)
    );
    await repo.upsert(
      withProminenceScore(createEmptyDocument("inst-update", "New"), 99)
    );
    const loaded = await repo.findById("inst-update");
    expect(loaded!.name).toBe("New");
    expect(loaded!.prominenceScore).toBe(99);
  });

  it("findById returns null for unknown institution", async () => {
    const loaded = await repo.findById("nonexistent");
    expect(loaded).toBeNull();
  });
});
