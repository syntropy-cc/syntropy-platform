/**
 * Integration tests for Labs article editor Postgres repositories (COMP-023.5).
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
import { PostgresArticleVersionRepository } from "../../src/infrastructure/repositories/postgres-article-version-repository.js";
import { ScientificArticle } from "../../src/domain/article-editor/scientific-article.js";
import { createSubjectAreaId } from "../../src/domain/scientific-context/subject-area.js";
import { ArticleVersion } from "../../src/domain/article-editor/article-version.js";

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
  "Postgres article editor repositories (COMP-023.5)",
  () => {
    let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
    let pool: Pool;
    let articleRepo: PostgresScientificArticleRepository;
    let versionRepo: PostgresArticleVersionRepository;

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
      versionRepo = new PostgresArticleVersionRepository(client);
    });

    afterAll(async () => {
      await pool?.end();
      await container?.stop();
    });

    it("save and findById round-trip article", async () => {
      const articleId = createArticleId(
        "a2000001-0000-4000-8000-000000000001"
      );
      const subjectAreaId = createSubjectAreaId(
        "51000001-0000-4000-8000-000000000001"
      );
      const article = new ScientificArticle({
        articleId,
        title: "Integration Test Article",
        content: "# Intro\n\nMyST content.",
        subjectAreaId,
        authorId: "author-1",
        status: "draft",
      });
      await articleRepo.save(article);
      const found = await articleRepo.findById(articleId);
      expect(found).not.toBeNull();
      expect(found!.articleId).toBe(articleId);
      expect(found!.title).toBe(article.title);
      expect(found!.content).toBe(article.content);
      expect(found!.status).toBe("draft");
    });

    it("findByAuthor returns only that author's articles", async () => {
      const subjectAreaId = createSubjectAreaId(
        "51000001-0000-4000-8000-000000000001"
      );
      const a1 = new ScientificArticle({
        articleId: createArticleId("a2000002-0000-4000-8000-000000000002"),
        title: "Article by Author A",
        content: "Content A",
        subjectAreaId,
        authorId: "author-a",
        status: "draft",
      });
      const a2 = new ScientificArticle({
        articleId: createArticleId("a2000003-0000-4000-8000-000000000003"),
        title: "Article by Author B",
        content: "Content B",
        subjectAreaId,
        authorId: "author-b",
        status: "draft",
      });
      await articleRepo.save(a1);
      await articleRepo.save(a2);
      const byA = await articleRepo.findByAuthor("author-a");
      expect(byA.length).toBeGreaterThanOrEqual(1);
      expect(byA.every((x) => x.authorId === "author-a")).toBe(true);
    });

    it("appendVersion and getLatest return latest version", async () => {
      const articleId = createArticleId(
        "a2000004-0000-4000-8000-000000000004"
      );
      const subjectAreaId = createSubjectAreaId(
        "51000001-0000-4000-8000-000000000001"
      );
      const article = new ScientificArticle({
        articleId,
        title: "Versioned Article",
        content: "v1",
        subjectAreaId,
        authorId: "author-1",
        status: "draft",
      });
      await articleRepo.save(article);

      const v1 = new ArticleVersion({
        articleId,
        versionNumber: 1,
        mystContent: "# Version 1",
        createdAt: new Date(),
        createdBy: "author-1",
      });
      await versionRepo.appendVersion(v1);

      const v2 = new ArticleVersion({
        articleId,
        versionNumber: 2,
        mystContent: "# Version 2",
        createdAt: new Date(),
        createdBy: "author-1",
      });
      await versionRepo.appendVersion(v2);

      const latest = await versionRepo.getLatest(articleId);
      expect(latest).not.toBeNull();
      expect(latest!.versionNumber).toBe(2);
      expect(latest!.mystContent).toContain("Version 2");

      const all = await versionRepo.listByArticleId(articleId);
      expect(all.length).toBe(2);
      expect(all[0]!.versionNumber).toBe(1);
      expect(all[1]!.versionNumber).toBe(2);
    });
  }
);
