/**
 * ContributionSandboxStatus — lifecycle status for ContributionSandbox (COMP-019.3).
 * Architecture: Hub Collaboration Layer
 */

export const ContributionSandboxStatus = {
  SettingUp: "setting_up",
  Active: "active",
  Completed: "completed",
} as const;

export type ContributionSandboxStatusValue =
  (typeof ContributionSandboxStatus)[keyof typeof ContributionSandboxStatus];

export function isContributionSandboxStatus(
  value: string
): value is ContributionSandboxStatusValue {
  return Object.values(ContributionSandboxStatus).includes(
    value as ContributionSandboxStatusValue
  );
}
