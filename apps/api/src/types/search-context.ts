/**
 * Search & Recommendation context for REST API (COMP-011.7).
 * Injects search and recommendation services so routes can serve search and recommendations.
 */

import type {
  SearchService,
  RecommendationService,
  RecommendationRepository,
} from "@syntropy/platform-core";

export interface SearchContext {
  searchService: SearchService;
  recommendationService: RecommendationService;
  recommendationRepository: RecommendationRepository;
}
