/**
 * StudyPlan repository port (COMP-029.5).
 * Architecture: Planning domain, PAT-004
 */

import type { StudyPlan } from "../study-plan.js";

export interface StudyPlanRepository {
  save(plan: StudyPlan): Promise<void>;
  findById(id: string): Promise<StudyPlan | null>;
  findByUserId(userId: string): Promise<StudyPlan[]>;
}
