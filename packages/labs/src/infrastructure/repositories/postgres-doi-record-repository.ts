/**
 * PostgreSQL implementation of DOIRecordRepositoryPort (COMP-026.3).
 */

import type { ArticleId } from "@syntropy/types";
import { createArticleId } from "@syntropy/types";
import { DOIRecord, createDoiRecordId } from "../../domain/doi-publication/doi-record.js";
import { isDOIStatus } from "../../domain/doi-publication/doi-status.js";
import type { DOIRecordRepositoryPort } from "../../domain/doi-publication/ports/doi-record-repository-port.js";
import type { LabsDbClient } from "../labs-db-client.js";

const TABLE = "labs.doi_records";
const INSERT =
  `INSERT INTO ${TABLE} (id, article_id, doi, datacite_id, status, registered_at, updated_at) ` +
  `VALUES ($1, $2, $3, $4, $5, $6, $7) ` +
  `ON CONFLICT (id) DO UPDATE SET doi = $3, datacite_id = $4, status = $5, registered_at = $6, updated_at = $7`;
const SELECT_BY_ARTICLE =
  `SELECT id, article_id, doi, datacite_id, status, registered_at, updated_at FROM ${TABLE} WHERE article_id = $1`;

interface DOIRecordRow {
  id: string;
  article_id: string;
  doi: string;
  datacite_id: string | null;
  status: string;
  registered_at: string;
  updated_at: string;
}

function rowToDOIRecord(row: DOIRecordRow): DOIRecord {
  const status = row.status as "draft" | "registered" | "findable";
  if (!isDOIStatus(status)) {
    throw new Error(`Invalid DOI status in DB: ${row.status}`);
  }
  return new DOIRecord({
    doiId: createDoiRecordId(row.id),
    articleId: createArticleId(row.article_id),
    doi: row.doi,
    registeredAt: new Date(row.registered_at),
    status,
  });
}

export class PostgresDOIRecordRepository implements DOIRecordRepositoryPort {
  constructor(private readonly client: LabsDbClient) {}

  async save(record: DOIRecord): Promise<void> {
    const now = new Date().toISOString();
    await this.client.execute(INSERT, [
      record.doiId as string,
      record.articleId as string,
      record.doi,
      null,
      record.status,
      record.registeredAt.toISOString(),
      now,
    ]);
  }

  async findByArticleId(articleId: ArticleId): Promise<DOIRecord | null> {
    const rows = await this.client.query<DOIRecordRow>(SELECT_BY_ARTICLE, [
      articleId as string,
    ]);
    if (rows.length === 0) return null;
    return rowToDOIRecord(rows[0]!);
  }
}
