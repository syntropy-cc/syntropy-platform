/**
 * PostgreSQL implementation of TrackRepository (COMP-015.5).
 * Architecture: Learn Content Hierarchy, PAT-004.
 */

import type { CareerId, CourseId, TrackId } from "@syntropy/types";
import type { Pool } from "pg";
import { Track } from "../../domain/content-hierarchy/track.js";
import type { TrackRepository } from "../../domain/ports/content-hierarchy-repositories.js";

interface TrackRow {
  id: string;
  career_id: string;
  title: string;
  course_ids: string[];
  prerequisites: string[];
}

function rowToTrack(row: TrackRow): Track {
  const courseIds = (Array.isArray(row.course_ids) ? row.course_ids : []) as CourseId[];
  const prerequisites = (Array.isArray(row.prerequisites) ? row.prerequisites : []) as CourseId[];
  return Track.create({
    id: row.id as TrackId,
    careerId: row.career_id as CareerId,
    title: row.title,
    courseIds,
    prerequisites,
  });
}

export class PostgresTrackRepository implements TrackRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: TrackId): Promise<Track | null> {
    const result = await this.pool.query<TrackRow>(
      "SELECT id, career_id, title, course_ids, prerequisites FROM learn.tracks WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const courseIds = Array.isArray(row.course_ids) ? row.course_ids : (row.course_ids as unknown as string[]) ?? [];
    const prerequisites = Array.isArray(row.prerequisites) ? row.prerequisites : (row.prerequisites as unknown as string[]) ?? [];
    return rowToTrack({ ...row, course_ids: courseIds, prerequisites });
  }

  async save(track: Track): Promise<void> {
    const courseIds = track.courseIds as unknown as string[];
    const prerequisites = track.prerequisites as unknown as string[];
    await this.pool.query(
      `INSERT INTO learn.tracks (id, career_id, title, course_ids, prerequisites, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, now())
       ON CONFLICT (id) DO UPDATE SET
         career_id = EXCLUDED.career_id,
         title = EXCLUDED.title,
         course_ids = EXCLUDED.course_ids,
         prerequisites = EXCLUDED.prerequisites,
         updated_at = now()`,
      [track.id, track.careerId, track.title, JSON.stringify(courseIds), JSON.stringify(prerequisites)]
    );
  }

  async listByCareerId(careerId: CareerId): Promise<Track[]> {
    const result = await this.pool.query<TrackRow>(
      "SELECT id, career_id, title, course_ids, prerequisites FROM learn.tracks WHERE career_id = $1 ORDER BY title",
      [careerId]
    );
    return result.rows.map((row) => {
      const courseIds = Array.isArray(row.course_ids) ? row.course_ids : (row.course_ids as unknown as string[]) ?? [];
      const prerequisites = Array.isArray(row.prerequisites) ? row.prerequisites : (row.prerequisites as unknown as string[]) ?? [];
      return rowToTrack({ ...row, course_ids: courseIds, prerequisites });
    });
  }
}
