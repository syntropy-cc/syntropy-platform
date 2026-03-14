/**
 * Integration tests for Creator Workflow and Approval Record repositories (COMP-017.4).
 * Uses Testcontainers Postgres and learn migrations. Set LEARN_INTEGRATION=true to run.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import {
  createApprovalRecordId,
  createCareerId,
  createCreatorWorkflowId,
  createTrackId,
} from "@syntropy/types";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { CreatorWorkflow } from "../../src/domain/creator-tools/creator-workflow.js";
import { ApprovalRecord } from "../../src/domain/creator-tools/approval-record.js";
import { PostgresCreatorWorkflowRepository } from "../../src/infrastructure/repositories/postgres-creator-workflow-repository.js";
import { PostgresApprovalRecordRepository } from "../../src/infrastructure/repositories/postgres-approval-record-repository.js";
import { PostgresCareerRepository } from "../../src/infrastructure/repositories/postgres-career-repository.js";
import { PostgresTrackRepository } from "../../src/infrastructure/repositories/postgres-track-repository.js";
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
  "creator workflow and approval record repositories integration (COMP-017.4)",
  () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let workflowRepo: PostgresCreatorWorkflowRepository;
    let approvalRepo: PostgresApprovalRecordRepository;
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
    }, 60_000);

    afterAll(async () => {
      await pool?.end();
      await container?.stop();
    });

    it("saves and finds creator workflow by id", async () => {
      const careerId = createCareerId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
      const trackId = createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
      const career = Career.create({
        careerId,
        title: "Test Career",
        trackIds: [trackId],
      });
      const track = Track.create({
        id: trackId,
        careerId,
        title: "Test Track",
        courseIds: [],
        prerequisites: [],
      });
      await careerRepo.save(career);
      await trackRepo.save(track);

      const workflowId = createCreatorWorkflowId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");
      const startedAt = new Date("2026-01-01T00:00:00Z");
      const workflow = CreatorWorkflow.create({
        id: workflowId,
        trackId,
        creatorId: "creator-1",
        startedAt,
      });

      await workflowRepo.save(workflow);
      const found = await workflowRepo.findById(workflowId);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(workflowId);
      expect(found!.trackId).toBe(trackId);
      expect(found!.creatorId).toBe("creator-1");
      expect(found!.currentPhase).toBe("ideation");
      expect(found!.phasesCompleted).toEqual([]);
    });

    it("saves workflow after transition and finds updated state", async () => {
      const careerId = createCareerId("d4e5f6a7-b8c9-4d0e-8f2a-3b4c5d6e7f8a");
      const trackId = createTrackId("e5f6a7b8-c9d0-4e1f-8a3b-4c5d6e7f8a9b");
      const career = Career.create({
        careerId,
        title: "Career 2",
        trackIds: [trackId],
      });
      const track = Track.create({
        id: trackId,
        careerId,
        title: "Track 2",
        courseIds: [],
        prerequisites: [],
      });
      await careerRepo.save(career);
      await trackRepo.save(track);

      const workflowId = createCreatorWorkflowId("f6a7b8c9-d0e1-4f2a-8b4c-5d6e7f8a9b0c");
      const workflow = CreatorWorkflow.create({
        id: workflowId,
        trackId,
        creatorId: "creator-2",
        startedAt: new Date("2026-01-02T00:00:00Z"),
      });
      workflow.transition("drafting");

      await workflowRepo.save(workflow);
      const found = await workflowRepo.findById(workflowId);

      expect(found).not.toBeNull();
      expect(found!.currentPhase).toBe("drafting");
      expect(found!.phasesCompleted).toEqual(["ideation"]);
    });

    it("saves approval record", async () => {
      const careerId = createCareerId("a7b8c9d0-e1f2-4a1b-8c5d-6e7f8a9b0c1d");
      const trackId = createTrackId("b8c9d0e1-f2a3-4b2c-8d6e-7f8a9b0c1d2e");
      const career = Career.create({
        careerId,
        title: "Career 3",
        trackIds: [trackId],
      });
      const track = Track.create({
        id: trackId,
        careerId,
        title: "Track 3",
        courseIds: [],
        prerequisites: [],
      });
      await careerRepo.save(career);
      await trackRepo.save(track);

      const workflowId = createCreatorWorkflowId("c9d0e1f2-a3b4-4c3d-8e7f-8a9b0c1d2e3f");
      const workflow = CreatorWorkflow.create({
        id: workflowId,
        trackId,
        creatorId: "creator-3",
        startedAt: new Date("2026-01-03T00:00:00Z"),
      });
      await workflowRepo.save(workflow);

      const record = ApprovalRecord.create({
        id: createApprovalRecordId("d0e1f2a3-b4c5-4d4e-8f9a-0b1c2d3e4f5a"),
        workflowId,
        phase: "ideation",
        reviewerId: "reviewer-1",
        decision: "approve",
        notes: "Looks good",
        decidedAt: new Date("2026-01-03T12:00:00Z"),
      });

      await approvalRepo.save(record);

      const foundWorkflow = await workflowRepo.findById(workflowId);
      expect(foundWorkflow).not.toBeNull();
      expect(foundWorkflow!.currentPhase).toBe("ideation");
    });
  }
);
