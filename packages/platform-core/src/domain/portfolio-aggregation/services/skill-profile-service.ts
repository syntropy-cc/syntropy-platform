/**
 * SkillProfileService — computes SkillProfile from events (COMP-010.4).
 * Architecture: Platform Core — Portfolio Aggregation.
 *
 * Extracts skill evidence from learn.fragment.artifact_published (tags) and
 * hub.contribution.integrated (skills/tags); aggregates by skill name and
 * assigns proficiency level from signal count.
 */

import type { PortfolioEvent } from "../portfolio.js";
import type { SkillProfile } from "../skill-profile.js";
import { createSkillProfile } from "../skill-profile.js";
import type { SkillRecord } from "../skill-record.js";
import { createSkillRecord } from "../skill-record.js";
import { levelFromSignalCount, normalizeSkillName } from "../skill-taxonomy.js";

/** Event types that carry skill evidence (tags or skills in payload). */
const SKILL_EVENT_TYPES = new Set<string>([
  "learn.fragment.artifact_published",
  "hub.contribution.integrated",
]);

/**
 * Extracts skill names from an event payload (tags or skills array).
 */
function extractSkillNamesFromPayload(payload: Record<string, unknown> | undefined): string[] {
  if (!payload || typeof payload !== "object") return [];
  const tags = payload.tags;
  const skills = payload.skills;
  const fromTags = Array.isArray(tags)
    ? (tags as unknown[]).filter((t): t is string => typeof t === "string").map(normalizeSkillName)
    : [];
  const fromSkills = Array.isArray(skills)
    ? (skills as unknown[]).filter((s): s is string => typeof s === "string").map(normalizeSkillName)
    : [];
  const combined = [...fromTags, ...fromSkills];
  return [...new Set(combined)].filter((s) => s.length > 0);
}

/**
 * Computes SkillProfile for a user from a list of portfolio events.
 * Extracts skill evidence from tags on completed fragments and contributions;
 * returns a profile with proficiency levels derived from signal counts.
 *
 * @param userId - User identifier
 * @param events - Events that may contain skill evidence (e.g. fragment published, contribution integrated)
 * @returns SkillProfile with one SkillRecord per skill area and level from signal count
 */
export function compute(
  userId: string,
  events: PortfolioEvent[]
): SkillProfile {
  const bySkill = new Map<string, { eventIds: string[] }>();

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (!SKILL_EVENT_TYPES.has(event.type)) continue;

    const names = extractSkillNamesFromPayload(event.payload);
    if (names.length === 0) continue;

    const eventId =
      (event.payload && typeof event.payload.id === "string" && event.payload.id) ||
      (event.payload && typeof event.payload.eventId === "string" && event.payload.eventId) ||
      `evt:${event.type}:${i}`;

    for (const name of names) {
      const existing = bySkill.get(name);
      if (existing) {
        existing.eventIds.push(eventId);
      } else {
        bySkill.set(name, { eventIds: [eventId] });
      }
    }
  }

  const skills: SkillRecord[] = [];
  for (const [skillName, { eventIds }] of bySkill.entries()) {
    const level = levelFromSignalCount(eventIds.length);
    skills.push(createSkillRecord(skillName, level, eventIds));
  }

  skills.sort((a, b) => a.skillName.localeCompare(b.skillName));
  return createSkillProfile(userId, skills);
}

/**
 * SkillProfileService (COMP-010.4). Use compute() or instance method.
 */
export class SkillProfileService {
  compute(userId: string, events: PortfolioEvent[]): SkillProfile {
    return compute(userId, events);
  }
}
