/**
 * Integration tests for Learn REST API (COMP-015.6).
 *
 * Uses Testcontainers Postgres, learn content hierarchy migration,
 * LearnContext with repositories and stub getCompletedCourseIds.
 * Requires Docker for Testcontainers.
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
import {
  Career,
  Course,
  CourseStatus,
  FragmentReviewService,
  PostgresCareerRepository,
  PostgresCourseRepository,
  PostgresFragmentRepository,
  PostgresFragmentReviewRecordRepository,
  PostgresTrackRepository,
  Track,
} from "@syntropy/learn-package";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901236";
const VALID_JWT = "valid-learn-api-test-jwt";

function createMockAuth(validJwt: string): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: TEST_USER_ID,
    actor_id: createActorId(TEST_USER_ID),
    roles: ["Learner"],
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  });
  return {
    async verifyToken(jwt: string) {
      if (jwt !== validJwt) throw new InvalidTokenError("Invalid or expired token");
      return token;
    },
    async signIn() {
      return token;
    },
    async signOut() {},
  };
}

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigration(
  pool: Pool,
  migrationsDir: string,
  name: string
): Promise<void> {
  const sql = readFileSync(join(migrationsDir, name), "utf8");
  await pool.query(sql);
}

const describeLearnApi =
  process.env.CI !== "true" && process.env.LEARN_INTEGRATION === "true"
    ? describe
    : describe.skip;

describeLearnApi("Learn API integration (COMP-015.6)", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    pool = new Pool({ connectionString: container.getConnectionUri() });
    const migrationsDir = getMigrationsDir();
    await runMigration(
      pool,
      migrationsDir,
      "20260315100000_learn_content_hierarchy.sql"
    );
    await runMigration(
      pool,
      migrationsDir,
      "20260315110000_learn_fragment_artifact.sql"
    );
    await runMigration(
      pool,
      migrationsDir,
      "20260316000000_learn_fragment_review_log.sql"
    );

    const careerRepo = new PostgresCareerRepository(pool);
    const trackRepo = new PostgresTrackRepository(pool);
    const courseRepo = new PostgresCourseRepository(pool);
    const fragmentRepo = new PostgresFragmentRepository(pool);
    const reviewRecordRepo = new PostgresFragmentReviewRecordRepository(pool);
    const artifactPublisher = {
      publish: async () => "test-dip-artifact-id",
    };
    const reviewerRole = {
      hasReviewerRole: async (userId: string) =>
        userId === TEST_USER_ID || userId === "reviewer-user",
    };
    const fragmentReviewService = new FragmentReviewService({
      fragmentRepository: fragmentRepo,
      artifactPublisher,
      reviewerRole,
      reviewRecord: reviewRecordRepo,
    });
    const markFragmentComplete = async (
      _userId: string,
      _fragmentId: string
    ): Promise<void> => {};

    const careerId = createCareerId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
    const trackId = createTrackId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
    const course1Id = createCourseId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");
    const course2Id = createCourseId("d4e5f6a7-b8c9-4d8e-8f2a-3b4c5d6e7f8a");
    const fragmentId = createFragmentId("e5f6a7b8-c9d0-4e9f-8a3b-4c5d6e7f8a9b");

    const career = Career.create({
      careerId,
      title: "Software Engineering",
      trackIds: [trackId],
    });
    const track = Track.create({
      id: trackId,
      careerId,
      title: "Full-Stack Web",
      courseIds: [course1Id, course2Id],
    });
    const course1 = Course.create({
      id: course1Id,
      trackId,
      title: "Intro to Web",
      orderPosition: 0,
      fragmentIds: [fragmentId],
      status: CourseStatus.Published,
    });
    const course2 = Course.create({
      id: course2Id,
      trackId,
      title: "Frontend Basics",
      orderPosition: 1,
      fragmentIds: [],
      status: CourseStatus.Published,
    });

    await careerRepo.save(career);
    await trackRepo.save(track);
    await courseRepo.save(course1);
    await courseRepo.save(course2);

    const getCompletedCourseIds = async (_userId: string): Promise<string[]> => [];

    app = await createApp({
      auth: createMockAuth(VALID_JWT),
      supabaseClient: null,
      learn: {
        careerRepository: careerRepo,
        trackRepository: trackRepo,
        courseRepository: courseRepo,
        getCompletedCourseIds,
        fragmentRepository: fragmentRepo,
        fragmentReviewService,
        markFragmentComplete,
      },
    });
  }, 60_000);

  afterAll(async () => {
    if (app) await app.close();
    if (pool) await pool.end();
    if (container) await container.stop();
  });

  it("GET /api/v1/learn/careers returns career list when authenticated", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/learn/careers",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { data: Array<{ id: string; title: string; trackIds: string[] }>; meta: unknown };
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    const career = body.data.find((c) => c.title === "Software Engineering");
    expect(career).toBeDefined();
    expect(career!.id).toBeDefined();
    expect(career!.trackIds).toHaveLength(1);
    expect(body.meta).toBeDefined();
  });

  it("GET /api/v1/learn/careers/:id/tracks returns tracks with fog-of-war applied", async () => {
    const careersRes = await app.inject({
      method: "GET",
      url: "/api/v1/learn/careers",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    const careersBody = careersRes.json() as { data: Array<{ id: string }> };
    const careerId = careersBody.data[0].id;

    const res = await app.inject({
      method: "GET",
      url: `/api/v1/learn/careers/${careerId}/tracks`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      data: Array<{
        id: string;
        title: string;
        unlocked: Array<{ courseId: string; title: string }>;
        locked: Array<{ courseId: string; title: string; reason: string }>;
      }>;
      meta: unknown;
    };
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(1);
    expect(body.data[0].title).toBe("Full-Stack Web");
    expect(body.data[0].unlocked).toHaveLength(1);
    expect(body.data[0].unlocked[0].title).toBe("Intro to Web");
    expect(body.data[0].locked).toHaveLength(1);
    expect(body.data[0].locked[0].title).toBe("Frontend Basics");
    expect(body.data[0].locked[0].reason).toBeDefined();
    expect(body.meta).toBeDefined();
  });

  it("GET /api/v1/learn/courses/:id returns course when found", async () => {
    const courseId = "c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f";
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/learn/courses/${courseId}`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      data: { id: string; trackId: string; title: string; orderPosition: number; fragmentIds: string[]; status: string };
      meta: unknown;
    };
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(courseId);
    expect(body.data.title).toBe("Intro to Web");
    expect(body.data.orderPosition).toBe(0);
    expect(body.data.status).toBe("published");
    expect(body.meta).toBeDefined();
  });

  it("GET /api/v1/learn/courses/:id returns 404 when course not found", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/learn/courses/00000000-0000-0000-0000-000000000000",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(404);
    const body = res.json() as { error: { code: string } };
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("GET /api/v1/learn/careers returns 401 when not authenticated", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/learn/careers",
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/v1/learn/fragments creates draft and GET returns it", async () => {
    const courseId = "c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f";
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/learn/fragments",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: { courseId, title: "New Fragment" },
    });
    expect(createRes.statusCode).toBe(201);
    const createBody = createRes.json() as {
      data: { id: string; status: string; title: string };
      meta: unknown;
    };
    expect(createBody.data.id).toBeDefined();
    expect(createBody.data.status).toBe("draft");
    expect(createBody.data.title).toBe("New Fragment");

    const getRes = await app.inject({
      method: "GET",
      url: `/api/v1/learn/fragments/${createBody.data.id}`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(getRes.statusCode).toBe(200);
    const getBody = getRes.json() as { data: { id: string; status: string }; meta: unknown };
    expect(getBody.data.id).toBe(createBody.data.id);
    expect(getBody.data.status).toBe("draft");
  });

  it("GET /api/v1/learn/fragments/:id returns 404 when not found", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/learn/fragments/00000000-0000-0000-0000-000000000000",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(res.statusCode).toBe(404);
  });
});
