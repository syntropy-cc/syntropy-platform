/**
 * Unit tests for PermissionChecker, hasPermission, requirePermission, cache, RequireRole (COMP-037.1).
 */

import { describe, it, expect } from "vitest";
import { createActorId } from "../domain/value-objects/actor-id.js";
import { ForbiddenError } from "../infrastructure/errors.js";
import { RBACRole } from "../domain/entities/rbac-role.js";
import {
  PermissionChecker,
  InMemoryPermissionCache,
  hasPermission,
  requirePermission,
  type RoleResolver,
} from "./permission-checker.js";
import { RequireRole } from "./require-role.decorator.js";

const ACTOR_LEARNER = createActorId("550e8400-e29b-41d4-a716-446655440001");
const ACTOR_ADMIN = createActorId("550e8400-e29b-41d4-a716-446655440002");
const ACTOR_CREATOR = createActorId("550e8400-e29b-41d4-a716-446655440003");

describe("PermissionChecker", () => {
  const resolveLearner: RoleResolver = async (id) =>
    id === ACTOR_LEARNER ? [RBACRole.Learner] : [];
  const resolveAdmin: RoleResolver = async () => [RBACRole.Admin];

  it("hasPermission_returns_true_when_learner_has_learn_read", async () => {
    const checker = new PermissionChecker({ roleResolver: resolveLearner });
    const result = await checker.hasPermission(ACTOR_LEARNER, "learn", "read");
    expect(result).toBe(true);
  });

  it("hasPermission_returns_false_when_learner_lacks_hub_submit", async () => {
    const checker = new PermissionChecker({ roleResolver: resolveLearner });
    const result = await checker.hasPermission(ACTOR_LEARNER, "hub", "submit");
    expect(result).toBe(false);
  });

  it("hasPermission_returns_true_when_admin_has_any_permission", async () => {
    const checker = new PermissionChecker({ roleResolver: resolveAdmin });
    expect(await checker.hasPermission(ACTOR_ADMIN, "admin", "user:suspend")).toBe(true);
    expect(await checker.hasPermission(ACTOR_ADMIN, "learn", "read")).toBe(true);
    expect(await checker.hasPermission(ACTOR_ADMIN, "hub", "contribution:submit")).toBe(true);
  });

  it("requirePermission_throws_ForbiddenError_when_denied", async () => {
    const checker = new PermissionChecker({ roleResolver: resolveLearner });
    await expect(
      checker.requirePermission(ACTOR_LEARNER, "hub", "submit")
    ).rejects.toThrow(ForbiddenError);
    await expect(
      checker.requirePermission(ACTOR_LEARNER, "hub", "submit")
    ).rejects.toMatchObject({ resource: "hub", action: "submit" });
  });

  it("requirePermission_does_not_throw_when_allowed", async () => {
    const checker = new PermissionChecker({ roleResolver: resolveLearner });
    await expect(
      checker.requirePermission(ACTOR_LEARNER, "learn", "read")
    ).resolves.toBeUndefined();
  });

  it("hasPermission_uses_cache_when_provided", async () => {
    const cache = new InMemoryPermissionCache();
    const resolveOnce: RoleResolver = async () => [RBACRole.Learner];
    const checker = new PermissionChecker({ roleResolver: resolveOnce, cache });

    await checker.hasPermission(ACTOR_LEARNER, "learn", "read");
    const hit = await cache.get(`rbac:perm:${ACTOR_LEARNER}:learn:read`);
    expect(hit).toBe(true);
  });

  it("hasPermission_returns_cached_false_after_deny", async () => {
    const cache = new InMemoryPermissionCache();
    const checker = new PermissionChecker({ roleResolver: resolveLearner, cache });
    await checker.hasPermission(ACTOR_LEARNER, "hub", "submit");
    const hit = await cache.get(`rbac:perm:${ACTOR_LEARNER}:hub:submit`);
    expect(hit).toBe(false);
  });
});

describe("createPermissionChecker and standalone functions", () => {
  const resolver: RoleResolver = async (id) =>
    id === ACTOR_CREATOR ? [RBACRole.Creator] : [];

  it("hasPermission_returns_true_for_creator_hub_submit", async () => {
    const result = await hasPermission(
      ACTOR_CREATOR,
      "hub",
      "submit",
      resolver
    );
    expect(result).toBe(true);
  });

  it("requirePermission_throws_for_creator_admin_action", async () => {
    await expect(
      requirePermission(ACTOR_CREATOR, "admin", "user:suspend", resolver)
    ).rejects.toThrow(ForbiddenError);
  });
});

describe("RequireRole decorator", () => {
  class Service {
    @RequireRole(RBACRole.Admin)
    async adminOnly(ctx: { actorId: unknown; roles: string[] }) {
      return ctx.actorId;
    }
  }

  it("RequireRole_throws_when_roles_missing_required_role", async () => {
    const svc = new Service();
    await expect(
      svc.adminOnly({ actorId: ACTOR_LEARNER, roles: [RBACRole.Learner] })
    ).rejects.toThrow(ForbiddenError);
  });

  it("RequireRole_throws_when_ctx_missing_roles", async () => {
    const svc = new Service();
    await expect(svc.adminOnly(null as unknown as { actorId: unknown; roles: string[] })).rejects.toThrow(
      /Missing auth context/
    );
  });

  it("RequireRole_invokes_method_when_role_present", async () => {
    const svc = new Service();
    const result = await svc.adminOnly({
      actorId: ACTOR_ADMIN,
      roles: [RBACRole.Admin],
    });
    expect(result).toBe(ACTOR_ADMIN);
  });
});
