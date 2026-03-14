/**
 * PostgreSQL implementation of RecommendationRepository (COMP-011.6).
 */

import type { EventLogClient } from "../../event-log/EventLogClient.js";
import type { RecommendationRepository } from "../../domain/search-recommendation/ports/recommendation-repository.js";
import { RecommendationSet } from "../../domain/search-recommendation/recommendation-set.js";
import { Recommendation } from "../../domain/search-recommendation/recommendation.js";
import type { OpportunityType } from "../../domain/search-recommendation/recommendation.js";

interface RecommendationRow {
  id: string;
  user_id: string;
  opportunity_type: string;
  entity_type: string;
  entity_id: string;
  relevance_score: number;
  reasoning: string | null;
  was_clicked: boolean;
  generated_at: Date;
}

const UPSERT_SET_SQL = `
  INSERT INTO platform_core.recommendation_sets (user_id, generated_at, updated_at)
  VALUES ($1, $2, now())
  ON CONFLICT (user_id)
  DO UPDATE SET generated_at = EXCLUDED.generated_at, updated_at = now()
`;

const DELETE_RECOMMENDATIONS_SQL = `
  DELETE FROM platform_core.recommendations WHERE user_id = $1
`;

const INSERT_RECOMMENDATION_SQL = `
  INSERT INTO platform_core.recommendations (id, user_id, opportunity_type, entity_type, entity_id, relevance_score, reasoning, was_clicked, generated_at, updated_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
`;

const FIND_SET_SQL = `
  SELECT user_id, generated_at FROM platform_core.recommendation_sets WHERE user_id = $1
`;

const FIND_RECOMMENDATIONS_SQL = `
  SELECT id, user_id, opportunity_type, entity_type, entity_id, relevance_score, reasoning, was_clicked, generated_at
  FROM platform_core.recommendations WHERE user_id = $1 ORDER BY relevance_score DESC
`;

export class PostgresRecommendationRepository implements RecommendationRepository {
  constructor(private readonly client: EventLogClient) {}

  async saveForUser(userId: string, set: RecommendationSet): Promise<void> {
    await this.client.execute(UPSERT_SET_SQL.trim(), [
      userId,
      set.generatedAt,
    ]);
    await this.client.execute(DELETE_RECOMMENDATIONS_SQL.trim(), [userId]);
    for (const r of set.recommendations) {
      await this.client.execute(INSERT_RECOMMENDATION_SQL.trim(), [
        r.id,
        userId,
        r.opportunityType,
        r.entityType,
        r.entityId,
        r.relevanceScore,
        r.reasoning,
        r.wasClicked,
        r.generatedAt,
      ]);
    }
  }

  async findByUserId(userId: string): Promise<RecommendationSet | null> {
    const setRows = await this.client.query<{ user_id: string; generated_at: Date }>(
      FIND_SET_SQL.trim(),
      [userId]
    );
    if (setRows.length === 0) return null;

    const recRows = await this.client.query<RecommendationRow>(
      FIND_RECOMMENDATIONS_SQL.trim(),
      [userId]
    );
    const recommendations = recRows.map((row) =>
      Recommendation.create({
        id: row.id,
        opportunityType: row.opportunity_type as OpportunityType,
        entityType: row.entity_type,
        entityId: row.entity_id,
        relevanceScore: row.relevance_score,
        reasoning: row.reasoning,
        wasClicked: row.was_clicked,
        generatedAt: new Date(row.generated_at),
      })
    );
    return RecommendationSet.create({
      userId: setRows[0]!.user_id,
      generatedAt: new Date(setRows[0]!.generated_at),
      recommendations,
    });
  }
}
