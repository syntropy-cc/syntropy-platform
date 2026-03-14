/**
 * Learn pillar tool handlers (COMP-014.1).
 * search_fragments, get_fragment, get_learner_progress, suggest_next_content.
 */

import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../domain/orchestration/tool-types.js";
import type { LearnToolPort } from "./ports/learn-ports.js";

const searchFragmentsParamsSchema = z.object({
  query: z.string().min(1, "query is required"),
});

const getFragmentParamsSchema = z.object({
  id: z.string().min(1, "id is required"),
});

const getLearnerProgressParamsSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

const suggestNextContentParamsSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

/**
 * Creates Learn tool definitions with handlers that call the Learn port.
 * App wires the port with real Learn domain implementations.
 */
export function createLearnToolDefinitions(port: LearnToolPort): ToolDefinition[] {
  return [
    {
      name: "search_fragments",
      description: "Search learning fragments by query",
      paramsSchema: searchFragmentsParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { query } = searchFragmentsParamsSchema.parse(params);
        try {
          const results = await port.searchFragments(query);
          return { success: true, data: { fragments: results } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "get_fragment",
      description: "Get a fragment by id",
      paramsSchema: getFragmentParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { id } = getFragmentParamsSchema.parse(params);
        try {
          const fragment = await port.getFragment(id);
          if (!fragment) {
            return { success: false, error: `Fragment not found: ${id}` };
          }
          return { success: true, data: fragment };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "get_learner_progress",
      description: "Get learner progress for a user",
      paramsSchema: getLearnerProgressParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { userId } = getLearnerProgressParamsSchema.parse(params);
        try {
          const progress = await port.getLearnerProgress(userId);
          return { success: true, data: progress };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "suggest_next_content",
      description: "Suggest next learning content for a user",
      paramsSchema: suggestNextContentParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { userId } = suggestNextContentParamsSchema.parse(params);
        try {
          const suggestions = await port.suggestNextContent(userId);
          return { success: true, data: { suggestions } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
  ];
}
