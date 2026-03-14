/**
 * Hub pillar tool handlers (COMP-014.2).
 * get_issues, get_contribution, analyze_contribution, get_institution_summary.
 */

import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../domain/orchestration/tool-types.js";
import type { HubToolPort } from "./ports/hub-ports.js";

const getIssuesParamsSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
});

const getContributionParamsSchema = z.object({
  id: z.string().min(1, "id is required"),
});

const analyzeContributionParamsSchema = z.object({
  id: z.string().min(1, "id is required"),
});

const getInstitutionSummaryParamsSchema = z.object({
  id: z.string().min(1, "id is required"),
});

/**
 * Creates Hub tool definitions with handlers that call the Hub port.
 */
export function createHubToolDefinitions(port: HubToolPort): ToolDefinition[] {
  return [
    {
      name: "get_issues",
      description: "Get issues for a project",
      paramsSchema: getIssuesParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { projectId } = getIssuesParamsSchema.parse(params);
        try {
          const issues = await port.getIssues(projectId);
          return { success: true, data: { issues } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "get_contribution",
      description: "Get a contribution by id",
      paramsSchema: getContributionParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { id } = getContributionParamsSchema.parse(params);
        try {
          const contribution = await port.getContribution(id);
          if (!contribution) {
            return { success: false, error: `Contribution not found: ${id}` };
          }
          return { success: true, data: contribution };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "analyze_contribution",
      description: "Analyze a contribution (status, linked issues, summary)",
      paramsSchema: analyzeContributionParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { id } = analyzeContributionParamsSchema.parse(params);
        try {
          const analysis = await port.analyzeContribution(id);
          return { success: true, data: analysis };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "get_institution_summary",
      description: "Get institution summary by id",
      paramsSchema: getInstitutionSummaryParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { id } = getInstitutionSummaryParamsSchema.parse(params);
        try {
          const summary = await port.getInstitutionSummary(id);
          if (!summary) {
            return { success: false, error: `Institution not found: ${id}` };
          }
          return { success: true, data: summary };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
  ];
}
