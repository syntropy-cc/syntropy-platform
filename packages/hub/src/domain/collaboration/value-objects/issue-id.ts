/**
 * IssueId — immutable identifier for a Hub Issue (COMP-019.1).
 * Architecture: Hub Collaboration Layer
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type IssueId = string & { readonly __brand: "IssueId" };

/**
 * Creates an IssueId from a string. Validates UUID format.
 */
export function createIssueId(value: string): IssueId {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Invalid IssueId: value cannot be empty");
  }
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(`Invalid IssueId: expected UUID format, got "${value}"`);
  }
  return trimmed as IssueId;
}

/**
 * Checks if a string is a valid IssueId without throwing.
 */
export function isIssueId(value: string): value is IssueId {
  return UUID_REGEX.test(value.trim());
}
