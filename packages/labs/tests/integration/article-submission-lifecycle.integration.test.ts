/**
 * Integration tests for article submission full lifecycle (COMP-023.8).
 * Create → submit → accept (DIP publication). Uses real DB; mocks DIP and notifier.
 * Run with LABS_INTEGRATION=true. Requires Docker for Testcontainers.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createArticleId } from "@syntropy/types";
import type { LabsDbClient } from "../../src/infrastructure/labs-db-client.js";
import { PostgresScientificArticleRepository } from "../../src/infrastructure/repositories/postgres-scientific-article-repository.js";
import { ScientificArticle } from "../../src/domain/article-editor/scientific-article.js";
import { createSubjectAreaId } from "../../src/domain/scientific-context/subject-area.js";
import { ArticleSubmissionService } from "../../src/application/article-submission-service.js";
import type { ArticlePublisherPort } from "../../src/domain/article-editor/ports/article-publisher-port.js";
import type { ArticleSubmissionNotifierPort } from "../../src/domain/article-editor/ports/article-submission-notifier-port.js";
import { MystRenderer } from "../../src/infrastructure/myst-renderer.js";

function getMigrationsDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "..", "..", "..", "supabase", "migrations");
}

async function runMigrations(pool: Pool, migrationsDir: string): Promise<void> {
  const labsContext = readFileSync(
    join(migrationsDir, "20260322000000_labs_scientific_context.sql"),
    "utf8"
  );
  await pool.query(labsContext);
  const articleEditor = readFileSync(
    join(migrationsDir, "20260323000000_labs_article_editor.sql"),
    "utf8"
  );
  await pool.query(articleEditor);
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
  process.env.CI !== "true" && process.env.LABS_INTEGRATION === "true"
    ? describe
    : describe.skip;

describeIntegration(
  "Article submission lifecycle (COMP-023.8)",
  () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let articleRepo: PostgresScientificArticleRepository;
    let publishCalls: Array<{ article: ScientificArticle }>;
    let notifierCalls: Array<{ articleId: string; authorId: string }>;
    let submissionService: ArticleSubmissionService;

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
      articleRepo = new PostgresScientificArticleRepository(client);

      publishCalls = [];
      const mockPublisher: ArticlePublisherPort = {
        async publish(article) {
          publishCalls.push({ article });
          return { artifactId: "dip-artifact-integration-test" };
        },
      };

      notifierCalls = [];
      const mockNotifier: ArticleSubmissionNotifierPort = {
        async notifySubmittedForReview(articleId, authorId) {
          notifierCalls.push({
            articleId: String(articleId),
            authorId,
          });
        },
      };

      submissionService = new ArticleSubmissionService({
        articleRepository: articleRepo,
        articlePublisher: mockPublisher,
        notifier: mockNotifier,
      });
    });

    afterAll(async () => {
      await pool?.end();
      await container?.stop();
    });

    it("full lifecycle: create draft, submit, accept → published and DIP publish called", async () => {
      const articleId = createArticleId(
        "a3000001-0000-4000-8000-000000000001"
      );
      const subjectAreaId = createSubjectAreaId(
        "51000001-0000-4000-8000-000000000001"
      );
      const authorId = "author-integration-1";

      const draft = new ScientificArticle({
        articleId,
        title: "Lifecycle Test Article",
        content: "# Introduction\n\nSome **MyST** content.",
        subjectAreaId,
        authorId,
        status: "draft",
      });
      await articleRepo.save(draft);

      await submissionService.submit(articleId, authorId);
      const afterSubmit = await articleRepo.findById(articleId);
      expect(afterSubmit).not.toBeNull();
      expect(afterSubmit!.status).toBe("under_review");
      expect(notifierCalls.length).toBe(1);
      expect(notifierCalls[0]!.articleId).toBe(String(articleId));
      expect(notifierCalls[0]!.authorId).toBe(authorId);

      await submissionService.accept(articleId, authorId);
      const afterAccept = await articleRepo.findById(articleId);
      expect(afterAccept).not.toBeNull();
      expect(afterAccept!.status).toBe("published");
      expect(afterAccept!.publishedArtifactId).toBe(
        "dip-artifact-integration-test"
      );
      expect(publishCalls.length).toBe(1);
      expect(publishCalls[0]!.article.title).toBe("Lifecycle Test Article");
    });

    it("MyST render produces non-empty HTML for article content", () => {
      const renderer = new MystRenderer();
      const html = renderer.render("# Title\n\nParagraph.");
      expect(html).toBeDefined();
      expect(typeof html).toBe("string");
      expect(html.length).toBeGreaterThan(0);
      expect(html).toContain("Title");
    });
  }
);
