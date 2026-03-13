/**
 * AuthorId — identifier of the author of a DIP Artifact (UUID-based).
 * Semantically aligned with Identity ActorId; kept local to DIP for COMP-003.1.
 * Architecture: COMP-003, DIP Artifact Registry
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Branded type for AuthorId. UUID-based; immutable.
 */
export type AuthorId = string & { readonly __brand: "AuthorId" };

/**
 * Creates an AuthorId from a string. Validates UUID format.
 *
 * @param value - UUID string (e.g. from Identity ActorId)
 * @returns AuthorId
 * @throws Error if value is not a valid UUID
 */
export function createAuthorId(value: string): AuthorId {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Invalid AuthorId: value cannot be empty");
  }
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(`Invalid AuthorId: expected UUID format, got "${value}"`);
  }
  return trimmed as AuthorId;
}

/**
 * Checks if a string is a valid AuthorId without throwing.
 */
export function isAuthorId(value: string): value is AuthorId {
  return UUID_REGEX.test(value.trim());
}
