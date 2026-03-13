/**
 * Unit tests for RBACRole, Permission, Role.
 * Tests: COMP-002.2
 */

import { describe, it, expect } from "vitest";
import { RBACRole } from "./rbac-role.js";
import { Permission } from "../value-objects/permission.js";
import { Role } from "./role.js";

describe("Permission", () => {
  it("fromString_parses_resource_action", () => {
    const p = Permission.fromString("hub:contribution:submit");
    expect(p.resource).toBe("hub:contribution");
    expect(p.action).toBe("submit");
    expect(p.key).toBe("hub:contribution:submit");
  });

  it("fromString_parses_simple_resource_action", () => {
    const p = Permission.fromString("learn:track:publish");
    expect(p.resource).toBe("learn:track");
    expect(p.action).toBe("publish");
  });

  it("fromString_throws_for_invalid_format", () => {
    expect(() => Permission.fromString("single")).toThrow(/Invalid permission key/);
    expect(() => Permission.fromString("")).toThrow();
  });

  it("equals_compares_by_key", () => {
    const a = new Permission("hub", "submit");
    const b = new Permission("hub", "submit");
    const c = new Permission("hub", "read");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});

describe("RBACRole", () => {
  it("has_all_required_enum_values", () => {
    expect(RBACRole.Admin).toBe("admin");
    expect(RBACRole.Creator).toBe("creator");
    expect(RBACRole.Learner).toBe("learner");
    expect(RBACRole.Mentor).toBe("mentor");
    expect(RBACRole.Reviewer).toBe("reviewer");
    expect(RBACRole.Moderator).toBe("moderator");
  });
});

describe("Role", () => {
  it("hasPermission_returns_true_when_permission_in_set", () => {
    const perm = new Permission("hub", "submit");
    const role = new Role(RBACRole.Creator, [perm]);
    expect(role.hasPermission(perm)).toBe(true);
    expect(role.hasPermissionKey("hub", "submit")).toBe(true);
  });

  it("hasPermission_returns_false_when_permission_not_in_set", () => {
    const role = new Role(RBACRole.Learner, [
      new Permission("learn", "read"),
    ]);
    expect(role.hasPermission(new Permission("hub", "submit"))).toBe(false);
    expect(role.hasPermissionKey("hub", "submit")).toBe(false);
  });

  it("stores_permissions_without_duplicates", () => {
    const p = new Permission("admin", "user:suspend");
    const role = new Role(RBACRole.Admin, [p, p]);
    expect(role.permissions.size).toBe(1);
  });
});
