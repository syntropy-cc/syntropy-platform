/**
 * Integration tests for Mentorship REST API (COMP-018.5).
 * Requires Docker for Testcontainers. Set LEARN_INTEGRATION=true to run.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import {
  createActorId,
  IdentityToken,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";
import {
  Career,
  Course,
  CourseStatus,
  FragmentReviewService,
  MentorshipService,
  PostgresCareerRepository,
  PostgresCourseRepository,
  PostgresFragmentRepository,
  PostgresFragmentReviewRecordRepository,
  PostgresMentorshipRepository,
  PostgresTrackRepository,
  Track,
} from "@syntropy/learn-package";
import {
  createCareerId,
  createCourseId,
  createTrackId,
} from "@syntropy/types";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901236";
const LEARNER_ID = "learner-user-id-001";
const VALID_JWT = "valid-mentorship-api-test-jwt";

function createMockAuth(validJwt: string): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: TEST_USER_ID,
    actor_id: createActorId(TEST_USER_ID),
    roles: ["Learner", "Mentor"],
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

const describeMentorshipApi =
  process.env.CI !== "true" && process.env.LEARN_INTEGRATION === "true"
    ? describe
    : describe.skip;

describeMentorshipApi("Mentorship API integration (COMP-018.5)", () => {
  let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let pool: Pool;
  let app: Awaited<ReturnType<typeof createApp>>;
  let trackId: string;

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
    await runMigration(
      pool,
      migrationsDir,
      "20260318000000_learn_mentorship.sql"
    );

    const careerRepo = new PostgresCareerRepository(pool);
    const trackRepo = new PostgresTrackRepository(pool);
    const courseRepo = new PostgresCourseRepository(pool);
    const fragmentRepo = new PostgresFragmentRepository(pool);
    const reviewRecordRepo = new PostgresFragmentReviewRecordRepository(pool);
    const mentorshipRepo = new PostgresMentorshipRepository(pool);
    const mentorshipService = new MentorshipService({ repository: mentorshipRepo });

    const careerId = createCareerId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
    trackId = "b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e";
    const trackIdTyped = createTrackId(trackId);
    const courseId = createCourseId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");

    const career = Career.create({
      careerId,
      title: "Test Career",
      trackIds: [trackIdTyped],
    });
    const track = Track.create({
      id: trackIdTyped,
      careerId,
      title: "Test Track",
      courseIds: [courseId],
      prerequisites: [],
    });
    const course = Course.create({
      id: courseId,
      trackId: trackIdTyped,
      title: "Intro",
      orderPosition: 0,
      fragmentIds: [],
      status: CourseStatus.Published,
    });
    await careerRepo.save(career);
    await trackRepo.save(track);
    await courseRepo.save(course);

    const artifactPublisher = { publish: async () => "dip-id" };
    const reviewerRole = {
      hasReviewerRole: async (userId: string) => userId === TEST_USER_ID,
    };
    const fragmentReviewService = new FragmentReviewService({
      fragmentRepository: fragmentRepo,
      artifactPublisher,
      reviewerRole,
      reviewRecord: reviewRecordRepo,
    });
    const getCompletedCourseIds = async (_userId: string): Promise<string[]> => [];
    const markFragmentComplete = async () => {};

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
        mentorshipService,
      },
    });
  }, 60_000);

  afterAll(async () => {
    if (app) await app.close();
    if (pool) await pool.end();
    if (container) await container.stop();
  });

  it("POST /api/v1/learn/mentorships creates relationship and GET returns it", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/learn/mentorships",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {
        mentorId: TEST_USER_ID,
        learnerId: LEARNER_ID,
        trackId,
        scopeDescription: "TypeScript help",
      },
    });
    expect(createRes.statusCode).toBe(201);
    const createBody = createRes.json() as { data: { id: string; status: string } };
    expect(createBody.data.id).toBeDefined();
    expect(createBody.data.status).toBe("proposed");

    const getRes = await app.inject({
      method: "GET",
      url: `/api/v1/learn/mentorships/${createBody.data.id}`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(getRes.statusCode).toBe(200);
    const getBody = getRes.json() as { data: { id: string; mentorId: string; learnerId: string; status: string } };
    expect(getBody.data.id).toBe(createBody.data.id);
    expect(getBody.data.mentorId).toBe(TEST_USER_ID);
    expect(getBody.data.learnerId).toBe(LEARNER_ID);
    expect(getBody.data.status).toBe("proposed");
  });

  it("PUT /api/v1/learn/mentorships/:id/accept returns 403 when caller is not mentor", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/learn/mentorships",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {
        mentorId: "other-mentor-id",
        learnerId: LEARNER_ID,
        trackId,
      },
    });
    expect(createRes.statusCode).toBe(201);
    const { id } = (createRes.json() as { data: { id: string } }).data;

    const acceptRes = await app.inject({
      method: "PUT",
      url: `/api/v1/learn/mentorships/${id}/accept`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(acceptRes.statusCode).toBe(403);
    const errBody = acceptRes.json() as { error: { code: string } };
    expect(errBody.error.code).toBe("FORBIDDEN");
  });

  it("full lifecycle: propose, accept as mentor, conclude, submit review", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/learn/mentorships",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {
        mentorId: TEST_USER_ID,
        learnerId: LEARNER_ID,
        trackId,
      },
    });
    expect(createRes.statusCode).toBe(201);
    const { id } = (createRes.json() as { data: { id: string } }).data;

    const acceptRes = await app.inject({
      method: "PUT",
      url: `/api/v1/learn/mentorships/${id}/accept`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(acceptRes.statusCode).toBe(200);
    const acceptBody = acceptRes.json() as { data: { status: string } };
    expect(acceptBody.data.status).toBe("active");

    const concludeRes = await app.inject({
      method: "POST",
      url: `/api/v1/learn/mentorships/${id}/conclude`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(concludeRes.statusCode).toBe(200);
    const concludeBody = concludeRes.json() as { data: { status: string } };
    expect(concludeBody.data.status).toBe("concluded");

    const reviewRes = await app.inject({
      method: "POST",
      url: `/api/v1/learn/mentorships/${id}/reviews`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {
        fragmentId: "c3d4e5f6-a7b8-4c6d-8e1f-2a3b4c5d6e7f",
        rating: 5,
        feedback: "Great mentorship.",
      },
    });
    expect(reviewRes.statusCode).toBe(201);
    const reviewBody = reviewRes.json() as { data: { id: string; rating: number } };
    expect(reviewBody.data.rating).toBe(5);
  });
});
