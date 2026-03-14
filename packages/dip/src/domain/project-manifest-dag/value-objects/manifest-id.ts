/**
 * ManifestId — immutable identifier for a project manifest (DIP).
 * Architecture: COMP-006, DIP Project Manifest & DAG
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Branded type for ManifestId. UUID-based; immutable.
 */
export type ManifestId = string & { readonly __brand: "ManifestId" };

/**
 * Creates a ManifestId from a string. Validates UUID format.
 *
 * @param value - UUID string
 * @returns ManifestId
 * @throws Error if value is not a valid UUID
 */
export function createManifestId(value: string): ManifestId {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Invalid ManifestId: value cannot be empty");
  }
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(`Invalid ManifestId: expected UUID format, got "${value}"`);
  }
  return trimmed as ManifestId;
}

/**
 * Checks if a string is a valid ManifestId without throwing.
 */
export function isManifestId(value: string): value is ManifestId {
  return UUID_REGEX.test(value.trim());
}
