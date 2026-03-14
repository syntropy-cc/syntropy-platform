/**
 * PostgreSQL implementation of ReviewPassageLinkRepositoryPort (COMP-025.5).
 */

import { randomUUID } from "node:crypto";
import { createArticleId, createReviewId } from "@syntropy/types";
import { ReviewPassageLink } from "../../domain/open-peer-review/review-passage-link.js";
import type { ReviewPassageLinkRepositoryPort } from "../../domain/open-peer-review/ports/review-passage-link-repository-port.js";
import type { LabsDbClient } from "../labs-db-client.js";

const TABLE = "labs.review_passage_links";
const INSERT =
  `INSERT INTO ${TABLE} (id, review_id, article_id, start_offset, end_offset, comment, created_at) ` +
  `VALUES ($1, $2, $3, $4, $5, $6, $7) ` +
  `ON CONFLICT (id) DO UPDATE SET review_id = $2, article_id = $3, start_offset = $4, end_offset = $5, comment = $6`;
const SELECT_BY_REVIEW = `SELECT id, review_id, article_id, start_offset, end_offset, comment FROM ${TABLE} WHERE review_id = $1 ORDER BY start_offset ASC`;

interface ReviewPassageLinkRow {
  id: string;
  review_id: string;
  article_id: string;
  start_offset: number;
  end_offset: number;
  comment: string;
}

function rowToLink(row: ReviewPassageLinkRow): ReviewPassageLink {
  return new ReviewPassageLink({
    id: row.id,
    reviewId: createReviewId(row.review_id),
    articleId: createArticleId(row.article_id),
    startOffset: row.start_offset,
    endOffset: row.end_offset,
    comment: row.comment ?? "",
  });
}

export class PostgresReviewPassageLinkRepository
  implements ReviewPassageLinkRepositoryPort
{
  constructor(private readonly client: LabsDbClient) {}

  async save(link: ReviewPassageLink): Promise<void> {
    const id = link.id ?? randomUUID();
    const now = new Date().toISOString();
    await this.client.execute(INSERT, [
      id,
      link.reviewId as string,
      link.articleId as string,
      link.startOffset,
      link.endOffset,
      link.comment,
      now,
    ]);
  }

  async findByReviewId(reviewId: string): Promise<ReviewPassageLink[]> {
    const rows = await this.client.query<ReviewPassageLinkRow>(
      SELECT_BY_REVIEW,
      [reviewId as string]
    );
    return rows.map(rowToLink);
  }
}
