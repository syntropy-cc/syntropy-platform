/**
 * Track entity — construction plan for a project within a Career (COMP-015.1, 015.2).
 * Architecture: Learn Content Hierarchy, IL2 (dip_reference_project_id immutable).
 */

import type { CareerId, CourseId, TrackId } from "@syntropy/types";

export interface TrackParams {
  id: TrackId;
  careerId: CareerId;
  title: string;
  courseIds: CourseId[];
  /** Course IDs that must be completed before others (e.g. for ordering / gating). */
  prerequisites?: CourseId[];
}

/**
 * Track entity. Sequence of courses building toward a real project.
 * IL2: dip_reference_project_id (when added) is set once and never changed.
 * Prerequisites define which courses must be completed before later ones (by order).
 */
export class Track {
  readonly id: TrackId;
  readonly careerId: CareerId;
  readonly title: string;
  private readonly _courseIds: readonly CourseId[];
  private readonly _prerequisites: readonly CourseId[];

  private constructor(params: TrackParams) {
    this.id = params.id;
    this.careerId = params.careerId;
    this.title = params.title;
    this._courseIds = [...params.courseIds];
    this._prerequisites = [...(params.prerequisites ?? [])];
  }

  static create(params: TrackParams): Track {
    return new Track(params);
  }

  get courseIds(): readonly CourseId[] {
    return this._courseIds;
  }

  get prerequisites(): readonly CourseId[] {
    return this._prerequisites;
  }
}
