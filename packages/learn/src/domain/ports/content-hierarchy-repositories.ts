/**
 * Content hierarchy repository ports (COMP-015.5).
 * Architecture: Learn Content Hierarchy, PAT-004.
 */

import type { CareerId, CourseId, TrackId } from "@syntropy/types";

import type { Career } from "../content-hierarchy/career.js";
import type { Course } from "../content-hierarchy/course.js";
import type { Track } from "../content-hierarchy/track.js";

/** Repository for Career aggregates. */
export interface CareerRepository {
  findById(id: CareerId): Promise<Career | null>;
  save(career: Career): Promise<void>;
  listAll(): Promise<Career[]>;
}

/** Repository for Track entities. */
export interface TrackRepository {
  findById(id: TrackId): Promise<Track | null>;
  save(track: Track): Promise<void>;
  listByCareerId(careerId: CareerId): Promise<Track[]>;
}

/** Repository for Course entities. */
export interface CourseRepository {
  findById(id: CourseId): Promise<Course | null>;
  save(course: Course): Promise<void>;
  listByTrackId(trackId: TrackId): Promise<Course[]>;
}
