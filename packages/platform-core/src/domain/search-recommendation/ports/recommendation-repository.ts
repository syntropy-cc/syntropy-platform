/**
 * Recommendation repository port (COMP-011.6).
 * Architecture: Platform Core — Search & Recommendation, PAT-004.
 */

import type { RecommendationSet } from "../recommendation-set.js";

/**
 * Repository for persisting and loading RecommendationSet per user.
 */
export interface RecommendationRepository {
  saveForUser(userId: string, set: RecommendationSet): Promise<void>;
  findByUserId(userId: string): Promise<RecommendationSet | null>;
}
