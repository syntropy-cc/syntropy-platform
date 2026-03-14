/**
 * ActionType for ModerationAction (COMP-031.2).
 * Architecture: Governance & Moderation domain.
 */

export const ActionType = {
  Approve: "approve",
  Remove: "remove",
  Warn: "warn",
  Ban: "ban",
} as const;

export type ActionTypeValue = (typeof ActionType)[keyof typeof ActionType];

export function isActionType(s: string): s is ActionTypeValue {
  return Object.values(ActionType).includes(s as ActionTypeValue);
}
