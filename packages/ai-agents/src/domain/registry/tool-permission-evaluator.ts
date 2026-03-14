/**
 * ToolPermissionEvaluator — evaluates whether an actor can invoke a tool (COMP-013.3).
 * Checks tool requiredRole against actor's roles; caches decision per session.
 */

import type { ToolDefinition } from "./tool-definition.js";

/** Resolves tool by id. */
export type ToolResolver = (toolId: string) => ToolDefinition | undefined;

/** Resolves actor roles (e.g. from identity/RBAC). */
export type RoleResolver = (actorId: string) => Promise<string[]>;

/** Simple cache interface for per-session caching. */
export interface PermissionCache {
  get(key: string): boolean | undefined;
  set(key: string, value: boolean): void;
}

const ADMIN_ROLE = "admin";

/**
 * Evaluates whether an actor can invoke a tool based on requiredRole and actor roles.
 * Admin role satisfies any tool. Caches result per cache key (e.g. sessionId:actorId:toolId).
 */
export class ToolPermissionEvaluator {
  constructor(
    private readonly toolResolver: ToolResolver,
    private readonly roleResolver: RoleResolver,
    private readonly cache: PermissionCache
  ) {}

  /**
   * Returns true if the actor has permission to invoke the tool (has requiredRole or admin).
   * Returns false if tool not found or actor lacks role. Uses cache when provided.
   */
  async canInvoke(
    actorId: string,
    toolId: string,
    sessionId?: string
  ): Promise<boolean> {
    const cacheKey = sessionId
      ? `${sessionId}:${actorId}:${toolId}`
      : `${actorId}:${toolId}`;
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) return cached;

    const tool = this.toolResolver(toolId);
    if (!tool) return false;

    const roles = await this.roleResolver(actorId);
    const allowed =
      roles.includes(ADMIN_ROLE) || roles.includes(tool.requiredRole);
    this.cache.set(cacheKey, allowed);
    return allowed;
  }
}
