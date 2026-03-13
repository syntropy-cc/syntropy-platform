/**
 * Role entity — maps a role name to a set of permissions.
 * Architecture: COMP-002, domains/identity/ARCHITECTURE.md
 */

import type { RBACRole } from "./rbac-role.js";
import { Permission } from "../value-objects/permission.js";

export class Role {
  readonly name: RBACRole;
  readonly permissions: ReadonlySet<Permission>;

  constructor(name: RBACRole, permissions: Iterable<Permission>) {
    this.name = name;
    this.permissions = new Set(permissions);
  }

  hasPermission(permission: Permission): boolean {
    return Array.from(this.permissions).some((p) => p.equals(permission));
  }

  hasPermissionKey(resource: string, action: string): boolean {
    return this.hasPermission(new Permission(resource, action));
  }
}
