/**
 * PostgreSQL implementation of AuthorResponseRepositoryPort (COMP-025.5).
 */

import { createArticleId, createReviewId } from "@syntropy/types";
import { AuthorResponse } from "../../domain/open-peer-review/author-response.js";
import type { AuthorResponseRepositoryPort } from "../../domain/open-peer-review/ports/author-response-repository-port.js";
import type { LabsDbClient } from "../labs-db-client.js";

const TABLE = "labs.author_responses";
const INSERT =
  `INSERT INTO ${TABLE} (id, review_id, article_id, review_passage_link_id, responder_id, response_text, created_at) ` +
  `VALUES ($1, $2, $3, $4, $5, $6, $7) ` +
  `ON CONFLICT (id) DO UPDATE SET review_id = $2, article_id = $3, review_passage_link_id = $4, responder_id = $5, response_text = $6`;
const SELECT_BY_REVIEW = `SELECT id, review_id, article_id, review_passage_link_id, responder_id, response_text, created_at FROM ${TABLE} WHERE review_id = $1 ORDER BY created_at ASC`;

interface AuthorResponseRow {
  id: string;
  review_id: string;
  article_id: string;
  review_passage_link_id: string | null;
  responder_id: string;
  response_text: string;
  created_at: string;
}

function rowToResponse(row: AuthorResponseRow): AuthorResponse {
  return new AuthorResponse({
    id: row.id,
    reviewId: createReviewId(row.review_id),
    articleId: createArticleId(row.article_id),
    reviewPassageLinkId: row.review_passage_link_id,
    responderId: row.responder_id,
    responseText: row.response_text ?? "",
    createdAt: new Date(row.created_at),
  });
}

export class PostgresAuthorResponseRepository
  implements AuthorResponseRepositoryPort
{
  constructor(private readonly client: LabsDbClient) {}

  async save(response: AuthorResponse): Promise<void> {
    const now = response.createdAt?.toISOString() ?? new Date().toISOString();
    await this.client.execute(INSERT, [
      response.id,
      response.reviewId as string,
      response.articleId as string,
      response.reviewPassageLinkId,
      response.responderId,
      response.responseText,
      now,
    ]);
  }

  async findByReviewId(reviewId: string): Promise<AuthorResponse[]> {
    const rows = await this.client.query<AuthorResponseRow>(
      SELECT_BY_REVIEW,
      [reviewId as string]
    );
    return rows.map(rowToResponse);
  }
}
