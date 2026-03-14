/**
 * Integration tests for PostgresRecommendationRepository (COMP-011.6).
 * Uses mock client to verify save/load shape.
 */

import { describe, it, expect } from "vitest";
import { PostgresRecommendationRepository } from "./postgres-recommendation-repository.js";
import { RecommendationSet } from "../../domain/search-recommendation/recommendation-set.js";
import { Recommendation } from "../../domain/search-recommendation/recommendation.js";
import type { EventLogClient } from "../../event-log/EventLogClient.js";

function createMockClient(): EventLogClient & {
  executed: Array<{ sql: string; params: unknown[] }>;
  recommendationSets: Map<string, { generated_at: Date }>;
  recommendations: Array<{
    id: string;
    user_id: string;
    opportunity_type: string;
    entity_type: string;
    entity_id: string;
    relevance_score: number;
    reasoning: string | null;
    was_clicked: boolean;
    generated_at: Date;
  }>;
} {
  const executed: Array<{ sql: string; params: unknown[] }> = [];
  const recommendationSets = new Map<string, { generated_at: Date }>();
  const recommendations: Array<{
    id: string;
    user_id: string;
    opportunity_type: string;
    entity_type: string;
    entity_id: string;
    relevance_score: number;
    reasoning: string | null;
    was_clicked: boolean;
    generated_at: Date;
  }> = [];

  return {
    executed,
    recommendationSets,
    recommendations,
    async execute(sql: string, params: unknown[]): Promise<void> {
      executed.push({ sql, params });
      const s = sql.trim();
      if (s.includes("recommendation_sets") && s.includes("INSERT")) {
        recommendationSets.set(String(params[0]), { generated_at: params[1] as Date });
      }
      if (s.includes("DELETE FROM platform_core.recommendations")) {
        const uid = String(params[0]);
        for (let i = recommendations.length - 1; i >= 0; i--) {
          if (recommendations[i]!.user_id === uid) recommendations.splice(i, 1);
        }
      }
      if (s.includes("INSERT INTO platform_core.recommendations")) {
        recommendations.push({
          id: String(params[0]),
          user_id: String(params[1]),
          opportunity_type: String(params[2]),
          entity_type: String(params[3]),
          entity_id: String(params[4]),
          relevance_score: Number(params[5]),
          reasoning: (params[6] as string) ?? null,
          was_clicked: Boolean(params[7]),
          generated_at: params[8] as Date,
        });
      }
    },
    async query<T>(sql: string, params: unknown[]): Promise<T[]> {
      const s = sql.trim();
      if (s.includes("recommendation_sets") && s.includes("WHERE user_id")) {
        const uid = String(params[0]);
        const set = recommendationSets.get(uid);
        if (!set) return [] as T[];
        return [{ user_id: uid, generated_at: set.generated_at }] as T[];
      }
      if (s.includes("FROM platform_core.recommendations") && s.includes("WHERE user_id")) {
        const uid = String(params[0]);
        return recommendations.filter((r) => r.user_id === uid) as T[];
      }
      return [];
    },
  };
}

describe("PostgresRecommendationRepository", () => {
  it("saveForUser inserts set and recommendations", async () => {
    const client = createMockClient();
    const repo = new PostgresRecommendationRepository(client);
    const rec1 = Recommendation.create({
      id: "rec-1",
      opportunityType: "PublishedTrack",
      entityType: "track",
      entityId: "t1",
      relevanceScore: 0.9,
      reasoning: "Matches your skills",
      generatedAt: new Date(),
    });
    const set = RecommendationSet.create({
      userId: "user-1",
      generatedAt: new Date(),
      recommendations: [rec1],
    });
    await repo.saveForUser("user-1", set);
    expect(client.recommendationSets.get("user-1")).toBeDefined();
    expect(client.recommendations.length).toBe(1);
    expect(client.recommendations[0]!.entity_id).toBe("t1");
  });

  it("findByUserId returns null when no set exists", async () => {
    const client = createMockClient();
    const repo = new PostgresRecommendationRepository(client);
    const found = await repo.findByUserId("user-2");
    expect(found).toBeNull();
  });

  it("findByUserId returns RecommendationSet when saved", async () => {
    const client = createMockClient();
    client.recommendationSets.set("user-3", { generated_at: new Date() });
    client.recommendations.push({
      id: "r1",
      user_id: "user-3",
      opportunity_type: "OpenIssue",
      entity_type: "issue",
      entity_id: "i1",
      relevance_score: 0.8,
      reasoning: null,
      was_clicked: false,
      generated_at: new Date(),
    });
    const repo = new PostgresRecommendationRepository(client);
    const found = await repo.findByUserId("user-3");
    expect(found).not.toBeNull();
    expect(found!.userId).toBe("user-3");
    expect(found!.recommendations.length).toBe(1);
    expect(found!.recommendations[0]!.opportunityType).toBe("OpenIssue");
    expect(found!.recommendations[0]!.entityId).toBe("i1");
  });
});
