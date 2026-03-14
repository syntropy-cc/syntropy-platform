/**
 * Labs pillar tool handlers (COMP-014.3).
 * get_article, search_articles, get_experiment, suggest_methodology.
 */

import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../domain/orchestration/tool-types.js";
import type { LabsToolPort } from "./ports/labs-ports.js";

const getArticleParamsSchema = z.object({
  id: z.string().min(1, "id is required"),
});

const searchArticlesParamsSchema = z.object({
  query: z.string().min(1, "query is required"),
});

const getExperimentParamsSchema = z.object({
  id: z.string().min(1, "id is required"),
});

const suggestMethodologyParamsSchema = z.object({
  subjectArea: z.string().min(1, "subjectArea is required"),
});

/**
 * Creates Labs tool definitions with handlers that call the Labs port.
 */
export function createLabsToolDefinitions(port: LabsToolPort): ToolDefinition[] {
  return [
    {
      name: "get_article",
      description: "Get an article by id",
      paramsSchema: getArticleParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { id } = getArticleParamsSchema.parse(params);
        try {
          const article = await port.getArticle(id);
          if (!article) {
            return { success: false, error: `Article not found: ${id}` };
          }
          return { success: true, data: article };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "search_articles",
      description: "Search articles by query",
      paramsSchema: searchArticlesParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { query } = searchArticlesParamsSchema.parse(params);
        try {
          const articles = await port.searchArticles(query);
          return { success: true, data: { articles } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "get_experiment",
      description: "Get an experiment by id",
      paramsSchema: getExperimentParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { id } = getExperimentParamsSchema.parse(params);
        try {
          const experiment = await port.getExperiment(id);
          if (!experiment) {
            return { success: false, error: `Experiment not found: ${id}` };
          }
          return { success: true, data: experiment };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "suggest_methodology",
      description: "Suggest methodologies for a subject area",
      paramsSchema: suggestMethodologyParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { subjectArea } = suggestMethodologyParamsSchema.parse(params);
        try {
          const methodologies = await port.suggestMethodology(subjectArea);
          return { success: true, data: { methodologies } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
  ];
}
