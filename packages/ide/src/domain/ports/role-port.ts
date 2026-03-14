/**
 * Port for resolving user role for quota (COMP-030.3).
 * Implementations query Identity; default role used in tests.
 */

export interface RolePort {
  getRole(userId: string): Promise<string>;
}
