/**
 * ArtifactId — immutable identifier for a DIP Artifact.
 * Architecture: COMP-003, DIP Artifact Registry
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Branded type for ArtifactId. UUID-based; immutable.
 */
export type ArtifactId = string & { readonly __brand: "ArtifactId" };

/**
 * Creates an ArtifactId from a string. Validates UUID format.
 *
 * @param value - UUID string
 * @returns ArtifactId
 * @throws Error if value is not a valid UUID
 */
export function createArtifactId(value: string): ArtifactId {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Invalid ArtifactId: value cannot be empty");
  }
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(`Invalid ArtifactId: expected UUID format, got "${value}"`);
  }
  return trimmed as ArtifactId;
}

/**
 * Checks if a string is a valid ArtifactId without throwing.
 */
export function isArtifactId(value: string): value is ArtifactId {
  return UUID_REGEX.test(value.trim());
}
