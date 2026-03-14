/**
 * Port for learner progress and accessible content (COMP-029.3).
 * Implementations live in Learn or app layer; keeps Planning independent of Learn package.
 */

/**
 * Minimal representation of a suggested step in a study plan (e.g. fragment or course id).
 */
export interface SuggestedStep {
  /** Stable id (e.g. fragment id, course id). */
  stepId: string;
  /** Display or type hint. */
  label?: string;
  /** Order in the path (0-based). */
  order: number;
}

/**
 * Input for generating a study plan: accessible content and progress for a user in a career.
 */
export interface LearnerProgressInput {
  /** Career (track) identifier. */
  careerId: string;
  /** User identifier. */
  userId: string;
  /** Ordered list of step ids the learner can access (fog-of-war). */
  accessibleStepIds: string[];
  /** Step ids already completed by the learner. */
  completedStepIds: string[];
}

/**
 * Port to obtain learner progress and accessible content for a career.
 * Used by StudyPlanService.generate; implemented by Learn domain or app.
 */
export interface LearnerProgressPort {
  getProgress(params: {
    userId: string;
    careerId: string;
  }): Promise<LearnerProgressInput>;
}
