/**
 * ContributionStatus — lifecycle status for Contribution aggregate (COMP-019.2).
 * Architecture: Hub Collaboration Layer
 */

export const ContributionStatus = {
  Submitted: "submitted",
  InReview: "in_review",
  Accepted: "accepted",
  Rejected: "rejected",
  Integrated: "integrated",
} as const;

export type ContributionStatusValue =
  (typeof ContributionStatus)[keyof typeof ContributionStatus];

export function isContributionStatus(
  value: string
): value is ContributionStatusValue {
  return Object.values(ContributionStatus).includes(
    value as ContributionStatusValue
  );
}
