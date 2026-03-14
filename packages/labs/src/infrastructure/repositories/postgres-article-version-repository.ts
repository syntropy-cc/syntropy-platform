/**
 * PostgreSQL implementation of ArticleVersionRepositoryPort (COMP-023.5).
 */

import { randomUUID } from "node:crypto";
import type { ArticleId } from "@syntropy/types";
import { createArticleId } from "@syntropy/types";
import { ArticleVersion } from "../../domain/article-editor/article-version.js";
import type { ArticleVersionRepositoryPort } from "../../domain/article-editor/ports/article-version-repository-port.js";
import type { LabsDbClient } from "../labs-db-client.js";

const TABLE = "labs.article_versions";
const INSERT =
  `INSERT INTO ${TABLE} (id, article_id, version_number, myst_content, content_hash, created_by, created_at) ` +
  `VALUES ($1, $2, $3, $4, $5, $6, $7)`;
const SELECT_LATEST =
  `SELECT id, article_id, version_number, myst_content, content_hash, created_by, created_at FROM ${TABLE} ` +
  `WHERE article_id = $1 ORDER BY version_number DESC LIMIT 1`;
const SELECT_BY_ARTICLE =
  `SELECT id, article_id, version_number, myst_content, content_hash, created_by, created_at FROM ${TABLE} ` +
  `WHERE article_id = $1 ORDER BY version_number ASC`;

interface ArticleVersionRow {
  id: string;
  article_id: string;
  version_number: number;
  myst_content: string;
  content_hash: string | null;
  created_by: string;
  created_at: string;
}

function rowToVersion(row: ArticleVersionRow): ArticleVersion {
  return new ArticleVersion({
    articleId: createArticleId(row.article_id),
    versionNumber: row.version_number,
    mystContent: row.myst_content,
    contentHash: row.content_hash ?? undefined,
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
  });
}

export class PostgresArticleVersionRepository
  implements ArticleVersionRepositoryPort
{
  constructor(private readonly client: LabsDbClient) {}

  async appendVersion(version: ArticleVersion): Promise<void> {
    const id = randomUUID();
    await this.client.execute(INSERT, [
      id,
      version.articleId as string,
      version.versionNumber,
      version.mystContent,
      version.contentHash ?? null,
      version.createdBy,
      version.createdAt.toISOString(),
    ]);
  }

  async getLatest(articleId: ArticleId): Promise<ArticleVersion | null> {
    const rows = await this.client.query<ArticleVersionRow>(SELECT_LATEST, [
      articleId as string,
    ]);
    if (rows.length === 0) return null;
    return rowToVersion(rows[0]!);
  }

  async listByArticleId(articleId: ArticleId): Promise<ArticleVersion[]> {
    const rows = await this.client.query<ArticleVersionRow>(SELECT_BY_ARTICLE, [
      articleId as string,
    ]);
    return rows.map(rowToVersion);
  }
}
