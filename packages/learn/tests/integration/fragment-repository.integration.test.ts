/**
 * Integration tests for Fragment and LearnerProgress repositories (COMP-016.5).
 * Uses Testcontainers Postgres and learn migrations.
 * Requires Docker. Set LEARN_INTEGRATION=true to run.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { createCourseId, createFragmentId, createTrackId } from "@syntropy/types";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Career } from "../../src/domain/content-hierarchy/career.js";
import { Course } from "../../src/domain/content-hierarchy/course.js";
import { CourseStatus } from "../../src/domain/content-hierarchy/course-status.js";
import { Track } from "../../src/domain/content-hierarchy/track.js";
import { Fragment } from "../../src/domain/fragment-artifact/fragment.js";
import { FragmentStatus } from "../../src/domain/fragment-artifact/fragment-status.js";
import { LearnerProgressRecord } from "../../src/domain/fragment-artifact/learner-progress-record.js";
import { PostgresCareerRepository } from "../../src/infrastructure/repositories/postgres-career-repository.js";
import { PostgresCourseRepository } from "../../src/infrastructure/repositories/postgres-course-repository.js";
import { PostgresFragmentRepository } from "../../src/infrastructure/repositories/postgres-fragment-repository.js";
import { PostgresLearnerProgressRepository } from "../../src/infrastructure/repositories/postgres-learner-progress-repository.js";
import { PostgresTrackRepository } from "../../src/infrastructure/repositories/postgres-track-repository.js";

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
  const fragmentArtifact = readFileSync(
    join(migrationsDir, "20260315110000_learn_fragment_artifact.sql"),
    "utf8"
  );
  await pool.query(fragmentArtifact);
}

const describeIntegration =
  process.env.CI !== "true" && process.env.LEARN_INTEGRATION === "true"
    ? describe
    : describe.skip;

describeIntegration(
  "fragment and learner progress repositories integration (COMP-016.5)",
  () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let careerRepo: PostgresCareerRepository;
    let trackRepo: PostgresTrackRepository;
    let courseRepo: PostgresCourseRepository;
    let fragmentRepo: PostgresFragmentRepository;
    let progressRepo: PostgresLearnerProgressRepository;

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
      courseRepo = new PostgresCourseRepository(pool);
      fragmentRepo = new PostgresFragmentRepository(pool);
      progressRepo = new PostgresLearnerProgressRepository(pool);
    }, 60_000);

    afterAll(async () => {
      await pool?.end();
      await container?.stop();
    });

    it("saves and finds fragment by id", async () => {
      const careerId = createCareerId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
      const trackId = createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
      const courseId = createCourseId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");
      const fragmentId = createFragmentId("d4e5f6a7-b8c9-4d8e-8f2a-3b4c5d6e7f8a");

      const career = Career.create({
        careerId,
        title: "Test Career",
        trackIds: [trackId],
      });
      const track = Track.create({
        id: trackId,
        careerId,
        title: "Test Track",
        courseIds: [courseId],
      });
      const course = Course.create({
        id: courseId,
        trackId,
        title: "Test Course",
        orderPosition: 0,
        fragmentIds: [fragmentId],
      });
      await careerRepo.save(career);
      await trackRepo.save(track);
      await courseRepo.save(course);

      const fragment = Fragment.create({
        id: fragmentId,
        courseId,
        creatorId: "creator-uuid",
        title: "First Fragment",
        problemContent: "Problem text",
        theoryContent: "Theory text",
        artifactContent: "Artifact code",
      });

      await fragmentRepo.save(fragment);
      const found = await fragmentRepo.findById(fragmentId);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(fragmentId);
      expect(found!.title).toBe("First Fragment");
      expect(found!.status).toBe(FragmentStatus.Draft);
      expect(found!.problemSection.content).toBe("Problem text");
      expect(found!.theorySection.content).toBe("Theory text");
      expect(found!.artifactSection.content).toBe("Artifact code");
    });

    it("updates fragment and preserves published_artifact_id on save", async () => {
      const courseId = createCourseId("e5f6a7b8-c9d0-4e9f-8a3b-4c5d6e7f8a9b");
      const fragmentId = createFragmentId("f6a7b8c9-d0e1-4f0a-8b4c-5d6e7f8a9b0c");
      const careerId = createCareerId("a7b8c9d0-e1f2-4a1b-8c5d-6e7f8a9b0c1d");
      const trackId = createTrackId("b8c9d0e1-f2a3-4b2c-8d6e-7f8a9b0c1d2e");

      const career = Career.create({
        careerId,
        title: "Career 2",
        trackIds: [trackId],
      });
      const track = Track.create({
        id: trackId,
        careerId,
        title: "Track 2",
        courseIds: [courseId],
      });
      const course = Course.create({
        id: courseId,
        trackId,
        title: "Course 2",
        orderPosition: 0,
        fragmentIds: [fragmentId],
      });
      await careerRepo.save(career);
      await trackRepo.save(track);
      await courseRepo.save(course);

      const fragment = Fragment.create({
        id: fragmentId,
        courseId,
        creatorId: "creator-2",
        title: "Second Fragment",
        problemContent: "P",
        theoryContent: "T",
        artifactContent: "A",
      });
      fragment.submitForReview();
      fragment.publish();
      fragment.setPublishedArtifactId("dip-artifact-xyz");

      await fragmentRepo.save(fragment);
      const found = await fragmentRepo.findById(fragmentId);
      expect(found).not.toBeNull();
      expect(found!.publishedArtifactId).toBe("dip-artifact-xyz");
    });

    it("saves and finds learner progress record", async () => {
      const record = LearnerProgressRecord.create({
        userId: "user-uuid-1",
        entityId: "frag-uuid-1",
        entityType: "fragment",
        status: "in_progress",
      });
      record.markStarted();
      await progressRepo.save(record);

      const found = await progressRepo.findByUserAndEntity(
        "user-uuid-1",
        "frag-uuid-1",
        "fragment"
      );
      expect(found).not.toBeNull();
      expect(found!.userId).toBe("user-uuid-1");
      expect(found!.entityId).toBe("frag-uuid-1");
      expect(found!.entityType).toBe("fragment");
      expect(found!.status).toBe("in_progress");
    });

    it("upserts learner progress record on save", async () => {
      const record = LearnerProgressRecord.create({
        userId: "user-uuid-2",
        entityId: "frag-uuid-2",
        entityType: "fragment",
      });
      record.markStarted();
      await progressRepo.save(record);

      record.complete(95);
      await progressRepo.save(record);

      const found = await progressRepo.findByUserAndEntity(
        "user-uuid-2",
        "frag-uuid-2",
        "fragment"
      );
      expect(found).not.toBeNull();
      expect(found!.status).toBe("completed");
      expect(found!.score).toBe(95);
    });
  }
);
