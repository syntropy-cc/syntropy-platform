/**
 * IACPId — immutable identifier for an IACP record.
 * Architecture: COMP-005, DIP IACP Engine
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Branded type for IACPId. UUID-based; immutable.
 */
export type IACPId = string & { readonly __brand: "IACPId" };

/**
 * Creates an IACPId from a string. Validates UUID format.
 *
 * @param value - UUID string
 * @returns IACPId
 * @throws Error if value is not a valid UUID
 */
export function createIACPId(value: string): IACPId {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Invalid IACPId: value cannot be empty");
  }
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(`Invalid IACPId: expected UUID format, got "${value}"`);
  }
  return trimmed as IACPId;
}

/**
 * Checks if a string is a valid IACPId without throwing.
 */
export function isIACPId(value: string): value is IACPId {
  return UUID_REGEX.test(value.trim());
}
