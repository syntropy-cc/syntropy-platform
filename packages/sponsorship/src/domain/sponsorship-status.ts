/**
 * SponsorshipStatus — lifecycle status for Sponsorship aggregate (COMP-027.1).
 * Architecture: sponsorship domain
 */

/** Lifecycle status for a sponsorship. */
export type SponsorshipStatus =
  | "pending"
  | "active"
  | "paused"
  | "cancelled";

const SPONSORSHIP_STATUSES: SponsorshipStatus[] = [
  "pending",
  "active",
  "paused",
  "cancelled",
];

export function isSponsorshipStatus(
  value: string
): value is SponsorshipStatus {
  return SPONSORSHIP_STATUSES.includes(value as SponsorshipStatus);
}
