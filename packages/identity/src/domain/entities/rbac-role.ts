/**
 * RBAC role enum — named roles for platform RBAC.
 * Architecture: COMP-002, Section 7
 */

export enum RBACRole {
  Admin = "admin",
  Creator = "creator",
  Learner = "learner",
  Mentor = "mentor",
  Reviewer = "reviewer",
  Moderator = "moderator",
}
