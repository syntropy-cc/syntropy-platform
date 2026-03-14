/**
 * Unit tests for ToolDefinition and validateToolInput (COMP-013.2).
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  createToolDefinition,
  validateToolInput,
  type ToolDefinition,
} from "../../../src/domain/registry/tool-definition.js";

const testSchema = z.object({
  query: z.string(),
  limit: z.number().optional().default(10),
});

describe("ToolDefinition", () => {
  it("createToolDefinition returns immutable definition with toolId name description inputSchema requiredRole", () => {
    const tool = createToolDefinition({
      toolId: "tool-search-1",
      name: "search",
      description: "Search fragments",
      inputSchema: testSchema,
      requiredRole: "creator",
    });
    expect(tool.toolId).toBe("tool-search-1");
    expect(tool.name).toBe("search");
    expect(tool.description).toBe("Search fragments");
    expect(tool.inputSchema).toBe(testSchema);
    expect(tool.requiredRole).toBe("creator");
  });

  it("createToolDefinition accepts optional description", () => {
    const tool = createToolDefinition({
      toolId: "tool-1",
      name: "tool1",
      inputSchema: z.object({}),
      requiredRole: "learner",
    });
    expect(tool.description).toBeUndefined();
  });
});

describe("validateToolInput", () => {
  const tool: ToolDefinition = createToolDefinition({
    toolId: "tool-search-1",
    name: "search",
    inputSchema: testSchema,
    requiredRole: "creator",
  });

  it("returns parsed value when params satisfy schema", () => {
    const params = { query: "test", limit: 5 };
    const result = validateToolInput(tool, params);
    expect(result).toEqual({ query: "test", limit: 5 });
  });

  it("applies schema defaults when params omit optional fields", () => {
    const result = validateToolInput(tool, { query: "x" });
    expect(result).toEqual({ query: "x", limit: 10 });
  });

  it("throws ZodError when params invalid", () => {
    expect(() => validateToolInput(tool, { query: 123 })).toThrow(z.ZodError);
    expect(() => validateToolInput(tool, {})).toThrow(z.ZodError);
    expect(() => validateToolInput(tool, null)).toThrow(z.ZodError);
  });
});
