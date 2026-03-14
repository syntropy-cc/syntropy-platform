/**
 * ProjectId — immutable identifier for a DIP DigitalProject.
 * Architecture: COMP-006, DIP Project Manifest & DAG
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Branded type for ProjectId. UUID-based; immutable.
 */
export type ProjectId = string & { readonly __brand: "ProjectId" };

/**
 * Creates a ProjectId from a string. Validates UUID format.
 *
 * @param value - UUID string
 * @returns ProjectId
 * @throws Error if value is not a valid UUID
 */
export function createProjectId(value: string): ProjectId {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Invalid ProjectId: value cannot be empty");
  }
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(`Invalid ProjectId: expected UUID format, got "${value}"`);
  }
  return trimmed as ProjectId;
}

/**
 * Checks if a string is a valid ProjectId without throwing.
 */
export function isProjectId(value: string): value is ProjectId {
  return UUID_REGEX.test(value.trim());
}
