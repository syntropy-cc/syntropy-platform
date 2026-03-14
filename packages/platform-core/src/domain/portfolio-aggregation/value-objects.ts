/**
 * Value objects for Portfolio aggregate (COMP-010.1).
 * Architecture: Platform Core — Portfolio Aggregation.
 */

/** XP total; must be non-negative. */
export class XPTotal {
  private constructor(private readonly _value: number) {}

  get value(): number {
    return this._value;
  }

  static create(initial: number = 0): XPTotal {
    if (initial < 0 || !Number.isInteger(initial)) {
      throw new Error("XPTotal must be a non-negative integer");
    }
    return new XPTotal(initial);
  }

  add(delta: number): XPTotal {
    if (delta <= 0 || !Number.isInteger(delta)) {
      throw new Error("XP delta must be a positive integer");
    }
    return new XPTotal(this._value + delta);
  }
}

/** Reputation score in [0.0, 1.0]. */
export class ReputationScore {
  private constructor(private readonly _value: number) {}

  get value(): number {
    return this._value;
  }

  static create(value: number): ReputationScore {
    if (value < 0 || value > 1) {
      throw new Error("ReputationScore must be between 0 and 1");
    }
    return new ReputationScore(value);
  }
}

/** Skill level. */
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
