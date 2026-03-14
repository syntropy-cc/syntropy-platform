/**
 * Achievement definitions and conditions (COMP-010.3).
 * Architecture: Platform Core — Portfolio Aggregation.
 */

export interface AchievementDefinition {
  id: string;
  name: string;
  /** Condition type for evaluation. */
  conditionType: "first_fragment" | "first_contribution" | "contributions_count" | "first_article" | "mentor" | string;
  /** Optional threshold, e.g. 10 for "10 contributions". */
  threshold?: number;
}

export const DEFAULT_ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { id: "first_fragment", name: "First Fragment Published", conditionType: "first_fragment" },
  { id: "first_contribution", name: "First Contribution Integrated", conditionType: "first_contribution" },
  { id: "ten_contributions", name: "10 Contributions", conditionType: "contributions_count", threshold: 10 },
  { id: "first_article", name: "First Article Published", conditionType: "first_article" },
  { id: "mentor", name: "Mentor", conditionType: "mentor" },
];
