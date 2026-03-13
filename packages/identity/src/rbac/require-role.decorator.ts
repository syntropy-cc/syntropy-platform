/**
 * @RequireRole(role) decorator — asserts the first parameter has the required role (COMP-037.1).
 *
 * Convention: the decorated method must receive as first argument an object with
 * { actorId: ActorId, roles: string[] } (e.g. from request.user). The decorator
 * throws ForbiddenError if roles does not include the required role.
 */

import { ForbiddenError } from "../infrastructure/errors.js";

export const REQUIRE_ROLE_METADATA_KEY = "syntropy:requireRole";

/**
 * Method decorator: requires the first parameter to have a `roles` array containing
 * the given role. Use on service methods that receive a context object, e.g.:
 *
 *   class MyService {
 *     @RequireRole(RBACRole.Admin)
 *     async doAdminThing(ctx: { actorId: ActorId; roles: string[] }) { ... }
 *   }
 *
 * If the first argument is missing or has no `roles` array, throws ForbiddenError.
 */
export function RequireRole(role: string) {
  return function (
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    if (!descriptor) return descriptor;
    const orig = descriptor.value;
    if (typeof orig !== "function") {
      return descriptor;
    }
    const original = orig as (...args: unknown[]) => Promise<unknown>;
    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      const ctx = args[0];
      if (!ctx || typeof ctx !== "object" || !("roles" in ctx)) {
        throw new ForbiddenError("Missing auth context (roles)");
      }
      const roles = (ctx as { roles: string[] }).roles;
      if (!Array.isArray(roles) || !roles.includes(role)) {
        throw new ForbiddenError(`Required role: ${role}`);
      }
      return original.apply(this, args);
    };
    return descriptor;
  };
}
