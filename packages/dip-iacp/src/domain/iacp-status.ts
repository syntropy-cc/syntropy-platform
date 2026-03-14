/**
 * IACPStatus — lifecycle status of an IACP record.
 * Architecture: COMP-005, DIP IACP Engine
 */

export const IACPStatus = {
  Draft: "draft",
  PendingSignatures: "pending_signatures",
  Active: "active",
  Terminated: "terminated",
} as const;

export type IACPStatus = (typeof IACPStatus)[keyof typeof IACPStatus];

export function isIACPStatus(value: string): value is IACPStatus {
  return (
    value === IACPStatus.Draft ||
    value === IACPStatus.PendingSignatures ||
    value === IACPStatus.Active ||
    value === IACPStatus.Terminated
  );
}
