/**
 * Unit tests for ToolRouter.
 * Architecture: COMP-012.4
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import { ToolRouter } from "../../../src/domain/orchestration/tool-router.js";
import {
  ToolNotFoundError,
  type ToolDefinition,
  type ToolRegistry,
  type ToolResult,
} from "../../../src/domain/orchestration/tool-types.js";

function createMockRegistry(tools: ToolDefinition[]): ToolRegistry {
  const map = new Map(tools.map((t) => [t.name, t]));
  return {
    get(name: string) {
      return map.get(name);
    },
  };
}

describe("ToolRouter", () => {
  describe("route", () => {
    it("returns handler result when tool exists and params are valid", async () => {
      const registry = createMockRegistry([
        {
          name: "echo",
          paramsSchema: z.object({ message: z.string() }),
          handler: (params) =>
            Promise.resolve({
              success: true,
              data: { echoed: (params as { message: string }).message },
            }),
        },
      ]);
      const router = new ToolRouter(registry);

      const result = await router.route("echo", { message: "hello" });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ echoed: "hello" });
    });

    it("throws ToolNotFoundError for unknown tool name", async () => {
      const registry = createMockRegistry([]);
      const router = new ToolRouter(registry);

      await expect(router.route("unknown_tool", {})).rejects.toThrow(
        ToolNotFoundError
      );
      await expect(router.route("unknown_tool", {})).rejects.toMatchObject({
        toolName: "unknown_tool",
      });
    });

    it("throws when params fail Zod validation", async () => {
      const registry = createMockRegistry([
        {
          name: "add",
          paramsSchema: z.object({
            a: z.number(),
            b: z.number(),
          }),
          handler: () => ({ success: true }),
        },
      ]);
      const router = new ToolRouter(registry);

      await expect(
        router.route("add", { a: "not-a-number", b: 1 })
      ).rejects.toThrow(/Expected number/);
    });

    it("invokes handler with parsed params", async () => {
      let received: unknown = null;
      const registry = createMockRegistry([
        {
          name: "capture",
          paramsSchema: z.object({ x: z.number(), y: z.string() }),
          handler: (params) => {
            received = params;
            return { success: true, data: params };
          },
        },
      ]);
      const router = new ToolRouter(registry);

      await router.route("capture", { x: 42, y: "ok" });

      expect(received).toEqual({ x: 42, y: "ok" });
    });

    it("returns ToolResult with success false when handler returns error", async () => {
      const registry = createMockRegistry([
        {
          name: "failing",
          paramsSchema: z.object({}),
          handler: (): ToolResult => ({
            success: false,
            error: "Tool failed",
          }),
        },
      ]);
      const router = new ToolRouter(registry);

      const result = await router.route("failing", {});

      expect(result.success).toBe(false);
      expect(result.error).toBe("Tool failed");
    });
  });
});
