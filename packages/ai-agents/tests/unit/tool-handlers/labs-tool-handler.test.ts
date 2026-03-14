/**
 * Unit tests for Labs tool handlers (COMP-014.3).
 */

import { describe, it, expect, vi } from "vitest";
import { createLabsToolDefinitions } from "../../../src/infrastructure/tool-handlers/labs-tool-handler.js";
import type { LabsToolPort } from "../../../src/infrastructure/tool-handlers/ports/labs-ports.js";

function createMockLabsPort(): LabsToolPort {
  return {
    getArticle: vi.fn().mockResolvedValue(null),
    searchArticles: vi.fn().mockResolvedValue([]),
    getExperiment: vi.fn().mockResolvedValue(null),
    suggestMethodology: vi.fn().mockResolvedValue([]),
  };
}

describe("Labs tool handlers", () => {
  it("createLabsToolDefinitions returns four tools with correct names", () => {
    const port = createMockLabsPort();
    const defs = createLabsToolDefinitions(port);
    const names = defs.map((d) => d.name).sort();
    expect(names).toEqual([
      "get_article",
      "get_experiment",
      "search_articles",
      "suggest_methodology",
    ]);
  });

  describe("get_article", () => {
    it("calls port.getArticle and returns success when article exists", async () => {
      const port = createMockLabsPort();
      (port.getArticle as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "a1",
        title: "Paper",
        status: "submitted",
      });
      const defs = createLabsToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_article")!;
      const result = await tool.handler({ id: "a1" });

      expect(port.getArticle).toHaveBeenCalledWith("a1");
      expect(result.success).toBe(true);
      expect((result as { data?: { id: string } }).data?.id).toBe("a1");
    });

    it("returns failure when article not found", async () => {
      const port = createMockLabsPort();
      (port.getArticle as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const defs = createLabsToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_article")!;
      const result = await tool.handler({ id: "missing" });

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toContain("not found");
    });
  });

  describe("search_articles", () => {
    it("calls port.searchArticles and returns success with articles", async () => {
      const port = createMockLabsPort();
      (port.searchArticles as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: "a1", title: "Study 1" },
      ]);
      const defs = createLabsToolDefinitions(port);
      const tool = defs.find((d) => d.name === "search_articles")!;
      const result = await tool.handler({ query: "study" });

      expect(port.searchArticles).toHaveBeenCalledWith("study");
      expect(result.success).toBe(true);
      expect((result as { data?: { articles: unknown[] } }).data?.articles).toHaveLength(1);
    });
  });

  describe("get_experiment", () => {
    it("returns success when experiment exists", async () => {
      const port = createMockLabsPort();
      (port.getExperiment as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "e1",
        title: "Exp 1",
        status: "completed",
      });
      const defs = createLabsToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_experiment")!;
      const result = await tool.handler({ id: "e1" });

      expect(port.getExperiment).toHaveBeenCalledWith("e1");
      expect(result.success).toBe(true);
      expect((result as { data?: { id: string } }).data?.id).toBe("e1");
    });
  });

  describe("suggest_methodology", () => {
    it("calls port.suggestMethodology and returns success with methodologies", async () => {
      const port = createMockLabsPort();
      (port.suggestMethodology as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: "m1", name: "Qualitative", description: "Interviews" },
      ]);
      const defs = createLabsToolDefinitions(port);
      const tool = defs.find((d) => d.name === "suggest_methodology")!;
      const result = await tool.handler({ subjectArea: "cs" });

      expect(port.suggestMethodology).toHaveBeenCalledWith("cs");
      expect(result.success).toBe(true);
      expect((result as { data?: { methodologies: unknown[] } }).data?.methodologies).toHaveLength(1);
    });
  });
});
