/**
 * Full creator workflow integration test (COMP-017.6).
 * Create workflow → generate draft (stub AI) → approve → assert phase transition.
 * Set LEARN_INTEGRATION=true to run. Requires Docker for Testcontainers.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import {
  createCareerId,
  createCreatorWorkflowId,
  createTrackId,
} from "@syntropy/types";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { CreatorWorkflow } from "../../src/domain/creator-tools/creator-workflow.js";
import { ApprovalService } from "../../src/application/approval-service.js";
import { CreatorCopilotService } from "../../src/application/creator-copilot-service.js";
import { StubLearnCopilotAdapter } from "../../src/infrastructure/ai-agents-copilot-adapter.js";
import { PostgresCareerRepository } from "../../src/infrastructure/repositories/postgres-career-repository.js";
import { PostgresTrackRepository } from "../../src/infrastructure/repositories/postgres-track-repository.js";
import { PostgresCreatorWorkflowRepository } from "../../src/infrastructure/repositories/postgres-creator-workflow-repository.js";
import { PostgresApprovalRecordRepository } from "../../src/infrastructure/repositories/postgres-approval-record-repository.js";
import { Career } from "../../src/domain/content-hierarchy/career.js";
import { Track } from "../../src/domain/content-hierarchy/track.js";

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigrations(pool: Pool, migrationsDir: string): Promise<void> {
  const hierarchy = readFileSync(
    join(migrationsDir, "20260315100000_learn_content_hierarchy.sql"),
    "utf8"
  );
  await pool.query(hierarchy);
  const creatorTools = readFileSync(
    join(migrationsDir, "20260317000000_learn_creator_tools.sql"),
    "utf8"
  );
  await pool.query(creatorTools);
}

const describeIntegration =
  process.env.CI !== "true" && process.env.LEARN_INTEGRATION === "true"
    ? describe
    : describe.skip;

describeIntegration(
  "creator workflow full flow integration (COMP-017.6)",
  () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let workflowRepo: PostgresCreatorWorkflowRepository;
    let approvalRepo: PostgresApprovalRecordRepository;
    let approvalService: ApprovalService;
    let copilotService: CreatorCopilotService;
    let careerRepo: PostgresCareerRepository;
    let trackRepo: PostgresTrackRepository;

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
      careerRepo = new PostgresCareerRepository(pool);
      trackRepo = new PostgresTrackRepository(pool);
      workflowRepo = new PostgresCreatorWorkflowRepository(pool);
      approvalRepo = new PostgresApprovalRecordRepository(pool);

      const reviewerApproval = {
        canApprove: async (workflowId: string, reviewerId: string) => {
          const w = await workflowRepo.findById(workflowId as import("@syntropy/types").CreatorWorkflowId);
          return w !== null && w.creatorId === reviewerId;
        },
      };

      approvalService = new ApprovalService({
        workflowLoader: workflowRepo,
        workflowSave: workflowRepo,
        approvalRecordRepository: approvalRepo,
        reviewerApproval,
      });

      copilotService = new CreatorCopilotService({
        learnCopilotAgent: new StubLearnCopilotAdapter({
          content: "AI-generated draft for ideation phase",
          sessionId: "e2e-session-1",
        }),
      });
    }, 60_000);

    afterAll(async () => {
      await pool?.end();
      await container?.stop();
    });

    it("full workflow: create → generate draft → approve → phase advances", async () => {
      const careerId = createCareerId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
      const trackId = createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
      const creatorId = "creator-e2e-1";

      const career = Career.create({
        careerId,
        title: "E2E Career",
        trackIds: [trackId],
      });
      const track = Track.create({
        id: trackId,
        careerId,
        title: "E2E Track",
        courseIds: [],
        prerequisites: [],
      });
      await careerRepo.save(career);
      await trackRepo.save(track);

      const workflowId = createCreatorWorkflowId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");
      const workflow = CreatorWorkflow.create({
        id: workflowId,
        trackId,
        creatorId,
        startedAt: new Date("2026-01-01T00:00:00Z"),
      });
      expect(workflow.currentPhase).toBe("ideation");

      await workflowRepo.save(workflow);

      const draft = await copilotService.generateDraft(workflow, "Outline the project scope");
      expect(draft.workflowId).toBe(workflowId);
      expect(draft.phase).toBe("ideation");
      expect(draft.content).toBe("AI-generated draft for ideation phase");
      expect(draft.agentSessionId).toBe("e2e-session-1");
      expect(draft.ai_generated).toBe(true);

      const result = await approvalService.approve(workflowId, creatorId, "Approved");
      expect(result.record.decision).toBe("approve");
      expect(result.record.phase).toBe("ideation");
      expect(result.event.phase).toBe("drafting");

      const afterApprove = await workflowRepo.findById(workflowId);
      expect(afterApprove).not.toBeNull();
      expect(afterApprove!.currentPhase).toBe("drafting");
      expect(afterApprove!.phasesCompleted).toEqual(["ideation"]);
    });

    it("approve transitions through multiple phases when called in sequence", async () => {
      const careerId = createCareerId("d4e5f6a7-b8c9-4d0e-8f2a-3b4c5d6e7f8a");
      const trackId = createTrackId("e5f6a7b8-c9d0-4e1f-8a3b-4c5d6e7f8a9b");
      const creatorId = "creator-e2e-2";

      const career = Career.create({
        careerId,
        title: "E2E Career 2",
        trackIds: [trackId],
      });
      const track = Track.create({
        id: trackId,
        careerId,
        title: "E2E Track 2",
        courseIds: [],
        prerequisites: [],
      });
      await careerRepo.save(career);
      await trackRepo.save(track);

      const workflowId = createCreatorWorkflowId("f6a7b8c9-d0e1-4f2a-8b4c-5d6e7f8a9b0c");
      const workflow = CreatorWorkflow.create({
        id: workflowId,
        trackId,
        creatorId,
        startedAt: new Date("2026-01-02T00:00:00Z"),
      });
      await workflowRepo.save(workflow);

      await approvalService.approve(workflowId, creatorId);
      let w = await workflowRepo.findById(workflowId);
      expect(w!.currentPhase).toBe("drafting");

      await approvalService.approve(workflowId, creatorId);
      w = await workflowRepo.findById(workflowId);
      expect(w!.currentPhase).toBe("review");

      await approvalService.approve(workflowId, creatorId);
      w = await workflowRepo.findById(workflowId);
      expect(w!.currentPhase).toBe("refinement");

      await approvalService.approve(workflowId, creatorId);
      w = await workflowRepo.findById(workflowId);
      expect(w!.currentPhase).toBe("publication");
      expect(w!.isComplete).toBe(true);
    });
  }
);
