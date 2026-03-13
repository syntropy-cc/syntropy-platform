/**
 * RBAC enforcement — permission checker, cache, decorator (COMP-037.1).
 */

export {
  PermissionChecker,
  createPermissionChecker,
  hasPermission,
  requirePermission,
  InMemoryPermissionCache,
  type RoleResolver,
  type PermissionCache,
  type PermissionCheckerOptions,
} from "./permission-checker.js";
export { RequireRole, REQUIRE_ROLE_METADATA_KEY } from "./require-role.decorator.js";
export {
  DEFAULT_ROLE_PERMISSIONS,
  getPermissionsForRole,
} from "./role-permissions.js";
