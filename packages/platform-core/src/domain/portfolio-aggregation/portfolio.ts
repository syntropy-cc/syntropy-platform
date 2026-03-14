/**
 * Portfolio aggregate — userId, xp, achievements, skills (COMP-010.1).
 * Architecture: Platform Core — Portfolio Aggregation.
 * Built from events via fromEvents(); achievements can only be unlocked once.
 */

import { XPTotal } from "./value-objects.js";
import { ReputationScore } from "./value-objects.js";
import type { Achievement } from "./achievement.js";
import { createAchievement } from "./achievement.js";
import type { SkillRecord } from "./skill-record.js";

/** Event shape for event-sourced portfolio build. */
export interface PortfolioEvent {
  readonly type: string;
  readonly payload?: Record<string, unknown>;
}

export interface PortfolioParams {
  userId: string;
  xp: XPTotal;
  reputationScore: ReputationScore;
  achievements: Achievement[];
  skills: SkillRecord[];
  /** Set when loading from persistence; used for optimistic locking. */
  version?: number;
}

export class Portfolio {
  readonly userId: string;
  private _xp: XPTotal;
  private readonly _reputationScore: ReputationScore;
  private _achievements: Achievement[];
  private readonly _skills: SkillRecord[];
  readonly version: number;

  private constructor(params: PortfolioParams) {
    this.userId = params.userId;
    this._xp = params.xp;
    this._reputationScore = params.reputationScore;
    this._achievements = [...params.achievements];
    this._skills = [...params.skills];
    this.version = params.version ?? 0;
  }

  /**
   * Create a portfolio from known state (e.g. loaded from persistence).
   */
  static create(params: PortfolioParams): Portfolio {
    return new Portfolio(params);
  }

  get xp(): number {
    return this._xp.value;
  }

  get reputationScore(): number {
    return this._reputationScore.value;
  }

  get achievements(): readonly Achievement[] {
    return this._achievements;
  }

  get skills(): readonly SkillRecord[] {
    return this._skills;
  }

  /**
   * Build a portfolio from a list of events.
   * Uses xpWeightByEventType to sum XP; optional default 0 for unknown event types.
   */
  static fromEvents(
    userId: string,
    events: PortfolioEvent[],
    xpWeightByEventType: Record<string, number> = {}
  ): Portfolio {
    let totalXp = 0;
    for (const e of events) {
      const w = xpWeightByEventType[e.type];
      if (typeof w === "number" && w > 0) {
        totalXp += w;
      }
    }
    return new Portfolio({
      userId,
      xp: XPTotal.create(totalXp),
      reputationScore: ReputationScore.create(0),
      achievements: [],
      skills: [],
    });
  }

  /**
   * Create an empty portfolio for a user.
   */
  static empty(userId: string): Portfolio {
    return new Portfolio({
      userId,
      xp: XPTotal.create(0),
      reputationScore: ReputationScore.create(0),
      achievements: [],
      skills: [],
    });
  }

  /**
   * Unlock an achievement by type. Throws if already unlocked (invariant).
   */
  unlockAchievement(achievementType: string): void {
    const already = this._achievements.some(
      (a) => a.achievementType === achievementType
    );
    if (already) {
      throw new Error(
        `Achievement already unlocked: ${achievementType}`
      );
    }
    this._achievements.push(createAchievement(achievementType));
  }

  /**
   * Add XP. Validates delta > 0.
   */
  addXp(delta: number): void {
    this._xp = this._xp.add(delta);
  }

  /** Check if an achievement type is already unlocked. */
  hasAchievement(achievementType: string): boolean {
    return this._achievements.some((a) => a.achievementType === achievementType);
  }
}
