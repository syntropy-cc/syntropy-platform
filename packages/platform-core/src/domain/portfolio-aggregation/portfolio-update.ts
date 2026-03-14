/**
 * Portfolio update — apply a single event to a portfolio (COMP-010.6).
 * Architecture: Platform Core — Portfolio Aggregation.
 *
 * Used by PortfolioEventConsumer to compute the new portfolio state from one event.
 */

import { Portfolio } from "./portfolio.js";
import type { PortfolioEvent } from "./portfolio.js";
import { XPTotal } from "./value-objects.js";
import { ReputationScore } from "./value-objects.js";
import { calculate as calculateXp } from "./xp-calculator.js";
import { DEFAULT_XP_WEIGHTS } from "./xp-weights.js";
import { evaluate as evaluateAchievements } from "./achievement-service.js";
import { compute as computeSkillProfile } from "./services/skill-profile-service.js";
import { calculate as calculateReputation } from "./services/reputation-service.js";
import type { ReputationSignals } from "./reputation-signals.js";
import { createSkillRecord } from "./skill-record.js";
import { levelFromSignalCount } from "./skill-taxonomy.js";

/**
 * Merges existing skills with the skill profile from the new event.
 * For each skill name, combines evidence event IDs and recomputes level from total count.
 */
function mergeSkills(
  existing: readonly { skillName: string; level: string; evidenceEventIds: string[] }[],
  fromEvent: readonly { skillName: string; level: string; evidenceEventIds: string[] }[]
): { skillName: string; level: "beginner" | "intermediate" | "advanced" | "expert"; evidenceEventIds: string[] }[] {
  const byName = new Map<string, string[]>();
  for (const s of existing) {
    byName.set(s.skillName, [...s.evidenceEventIds]);
  }
  for (const s of fromEvent) {
    const current = byName.get(s.skillName) ?? [];
    for (const id of s.evidenceEventIds) {
      if (!current.includes(id)) current.push(id);
    }
    byName.set(s.skillName, current);
  }
  return Array.from(byName.entries()).map(([skillName, evidenceEventIds]) => {
    const level = levelFromSignalCount(evidenceEventIds.length);
    return createSkillRecord(skillName, level, evidenceEventIds);
  });
}

/**
 * Builds reputation signals from portfolio state for the calculator.
 * Uses achievements and XP as proxies when full signals are not available.
 */
function signalsFromPortfolio(portfolio: Portfolio): ReputationSignals {
  const contributionCount = Math.min(100, portfolio.achievements.length * 20);
  return {
    contributionCount,
    reviewScore: 0.5,
    peerFeedbackScore: 0.5,
    lastActivityAt: new Date(),
  };
}

/**
 * Applies a single event to a portfolio and returns the updated portfolio (new instance).
 * Does not mutate the input portfolio.
 */
export function applyEvent(portfolio: Portfolio, event: PortfolioEvent): Portfolio {
  const userId = portfolio.userId;
  const working = Portfolio.create({
    userId,
    xp: XPTotal.create(portfolio.xp),
    reputationScore: ReputationScore.create(portfolio.reputationScore),
    achievements: [...portfolio.achievements],
    skills: [...portfolio.skills],
    version: portfolio.version,
  });

  const xpDelta = calculateXp([event], DEFAULT_XP_WEIGHTS).totalXp;
  if (xpDelta > 0) working.addXp(xpDelta);

  evaluateAchievements(working, { type: event.type, payload: event.payload });

  const skillProfileFromEvent = computeSkillProfile(userId, [event]);
  const mergedSkills = mergeSkills(working.skills, skillProfileFromEvent.skills);
  const repScore = calculateReputation(signalsFromPortfolio(working));

  return Portfolio.create({
    userId,
    xp: XPTotal.create(working.xp),
    reputationScore: ReputationScore.create(repScore.value),
    achievements: [...working.achievements],
    skills: mergedSkills,
    version: working.version,
  });
}
