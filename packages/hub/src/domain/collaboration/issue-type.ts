/**
 * IssueType — classification for Issue aggregate (COMP-019.1).
 * Architecture: Hub Collaboration Layer
 */

export const IssueType = {
  Bug: "bug",
  Feature: "feature",
  Task: "task",
  Chore: "chore",
} as const;

export type IssueTypeValue = (typeof IssueType)[keyof typeof IssueType];

export function isIssueType(value: string): value is IssueTypeValue {
  return Object.values(IssueType).includes(value as IssueTypeValue);
}
