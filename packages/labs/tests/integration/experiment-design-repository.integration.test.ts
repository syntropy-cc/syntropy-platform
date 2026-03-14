/**
 * Integration tests for ExperimentDesign and ExperimentResult repositories (COMP-024.4).
 * Uses real DB via Testcontainers. Run with LABS_INTEGRATION=true.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createArticleId,
  createExperimentId,
  createExperimentResultId,
} from "@syntropy/types";
import { createHypothesisId } from "../../src/domain/scientific-context/hypothesis-record.js";
import { createSubjectAreaId } from "../../src/domain/scientific-context/subject-area.js";
import { createResearchMethodologyId } from "../../src/domain/scientific-context/research-methodology.js";
import type { LabsDbClient } from "../../src/infrastructure/labs-db-client.js";
import { PostgresExperimentDesignRepository } from "../../src/infrastructure/repositories/postgres-experiment-design-repository.js";
import { PostgresExperimentResultRepository } from "../../src/infrastructure/repositories/postgres-experiment-result-repository.js";
import { ExperimentDesign } from "../../src/domain/experiment-design/experiment-design.js";
import { ExperimentResult } from "../../src/domain/experiment-design/experiment-result.js";
import { AnonymizationPolicyEnforcer } from "../../src/domain/experiment-design/services/anonymization-policy-enforcer.js";
import { createHypothesisId } from "../../src/domain/scientific-context/hypothesis-record.js";

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigrations(pool: Pool, migrationsDir: string): Promise<void> {
  const migrations = [
    "20260322000000_labs_scientific_context.sql",
    "20260323000000_labs_article_editor.sql",
    "20260324000000_labs_experiment_design.sql",
  ];
  for (const name of migrations) {
    const sql = readFileSync(join(migrationsDir, name), "utf8");
    await pool.query(sql);
  }
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
  process.env.LABS_INTEGRATION === "true" ? describe : describe.skip;

describeIntegration(
  "Experiment design repository (COMP-024.4)",
  () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let designRepo: PostgresExperimentDesignRepository;
    let resultRepo: PostgresExperimentResultRepository;

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
      designRepo = new PostgresExperimentDesignRepository(client);
      resultRepo = new PostgresExperimentResultRepository(client);
    });

    afterAll(async () => {
      await pool?.end();
      await container?.stop();
    });

    it("persists and loads ExperimentDesign", async () => {
      const articleId = createArticleId(
        "a4000001-0000-4000-8000-000000000001"
      );
      const subjectAreaId = createSubjectAreaId(
        "51000001-0000-4000-8000-000000000001"
      );
      const methodologyId = createResearchMethodologyId(
        "71000001-0000-4000-8000-000000000001"
      );
      await pool.query(
        `INSERT INTO labs.subject_areas (id, parent_id, name, code, description, depth_level) VALUES ($1, NULL, 'Test', 'T', NULL, 1)`,
        [subjectAreaId]
      );
      await pool.query(
        `INSERT INTO labs.research_methodologies (id, name, type, description) VALUES ($1, 'Quantitative', 'quantitative', NULL)`,
        [methodologyId]
      );
      await pool.query(
        `INSERT INTO labs.scientific_articles (id, title, subject_area_id, author_id, status, current_content, created_at, updated_at) VALUES ($1, 'Exp Article', $2, 'author-1', 'draft', '', now(), now())`,
        [articleId, subjectAreaId]
      );

      const experimentId = createExperimentId(
        "e4000001-0000-4000-8000-000000000001"
      );
      const design = new ExperimentDesign({
        experimentId,
        articleId,
        researcherId: "researcher-1",
        title: "Integration Test Experiment",
        methodologyId: methodologyId as string,
        hypothesisRecordId: null,
        protocol: { steps: ["measure", "analyze"] },
        variables: { x: 1 },
        ethicalApprovalStatus: "approved",
        status: "designing",
      });
      await designRepo.save(design);

      const loaded = await designRepo.findById(experimentId);
      expect(loaded).not.toBeNull();
      expect(loaded!.title).toBe("Integration Test Experiment");
      expect(loaded!.status).toBe("designing");
      expect(loaded!.protocol).toEqual({ steps: ["measure", "analyze"] });
    });

    it("persists and loads ExperimentResult", async () => {
      const articleId = createArticleId(
        "a4000002-0000-4000-8000-000000000002"
      );
      const subjectAreaId = createSubjectAreaId(
        "51000002-0000-4000-8000-000000000002"
      );
      const methodologyId = createResearchMethodologyId(
        "71000002-0000-4000-8000-000000000002"
      );
      await pool.query(
        `INSERT INTO labs.subject_areas (id, parent_id, name, code, description, depth_level) VALUES ($1, NULL, 'Test2', 'T2', NULL, 1)`,
        [subjectAreaId]
      );
      await pool.query(
        `INSERT INTO labs.research_methodologies (id, name, type, description) VALUES ($1, 'Qualitative', 'qualitative', NULL)`,
        [methodologyId]
      );
      await pool.query(
        `INSERT INTO labs.scientific_articles (id, title, subject_area_id, author_id, status, current_content, created_at, updated_at) VALUES ($1, 'Exp Article 2', $2, 'author-2', 'draft', '', now(), now())`,
        [articleId, subjectAreaId]
      );

      const experimentId = createExperimentId(
        "e4000002-0000-4000-8000-000000000002"
      );
      const design = new ExperimentDesign({
        experimentId,
        articleId,
        researcherId: "researcher-2",
        title: "Experiment for Result Test",
        methodologyId: methodologyId as string,
        hypothesisRecordId: null,
        protocol: {},
        variables: {},
        ethicalApprovalStatus: "pending",
        status: "registered",
      });
      await designRepo.save(design);

      const resultId = createExperimentResultId(
        "b4000001-0000-4000-8000-000000000001"
      );
      const result = new ExperimentResult({
        id: resultId,
        experimentId,
        rawDataLocation: "s3://bucket/exp-e4000002/result.json",
        statisticalSummary: { mean: 0.5, n: 50 },
        pValue: 0.01,
        collectedAt: new Date("2026-01-20T12:00:00Z"),
      });
      await resultRepo.save(result);

      const loadedResult = await resultRepo.findById(resultId);
      expect(loadedResult).not.toBeNull();
      expect(loadedResult!.rawDataLocation).toBe(
        "s3://bucket/exp-e4000002/result.json"
      );
      expect(loadedResult!.statisticalSummary).toEqual({ mean: 0.5, n: 50 });
      expect(loadedResult!.pValue).toBe(0.01);

      const byExperiment = await resultRepo.findByExperimentId(experimentId);
      expect(byExperiment.length).toBe(1);
      expect(byExperiment[0]!.id).toBe(resultId);
    });

    it("PII redaction: result with PII is stored redacted (COMP-024.6)", async () => {
      const articleId = createArticleId(
        "a4000003-0000-4000-8000-000000000003"
      );
      const subjectAreaId = createSubjectAreaId(
        "51000003-0000-4000-8000-000000000003"
      );
      const methodologyId = createResearchMethodologyId(
        "71000003-0000-4000-8000-000000000003"
      );
      await pool.query(
        `INSERT INTO labs.subject_areas (id, parent_id, name, code, description, depth_level) VALUES ($1, NULL, 'Test3', 'T3', NULL, 1)`,
        [subjectAreaId]
      );
      await pool.query(
        `INSERT INTO labs.research_methodologies (id, name, type, description) VALUES ($1, 'Mixed', 'mixed', NULL)`,
        [methodologyId]
      );
      await pool.query(
        `INSERT INTO labs.scientific_articles (id, title, subject_area_id, author_id, status, current_content, created_at, updated_at) VALUES ($1, 'Exp Article 3', $2, 'author-3', 'draft', '', now(), now())`,
        [articleId, subjectAreaId]
      );

      const experimentId = createExperimentId(
        "e4000003-0000-4000-8000-000000000003"
      );
      const design = new ExperimentDesign({
        experimentId,
        articleId,
        researcherId: "researcher-3",
        title: "Experiment PII Test",
        methodologyId: methodologyId as string,
        hypothesisRecordId: null,
        protocol: {},
        variables: {},
        ethicalApprovalStatus: "approved",
        status: "registered",
      });
      await designRepo.save(design);

      const resultId = createExperimentResultId(
        "b4000002-0000-4000-8000-000000000002"
      );
      const rawResult = new ExperimentResult({
        id: resultId,
        experimentId,
        rawDataLocation: "s3://bucket/pii-result.json",
        statisticalSummary: {
          mean: 0.5,
          n: 30,
          email: "participant@pii.com",
          participantId: "real-user-456",
        },
        pValue: 0.02,
        collectedAt: new Date("2026-01-25T14:00:00Z"),
      });
      const enforcer = new AnonymizationPolicyEnforcer();
      const redacted = enforcer.enforce(rawResult, {
        piiKeys: ["email", "participantId"],
      });
      await resultRepo.save(redacted);

      const loaded = await resultRepo.findById(resultId);
      expect(loaded).not.toBeNull();
      expect(loaded!.statisticalSummary.mean).toBe(0.5);
      expect(loaded!.statisticalSummary.n).toBe(30);
      expect(loaded!.statisticalSummary.email).toBe("[REDACTED]");
      expect(loaded!.statisticalSummary.participantId).toBe("[REDACTED]");
    });

    it("hypothesis link: experiment design linked to hypothesis (COMP-024.6)", async () => {
      const articleId = createArticleId(
        "a4000004-0000-4000-8000-000000000004"
      );
      const subjectAreaId = createSubjectAreaId(
        "51000004-0000-4000-8000-000000000004"
      );
      const methodologyId = createResearchMethodologyId(
        "71000004-0000-4000-8000-000000000004"
      );
      const hypothesisId = createHypothesisId(
        "91000001-0000-4000-8000-000000000004"
      );
      const experimentId = createExperimentId(
        "e4000004-0000-4000-8000-000000000004"
      );
      await pool.query(
        `INSERT INTO labs.subject_areas (id, parent_id, name, code, description, depth_level) VALUES ($1, NULL, 'Test4', 'T4', NULL, 1)`,
        [subjectAreaId]
      );
      await pool.query(
        `INSERT INTO labs.research_methodologies (id, name, type, description) VALUES ($1, 'Quant', 'quantitative', NULL)`,
        [methodologyId]
      );
      await pool.query(
        `INSERT INTO labs.scientific_articles (id, title, subject_area_id, author_id, status, current_content, created_at, updated_at) VALUES ($1, 'Exp Article 4', $2, 'author-4', 'draft', '', now(), now())`,
        [articleId, subjectAreaId]
      );
      await pool.query(
        `INSERT INTO labs.hypothesis_records (id, project_id, statement, status, experiment_id, created_by, created_at, updated_at) VALUES ($1, 'proj-1', 'H1: effect exists', 'proposed', $2, 'author-4', now(), now())`,
        [hypothesisId, experimentId]
      );

      const design = new ExperimentDesign({
        experimentId,
        articleId,
        researcherId: "researcher-4",
        title: "Experiment With Hypothesis",
        methodologyId: methodologyId as string,
        hypothesisRecordId: hypothesisId,
        protocol: {},
        variables: {},
        ethicalApprovalStatus: "approved",
        status: "designing",
      });
      await designRepo.save(design);

      const loaded = await designRepo.findById(experimentId);
      expect(loaded).not.toBeNull();
      expect(loaded!.hypothesisRecordId).toEqual(hypothesisId);
    });
  }
);
