/**
 * Integration tests for IDE repositories (COMP-030.7).
 * Uses real Postgres via Testcontainers. Run with IDE_INTEGRATION=true.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { IDESession } from "../../src/domain/ide-session.js";
import { IDESessionStatus } from "../../src/domain/ide-session-status.js";
import { WorkspaceSnapshot } from "../../src/domain/workspace-snapshot.js";
import { PostgresIDESessionRepository } from "../../src/infrastructure/repositories/postgres-ide-session-repository.js";
import { PostgresWorkspaceSnapshotRepository } from "../../src/infrastructure/repositories/postgres-workspace-snapshot-repository.js";

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigrations(pool: Pool, migrationsDir: string): Promise<void> {
  const sql = readFileSync(
    join(migrationsDir, "20260331000000_ide_domain.sql"),
    "utf8"
  );
  await pool.query(sql);
}

const describeIntegration =
  process.env.IDE_INTEGRATION === "true" ? describe : describe.skip;

describeIntegration("IDE repositories (COMP-030.7)", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let sessionRepo: PostgresIDESessionRepository;
  let snapshotRepo: PostgresWorkspaceSnapshotRepository;

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
    sessionRepo = new PostgresIDESessionRepository(pool);
    snapshotRepo = new PostgresWorkspaceSnapshotRepository(pool);
  }, 60_000);

  afterAll(async () => {
    await pool?.end();
    await container?.stop();
  });

  it("saves and finds IDE session by id", async () => {
    const session = IDESession.create({
      sessionId: "sess-int-1",
      userId: "user-a",
      projectId: "proj-1",
    });
    await sessionRepo.save(session);

    const found = await sessionRepo.findById("sess-int-1");
    expect(found).not.toBeNull();
    expect(found!.sessionId).toBe("sess-int-1");
    expect(found!.userId).toBe("user-a");
    expect(found!.projectId).toBe("proj-1");
    expect(found!.status).toBe(IDESessionStatus.Pending);
    expect(found!.containerId).toBeNull();
  });

  it("saves updated session with container and status", async () => {
    let session = IDESession.create({
      sessionId: "sess-int-2",
      userId: "user-b",
    });
    await sessionRepo.save(session);

    const updated = session.withContainerStarted("cont-123");
    await sessionRepo.save(updated);

    const found = await sessionRepo.findById("sess-int-2");
    expect(found).not.toBeNull();
    expect(found!.status).toBe(IDESessionStatus.Active);
    expect(found!.containerId).toBe("cont-123");
  });

  it("saves and retrieves workspace snapshot by session id", async () => {
    const session = IDESession.create({
      sessionId: "sess-int-3",
      userId: "user-c",
    });
    await sessionRepo.save(session);

    const files = [
      { path: "src/index.ts", content: "export {};" },
      { path: "README.md", content: "# Test" },
    ];
    const snapshot = WorkspaceSnapshot.create("sess-int-3", files, {
      snapshotId: "ws-sess-int-3-v1",
    });
    await snapshotRepo.save(snapshot);

    const latest = await snapshotRepo.getLatestBySessionId("sess-int-3");
    expect(latest).not.toBeNull();
    expect(latest!.sessionId).toBe("sess-int-3");
    expect(latest!.version).toBe(1);
    expect(latest!.files).toHaveLength(2);
    expect(latest!.files[0].path).toBe("src/index.ts");
    expect(latest!.files[0].content).toBe("export {};");
  });

  it("getLatestBySessionId returns null when no snapshot exists", async () => {
    const latest = await snapshotRepo.getLatestBySessionId("nonexistent-sess");
    expect(latest).toBeNull();
  });

  it("findById returns null when session does not exist", async () => {
    const found = await sessionRepo.findById("nonexistent-sess");
    expect(found).toBeNull();
  });
});
