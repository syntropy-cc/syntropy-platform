/**
 * Integration tests for Labs scientific context Postgres repositories (COMP-022.4).
 * Run with LABS_INTEGRATION=true. Requires Docker for Testcontainers.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { LabsDbClient } from "../../src/infrastructure/labs-db-client.js";
import { PostgresSubjectAreaRepository } from "../../src/infrastructure/repositories/postgres-subject-area-repository.js";
import { PostgresResearchMethodologyRepository } from "../../src/infrastructure/repositories/postgres-research-methodology-repository.js";
import { PostgresHypothesisRecordRepository } from "../../src/infrastructure/repositories/postgres-hypothesis-record-repository.js";
import {
  SubjectArea,
  createSubjectAreaId,
} from "../../src/domain/scientific-context/subject-area.js";
import { SUBJECT_AREA_SEED } from "../../src/infrastructure/seeds/subject-areas.js";
import { METHODOLOGY_SEED } from "../../src/infrastructure/seeds/methodologies.js";
import {
  HypothesisRecord,
  createHypothesisId,
} from "../../src/domain/scientific-context/hypothesis-record.js";
import { ResearchMethodology } from "../../src/domain/scientific-context/research-methodology.js";

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigrations(pool: Pool, migrationsDir: string): Promise<void> {
  const sql = readFileSync(
    join(migrationsDir, "20260322000000_labs_scientific_context.sql"),
    "utf8"
  );
  await pool.query(sql);
}

function createDbClient(pool: Pool): LabsDbClient {
  return {
    execute: (sql: string, params: unknown[]) =>
      pool.query(sql, params).then(() => {}),
    query: (sql: string, params: unknown[]) =>
      pool.query(sql, params).then((r) => r.rows as Record<string, unknown>[]),
  };
}

const describeIntegration =
  process.env.CI !== "true" && process.env.LABS_INTEGRATION === "true"
    ? describe
    : describe.skip;

describeIntegration(
  "Postgres scientific context repositories (COMP-022.4)",
  () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let subjectAreaRepo: PostgresSubjectAreaRepository;
    let methodologyRepo: PostgresResearchMethodologyRepository;
    let hypothesisRepo: PostgresHypothesisRecordRepository;

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
      subjectAreaRepo = new PostgresSubjectAreaRepository(client);
      methodologyRepo = new PostgresResearchMethodologyRepository(client);
      hypothesisRepo = new PostgresHypothesisRecordRepository(client);
    });

    afterAll(async () => {
      await pool?.end();
      await container?.stop();
    });

    it("subject area: save and listAll returns persisted areas", async () => {
      const area = new SubjectArea(SUBJECT_AREA_SEED[0]!);
      await subjectAreaRepo.save(area);
      const all = await subjectAreaRepo.listAll();
      expect(all.length).toBe(1);
      expect(all[0]!.name).toBe(area.name);
      expect(all[0]!.depthLevel).toBe(area.depthLevel);
    });

    it("subject area: getTree returns hierarchical tree", async () => {
      for (const params of SUBJECT_AREA_SEED.slice(1, 6)) {
        await subjectAreaRepo.save(new SubjectArea(params));
      }
      const tree = await subjectAreaRepo.getTree();
      expect(tree.length).toBeGreaterThanOrEqual(1);
      const withChildren = tree.filter((n) => n.children.length > 0);
      expect(withChildren.length).toBeGreaterThanOrEqual(1);
    });

    it("subject area: findById returns area when exists", async () => {
      const id = createSubjectAreaId(SUBJECT_AREA_SEED[0]!.id as string);
      const found = await subjectAreaRepo.findById(id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(id);
    });

    it("methodology: save and listAll returns persisted methodologies", async () => {
      for (const params of METHODOLOGY_SEED) {
        await methodologyRepo.save(new ResearchMethodology(params));
      }
      const all = await methodologyRepo.listAll();
      expect(all.length).toBe(3);
      const types = all.map((m) => m.type);
      expect(types).toContain("quantitative");
      expect(types).toContain("qualitative");
      expect(types).toContain("mixed");
    });

    it("hypothesis: save and findById return record with status proposed", async () => {
      const record = new HypothesisRecord({
        hypothesisId: createHypothesisId(
          "d4000001-0000-4000-8000-000000000001"
        ),
        projectId: "proj-1",
        statement: "Increased X leads to increased Y.",
        status: "proposed",
        createdBy: "user-1",
      });
      await hypothesisRepo.save(record);
      const found = await hypothesisRepo.findById(record.hypothesisId);
      expect(found).not.toBeNull();
      expect(found!.statement).toBe(record.statement);
      expect(found!.status).toBe("proposed");
      expect(found!.projectId).toBe("proj-1");
    });
  }
);
