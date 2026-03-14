/**
 * PostgreSQL implementation of CareerRepository (COMP-015.5).
 * Architecture: Learn Content Hierarchy, PAT-004.
 */

import type { CareerId, TrackId } from "@syntropy/types";
import type { Pool } from "pg";
import { Career } from "../../domain/content-hierarchy/career.js";
import type { CareerRepository } from "../../domain/ports/content-hierarchy-repositories.js";

interface CareerRow {
  id: string;
  title: string;
  track_ids: string[] | unknown;
}

function rowToCareer(row: CareerRow): Career {
  const careerId = row.id as CareerId;
  const trackIds = (Array.isArray(row.track_ids) ? row.track_ids : []) as TrackId[];
  return Career.create({
    careerId,
    title: row.title,
    trackIds,
  });
}

export class PostgresCareerRepository implements CareerRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: CareerId): Promise<Career | null> {
    const result = await this.pool.query<CareerRow>(
      "SELECT id, title, track_ids FROM learn.careers WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const trackIdsRaw = row.track_ids;
    const trackIds = Array.isArray(trackIdsRaw) ? trackIdsRaw : [];
    return rowToCareer({ ...row, track_ids: trackIds });
  }

  async save(career: Career): Promise<void> {
    const trackIds = career.tracks as unknown as string[];
    await this.pool.query(
      `INSERT INTO learn.careers (id, title, track_ids, updated_at)
       VALUES ($1, $2, $3::jsonb, now())
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         track_ids = EXCLUDED.track_ids,
         updated_at = now()`,
      [career.careerId, career.title, JSON.stringify(trackIds)]
    );
  }

  async listAll(): Promise<Career[]> {
    const result = await this.pool.query<CareerRow>(
      "SELECT id, title, track_ids FROM learn.careers ORDER BY title"
    );
    return result.rows.map((row) => {
      const trackIdsRaw = row.track_ids;
      const trackIds = Array.isArray(trackIdsRaw) ? trackIdsRaw : [];
      return rowToCareer({ ...row, track_ids: trackIds });
    });
  }
}
