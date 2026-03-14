/**
 * Integration tests for Mentorship repository (COMP-018.4).
 * Uses Testcontainers Postgres and learn migrations. Set LEARN_INTEGRATION=true to run.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import {
  createCareerId,
  createFragmentId,
  createMentorReviewId,
  createMentorshipRelationshipId,
  createTrackId,
} from "@syntropy/types";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MentorshipRelationship } from "../../src/domain/mentorship/mentorship-relationship.js";
import { MentorReview } from "../../src/domain/mentorship/mentor-review.js";
import { PostgresMentorshipRepository } from "../../src/infrastructure/repositories/postgres-mentorship-repository.js";
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
  const mentorship = readFileSync(
    join(migrationsDir, "20260318000000_learn_mentorship.sql"),
    "utf8"
  );
  await pool.query(mentorship);
}

const describeIntegration =
  process.env.CI !== "true" && process.env.LEARN_INTEGRATION === "true"
    ? describe
    : describe.skip;

describeIntegration(
  "mentorship repository integration (COMP-018.4)",
  () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let repo: PostgresMentorshipRepository;
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
      repo = new PostgresMentorshipRepository(pool);
    }, 60_000);

    afterAll(async () => {
      await pool?.end();
      await container?.stop();
    });

    async function ensureTrack(): Promise<ReturnType<typeof createTrackId>> {
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
      return trackId;
    }

    it("saves and finds mentorship relationship by id", async () => {
      const trackId = await ensureTrack();
      const relId = createMentorshipRelationshipId(
        "c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f"
      );
      const { relationship } = MentorshipRelationship.propose({
        id: relId,
        mentorId: "mentor-1",
        learnerId: "learner-1",
        trackId,
      });

      await repo.save(relationship);
      const found = await repo.findById(relId);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(relId);
      expect(found!.mentorId).toBe("mentor-1");
      expect(found!.learnerId).toBe("learner-1");
      expect(found!.status).toBe("proposed");
    });

    it("findByMentor and findByLearner return relationships", async () => {
      const trackId = await ensureTrack();
      const relId = createMentorshipRelationshipId(
        "d4e5f6a7-b8c9-4d7e-8f2a-3b4c5d6e7f8a"
      );
      const { relationship } = MentorshipRelationship.propose({
        id: relId,
        mentorId: "mentor-2",
        learnerId: "learner-2",
        trackId,
      });
      await repo.save(relationship);

      const byMentor = await repo.findByMentor("mentor-2");
      const byLearner = await repo.findByLearner("learner-2");

      expect(byMentor.some((r) => r.id === relId)).toBe(true);
      expect(byLearner.some((r) => r.id === relId)).toBe(true);
    });

    it("countActiveByMentor returns correct count", async () => {
      const trackId = await ensureTrack();
      const rel1Id = createMentorshipRelationshipId(
        "e5f6a7b8-c9d0-4e8f-9a2b-4c5d6e7f8a9b"
      );
      const rel2Id = createMentorshipRelationshipId(
        "f6a7b8c9-d0e1-4f9a-0b3c-5d6e7f8a9b0c"
      );

      const { relationship: r1 } = MentorshipRelationship.propose({
        id: rel1Id,
        mentorId: "mentor-3",
        learnerId: "learner-3a",
        trackId,
      });
      r1.accept("mentor-3", 0);
      await repo.save(r1);

      const { relationship: r2 } = MentorshipRelationship.propose({
        id: rel2Id,
        mentorId: "mentor-3",
        learnerId: "learner-3b",
        trackId,
      });
      r2.accept("mentor-3", 1);
      await repo.save(r2);

      const count = await repo.countActiveByMentor("mentor-3");
      expect(count).toBe(2);
    });

    it("save and findReviewByRelationship persist mentor review", async () => {
      const trackId = await ensureTrack();
      const relId = createMentorshipRelationshipId(
        "a7b8c9d0-e1f2-4a0b-1c4d-6e7f8a9b0c1d"
      );
      const { relationship } = MentorshipRelationship.propose({
        id: relId,
        mentorId: "mentor-4",
        learnerId: "learner-4",
        trackId,
      });
      relationship.accept("mentor-4", 0);
      relationship.conclude();
      await repo.save(relationship);

      const review = MentorReview.create(relationship, {
        id: createMentorReviewId("b8c9d0e1-f2a3-4b1c-2d5e-7f8a9b0c1d2e"),
        reviewerId: "mentor-4",
        fragmentId: createFragmentId("c9d0e1f2-a3b4-4c2d-8e6f-8a9b0c1d2e3f"),
        rating: 5,
        feedback: "Excellent work.",
      });
      await repo.saveReview(review);

      const found = await repo.findReviewByRelationship(relId);
      expect(found).not.toBeNull();
      expect(found!.relationshipId).toBe(relId);
      expect(found!.rating).toBe(5);
      expect(found!.feedback).toBe("Excellent work.");
    });
  }
);
