/**
 * FlagStatus enum for ModerationFlag (COMP-031.1).
 * Architecture: Governance & Moderation domain.
 */

export const FlagStatus = {
  Pending: "pending",
  UnderReview: "under_review",
  Resolved: "resolved",
  Dismissed: "dismissed",
} as const;

export type FlagStatusValue = (typeof FlagStatus)[keyof typeof FlagStatus];

export function isFlagStatus(s: string): s is FlagStatusValue {
  return Object.values(FlagStatus).includes(s as FlagStatusValue);
}
