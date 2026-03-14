/**
 * ContributionId — immutable identifier for a Hub Contribution (COMP-019.2).
 * Architecture: Hub Collaboration Layer
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ContributionId = string & { readonly __brand: "ContributionId" };

/**
 * Creates a ContributionId from a string. Validates UUID format.
 */
export function createContributionId(value: string): ContributionId {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Invalid ContributionId: value cannot be empty");
  }
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(
      `Invalid ContributionId: expected UUID format, got "${value}"`
    );
  }
  return trimmed as ContributionId;
}

/**
 * Checks if a string is a valid ContributionId without throwing.
 */
export function isContributionId(value: string): value is ContributionId {
  return UUID_REGEX.test(value.trim());
}
