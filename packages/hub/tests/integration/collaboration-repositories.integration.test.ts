/**
 * Integration tests for Hub collaboration repositories (COMP-019.7).
 * Run with HUB_INTEGRATION=true. Requires Docker for Testcontainers.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Issue, IssueStatus } from "../../src/domain/collaboration/issue.js";
import { createIssueId } from "../../src/domain/collaboration/value-objects/issue-id.js";
import { Contribution, ContributionStatus } from "../../src/domain/collaboration/contribution.js";
import { createContributionId } from "../../src/domain/collaboration/value-objects/contribution-id.js";
import {
  ContributionSandbox,
  ContributionSandboxStatus,
} from "../../src/domain/collaboration/contribution-sandbox.js";
import type { HubCollaborationDbClient } from "../../src/infrastructure/hub-collaboration-db-client.js";
import { PostgresIssueRepository } from "../../src/infrastructure/repositories/postgres-issue-repository.js";
import { PostgresContributionRepository } from "../../src/infrastructure/repositories/postgres-contribution-repository.js";
import { PostgresContributionSandboxRepository } from "../../src/infrastructure/repositories/postgres-contribution-sandbox-repository.js";

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runHubMigration(pool: Pool, migrationsDir: string): Promise<void> {
  const sql = readFileSync(
    join(migrationsDir, "20260319000000_hub_collaboration.sql"),
    "utf8"
  );
  await pool.query(sql);
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
  "Hub collaboration repositories (COMP-019.7)",
  () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let client: HubCollaborationDbClient;
    let issueRepo: PostgresIssueRepository;
    let contributionRepo: PostgresContributionRepository;
    let sandboxRepo: PostgresContributionSandboxRepository;

    beforeAll(async () => {
      container = await new PostgreSqlContainer().start();
      pool = new Pool({
        host: container.getHost(),
        port: container.getPort(),
        user: container.getUsername(),
        password: container.getPassword(),
        database: container.getDatabase(),
      });
      await runHubMigration(pool, getMigrationsDir());
      client = createDbClient(pool);
      issueRepo = new PostgresIssueRepository(client);
      contributionRepo = new PostgresContributionRepository(client);
      sandboxRepo = new PostgresContributionSandboxRepository(client);
    });

    afterAll(async () => {
      await pool?.end();
      await container?.stop();
    });

    it("saves and retrieves issue by id", async () => {
      const issueId = createIssueId(randomUUID());
      const projectId = "proj-1";
      const { issue } = Issue.open({
        issueId,
        projectId,
        title: "Test issue",
        type: "feature",
      });

      await issueRepo.save(issue);
      const loaded = await issueRepo.getById(issueId);

      expect(loaded).not.toBeNull();
      expect(loaded!.issueId).toBe(issue.issueId);
      expect(loaded!.projectId).toBe(projectId);
      expect(loaded!.title).toBe("Test issue");
      expect(loaded!.status).toBe(IssueStatus.Open);
    });

    it("getByIds returns matching issues", async () => {
      const id1 = createIssueId(randomUUID());
      const id2 = createIssueId(randomUUID());
      const id3 = createIssueId(randomUUID());
      const projectId = "proj-2";
      await issueRepo.save(
        Issue.fromPersistence({
          issueId: id1,
          projectId,
          title: "I1",
          type: "bug",
          status: "open",
        })
      );
      await issueRepo.save(
        Issue.fromPersistence({
          issueId: id2,
          projectId,
          title: "I2",
          type: "task",
          status: "in_progress",
        })
      );
      await issueRepo.save(
        Issue.fromPersistence({
          issueId: id3,
          projectId,
          title: "I3",
          type: "chore",
          status: "closed",
        })
      );

      const loaded = await issueRepo.getByIds([id1 as string, id3 as string]);

      expect(loaded).toHaveLength(2);
      const ids = loaded.map((i) => i.issueId as string).sort();
      expect(ids).toEqual([id1 as string, id3 as string].sort());
    });

    it("saves and retrieves contribution with linked issues", async () => {
      const contribId = createContributionId(randomUUID());
      const issueId = createIssueId(randomUUID());
      const projectId = "proj-3";
      await issueRepo.save(
        Issue.fromPersistence({
          issueId,
          projectId,
          title: "Linked",
          type: "feature",
          status: "open",
        })
      );
      const { contribution } = Contribution.submit({
        id: contribId,
        projectId,
        contributorId: "user-1",
        title: "Contribution",
        description: "Desc",
        content: { key: "value" },
        linkedIssueIds: [issueId as string],
      });

      await contributionRepo.save(contribution);
      const loaded = await contributionRepo.getById(contribId);

      expect(loaded).not.toBeNull();
      expect(loaded!.id).toBe(contribId);
      expect(loaded!.linkedIssueIds).toContain(issueId as string);
      expect(loaded!.title).toBe("Contribution");
      expect(loaded!.status).toBe(ContributionStatus.Submitted);
    });

    it("persists dip_artifact_id on merge", async () => {
      const contribId = createContributionId(randomUUID());
      const projectId = "proj-4";
      const { contribution: submitted } = Contribution.submit({
        id: contribId,
        projectId,
        contributorId: "user-2",
        title: "Merge test",
        description: "",
        content: {},
      });
      const inReview = submitted.assignReviewer("reviewer-1");
      const accepted = inReview.accept("reviewer-1");
      const { contribution: merged } = accepted.merge("dip-artifact-123");

      await contributionRepo.save(merged);
      const loaded = await contributionRepo.getById(contribId);

      expect(loaded).not.toBeNull();
      expect(loaded!.dipArtifactId).toBe("dip-artifact-123");
      expect(loaded!.status).toBe(ContributionStatus.Integrated);
    });

    it("saves and retrieves contribution sandbox", async () => {
      const sandboxId = randomUUID();
      const projectId = "proj-5";
      const sandbox = ContributionSandbox.create({
        id: sandboxId,
        projectId,
        title: "Challenge",
        challengeDescription: "Do the thing",
        config: { maxParticipants: 10 },
      });

      await sandboxRepo.save(sandbox);
      const loaded = await sandboxRepo.getById(sandboxId);

      expect(loaded).not.toBeNull();
      expect(loaded!.id).toBe(sandboxId);
      expect(loaded!.title).toBe("Challenge");
      expect(loaded!.status).toBe(ContributionSandboxStatus.SettingUp);
      expect(loaded!.config.maxParticipants).toBe(10);
    });
  }
);
