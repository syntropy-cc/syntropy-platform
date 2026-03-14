/**
 * Course entity — coherent learning unit within a Track (COMP-015.1, 015.2).
 * Architecture: Learn Content Hierarchy.
 */

import type { CourseId, FragmentId, TrackId } from "@syntropy/types";

import { CourseStatus } from "./course-status.js";

export interface CourseParams {
  id: CourseId;
  trackId: TrackId;
  title: string;
  orderPosition: number;
  fragmentIds: FragmentId[];
  status?: CourseStatus;
}

/**
 * Course entity. Ordered list of fragments within a track.
 * Ordering is enforced by orderPosition; status defaults to Draft.
 */
export class Course {
  readonly id: CourseId;
  readonly trackId: TrackId;
  readonly title: string;
  readonly orderPosition: number;
  private readonly _fragmentIds: readonly FragmentId[];
  readonly status: CourseStatus;

  private constructor(params: CourseParams) {
    this.id = params.id;
    this.trackId = params.trackId;
    this.title = params.title;
    this.orderPosition = params.orderPosition;
    this._fragmentIds = [...params.fragmentIds];
    this.status = params.status ?? CourseStatus.Draft;
  }

  static create(params: CourseParams): Course {
    return new Course(params);
  }

  get fragmentIds(): readonly FragmentId[] {
    return this._fragmentIds;
  }
}
