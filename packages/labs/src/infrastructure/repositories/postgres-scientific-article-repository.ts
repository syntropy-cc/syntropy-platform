/**
 * PostgreSQL implementation of ScientificArticleRepositoryPort (COMP-023.5).
 */

import type { ArticleId } from "@syntropy/types";
import { createArticleId } from "@syntropy/types";
import { createSubjectAreaId } from "../../domain/scientific-context/subject-area.js";
import { ScientificArticle } from "../../domain/article-editor/scientific-article.js";
import type { ScientificArticleRepositoryPort } from "../../domain/article-editor/ports/scientific-article-repository-port.js";
import type { LabsDbClient } from "../labs-db-client.js";

const TABLE = "labs.scientific_articles";
const INSERT =
  `INSERT INTO ${TABLE} (id, title, subject_area_id, author_id, status, current_content, published_artifact_id, published_at, created_at, updated_at) ` +
  `VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ` +
  `ON CONFLICT (id) DO UPDATE SET title = $2, subject_area_id = $3, author_id = $4, status = $5, current_content = $6, published_artifact_id = $7, published_at = $8, updated_at = $10`;
const SELECT_BY_ID = `SELECT id, title, subject_area_id, author_id, status, current_content, published_artifact_id, published_at, created_at, updated_at FROM ${TABLE} WHERE id = $1`;
const SELECT_BY_AUTHOR = `SELECT id, title, subject_area_id, author_id, status, current_content, published_artifact_id, published_at, created_at, updated_at FROM ${TABLE} WHERE author_id = $1 ORDER BY created_at DESC`;

interface ScientificArticleRow {
  id: string;
  title: string;
  subject_area_id: string;
  author_id: string;
  status: string;
  current_content: string;
  published_artifact_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToArticle(row: ScientificArticleRow): ScientificArticle {
  return new ScientificArticle({
    articleId: createArticleId(row.id),
    title: row.title,
    content: row.current_content,
    subjectAreaId: createSubjectAreaId(row.subject_area_id),
    authorId: row.author_id,
    status: row.status as "draft" | "under_review" | "published",
    publishedArtifactId: row.published_artifact_id ?? undefined,
    publishedAt: row.published_at ? new Date(row.published_at) : undefined,
  });
}

export class PostgresScientificArticleRepository
  implements ScientificArticleRepositoryPort
{
  constructor(private readonly client: LabsDbClient) {}

  async save(article: ScientificArticle): Promise<void> {
    const now = new Date().toISOString();
    await this.client.execute(INSERT, [
      article.articleId as string,
      article.title,
      article.subjectAreaId as string,
      article.authorId,
      article.status,
      article.content,
      article.publishedArtifactId ?? null,
      article.publishedAt?.toISOString() ?? null,
      now,
      now,
    ]);
  }

  async findById(id: ArticleId): Promise<ScientificArticle | null> {
    const rows = await this.client.query<ScientificArticleRow>(SELECT_BY_ID, [
      id as string,
    ]);
    if (rows.length === 0) return null;
    return rowToArticle(rows[0]!);
  }

  async findByAuthor(authorId: string): Promise<ScientificArticle[]> {
    const rows = await this.client.query<ScientificArticleRow>(
      SELECT_BY_AUTHOR,
      [authorId]
    );
    return rows.map(rowToArticle);
  }
}
