/**
 * Goal repository port (COMP-029.5).
 * Architecture: Planning domain, PAT-004
 */

import type { Goal } from "../goal.js";

export interface GoalRepository {
  save(goal: Goal): Promise<void>;
  findById(goalId: string): Promise<Goal | null>;
  findByUserId(userId: string): Promise<Goal[]>;
}
