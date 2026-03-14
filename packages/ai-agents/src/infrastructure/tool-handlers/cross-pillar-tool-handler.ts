/**
 * Cross-pillar tool handlers (COMP-014.4).
 * search_all, get_portfolio, get_recommendations — synthesize from Search + Portfolio.
 */

import { z } from "zod";
import type {
  ToolDefinition,
  ToolResult,
} from "../../domain/orchestration/tool-types.js";
import type { CrossPillarToolPort } from "./ports/cross-pillar-ports.js";

const searchAllParamsSchema = z.object({
  query: z.string().min(1, "query is required"),
});

const getPortfolioParamsSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

const getRecommendationsParamsSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

/**
 * Creates cross-pillar tool definitions with handlers that call the port.
 * App wires the port with platform-core SearchService, PortfolioRepository,
 * and RecommendationService.
 */
export function createCrossPillarToolDefinitions(
  port: CrossPillarToolPort
): ToolDefinition[] {
  return [
    {
      name: "search_all",
      description: "Search across all pillars (Learn, Hub, Labs) by query",
      paramsSchema: searchAllParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { query } = searchAllParamsSchema.parse(params);
        try {
          const results = await port.searchAll(query);
          return { success: true, data: { results } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "get_portfolio",
      description: "Get a user's portfolio (XP, achievements, skills)",
      paramsSchema: getPortfolioParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { userId } = getPortfolioParamsSchema.parse(params);
        try {
          const portfolio = await port.getPortfolio(userId);
          if (!portfolio) {
            return { success: false, error: `Portfolio not found for user: ${userId}` };
          }
          return { success: true, data: portfolio };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "get_recommendations",
      description: "Get personalized recommendations for a user",
      paramsSchema: getRecommendationsParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { userId } = getRecommendationsParamsSchema.parse(params);
        try {
          const recommendations = await port.getRecommendations(userId);
          return { success: true, data: { recommendations } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
  ];
}
