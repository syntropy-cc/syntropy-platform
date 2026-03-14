/**
 * StudyPlan aggregate — suggested learning path for a learner (COMP-029.3).
 * Architecture: Planning domain
 */

import type { SuggestedStep } from "./ports/learner-progress-port.js";

export interface StudyPlanParams {
  id: string;
  userId: string;
  careerId: string;
  suggestedPath: SuggestedStep[];
}

/**
 * StudyPlan aggregate. Holds the suggested sequence of steps for a learner in a career.
 */
export class StudyPlan {
  readonly id: string;
  readonly userId: string;
  readonly careerId: string;
  readonly suggestedPath: readonly SuggestedStep[];

  private constructor(params: StudyPlanParams) {
    this.id = params.id;
    this.userId = params.userId;
    this.careerId = params.careerId;
    this.suggestedPath = [...params.suggestedPath];
  }

  static create(params: {
    id: string;
    userId: string;
    careerId: string;
    suggestedPath: SuggestedStep[];
  }): StudyPlan {
    if (!params.id?.trim()) {
      throw new Error("StudyPlan.id cannot be empty");
    }
    if (!params.userId?.trim()) {
      throw new Error("StudyPlan.userId cannot be empty");
    }
    if (!params.careerId?.trim()) {
      throw new Error("StudyPlan.careerId cannot be empty");
    }
    return new StudyPlan({
      id: params.id.trim(),
      userId: params.userId.trim(),
      careerId: params.careerId.trim(),
      suggestedPath: params.suggestedPath ?? [],
    });
  }

  static fromPersistence(params: StudyPlanParams): StudyPlan {
    return new StudyPlan(params);
  }
}
