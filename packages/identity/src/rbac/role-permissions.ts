/**
 * Default role-to-permission matrix for RBAC (COMP-037.1).
 * Used by PermissionChecker to resolve (resource, action) from actor roles.
 */

import { RBACRole } from "../domain/entities/rbac-role.js";
import { Permission } from "../domain/value-objects/permission.js";

const P = (resource: string, action: string) => new Permission(resource, action);

/** Permissions granted to each role. Admin is treated as wildcard in the checker. */
export const DEFAULT_ROLE_PERMISSIONS: ReadonlyMap<RBACRole, ReadonlySet<Permission>> = new Map([
  [
    RBACRole.Admin,
    new Set([
      P("admin", "user:suspend"),
      P("admin", "user:read"),
      P("admin", "moderation:read"),
      P("admin", "moderation:action"),
      P("api", "protected"),
      P("learn", "read"),
      P("learn", "publish"),
      P("hub", "read"),
      P("hub", "submit"),
      P("hub", "contribution:submit"),
      P("labs", "read"),
      P("labs", "submit"),
      P("labs", "review"),
    ]),
  ],
  [
    RBACRole.Learner,
    new Set([P("learn", "read"), P("api", "protected")]),
  ],
  [
    RBACRole.Creator,
    new Set([
      P("learn", "read"),
      P("learn", "publish"),
      P("hub", "read"),
      P("hub", "submit"),
      P("hub", "contribution:submit"),
      P("api", "protected"),
    ]),
  ],
  [
    RBACRole.Mentor,
    new Set([
      P("learn", "read"),
      P("learn", "publish"),
      P("learn", "mentor:review"),
      P("hub", "read"),
      P("hub", "submit"),
      P("api", "protected"),
    ]),
  ],
  [
    RBACRole.Reviewer,
    new Set([
      P("learn", "read"),
      P("labs", "read"),
      P("labs", "review"),
      P("api", "protected"),
    ]),
  ],
  [
    RBACRole.Moderator,
    new Set([
      P("admin", "moderation:read"),
      P("admin", "moderation:action"),
      P("learn", "read"),
      P("hub", "read"),
      P("labs", "read"),
      P("api", "protected"),
    ]),
  ],
]);

/** Returns permissions for a role name (string). Returns empty set for unknown role. */
export function getPermissionsForRole(roleName: string): ReadonlySet<Permission> {
  const role = Object.values(RBACRole).find((r) => r === roleName);
  if (!role) return new Set();
  return DEFAULT_ROLE_PERMISSIONS.get(role) ?? new Set();
}
