/**
 * InstitutionId — immutable identifier for a DigitalInstitution (DIP).
 * Architecture: COMP-006, DIP Project Manifest & DAG
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Branded type for InstitutionId. UUID-based; immutable.
 */
export type InstitutionId = string & { readonly __brand: "InstitutionId" };

/**
 * Creates an InstitutionId from a string. Validates UUID format.
 *
 * @param value - UUID string
 * @returns InstitutionId
 * @throws Error if value is not a valid UUID
 */
export function createInstitutionId(value: string): InstitutionId {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Invalid InstitutionId: value cannot be empty");
  }
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(
      `Invalid InstitutionId: expected UUID format, got "${value}"`
    );
  }
  return trimmed as InstitutionId;
}

/**
 * Checks if a string is a valid InstitutionId without throwing.
 */
export function isInstitutionId(value: string): value is InstitutionId {
  return UUID_REGEX.test(value.trim());
}
