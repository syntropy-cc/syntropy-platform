/**
 * ActorId — stable, platform-wide identifier for a User used in DIP cryptographic signing.
 * Architecture: COMP-002, domains/identity/ARCHITECTURE.md
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Branded type for ActorId. UUID-based; never reassigned.
 */
export type ActorId = string & { readonly __brand: "ActorId" };

/**
 * Creates an ActorId from a string. Validates UUID format.
 *
 * @param value - UUID string (e.g. from Supabase user id)
 * @returns ActorId
 * @throws Error if value is not a valid UUID
 */
export function createActorId(value: string): ActorId {
  const trimmed = value.trim();
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(`Invalid ActorId: expected UUID format, got "${value}"`);
  }
  return trimmed as ActorId;
}

/**
 * Checks if a string is a valid ActorId without throwing.
 */
export function isActorId(value: string): value is ActorId {
  return UUID_REGEX.test(value.trim());
}
