/**
 * Port to resolve course/track hierarchy for progress cascade (COMP-016.3).
 * Architecture: fragment-artifact-engine.md.
 */

import type { CourseId, FragmentId, TrackId } from "@syntropy/types";

/**
 * Allows ProgressTrackingService to determine course/track and fragment/course lists
 * for cascade completion (fragment → course → track).
 */
export interface CourseHierarchyPort {
  getCourseIdForFragment(fragmentId: FragmentId): Promise<CourseId | null>;

  getFragmentIdsForCourse(courseId: CourseId): Promise<FragmentId[]>;

  getTrackIdForCourse(courseId: CourseId): Promise<TrackId | null>;

  getCourseIdsForTrack(trackId: TrackId): Promise<CourseId[]>;
}
