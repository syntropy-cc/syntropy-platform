/**
 * Recommendation service — computes personalized RecommendationSet from portfolio + search (COMP-011.5).
 * Architecture: Platform Core — Search & Recommendation.
 */

import type { PortfolioRepository } from "../../portfolio-aggregation/ports/portfolio-repository.js";
import type { SearchRepository } from "../ports/search-repository.js";
import { RecommendationSet } from "../recommendation-set.js";
import { Recommendation } from "../recommendation.js";
import type { OpportunityType } from "../recommendation.js";
const TOP_N = 20;

/** Map entity_type to OpportunityType for recommendations. */
function entityTypeToOpportunityType(entityType: string): OpportunityType {
  const lower = entityType.toLowerCase();
  if (lower === "issue" || lower === "contribution") return "OpenIssue";
  if (lower === "track" || lower === "course") return "PublishedTrack";
  if (lower === "article") return "LabsArticle";
  if (lower === "institution") return "InstitutionToJoin";
  return "PublishedTrack";
}

export interface RecommendationServiceOptions {
  portfolioRepository: PortfolioRepository;
  searchRepository: SearchRepository;
}

/**
 * Builds RecommendationSet from portfolio skills + search similarity. Top 20 per user.
 */
export class RecommendationService {
  constructor(
    private readonly portfolioRepository: PortfolioRepository,
    private readonly searchRepository: SearchRepository
  ) {}

  /**
   * Compute personalized recommendations for a user. Uses portfolio skills to drive search, then maps results to Recommendation.
   */
  async compute(userId: string): Promise<RecommendationSet> {
    const portfolio = await this.portfolioRepository.findByUserId(userId);
    const query =
      portfolio && portfolio.skills.length > 0
        ? portfolio.skills.map((s) => s.skillName).join(" ")
        : "learning development";
    const candidates = await this.searchRepository.search(query);
    const sorted = candidates.slice(0, TOP_N);
    const recommendations = sorted.map((doc, i) =>
      Recommendation.create({
        id: `rec-${userId}-${doc.indexId}-${i}`,
        opportunityType: entityTypeToOpportunityType(doc.entityType),
        entityType: doc.entityType,
        entityId: doc.entityId,
        relevanceScore: 1 - i / Math.max(TOP_N, 1),
        reasoning: `Matches your interests`,
        generatedAt: new Date(),
      })
    );
    return RecommendationSet.create({
      userId,
      generatedAt: new Date(),
      recommendations,
    });
  }
}
