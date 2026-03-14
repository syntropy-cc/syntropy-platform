/**
 * PostgreSQL implementation of ReviewRepositoryPort (COMP-025.5).
 */

import { createArticleId, createReviewId } from "@syntropy/types";
import { Review } from "../../domain/open-peer-review/review.js";
import type { ReviewRepositoryPort } from "../../domain/open-peer-review/ports/review-repository-port.js";
import type { LabsDbClient } from "../labs-db-client.js";

const TABLE = "labs.reviews";
const INSERT =
  `INSERT INTO ${TABLE} (id, article_id, reviewer_id, status, content, submitted_at, published_at, created_at, updated_at) ` +
  `VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ` +
  `ON CONFLICT (id) DO UPDATE SET article_id = $2, reviewer_id = $3, status = $4, content = $5, submitted_at = $6, published_at = $7, updated_at = $9`;
const SELECT_BY_ID = `SELECT id, article_id, reviewer_id, status, content, submitted_at, published_at FROM ${TABLE} WHERE id = $1`;
const SELECT_BY_ARTICLE = `SELECT id, article_id, reviewer_id, status, content, submitted_at, published_at FROM ${TABLE} WHERE article_id = $1 ORDER BY created_at ASC`;

interface ReviewRow {
  id: string;
  article_id: string;
  reviewer_id: string;
  status: string;
  content: string;
  submitted_at: string | null;
  published_at: string | null;
}

function rowToReview(row: ReviewRow): Review {
  return new Review({
    reviewId: createReviewId(row.id),
    articleId: createArticleId(row.article_id),
    reviewerId: row.reviewer_id,
    status: row.status as "in_progress" | "submitted" | "published" | "embargoed",
    content: row.content ?? "",
    submittedAt: row.submitted_at ? new Date(row.submitted_at) : null,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
  });
}

export class PostgresReviewRepository implements ReviewRepositoryPort {
  constructor(private readonly client: LabsDbClient) {}

  async save(review: Review): Promise<void> {
    const now = new Date().toISOString();
    await this.client.execute(INSERT, [
      review.reviewId as string,
      review.articleId as string,
      review.reviewerId,
      review.status,
      review.content,
      review.submittedAt?.toISOString() ?? null,
      review.publishedAt?.toISOString() ?? null,
      now,
      now,
    ]);
  }

  async findById(id: string): Promise<Review | null> {
    const rows = await this.client.query<ReviewRow>(SELECT_BY_ID, [id]);
    if (rows.length === 0) return null;
    return rowToReview(rows[0]!);
  }

  async findByArticleId(articleId: string): Promise<Review[]> {
    const rows = await this.client.query<ReviewRow>(SELECT_BY_ARTICLE, [
      articleId as string,
    ]);
    return rows.map((r) => rowToReview(r));
  }
}
