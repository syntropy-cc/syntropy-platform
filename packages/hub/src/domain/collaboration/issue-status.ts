/**
 * IssueStatus — lifecycle status for Issue aggregate (COMP-019.1).
 * Architecture: Hub Collaboration Layer
 */

export const IssueStatus = {
  Open: "open",
  InProgress: "in_progress",
  InReview: "in_review",
  Closed: "closed",
} as const;

export type IssueStatusValue =
  (typeof IssueStatus)[keyof typeof IssueStatus];

export function isIssueStatus(value: string): value is IssueStatusValue {
  return Object.values(IssueStatus).includes(value as IssueStatusValue);
}
