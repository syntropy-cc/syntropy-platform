/**
 * Cross-pillar domain ports for platform search and portfolio (COMP-014.4).
 * Implementations are wired by the app using platform-core SearchService,
 * PortfolioRepository, and RecommendationService.
 */

/** Summary of a search result for cross-pillar synthesis. */
export interface SearchResultSummary {
  indexId: string;
  entityType: string;
  entityId: string;
}

/** Summary of a user portfolio for cross-pillar context. */
export interface PortfolioSummary {
  userId: string;
  xp: number;
  reputationScore: number;
  achievementCount: number;
  skillNames: string[];
}

/** Summary of a single recommendation for cross-pillar synthesis. */
export interface RecommendationSummary {
  id: string;
  opportunityType: string;
  entityType: string;
  entityId: string;
  relevanceScore: number;
  reasoning: string | null;
}

/**
 * Port for cross-pillar tool handlers. App provides implementation using
 * platform-core Search and Portfolio/Recommendation domains.
 */
export interface CrossPillarToolPort {
  searchAll(query: string): Promise<SearchResultSummary[]>;
  getPortfolio(userId: string): Promise<PortfolioSummary | null>;
  getRecommendations(userId: string): Promise<RecommendationSummary[]>;
}
