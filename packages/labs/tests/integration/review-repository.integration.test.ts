/**
 * Integration tests for Review, ReviewPassageLink, and AuthorResponse repositories (COMP-025.5).
 * Uses real DB via Testcontainers. Run with LABS_INTEGRATION=true.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createArticleId,
  createReviewId,
} from "@syntropy/types";
import { createSubjectAreaId } from "../../src/domain/scientific-context/subject-area.js";
import { createResearchMethodologyId } from "../../src/domain/scientific-context/research-methodology.js";
import type { LabsDbClient } from "../../src/infrastructure/labs-db-client.js";
import { PostgresReviewRepository } from "../../src/infrastructure/repositories/postgres-review-repository.js";
import { PostgresReviewPassageLinkRepository } from "../../src/infrastructure/repositories/postgres-review-passage-link-repository.js";
import { PostgresAuthorResponseRepository } from "../../src/infrastructure/repositories/postgres-author-response-repository.js";
import { Review } from "../../src/domain/open-peer-review/review.js";
import { ReviewPassageLink } from "../../src/domain/open-peer-review/review-passage-link.js";
import { AuthorResponse } from "../../src/domain/open-peer-review/author-response.js";

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigrations(pool: Pool, migrationsDir: string): Promise<void> {
  const migrations = [
    "20260322000000_labs_scientific_context.sql",
    "20260323000000_labs_article_editor.sql",
    "20260324000000_labs_experiment_design.sql",
    "20260325000000_labs_open_peer_review.sql",
  ];
  for (const name of migrations) {
    const sql = readFileSync(join(migrationsDir, name), "utf8");
    await pool.query(sql);
  }
}

function createDbClient(pool: Pool): LabsDbClient {
  return {
    execute: (sql: string, params: unknown[]) =>
      pool.query(sql, params).then(() => {}),
    query: (sql: string, params: unknown[]) =>
      pool.query(sql, params).then((r) => r.rows as Record<string, unknown>[]),
  };
}

const describeIntegration =
  process.env.LABS_INTEGRATION === "true" ? describe : describe.skip;

describeIntegration(
  "Review repository (COMP-025.5)",
  () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let reviewRepo: PostgresReviewRepository;
    let passageLinkRepo: PostgresReviewPassageLinkRepository;
    let authorResponseRepo: PostgresAuthorResponseRepository;

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
      const client = createDbClient(pool);
      reviewRepo = new PostgresReviewRepository(client);
      passageLinkRepo = new PostgresReviewPassageLinkRepository(client);
      authorResponseRepo = new PostgresAuthorResponseRepository(client);
    });

    afterAll(async () => {
      await pool?.end();
      await container?.stop();
    });

    async function insertArticle(articleId: string): Promise<void> {
      const subjectAreaId = createSubjectAreaId(
        "51000001-0000-4000-8000-000000000099"
      );
      const methodologyId = createResearchMethodologyId(
        "71000001-0000-4000-8000-000000000099"
      );
      await pool.query(
        `INSERT INTO labs.subject_areas (id, parent_id, name, code, description, depth_level) VALUES ($1, NULL, 'Test', 'T', NULL, 1) ON CONFLICT (id) DO NOTHING`,
        [subjectAreaId]
      );
      await pool.query(
        `INSERT INTO labs.research_methodologies (id, name, type, description) VALUES ($1, 'Quantitative', 'quantitative', NULL) ON CONFLICT (id) DO NOTHING`,
        [methodologyId]
      );
      await pool.query(
        `INSERT INTO labs.scientific_articles (id, title, subject_area_id, author_id, status, current_content, created_at, updated_at) VALUES ($1, 'Review Test Article', $2, 'author-1', 'draft', '', now(), now()) ON CONFLICT (id) DO NOTHING`,
        [articleId, subjectAreaId]
      );
    }

    it("persists and loads Review", async () => {
      const articleId = createArticleId(
        "a5000001-0000-4000-8000-000000000001"
      );
      await insertArticle(articleId as string);

      const reviewId = createReviewId(
        "a2000001-0000-4000-8000-000000000001"
      );
      const review = new Review({
        reviewId,
        articleId,
        reviewerId: "reviewer-1",
        status: "in_progress",
        content: "Initial draft comment.",
      });
      await reviewRepo.save(review);

      const loaded = await reviewRepo.findById(reviewId);
      expect(loaded).not.toBeNull();
      expect(loaded!.reviewId).toEqual(reviewId);
      expect(loaded!.articleId).toEqual(articleId);
      expect(loaded!.reviewerId).toBe("reviewer-1");
      expect(loaded!.status).toBe("in_progress");
      expect(loaded!.content).toBe("Initial draft comment.");
    });

    it("findByArticleId returns reviews for article", async () => {
      const articleId = createArticleId(
        "a5000002-0000-4000-8000-000000000002"
      );
      await insertArticle(articleId as string);

      const reviewId = createReviewId(
        "a2000002-0000-4000-8000-000000000002"
      );
      const review = new Review({
        reviewId,
        articleId,
        reviewerId: "reviewer-2",
        status: "submitted",
        content: "Submitted review.",
        submittedAt: new Date(),
      });
      await reviewRepo.save(review);

      const byArticle = await reviewRepo.findByArticleId(articleId);
      expect(byArticle.length).toBeGreaterThanOrEqual(1);
      const found = byArticle.find((r) => (r.reviewId as string) === (reviewId as string));
      expect(found).not.toBeUndefined();
      expect(found!.content).toBe("Submitted review.");
    });

    it("persists and loads ReviewPassageLink", async () => {
      const articleId = createArticleId(
        "a5000003-0000-4000-8000-000000000003"
      );
      await insertArticle(articleId as string);

      const reviewId = createReviewId(
        "a2000003-0000-4000-8000-000000000003"
      );
      const review = new Review({
        reviewId,
        articleId,
        reviewerId: "reviewer-3",
        status: "submitted",
        content: "Review with passage link.",
        submittedAt: new Date(),
      });
      await reviewRepo.save(review);

      const link = new ReviewPassageLink({
        reviewId,
        articleId,
        startOffset: 0,
        endOffset: 5,
        comment: "Check this phrase.",
      });
      await passageLinkRepo.save(link);

      const byReview = await passageLinkRepo.findByReviewId(reviewId);
      expect(byReview.length).toBe(1);
      expect(byReview[0]!.comment).toBe("Check this phrase.");
      expect(byReview[0]!.startOffset).toBe(0);
      expect(byReview[0]!.endOffset).toBe(5);
      expect(byReview[0]!.id).not.toBeNull();
    });

    it("persists and loads AuthorResponse", async () => {
      const articleId = createArticleId(
        "a5000004-0000-4000-8000-000000000004"
      );
      await insertArticle(articleId as string);

      const reviewId = createReviewId(
        "a2000004-0000-4000-8000-000000000004"
      );
      const review = new Review({
        reviewId,
        articleId,
        reviewerId: "reviewer-4",
        status: "published",
        content: "Published review.",
        submittedAt: new Date(),
        publishedAt: new Date(),
      });
      await reviewRepo.save(review);

      const response = AuthorResponse.create(
        {
          id: "resp-0001-0000-4000-8000-000000000004",
          reviewId,
          articleId,
          reviewPassageLinkId: null,
          responderId: "author-1",
          responseText: "Thank you for the feedback.",
        },
        "author-1"
      );
      await authorResponseRepo.save(response);

      const byReview = await authorResponseRepo.findByReviewId(reviewId);
      expect(byReview.length).toBe(1);
      expect(byReview[0]!.responseText).toBe("Thank you for the feedback.");
      expect(byReview[0]!.responderId).toBe("author-1");
    });
  }
);
