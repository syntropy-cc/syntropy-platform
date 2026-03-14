/**
 * Integration tests for Hub institution orchestration repositories (COMP-020.5).
 * Run with HUB_INTEGRATION=true. Requires Docker for Testcontainers.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  InstitutionCreationWorkflow,
  InstitutionCreationPhase,
} from "../../src/domain/institution-orchestration/institution-creation-workflow.js";
import type { HubCollaborationDbClient } from "../../src/infrastructure/hub-collaboration-db-client.js";
import { PostgresInstitutionWorkflowRepository } from "../../src/infrastructure/repositories/postgres-institution-workflow-repository.js";
import { PostgresContractTemplateRepository } from "../../src/infrastructure/repositories/postgres-contract-template-repository.js";

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
  const hubInstitutionOrchestration = readFileSync(
    join(migrationsDir, "20260320000000_hub_institution_orchestration.sql"),
    "utf8"
  );
  await pool.query(hubInstitutionOrchestration);
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

describeIntegration(
  "Hub institution orchestration repositories (COMP-020.5)",
  () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let client: HubCollaborationDbClient;
    let workflowRepo: PostgresInstitutionWorkflowRepository;
    let templateRepo: PostgresContractTemplateRepository;

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
      client = createDbClient(pool);
      workflowRepo = new PostgresInstitutionWorkflowRepository(client);
      templateRepo = new PostgresContractTemplateRepository(client);
    });

    afterAll(async () => {
      await pool?.end();
      await container?.stop();
    });

    it("saves and retrieves workflow by id", async () => {
      const workflowId = "wf-" + randomUUID().slice(0, 8);
      const templateId = "tpl-open";
      const workflow = InstitutionCreationWorkflow.fromPersistence({
        id: workflowId,
        templateId,
        currentPhase: InstitutionCreationPhase.FoundersConfirmed,
        configuredParameters: { founderIds: ["u1", "u2"] },
      });

      await workflowRepo.save(workflow);
      const loaded = await workflowRepo.findById(workflowId);

      expect(loaded).not.toBeNull();
      expect(loaded!.id).toBe(workflowId);
      expect(loaded!.templateId).toBe(templateId);
      expect(loaded!.currentPhase).toBe(InstitutionCreationPhase.FoundersConfirmed);
      expect(loaded!.configuredParameters).toEqual({ founderIds: ["u1", "u2"] });
      expect(loaded!.dipInstitutionId).toBeNull();
    });

    it("findById returns null for unknown workflow", async () => {
      const loaded = await workflowRepo.findById("wf-nonexistent");
      expect(loaded).toBeNull();
    });

    it("save updates workflow to institution_created", async () => {
      const workflowId = "wf-" + randomUUID().slice(0, 8);
      const templateId = "tpl-research";
      let workflow = InstitutionCreationWorkflow.fromPersistence({
        id: workflowId,
        templateId,
        currentPhase: InstitutionCreationPhase.FoundersConfirmed,
      });
      await workflowRepo.save(workflow);

      const afterDeploy = workflow.proceed({ contractDeployed: true });
      const completed = afterDeploy.proceed({ dipInstitutionId: "inst-xyz" });
      await workflowRepo.save(completed);

      const loaded = await workflowRepo.findById(workflowId);
      expect(loaded).not.toBeNull();
      expect(loaded!.currentPhase).toBe(InstitutionCreationPhase.InstitutionCreated);
      expect(loaded!.dipInstitutionId).toBe("inst-xyz");
    });

    it("getById returns null when contract_templates table is empty", async () => {
      const t = await templateRepo.getById("any-id");
      expect(t).toBeNull();
    });

    it("list returns empty when no templates", async () => {
      const list = await templateRepo.list();
      expect(list).toEqual([]);
    });

    it("getById and list return template after insert", async () => {
      const templateId = "tpl-integration-" + randomUUID().slice(0, 8);
      await pool.query(
        `INSERT INTO hub.contract_templates (id, name, dsl, type) VALUES ($1, $2, $3, $4)`,
        [templateId, "Test Template", "governance {}", "open_source_project"]
      );

      const t = await templateRepo.getById(templateId);
      expect(t).not.toBeNull();
      expect(t!.templateId).toBe(templateId);
      expect(t!.name).toBe("Test Template");
      expect(t!.dsl).toBe("governance {}");

      const list = await templateRepo.list();
      expect(list.some((x) => x.templateId === templateId)).toBe(true);
    });
  }
);
