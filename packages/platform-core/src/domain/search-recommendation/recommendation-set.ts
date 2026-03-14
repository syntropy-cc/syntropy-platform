/**
 * RecommendationSet aggregate — personalized set of recommendations for a user (COMP-011.5, COMP-011.6).
 * Architecture: Platform Core — Search & Recommendation.
 */

import type { Recommendation } from "./recommendation.js";

export interface RecommendationSetParams {
  userId: string;
  generatedAt: Date;
  recommendations: Recommendation[];
}

export class RecommendationSet {
  readonly userId: string;
  readonly generatedAt: Date;
  readonly recommendations: readonly Recommendation[];

  private constructor(params: RecommendationSetParams) {
    this.userId = params.userId;
    this.generatedAt = params.generatedAt;
    this.recommendations = params.recommendations;
  }

  static create(params: RecommendationSetParams): RecommendationSet {
    return new RecommendationSet(params);
  }

  recordClick(recommendationId: string): RecommendationSet {
    const updated = this.recommendations.map((r) =>
      r.id === recommendationId ? r.recordClick() : r
    );
    return new RecommendationSet({
      userId: this.userId,
      generatedAt: this.generatedAt,
      recommendations: updated,
    });
  }
}
