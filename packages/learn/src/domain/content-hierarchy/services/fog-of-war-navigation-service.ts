/**
 * Fog-of-war navigation service (COMP-015.3).
 * Determines which courses are unlocked vs locked for a learner based on completed courses.
 * Architecture: Learn Content Hierarchy, content-hierarchy-navigation.md.
 */

import type { CourseId, TrackId } from "@syntropy/types";

import type { Career } from "../career.js";
import type { Course } from "../course.js";
import type { Track } from "../track.js";

/** Single unlocked course entry in the result. */
export interface UnlockedCourse {
  courseId: CourseId;
  trackId: TrackId;
  title: string;
  orderPosition: number;
}

/** Single locked course entry with reason. */
export interface LockedCourse {
  courseId: CourseId;
  trackId: TrackId;
  title: string;
  orderPosition: number;
  /** Human-readable reason why this course is locked. */
  reason: string;
}

/** Result of getAccessible: unlocked and locked content with lock reasons. */
export interface AccessibleContentResult {
  unlocked: UnlockedCourse[];
  locked: LockedCourse[];
}

/**
 * Fog-of-war navigation service. Pure domain service: given a hierarchy snapshot and
 * the set of completed course IDs, computes which courses are unlocked vs locked.
 *
 * Unlock rule: the first course in each track is always unlocked; course at position i
 * is unlocked iff all previous courses (by track order) are in completedCourseIds.
 */
export class FogOfWarNavigationService {
  /**
   * Returns unlocked and locked content with lock reasons for the given hierarchy and progress.
   *
   * @param career - The career aggregate
   * @param tracks - Tracks belonging to this career (order preserved)
   * @param courses - All courses for these tracks
   * @param completedCourseIds - Set of course IDs the learner has completed
   * @returns AccessibleContentResult with unlocked and locked arrays
   */
  getAccessible(
    career: Career,
    tracks: Track[],
    courses: Course[],
    completedCourseIds: ReadonlySet<CourseId> | CourseId[]
  ): AccessibleContentResult {
    const completed = new Set(completedCourseIds);
    const unlocked: UnlockedCourse[] = [];
    const locked: LockedCourse[] = [];

    const trackIds = new Set(career.tracks);
    const tracksForCareer = tracks.filter((t) => trackIds.has(t.id));

    for (const track of tracksForCareer) {
      const trackCourses = courses
        .filter((c) => c.trackId === track.id)
        .sort((a, b) => a.orderPosition - b.orderPosition);

      for (let i = 0; i < trackCourses.length; i++) {
        const course = trackCourses[i];
        const entry = {
          courseId: course.id,
          trackId: course.trackId,
          title: course.title,
          orderPosition: course.orderPosition,
        };

        if (i === 0) {
          unlocked.push(entry);
          continue;
        }

        const previousCourses = trackCourses.slice(0, i);
        const allPreviousCompleted = previousCourses.every((prev) =>
          completed.has(prev.id)
        );

        if (allPreviousCompleted) {
          unlocked.push(entry);
        } else {
          const lastIncomplete = previousCourses.find((prev) => !completed.has(prev.id));
          locked.push({
            ...entry,
            reason: lastIncomplete
              ? `Complete "${lastIncomplete.title}" first`
              : "Complete previous course first",
          });
        }
      }
    }

    return { unlocked, locked };
  }
}
