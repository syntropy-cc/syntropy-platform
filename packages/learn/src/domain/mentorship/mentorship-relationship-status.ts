/**
 * MentorshipRelationship status and transition guards (COMP-018.1).
 * Architecture: mentorship-community.md.
 */

export const MENTORSHIP_STATUSES = [
  "proposed",
  "active",
  "concluded",
  "declined",
] as const;

export type MentorshipStatus = (typeof MENTORSHIP_STATUSES)[number];

export function isMentorshipStatus(value: string): value is MentorshipStatus {
  return MENTORSHIP_STATUSES.includes(value as MentorshipStatus);
}

/** Only proposed relationships can be accepted. */
export function canAccept(status: MentorshipStatus): boolean {
  return status === "proposed";
}

/** Only proposed relationships can be declined. */
export function canDecline(status: MentorshipStatus): boolean {
  return status === "proposed";
}

/** Only active relationships can be concluded. */
export function canConclude(status: MentorshipStatus): boolean {
  return status === "active";
}
