/**
 * Port for persisting fragment review decisions (COMP-016.6).
 * Stores approve/reject actions and rejection reason for audit.
 */

import type { FragmentId } from "@syntropy/types";

export type FragmentReviewAction = "approved" | "rejected";

export interface FragmentReviewRecordPort {
  recordReview(
    fragmentId: FragmentId,
    reviewerId: string,
    action: FragmentReviewAction,
    reason?: string
  ): Promise<void>;
}
