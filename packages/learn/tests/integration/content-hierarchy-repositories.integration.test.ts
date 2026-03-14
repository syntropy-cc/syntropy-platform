/**
 * Integration tests for Content Hierarchy repositories (COMP-015.5).
 * Uses Testcontainers Postgres and learn content hierarchy migration.
 * Requires Docker.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import {
  createCareerId,
  createCourseId,
  createFragmentId,
  createTrackId,
} from "@syntropy/types";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Career } from "../../src/domain/content-hierarchy/career.js";
import { Course } from "../../src/domain/content-hierarchy/course.js";
import { CourseStatus } from "../../src/domain/content-hierarchy/course-status.js";
import { Track } from "../../src/domain/content-hierarchy/track.js";
import { PostgresCareerRepository } from "../../src/infrastructure/repositories/postgres-career-repository.js";
import { PostgresTrackRepository } from "../../src/infrastructure/repositories/postgres-track-repository.js";
import { PostgresCourseRepository } from "../../src/infrastructure/repositories/postgres-course-repository.js";

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runLearnMigration(pool: Pool, migrationsDir: string): Promise<void> {
  const sql = readFileSync(
    join(migrationsDir, "20260315100000_learn_content_hierarchy.sql"),
    "utf8"
  );
  await pool.query(sql);
}

const describeIntegration = process.env.CI !== "true" && process.env.LEARN_INTEGRATION === "true" ? describe : describe.skip;

describeIntegration("content hierarchy repositories integration (COMP-015.5)", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let careerRepo: PostgresCareerRepository;
  let trackRepo: PostgresTrackRepository;
  let courseRepo: PostgresCourseRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    pool = new Pool({
      host: container.getHost(),
      port: container.getPort(),
      user: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
    });
    await runLearnMigration(pool, getMigrationsDir());
    careerRepo = new PostgresCareerRepository(pool);
    trackRepo = new PostgresTrackRepository(pool);
    courseRepo = new PostgresCourseRepository(pool);
  }, 60_000);

  afterAll(async () => {
    await pool?.end();
    await container?.stop();
  });

  it("saves and finds career by id", async () => {
    const careerId = createCareerId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
    const trackId = createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
    const career = Career.create({
      careerId,
      title: "Software Engineering",
      trackIds: [trackId],
    });

    await careerRepo.save(career);
    const found = await careerRepo.findById(careerId);

    expect(found).not.toBeNull();
    expect(found!.careerId).toBe(careerId);
    expect(found!.title).toBe("Software Engineering");
    expect(found!.tracks).toHaveLength(1);
    expect(found!.tracks[0]).toBe(trackId);
  });

  it("saves and finds track by id and listByCareerId", async () => {
    const careerId = createCareerId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");
    const trackId = createTrackId("d4e5f6a7-b8c9-4d8e-8f2a-3b4c5d6e7f8a");
    const course1Id = createCourseId("e5f6a7b8-c9d0-4e9f-8a3b-4c5d6e7f8a9b");
    const career = Career.create({
      careerId,
      title: "Data Science",
      trackIds: [trackId],
    });
    const track = Track.create({
      id: trackId,
      careerId,
      title: "ML Track",
      courseIds: [course1Id],
      prerequisites: [],
    });

    await careerRepo.save(career);
    await trackRepo.save(track);

    const foundTrack = await trackRepo.findById(trackId);
    expect(foundTrack).not.toBeNull();
    expect(foundTrack!.id).toBe(trackId);
    expect(foundTrack!.title).toBe("ML Track");
    expect(foundTrack!.courseIds).toHaveLength(1);

    const tracksForCareer = await trackRepo.listByCareerId(careerId);
    expect(tracksForCareer).toHaveLength(1);
    expect(tracksForCareer[0].id).toBe(trackId);
  });

  it("saves and finds course by id and listByTrackId", async () => {
    const careerId = createCareerId("f6a7b8c9-d0e1-4f0a-8b4c-5d6e7f8a9b0c");
    const trackId = createTrackId("a7b8c9d0-e1f2-4a1b-8c5d-6e7f8a9b0c1d");
    const courseId = createCourseId("b8c9d0e1-f2a3-4b2c-8d6e-7f8a9b0c1d2e");
    const fragmentId = createFragmentId("c9d0e1f2-a3b4-4c3d-8e7f-8a9b0c1d2e3f");
    const career = Career.create({
      careerId,
      title: "DevOps",
      trackIds: [trackId],
    });
    const track = Track.create({
      id: trackId,
      careerId,
      title: "CI/CD",
      courseIds: [courseId],
    });
    const course = Course.create({
      id: courseId,
      trackId,
      title: "Docker Basics",
      orderPosition: 0,
      fragmentIds: [fragmentId],
      status: CourseStatus.Published,
    });

    await careerRepo.save(career);
    await trackRepo.save(track);
    await courseRepo.save(course);

    const foundCourse = await courseRepo.findById(courseId);
    expect(foundCourse).not.toBeNull();
    expect(foundCourse!.id).toBe(courseId);
    expect(foundCourse!.title).toBe("Docker Basics");
    expect(foundCourse!.orderPosition).toBe(0);
    expect(foundCourse!.status).toBe(CourseStatus.Published);
    expect(foundCourse!.fragmentIds).toHaveLength(1);

    const coursesForTrack = await courseRepo.listByTrackId(trackId);
    expect(coursesForTrack).toHaveLength(1);
    expect(coursesForTrack[0].id).toBe(courseId);
  });
});
