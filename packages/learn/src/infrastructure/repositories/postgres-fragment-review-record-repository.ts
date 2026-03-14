/**
 * PostgreSQL implementation of FragmentReviewRecordPort (COMP-016.6).
 */

import type { FragmentId } from "@syntropy/types";
import type { Pool } from "pg";
import type {
  FragmentReviewAction,
  FragmentReviewRecordPort,
} from "../../domain/fragment-artifact/ports/fragment-review-record-port.js";

export class PostgresFragmentReviewRecordRepository
  implements FragmentReviewRecordPort
{
  constructor(private readonly pool: Pool) {}

  async recordReview(
    fragmentId: FragmentId,
    reviewerId: string,
    action: FragmentReviewAction,
    reason?: string
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO learn.fragment_review_log (fragment_id, reviewer_id, action, reason)
       VALUES ($1, $2, $3, $4)`,
      [fragmentId, reviewerId, action, reason ?? null]
    );
  }
}
