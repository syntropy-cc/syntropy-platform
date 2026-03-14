/**
 * Unit tests for Learn tool handlers (COMP-014.1).
 */

import { describe, it, expect, vi } from "vitest";
import { createLearnToolDefinitions } from "../../../src/infrastructure/tool-handlers/learn-tool-handler.js";
import type { LearnToolPort } from "../../../src/infrastructure/tool-handlers/ports/learn-ports.js";

function createMockLearnPort(): LearnToolPort {
  return {
    searchFragments: vi.fn().mockResolvedValue([]),
    getFragment: vi.fn().mockResolvedValue(null),
    getLearnerProgress: vi.fn().mockResolvedValue({
      userId: "user-1",
      completedEntityIds: [],
      inProgressEntityIds: [],
    }),
    suggestNextContent: vi.fn().mockResolvedValue([]),
  };
}

describe("Learn tool handlers", () => {
  it("createLearnToolDefinitions returns four tools with correct names", () => {
    const port = createMockLearnPort();
    const defs = createLearnToolDefinitions(port);
    const names = defs.map((d) => d.name).sort();
    expect(names).toEqual([
      "get_fragment",
      "get_learner_progress",
      "search_fragments",
      "suggest_next_content",
    ]);
  });

  describe("search_fragments", () => {
    it("calls port.searchFragments and returns success with fragments", async () => {
      const port = createMockLearnPort();
      (port.searchFragments as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: "f1", title: "Intro" },
      ]);
      const defs = createLearnToolDefinitions(port);
      const tool = defs.find((d) => d.name === "search_fragments")!;
      const result = await tool.handler({ query: "intro" });

      expect(port.searchFragments).toHaveBeenCalledWith("intro");
      expect(result.success).toBe(true);
      expect((result as { data?: { fragments: unknown[] } }).data?.fragments).toEqual([
        { id: "f1", title: "Intro" },
      ]);
    });

    it("returns failure when port throws", async () => {
      const port = createMockLearnPort();
      (port.searchFragments as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Search failed")
      );
      const defs = createLearnToolDefinitions(port);
      const tool = defs.find((d) => d.name === "search_fragments")!;
      const result = await tool.handler({ query: "x" });

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toBe("Search failed");
    });
  });

  describe("get_fragment", () => {
    it("calls port.getFragment and returns success when fragment exists", async () => {
      const port = createMockLearnPort();
      (port.getFragment as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "f1",
        title: "Fragment 1",
        status: "published",
      });
      const defs = createLearnToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_fragment")!;
      const result = await tool.handler({ id: "f1" });

      expect(port.getFragment).toHaveBeenCalledWith("f1");
      expect(result.success).toBe(true);
      expect((result as { data?: { id: string } }).data?.id).toBe("f1");
    });

    it("returns failure when fragment not found", async () => {
      const port = createMockLearnPort();
      (port.getFragment as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const defs = createLearnToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_fragment")!;
      const result = await tool.handler({ id: "missing" });

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toContain("not found");
    });
  });

  describe("get_learner_progress", () => {
    it("calls port.getLearnerProgress and returns success with progress", async () => {
      const port = createMockLearnPort();
      (port.getLearnerProgress as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: "u1",
        completedEntityIds: ["f1"],
        inProgressEntityIds: ["f2"],
      });
      const defs = createLearnToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_learner_progress")!;
      const result = await tool.handler({ userId: "u1" });

      expect(port.getLearnerProgress).toHaveBeenCalledWith("u1");
      expect(result.success).toBe(true);
      expect((result as { data?: { completedEntityIds: string[] } }).data?.completedEntityIds).toEqual(["f1"]);
    });
  });

  describe("suggest_next_content", () => {
    it("calls port.suggestNextContent and returns success with suggestions", async () => {
      const port = createMockLearnPort();
      (port.suggestNextContent as ReturnType<typeof vi.fn>).mockResolvedValue([
        { entityId: "f1", entityType: "fragment", title: "Next" },
      ]);
      const defs = createLearnToolDefinitions(port);
      const tool = defs.find((d) => d.name === "suggest_next_content")!;
      const result = await tool.handler({ userId: "u1" });

      expect(port.suggestNextContent).toHaveBeenCalledWith("u1");
      expect(result.success).toBe(true);
      expect((result as { data?: { suggestions: unknown[] } }).data?.suggestions).toHaveLength(1);
    });
  });
});
