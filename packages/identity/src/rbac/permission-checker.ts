/**
 * RBAC permission checker — hasPermission, requirePermission, cache and role resolver (COMP-037.1).
 */

import type { ActorId } from "../domain/value-objects/actor-id.js";
import { Permission } from "../domain/value-objects/permission.js";
import { RBACRole } from "../domain/entities/rbac-role.js";
import { ForbiddenError } from "../infrastructure/errors.js";
import { getPermissionsForRole } from "./role-permissions.js";

const PERMISSION_CACHE_TTL_SEC = 300; // 5 min

export type RoleResolver = (actorId: ActorId) => Promise<string[]>;

export interface PermissionCache {
  get(key: string): Promise<boolean | null>;
  set(key: string, value: boolean, ttlSec: number): Promise<void>;
}

function cacheKey(actorId: ActorId, resource: string, action: string): string {
  return `rbac:perm:${actorId}:${resource}:${action}`;
}

/**
 * In-memory permission cache for tests and dev. Not for production at scale.
 */
export class InMemoryPermissionCache implements PermissionCache {
  private readonly store = new Map<string, boolean>();

  async get(key: string): Promise<boolean | null> {
    const v = this.store.get(key);
    if (v === undefined) return null;
    return v;
  }

  async set(key: string, value: boolean, _ttlSec: number): Promise<void> {
    this.store.set(key, value);
  }
}

export interface PermissionCheckerOptions {
  roleResolver: RoleResolver;
  cache?: PermissionCache | null;
  /** Override role→permissions (default: DEFAULT_ROLE_PERMISSIONS). */
  rolePermissions?: (roleName: string) => ReadonlySet<Permission>;
}

/**
 * Checks (actorId, resource, action) against resolved roles and optional cache.
 */
export class PermissionChecker {
  private readonly roleResolver: RoleResolver;
  private readonly cache: PermissionCache | null;
  private readonly getRolePermissions: (roleName: string) => ReadonlySet<Permission>;

  constructor(options: PermissionCheckerOptions) {
    this.roleResolver = options.roleResolver;
    this.cache = options.cache ?? null;
    this.getRolePermissions = options.rolePermissions ?? getPermissionsForRole;
  }

  /**
   * Returns true if the actor has the given (resource, action) via any of their roles.
   * Admin role is treated as having all permissions for any (resource, action).
   */
  async hasPermission(
    actorId: ActorId,
    resource: string,
    action: string
  ): Promise<boolean> {
    const key = cacheKey(actorId, resource, action);
    if (this.cache) {
      const cached = await this.cache.get(key);
      if (cached !== null) return cached;
    }

    const roleNames = await this.roleResolver(actorId);
    const perm = new Permission(resource, action);

    for (const roleName of roleNames) {
      if (roleName === RBACRole.Admin) return this.setAndReturn(true, key);
      const perms = this.getRolePermissions(roleName);
      if (Array.from(perms).some((p) => p.equals(perm))) return this.setAndReturn(true, key);
    }

    return this.setAndReturn(false, key);
  }

  private async setAndReturn(value: boolean, key: string): Promise<boolean> {
    if (this.cache) await this.cache.set(key, value, PERMISSION_CACHE_TTL_SEC);
    return value;
  }

  /**
   * Throws ForbiddenError if the actor does not have (resource, action).
   */
  async requirePermission(
    actorId: ActorId,
    resource: string,
    action: string
  ): Promise<void> {
    const allowed = await this.hasPermission(actorId, resource, action);
    if (!allowed) {
      throw new ForbiddenError(
        `Permission denied for ${resource}:${action}`,
        resource,
        action
      );
    }
  }
}

/**
 * Convenience: create a checker with only a role resolver (no cache).
 */
export function createPermissionChecker(
  roleResolver: RoleResolver,
  cache?: PermissionCache | null
): PermissionChecker {
  return new PermissionChecker({ roleResolver, cache });
}

/**
 * Standalone hasPermission using a one-off checker (no cache unless provided).
 */
export async function hasPermission(
  actorId: ActorId,
  resource: string,
  action: string,
  roleResolver: RoleResolver,
  cache?: PermissionCache | null
): Promise<boolean> {
  const checker = createPermissionChecker(roleResolver, cache);
  return checker.hasPermission(actorId, resource, action);
}

/**
 * Standalone requirePermission — throws ForbiddenError if denied.
 */
export async function requirePermission(
  actorId: ActorId,
  resource: string,
  action: string,
  roleResolver: RoleResolver,
  cache?: PermissionCache | null
): Promise<void> {
  const checker = createPermissionChecker(roleResolver, cache);
  await checker.requirePermission(actorId, resource, action);
}
