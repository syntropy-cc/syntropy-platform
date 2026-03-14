/**
 * Prerequisite evaluator (COMP-015.4).
 * Checks whether a learner has completed all prerequisites for a course.
 * Architecture: Learn Content Hierarchy, content-hierarchy-navigation.md.
 */

import type { CourseId } from "@syntropy/types";

/** Result of evaluating prerequisites for a course. */
export interface PrerequisiteEvaluationResult {
  /** True iff all prerequisite courses are in completedCourseIds. */
  met: boolean;
  /** Course IDs that are prerequisites but not yet completed. */
  missing: CourseId[];
}

/**
 * Evaluates whether a learner has met all prerequisites for a course.
 * Pure domain: no I/O. Caller supplies prerequisite list and completed set.
 */
export class PrerequisiteEvaluator {
  /**
   * Evaluates prerequisites for a course.
   *
   * @param _courseId - The course being evaluated (for API consistency; not used in pure logic)
   * @param prerequisiteCourseIds - Course IDs that must be completed before this course
   * @param completedCourseIds - Set or array of course IDs the learner has completed
   * @returns PrerequisiteEvaluationResult with met and missing
   */
  evaluate(
    _courseId: CourseId,
    prerequisiteCourseIds: readonly CourseId[],
    completedCourseIds: ReadonlySet<CourseId> | CourseId[]
  ): PrerequisiteEvaluationResult {
    const completed = new Set(completedCourseIds);
    const missing = prerequisiteCourseIds.filter((id) => !completed.has(id));
    return {
      met: missing.length === 0,
      missing: [...missing],
    };
  }
}
