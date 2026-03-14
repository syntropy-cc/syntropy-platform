/**
 * ProgressTrackingService — marks fragment/course/track progress and emits events (COMP-016.3).
 * Architecture: fragment-artifact-engine.md.
 */

import type { FragmentId } from "@syntropy/types";

import type { CourseHierarchyPort } from "../ports/course-hierarchy-port.js";
import type { LearnerProgressRepositoryPort } from "../ports/learner-progress-repository-port.js";
import type { ProgressEventsPort } from "../ports/progress-events-port.js";
import { LearnerProgressRecord } from "../learner-progress-record.js";

export interface ProgressTrackingServiceParams {
  progressRepository: LearnerProgressRepositoryPort;
  eventsPort: ProgressEventsPort;
  hierarchyPort: CourseHierarchyPort;
}

/**
 * Tracks learner progress per fragment; marks course/track complete when all
 * required entities are completed; publishes learn.fragment.completed and
 * learn.track.completed via port.
 */
export class ProgressTrackingService {
  private readonly _repo: LearnerProgressRepositoryPort;
  private readonly _events: ProgressEventsPort;
  private readonly _hierarchy: CourseHierarchyPort;

  constructor(params: ProgressTrackingServiceParams) {
    this._repo = params.progressRepository;
    this._events = params.eventsPort;
    this._hierarchy = params.hierarchyPort;
  }

  async markFragmentStarted(userId: string, fragmentId: FragmentId): Promise<void> {
    const existing = await this._repo.findByUserAndEntity(
      userId,
      fragmentId,
      "fragment"
    );
    const record = existing ?? LearnerProgressRecord.create({
      userId,
      entityId: fragmentId,
      entityType: "fragment",
      status: "not_started",
    });
    record.markStarted();
    await this._repo.save(record);
  }

  async markFragmentCompleted(
    userId: string,
    fragmentId: FragmentId,
    score?: number | null
  ): Promise<void> {
    const existing = await this._repo.findByUserAndEntity(
      userId,
      fragmentId,
      "fragment"
    );
    const record = existing ?? LearnerProgressRecord.create({
      userId,
      entityId: fragmentId,
      entityType: "fragment",
      status: "not_started",
    });
    record.complete(score ?? undefined);
    await this._repo.save(record);

    const completedAt = record.completedAt ?? new Date();
    await this._events.publishFragmentCompleted(
      userId,
      fragmentId,
      completedAt,
      record.score
    );

    await this.checkCourseAndTrackCompletion(userId, fragmentId, completedAt);
  }

  private async checkCourseAndTrackCompletion(
    userId: string,
    fragmentId: FragmentId,
    completedAt: Date
  ): Promise<void> {
    const courseId = await this._hierarchy.getCourseIdForFragment(fragmentId);
    if (!courseId) return;

    const fragmentIds = await this._hierarchy.getFragmentIdsForCourse(courseId);
    const allFragmentComplete = await this.areAllEntitiesCompleted(
      userId,
      fragmentIds,
      "fragment"
    );
    if (!allFragmentComplete) return;

    const courseRecord = await this._repo.findByUserAndEntity(
      userId,
      courseId,
      "course"
    );
    const course = courseRecord ?? LearnerProgressRecord.create({
      userId,
      entityId: courseId,
      entityType: "course",
      status: "not_started",
    });
    if (!course.isCompleted) {
      course.complete();
      await this._repo.save(course);
    }

    const trackId = await this._hierarchy.getTrackIdForCourse(courseId);
    if (!trackId) return;

    const courseIds = await this._hierarchy.getCourseIdsForTrack(trackId);
    const allCourseComplete = await this.areAllEntitiesCompleted(
      userId,
      courseIds,
      "course"
    );
    if (!allCourseComplete) return;

    const trackRecord = await this._repo.findByUserAndEntity(
      userId,
      trackId,
      "track"
    );
    const track = trackRecord ?? LearnerProgressRecord.create({
      userId,
      entityId: trackId,
      entityType: "track",
      status: "not_started",
    });
    if (!track.isCompleted) {
      track.complete();
      await this._repo.save(track);
      await this._events.publishTrackCompleted(userId, trackId, completedAt);
    }
  }

  private async areAllEntitiesCompleted(
    userId: string,
    entityIds: string[],
    entityType: "fragment" | "course" | "track"
  ): Promise<boolean> {
    for (const entityId of entityIds) {
      const r = await this._repo.findByUserAndEntity(userId, entityId, entityType);
      if (!r || !r.isCompleted) return false;
    }
    return true;
  }
}
