/**
 * XPCalculator — total XP and level from events (COMP-010.2).
 * Architecture: Platform Core — Portfolio Aggregation.
 */

import { DEFAULT_XP_WEIGHTS, levelFromXp } from "./xp-weights.js";

export interface XPCalculatorEvent {
  readonly type: string;
}

export interface XPCalculatorResult {
  totalXp: number;
  level: number;
}

/**
 * Calculates total XP and level from a list of events using the given weight table.
 */
export function calculate(
  events: XPCalculatorEvent[],
  weights: Record<string, number> = DEFAULT_XP_WEIGHTS
): XPCalculatorResult {
  let totalXp = 0;
  for (const e of events) {
    const w = weights[e.type];
    if (typeof w === "number" && w > 0 && Number.isInteger(w)) {
      totalXp += w;
    }
  }
  const level = levelFromXp(totalXp);
  return { totalXp, level };
}

/**
 * XP calculator (COMP-010.2). Use calculate() or instance method.
 */
export class XPCalculator {
  constructor(private readonly weights: Record<string, number> = DEFAULT_XP_WEIGHTS) {}

  calculate(events: XPCalculatorEvent[]): XPCalculatorResult {
    return calculate(events, this.weights);
  }
}
