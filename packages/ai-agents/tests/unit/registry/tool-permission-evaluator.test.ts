/**
 * Unit tests for ToolPermissionEvaluator (COMP-013.3).
 */

import { describe, expect, it, beforeEach } from "vitest";
import { z } from "zod";
import { createToolDefinition } from "../../../src/domain/registry/tool-definition.js";
import {
  ToolPermissionEvaluator,
  type ToolResolver,
  type RoleResolver,
  type PermissionCache,
} from "../../../src/domain/registry/tool-permission-evaluator.js";

const creatorTool = createToolDefinition({
  toolId: "tool-create",
  name: "create",
  inputSchema: z.object({ title: z.string() }),
  requiredRole: "creator",
});

function createToolResolver(tools: Map<string, ReturnType<typeof createToolDefinition>>): ToolResolver {
  return (toolId: string) => tools.get(toolId);
}

function createRoleResolver(rolesByActor: Map<string, string[]>): RoleResolver {
  return async (actorId: string) => rolesByActor.get(actorId) ?? [];
}

function createCache(): PermissionCache {
  const map = new Map<string, boolean>();
  return {
    get(key: string) {
      return map.get(key);
    },
    set(key: string, value: boolean) {
      map.set(key, value);
    },
  };
}

describe("ToolPermissionEvaluator", () => {
  const tools = new Map([["tool-create", creatorTool]]);
  let roleResolver: RoleResolver;
  let cache: PermissionCache;

  beforeEach(() => {
    cache = createCache();
  });

  it("canInvoke returns false when tool not found", async () => {
    roleResolver = createRoleResolver(new Map([["user1", ["creator"]]]));
    const evaluator = new ToolPermissionEvaluator(
      createToolResolver(tools),
      roleResolver,
      cache
    );
    const result = await evaluator.canInvoke("user1", "unknown-tool");
    expect(result).toBe(false);
  });

  it("canInvoke returns false when actor lacks required role", async () => {
    roleResolver = createRoleResolver(new Map([["user1", ["learner"]]]));
    const evaluator = new ToolPermissionEvaluator(
      createToolResolver(tools),
      roleResolver,
      cache
    );
    const result = await evaluator.canInvoke("user1", "tool-create");
    expect(result).toBe(false);
  });

  it("canInvoke returns true when actor has required role", async () => {
    roleResolver = createRoleResolver(new Map([["user1", ["creator"]]]));
    const evaluator = new ToolPermissionEvaluator(
      createToolResolver(tools),
      roleResolver,
      cache
    );
    const result = await evaluator.canInvoke("user1", "tool-create");
    expect(result).toBe(true);
  });

  it("canInvoke returns true when actor has admin role", async () => {
    roleResolver = createRoleResolver(new Map([["admin1", ["admin"]]]));
    const evaluator = new ToolPermissionEvaluator(
      createToolResolver(tools),
      roleResolver,
      cache
    );
    const result = await evaluator.canInvoke("admin1", "tool-create");
    expect(result).toBe(true);
  });

  it("canInvoke caches result and does not call roleResolver again for same key", async () => {
    const rolesByActor = new Map<string, string[]>([["user1", ["creator"]]]);
    let resolveCount = 0;
    roleResolver = async (actorId: string) => {
      resolveCount++;
      return rolesByActor.get(actorId) ?? [];
    };
    const evaluator = new ToolPermissionEvaluator(
      createToolResolver(tools),
      roleResolver,
      cache
    );
    await evaluator.canInvoke("user1", "tool-create");
    await evaluator.canInvoke("user1", "tool-create");
    expect(resolveCount).toBe(1);
  });

  it("canInvoke with sessionId uses session-scoped cache key", async () => {
    roleResolver = createRoleResolver(new Map([["user1", ["creator"]]]));
    const evaluator = new ToolPermissionEvaluator(
      createToolResolver(tools),
      roleResolver,
      cache
    );
    const r1 = await evaluator.canInvoke("user1", "tool-create", "session-a");
    const r2 = await evaluator.canInvoke("user1", "tool-create", "session-b");
    expect(r1).toBe(true);
    expect(r2).toBe(true);
    expect(cache.get("session-a:user1:tool-create")).toBe(true);
    expect(cache.get("session-b:user1:tool-create")).toBe(true);
  });
});
