/**
 * StudyPlanService — generates suggested learning path from learner progress (COMP-029.3).
 * Architecture: Planning domain, depends on LearnerProgressPort
 */

import { randomUUID } from "node:crypto";
import type { LearnerProgressPort, SuggestedStep } from "../domain/ports/learner-progress-port.js";
import { StudyPlan } from "../domain/study-plan.js";

/**
 * Builds a study plan for a user and career using progress and fog-of-war from the port.
 * Suggested path = accessible steps not yet completed, in a stable order.
 */
export class StudyPlanService {
  constructor(private readonly learnerProgress: LearnerProgressPort) {}

  async generate(userId: string, careerId: string): Promise<StudyPlan> {
    const input = await this.learnerProgress.getProgress({ userId, careerId });
    const remaining = input.accessibleStepIds.filter(
      (id) => !input.completedStepIds.includes(id)
    );
    const suggestedPath: SuggestedStep[] = remaining.map((stepId, index) => ({
      stepId,
      order: index,
    }));
    const id = randomUUID();
    return StudyPlan.create({
      id,
      userId: input.userId,
      careerId: input.careerId,
      suggestedPath,
    });
  }
}
