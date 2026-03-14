/**
 * Unit tests for Hub tool handlers (COMP-014.2).
 */

import { describe, it, expect, vi } from "vitest";
import { createHubToolDefinitions } from "../../../src/infrastructure/tool-handlers/hub-tool-handler.js";
import type { HubToolPort } from "../../../src/infrastructure/tool-handlers/ports/hub-ports.js";

function createMockHubPort(): HubToolPort {
  return {
    getIssues: vi.fn().mockResolvedValue([]),
    getContribution: vi.fn().mockResolvedValue(null),
    analyzeContribution: vi.fn().mockResolvedValue({
      contributionId: "c1",
      status: "submitted",
      title: "Fix bug",
      linkedIssueCount: 0,
    }),
    getInstitutionSummary: vi.fn().mockResolvedValue(null),
  };
}

describe("Hub tool handlers", () => {
  it("createHubToolDefinitions returns four tools with correct names", () => {
    const port = createMockHubPort();
    const defs = createHubToolDefinitions(port);
    const names = defs.map((d) => d.name).sort();
    expect(names).toEqual([
      "analyze_contribution",
      "get_contribution",
      "get_institution_summary",
      "get_issues",
    ]);
  });

  describe("get_issues", () => {
    it("calls port.getIssues and returns success with issues", async () => {
      const port = createMockHubPort();
      (port.getIssues as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: "i1", projectId: "p1", title: "Issue 1", status: "open" },
      ]);
      const defs = createHubToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_issues")!;
      const result = await tool.handler({ projectId: "p1" });

      expect(port.getIssues).toHaveBeenCalledWith("p1");
      expect(result.success).toBe(true);
      expect((result as { data?: { issues: unknown[] } }).data?.issues).toHaveLength(1);
    });
  });

  describe("get_contribution", () => {
    it("returns success when contribution exists", async () => {
      const port = createMockHubPort();
      (port.getContribution as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "c1",
        projectId: "p1",
        contributorId: "u1",
        title: "PR",
        status: "in_review",
      });
      const defs = createHubToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_contribution")!;
      const result = await tool.handler({ id: "c1" });

      expect(port.getContribution).toHaveBeenCalledWith("c1");
      expect(result.success).toBe(true);
      expect((result as { data?: { id: string } }).data?.id).toBe("c1");
    });

    it("returns failure when contribution not found", async () => {
      const port = createMockHubPort();
      (port.getContribution as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const defs = createHubToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_contribution")!;
      const result = await tool.handler({ id: "missing" });

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toContain("not found");
    });
  });

  describe("analyze_contribution", () => {
    it("calls port.analyzeContribution and returns success with analysis", async () => {
      const port = createMockHubPort();
      (port.analyzeContribution as ReturnType<typeof vi.fn>).mockResolvedValue({
        contributionId: "c1",
        status: "accepted",
        title: "Fix",
        linkedIssueCount: 2,
        summary: "Ready to merge",
      });
      const defs = createHubToolDefinitions(port);
      const tool = defs.find((d) => d.name === "analyze_contribution")!;
      const result = await tool.handler({ id: "c1" });

      expect(port.analyzeContribution).toHaveBeenCalledWith("c1");
      expect(result.success).toBe(true);
      expect((result as { data?: { linkedIssueCount: number } }).data?.linkedIssueCount).toBe(2);
    });
  });

  describe("get_institution_summary", () => {
    it("returns success when institution exists", async () => {
      const port = createMockHubPort();
      (port.getInstitutionSummary as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "inst1",
        name: "Acme",
        slug: "acme",
      });
      const defs = createHubToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_institution_summary")!;
      const result = await tool.handler({ id: "inst1" });

      expect(port.getInstitutionSummary).toHaveBeenCalledWith("inst1");
      expect(result.success).toBe(true);
      expect((result as { data?: { name: string } }).data?.name).toBe("Acme");
    });

    it("returns failure when institution not found", async () => {
      const port = createMockHubPort();
      (port.getInstitutionSummary as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const defs = createHubToolDefinitions(port);
      const tool = defs.find((d) => d.name === "get_institution_summary")!;
      const result = await tool.handler({ id: "missing" });

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toContain("not found");
    });
  });
});
