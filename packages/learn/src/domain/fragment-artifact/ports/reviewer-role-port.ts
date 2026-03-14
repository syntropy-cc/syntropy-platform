/**
 * Port for checking reviewer role (COMP-016.6).
 * Implemented by infrastructure (e.g. Identity/RBAC adapter).
 */

export interface ReviewerRolePort {
  hasReviewerRole(userId: string): Promise<boolean>;
}
