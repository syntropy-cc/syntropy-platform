/**
 * AchievementService — evaluates portfolio and event to unlock achievements (COMP-010.3).
 * Architecture: Platform Core — Portfolio Aggregation.
 */

import type { Portfolio } from "./portfolio.js";
import {
  type AchievementDefinition,
  DEFAULT_ACHIEVEMENT_DEFINITIONS,
} from "./achievement-definitions.js";
import { createAchievementUnlockedEvent } from "./events/achievement-unlocked.js";

/** Event that may trigger achievement evaluation. */
export interface AchievementEvaluationEvent {
  type: string;
  payload?: Record<string, unknown>;
}

export interface AchievementUnlockResult {
  unlocked: string[];
  events: ReturnType<typeof createAchievementUnlockedEvent>[];
}

const EVENT_TO_CONDITION: Record<string, string> = {
  "learn.fragment.artifact_published": "first_fragment",
  "hub.contribution.integrated": "first_contribution",
  "labs.article.published": "first_article",
  "learn.mentorship.started": "mentor",
};

/**
 * Evaluates whether the current event and portfolio state unlock any new achievements.
 * Returns list of newly unlocked achievement types and corresponding domain events.
 */
export function evaluate(
  portfolio: Portfolio,
  event: AchievementEvaluationEvent,
  definitions: AchievementDefinition[] = DEFAULT_ACHIEVEMENT_DEFINITIONS
): AchievementUnlockResult {
  return evaluateAchievements(portfolio, event, definitions);
}

function evaluateAchievements(
  portfolio: Portfolio,
  event: AchievementEvaluationEvent,
  definitions: AchievementDefinition[]
): AchievementUnlockResult {
  const unlocked: string[] = [];
  const events: ReturnType<typeof createAchievementUnlockedEvent>[] = [];
  const conditionTypeFromEvent = EVENT_TO_CONDITION[event.type];
  const contributionCount =
    typeof event.payload?.contributionCount === "number"
      ? event.payload.contributionCount
      : 0;

  for (const def of definitions) {
    if (portfolio.hasAchievement(def.id)) continue;

    let shouldUnlock = false;
    if (
      def.conditionType === conditionTypeFromEvent &&
      (def.conditionType === "first_fragment" ||
        def.conditionType === "first_contribution" ||
        def.conditionType === "first_article" ||
        def.conditionType === "mentor")
    ) {
      shouldUnlock = true;
    }
    if (
      def.conditionType === "contributions_count" &&
      typeof def.threshold === "number" &&
      contributionCount >= def.threshold
    ) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      portfolio.unlockAchievement(def.id);
      unlocked.push(def.id);
      events.push(createAchievementUnlockedEvent(portfolio.userId, def.id));
    }
  }

  return { unlocked, events };
}

/**
 * AchievementService (COMP-010.3). Use evaluate() or instance method.
 */
export class AchievementService {
  constructor(
    private readonly definitions: AchievementDefinition[] = DEFAULT_ACHIEVEMENT_DEFINITIONS
  ) {}

  evaluate(portfolio: Portfolio, event: AchievementEvaluationEvent): AchievementUnlockResult {
    return evaluate(portfolio, event, this.definitions);
  }
}
