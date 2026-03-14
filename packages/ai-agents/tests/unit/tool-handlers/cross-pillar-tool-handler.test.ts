/**
 * Unit tests for cross-pillar tool handlers (COMP-014.4).
 */

import { describe, it, expect, vi } from "vitest";
import { createCrossPillarToolDefinitions } from "../../../src/infrastructure/tool-handlers/cross-pillar-tool-handler.js";
import type { CrossPillarToolPort } from "../../../src/infrastructure/tool-handlers/ports/cross-pillar-ports.js";

function createMockCrossPillarPort(): CrossPillarToolPort {
  return {
    searchAll: vi.fn().mockResolvedValue([]),
    getPortfolio: vi.fn().mockResolvedValue(null),
    getRecommendations: vi.fn().mockResolvedValue([]),
  };
}

describe("Cross-pillar tool handlers", () => {
  it("createCrossPillarToolDefinitions returns three tools with correct names", () => {
    const port = createMockCrossPillarPort();
    const defs = createCrossPillarToolDefinitions(port);
    const names = defs.map((d) => d.name).sort();
    expect(names).toEqual(["get_portfolio", "get_recommendations", "search_all"]);
  });

  describe("search_all", () => {
    it("calls port.searchAll and returns success with results", async () => {
      const port = createMockCrossPillarPort();
      (port.searchAll as ReturnType<typeof vi.fn>).mockResolvedValue([
        { indexId: "idx-1", entityType: "track", entityId: "t1" },
      ]);
      const defs = createCrossPillarToolDefinitions(port);
      const tool = defs.find((d) => d.name === "search_all")!;
      const result = await tool.handler({ query: "typescript" });

      expect(port.searchAll).toHaveBeenCalledWith("typescript");
      expect(result.success).toBe(true);
      expect((result as { data?: { results: unknown[] } }).data?.results).toEqual([
        { indexId: "idx-1", entityType: "track", entityId: "t1" },
      ]);
    });

    it("returns failure when port throws", async () => {
      const port = createMockCrossPillarPort();
      (port.searchAll as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Search failed")
      );
      const defs = createCrossPillarToolDefinitions(port);
      const tool = defs.find((d) => d.name === "search_all")!;
      const result = await tool.handler({ query: "x" });

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toBe("Search failed");
    });
  });

  describe("get_portfolio", () => {
    it("calls port.getPortfolio and returns success when portfolio exists", async () => {
      const port = createMockCrossPillarPort();
      (port.getPortfolio as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: "u1",
        xp: 100,
        reputationScore: 50,
        achievementCount: 2,
        skillNames: ["TypeScript", "React"],
      });
      const defs = createCrossPillarToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_portfolio")!;
      const result = await tool.handler({ userId: "u1" });

      expect(port.getPortfolio).toHaveBeenCalledWith("u1");
      expect(result.success).toBe(true);
      expect((result as { data?: { userId: string } }).data?.userId).toBe("u1");
      expect((result as { data?: { xp: number } }).data?.xp).toBe(100);
    });

    it("returns failure when portfolio not found", async () => {
      const port = createMockCrossPillarPort();
      (port.getPortfolio as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const defs = createCrossPillarToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_portfolio")!;
      const result = await tool.handler({ userId: "missing" });

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toContain("not found");
    });

    it("returns failure when port throws", async () => {
      const port = createMockCrossPillarPort();
      (port.getPortfolio as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("DB error")
      );
      const defs = createCrossPillarToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_portfolio")!;
      const result = await tool.handler({ userId: "u1" });

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toBe("DB error");
    });
  });

  describe("get_recommendations", () => {
    it("calls port.getRecommendations and returns success with recommendations", async () => {
      const port = createMockCrossPillarPort();
      (port.getRecommendations as ReturnType<typeof vi.fn>).mockResolvedValue([
        {
          id: "rec-1",
          opportunityType: "PublishedTrack",
          entityType: "track",
          entityId: "t1",
          relevanceScore: 0.9,
          reasoning: "Matches your interests",
        },
      ]);
      const defs = createCrossPillarToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_recommendations")!;
      const result = await tool.handler({ userId: "u1" });

      expect(port.getRecommendations).toHaveBeenCalledWith("u1");
      expect(result.success).toBe(true);
      expect((result as { data?: { recommendations: unknown[] } }).data?.recommendations).toHaveLength(1);
    });

    it("returns failure when port throws", async () => {
      const port = createMockCrossPillarPort();
      (port.getRecommendations as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Recommendation service unavailable")
      );
      const defs = createCrossPillarToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_recommendations")!;
      const result = await tool.handler({ userId: "u1" });

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toBe(
        "Recommendation service unavailable"
      );
    });
  });
});
