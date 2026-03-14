/**
 * Unit tests for RecommendationService (COMP-011.5).
 */

import { describe, it, expect, vi } from "vitest";
import { RecommendationService } from "./recommendation-service.js";
import { SearchIndex } from "../search-index.js";
import { Portfolio } from "../../portfolio-aggregation/portfolio.js";
import { XPTotal, ReputationScore } from "../../portfolio-aggregation/value-objects.js";
import type { PortfolioRepository } from "../../portfolio-aggregation/ports/portfolio-repository.js";
import type { SearchRepository } from "../ports/search-repository.js";

describe("RecommendationService", () => {
  it("compute returns RecommendationSet with up to 20 recommendations", async () => {
    const portfolio = Portfolio.create({
      userId: "user-1",
      xp: XPTotal.create(100),
      reputationScore: ReputationScore.create(0.5),
      achievements: [],
      skills: [{ skillName: "TypeScript", level: "intermediate", evidenceEventIds: [] }],
    });
    const findByUserId = vi.fn().mockResolvedValue(portfolio);
    const search = vi.fn().mockResolvedValue([
      SearchIndex.create({
        indexId: "track:1",
        entityType: "track",
        entityId: "t1",
        tsvectorContent: "TypeScript",
      }),
      SearchIndex.create({
        indexId: "article:1",
        entityType: "article",
        entityId: "a1",
        tsvectorContent: "TypeScript",
      }),
    ]);
    const repo = {
      findByUserId,
      save: vi.fn(),
    } as unknown as PortfolioRepository;
    const searchRepo = {
      search,
      upsert: vi.fn(),
      searchByVector: vi.fn(),
      updateEmbedding: vi.fn(),
      findById: vi.fn(),
      deleteByEntity: vi.fn(),
    } as unknown as SearchRepository;
    const service = new RecommendationService(repo, searchRepo);

    const set = await service.compute("user-1");

    expect(set.userId).toBe("user-1");
    expect(set.recommendations.length).toBeLessThanOrEqual(20);
    expect(set.recommendations.length).toBe(2);
    expect(findByUserId).toHaveBeenCalledWith("user-1");
    expect(search).toHaveBeenCalledWith("TypeScript");
    expect(set.recommendations[0]!.opportunityType).toBe("PublishedTrack");
    expect(set.recommendations[0]!.entityId).toBe("t1");
    expect(set.recommendations[1]!.opportunityType).toBe("LabsArticle");
  });

  it("compute uses default query when user has no portfolio", async () => {
    const findByUserId = vi.fn().mockResolvedValue(null);
    const search = vi.fn().mockResolvedValue([]);
    const repo = { findByUserId, save: vi.fn() } as unknown as PortfolioRepository;
    const searchRepo = {
      search,
      upsert: vi.fn(),
      searchByVector: vi.fn(),
      updateEmbedding: vi.fn(),
      findById: vi.fn(),
      deleteByEntity: vi.fn(),
    } as unknown as SearchRepository;
    const service = new RecommendationService(repo, searchRepo);

    const set = await service.compute("user-2");

    expect(set.userId).toBe("user-2");
    expect(set.recommendations).toEqual([]);
    expect(search).toHaveBeenCalledWith("learning development");
  });

  it("compute maps entity_type to OpportunityType correctly", async () => {
    const search = vi.fn().mockResolvedValue([
      SearchIndex.create({ indexId: "i:1", entityType: "issue", entityId: "1", tsvectorContent: "x" }),
      SearchIndex.create({ indexId: "inst:1", entityType: "institution", entityId: "1", tsvectorContent: "y" }),
    ]);
    const repo = { findByUserId: vi.fn().mockResolvedValue(null), save: vi.fn() } as unknown as PortfolioRepository;
    const searchRepo = {
      search,
      upsert: vi.fn(),
      searchByVector: vi.fn(),
      updateEmbedding: vi.fn(),
      findById: vi.fn(),
      deleteByEntity: vi.fn(),
    } as unknown as SearchRepository;
    const service = new RecommendationService(repo, searchRepo);

    const set = await service.compute("u");

    expect(set.recommendations[0]!.opportunityType).toBe("OpenIssue");
    expect(set.recommendations[1]!.opportunityType).toBe("InstitutionToJoin");
  });
});
