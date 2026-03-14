/**
 * PostgreSQL implementation of CourseRepository (COMP-015.5).
 * Architecture: Learn Content Hierarchy, PAT-004.
 */

import type { CourseId, FragmentId, TrackId } from "@syntropy/types";
import type { Pool } from "pg";
import { Course } from "../../domain/content-hierarchy/course.js";
import { CourseStatus } from "../../domain/content-hierarchy/course-status.js";
import type { CourseRepository } from "../../domain/ports/content-hierarchy-repositories.js";

interface CourseRow {
  id: string;
  track_id: string;
  title: string;
  order_position: number;
  fragment_ids: string[];
  status: string;
}

function rowToCourse(row: CourseRow): Course {
  const fragmentIds = (Array.isArray(row.fragment_ids) ? row.fragment_ids : []) as FragmentId[];
  const status =
    row.status === "published" ? CourseStatus.Published : CourseStatus.Draft;
  return Course.create({
    id: row.id as CourseId,
    trackId: row.track_id as TrackId,
    title: row.title,
    orderPosition: row.order_position,
    fragmentIds,
    status,
  });
}

export class PostgresCourseRepository implements CourseRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: CourseId): Promise<Course | null> {
    const result = await this.pool.query<CourseRow>(
      "SELECT id, track_id, title, order_position, fragment_ids, status FROM learn.courses WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const fragmentIds = Array.isArray(row.fragment_ids) ? row.fragment_ids : (row.fragment_ids as unknown as string[]) ?? [];
    return rowToCourse({ ...row, fragment_ids: fragmentIds });
  }

  async save(course: Course): Promise<void> {
    const fragmentIds = course.fragmentIds as unknown as string[];
    const status = course.status === CourseStatus.Published ? "published" : "draft";
    await this.pool.query(
      `INSERT INTO learn.courses (id, track_id, title, order_position, fragment_ids, status, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, now())
       ON CONFLICT (id) DO UPDATE SET
         track_id = EXCLUDED.track_id,
         title = EXCLUDED.title,
         order_position = EXCLUDED.order_position,
         fragment_ids = EXCLUDED.fragment_ids,
         status = EXCLUDED.status,
         updated_at = now()`,
      [course.id, course.trackId, course.title, course.orderPosition, JSON.stringify(fragmentIds), status]
    );
  }

  async listByTrackId(trackId: TrackId): Promise<Course[]> {
    const result = await this.pool.query<CourseRow>(
      "SELECT id, track_id, title, order_position, fragment_ids, status FROM learn.courses WHERE track_id = $1 ORDER BY order_position",
      [trackId]
    );
    return result.rows.map((row) => {
      const fragmentIds = Array.isArray(row.fragment_ids) ? row.fragment_ids : (row.fragment_ids as unknown as string[]) ?? [];
      return rowToCourse({ ...row, fragment_ids: fragmentIds });
    });
  }
}
