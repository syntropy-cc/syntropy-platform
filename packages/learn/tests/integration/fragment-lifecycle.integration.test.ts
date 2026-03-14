/**
 * Integration test: fragment full lifecycle (COMP-016.8).
 * Create fragment → submit for review → approve → learner completes; assert DB state.
 * Uses Testcontainers Postgres. Set LEARN_INTEGRATION=true to run.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import {
  createCourseId,
  createFragmentId,
  createTrackId,
} from "@syntropy/types";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Fragment } from "../../src/domain/fragment-artifact/fragment.js";
import { FragmentStatus } from "../../src/domain/fragment-artifact/fragment-status.js";
import { FragmentReviewService } from "../../src/domain/fragment-artifact/services/fragment-review-service.js";
import { ProgressTrackingService } from "../../src/domain/fragment-artifact/services/progress-tracking-service.js";
import type { ProgressEventsPort } from "../../src/domain/fragment-artifact/ports/progress-events-port.js";
import type { CourseHierarchyPort } from "../../src/domain/fragment-artifact/ports/course-hierarchy-port.js";
import { Career } from "../../src/domain/content-hierarchy/career.js";
import { Course } from "../../src/domain/content-hierarchy/course.js";
import { CourseStatus } from "../../src/domain/content-hierarchy/course-status.js";
import { Track } from "../../src/domain/content-hierarchy/track.js";
import { PostgresCareerRepository } from "../../src/infrastructure/repositories/postgres-career-repository.js";
import { PostgresCourseRepository } from "../../src/infrastructure/repositories/postgres-course-repository.js";
import { PostgresFragmentRepository } from "../../src/infrastructure/repositories/postgres-fragment-repository.js";
import { PostgresFragmentReviewRecordRepository } from "../../src/infrastructure/repositories/postgres-fragment-review-record-repository.js";
import { PostgresLearnerProgressRepository } from "../../src/infrastructure/repositories/postgres-learner-progress-repository.js";
import { PostgresTrackRepository } from "../../src/infrastructure/repositories/postgres-track-repository.js";

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigrations(pool: Pool, migrationsDir: string): Promise<void> {
  const files = [
    "20260315100000_learn_content_hierarchy.sql",
    "20260315110000_learn_fragment_artifact.sql",
    "20260316000000_learn_fragment_review_log.sql",
  ];
  for (const name of files) {
    const sql = readFileSync(join(migrationsDir, name), "utf8");
    await pool.query(sql);
  }
}

const describeIntegration =
  process.env.CI !== "true" && process.env.LEARN_INTEGRATION === "true"
    ? describe
    : describe.skip;

describeIntegration("fragment lifecycle integration (COMP-016.8)", () => {
  let pool: Pool;
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let fragmentRepo: PostgresFragmentRepository;
  let progressRepo: PostgresLearnerProgressRepository;
  let reviewService: FragmentReviewService;
  let progressService: ProgressTrackingService;

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

    const careerRepo = new PostgresCareerRepository(pool);
    const trackRepo = new PostgresTrackRepository(pool);
    const courseRepo = new PostgresCourseRepository(pool);
    fragmentRepo = new PostgresFragmentRepository(pool);
    progressRepo = new PostgresLearnerProgressRepository(pool);
    const reviewRecordRepo = new PostgresFragmentReviewRecordRepository(pool);

    const careerId = createCareerId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
    const trackId = createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
    const courseId = createCourseId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");

    const career = Career.create({
      careerId,
      title: "Lifecycle Career",
      trackIds: [trackId],
    });
    const track = Track.create({
      id: trackId,
      careerId,
      title: "Lifecycle Track",
      courseIds: [courseId],
    });
    const course = Course.create({
      id: courseId,
      trackId,
      title: "Lifecycle Course",
      orderPosition: 0,
      fragmentIds: [],
      status: CourseStatus.Published,
    });
    await careerRepo.save(career);
    await trackRepo.save(track);
    await courseRepo.save(course);

    const mockEvents: ProgressEventsPort = {
      publishFragmentCompleted: async () => {},
      publishTrackCompleted: async () => {},
    };
    const lifecycleFragmentId = createFragmentId(
      "d4e5f6a7-b8c9-4d8e-8f2a-3b4c5d6e7f8a"
    );
    const hierarchyPort: CourseHierarchyPort = {
      getCourseIdForFragment: async (fid) =>
        fid === lifecycleFragmentId ? courseId : null,
      getFragmentIdsForCourse: async (cid) =>
        cid === courseId ? [lifecycleFragmentId] : [],
      getTrackIdForCourse: async (cid) => (cid === courseId ? trackId : null),
      getCourseIdsForTrack: async (tid) => (tid === trackId ? [courseId] : []),
    };
    progressService = new ProgressTrackingService({
      progressRepository: progressRepo,
      eventsPort: mockEvents,
      hierarchyPort,
    });

    reviewService = new FragmentReviewService({
      fragmentRepository: fragmentRepo,
      artifactPublisher: { publish: async () => "dip-lifecycle-artifact-id" },
      reviewerRole: { hasReviewerRole: async (id) => id === "reviewer-1" },
      reviewRecord: reviewRecordRepo,
    });
  }, 60_000);

  afterAll(async () => {
    await pool?.end();
    await container?.stop();
  });

  it("full lifecycle: create → submit → approve → learner complete", async () => {
    const courseId = createCourseId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");
    const fragmentId = createFragmentId(
      "d4e5f6a7-b8c9-4d8e-8f2a-3b4c5d6e7f8a"
    );
    const learnerId = "learner-lifecycle-1";
    const reviewerId = "reviewer-1";

    const fragment = Fragment.create({
      id: fragmentId,
      courseId,
      creatorId: "creator-1",
      title: "Lifecycle Fragment",
      problemContent: "Problem",
      theoryContent: "Theory",
      artifactContent: "Artifact",
    });
    await fragmentRepo.save(fragment);

    let loaded = await fragmentRepo.findById(fragmentId);
    expect(loaded).not.toBeNull();
    expect(loaded!.status).toBe(FragmentStatus.Draft);

    await reviewService.submit(fragmentId);
    loaded = await fragmentRepo.findById(fragmentId);
    expect(loaded).not.toBeNull();
    expect(loaded!.status).toBe(FragmentStatus.InReview);

    await reviewService.approve(fragmentId, reviewerId);
    loaded = await fragmentRepo.findById(fragmentId);
    expect(loaded).not.toBeNull();
    expect(loaded!.status).toBe(FragmentStatus.Published);
    expect(loaded!.publishedArtifactId).toBe("dip-lifecycle-artifact-id");

    await progressService.markFragmentCompleted(learnerId, fragmentId);
    const progress = await progressRepo.findByUserAndEntity(
      learnerId,
      fragmentId,
      "fragment"
    );
    expect(progress).not.toBeNull();
    expect(progress!.status).toBe("completed");
  });
});
