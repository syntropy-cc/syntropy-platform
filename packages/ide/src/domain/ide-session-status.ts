/**
 * IDESession status lifecycle (COMP-030.1).
 * Architecture: IDE domain, ARCH-001
 */

export const IDESessionStatus = {
  Pending: "pending",
  Provisioning: "provisioning",
  Active: "active",
  Suspended: "suspended",
  Terminated: "terminated",
} as const;

export type IDESessionStatusValue =
  (typeof IDESessionStatus)[keyof typeof IDESessionStatus];

export function isIDESessionStatus(value: string): value is IDESessionStatusValue {
  return Object.values(IDESessionStatus).includes(value as IDESessionStatusValue);
}
