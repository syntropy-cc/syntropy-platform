/**
 * PostgreSQL implementation of MentorSessionRepository (COMP-029.5).
 */

import type { Pool } from "pg";
import { MentorSession } from "../../domain/mentor-session.js";
import type { MentorSessionRepository } from "../../domain/ports/mentor-session-repository.js";

const TABLE = "planning.mentor_sessions";

const SESSION_STATUSES = ["scheduled", "completed", "cancelled"] as const;
function isMentorSessionStatus(
  s: string
): s is (typeof SESSION_STATUSES)[number] {
  return SESSION_STATUSES.includes(s as (typeof SESSION_STATUSES)[number]);
}

function rowToMentorSession(row: {
  session_id: string;
  mentor_id: string;
  learner_id: string;
  scheduled_at: Date | string;
  status: string;
}): MentorSession {
  if (!isMentorSessionStatus(row.status)) {
    throw new Error(`Invalid mentor session status in DB: ${row.status}`);
  }
  return MentorSession.fromPersistence({
    sessionId: row.session_id,
    mentorId: row.mentor_id,
    learnerId: row.learner_id,
    scheduledAt: new Date(row.scheduled_at),
    status: row.status,
  });
}

export class PostgresMentorSessionRepository
  implements MentorSessionRepository
{
  constructor(private readonly pool: Pool) {}

  async save(session: MentorSession): Promise<void> {
    const now = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO ${TABLE} (session_id, mentor_id, learner_id, scheduled_at, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (session_id) DO UPDATE SET
         mentor_id = $2, learner_id = $3, scheduled_at = $4, status = $5, updated_at = $6`,
      [
        session.sessionId,
        session.mentorId,
        session.learnerId,
        session.scheduledAt.toISOString(),
        session.status,
        now,
      ]
    );
  }

  async findById(sessionId: string): Promise<MentorSession | null> {
    const result = await this.pool.query(
      `SELECT session_id, mentor_id, learner_id, scheduled_at, status
       FROM ${TABLE} WHERE session_id = $1`,
      [sessionId]
    );
    if (result.rows.length === 0) return null;
    return rowToMentorSession(
      result.rows[0] as Parameters<typeof rowToMentorSession>[0]
    );
  }

  async findByMentorId(mentorId: string): Promise<MentorSession[]> {
    const result = await this.pool.query(
      `SELECT session_id, mentor_id, learner_id, scheduled_at, status
       FROM ${TABLE} WHERE mentor_id = $1 ORDER BY scheduled_at`,
      [mentorId]
    );
    return result.rows.map((row) =>
      rowToMentorSession(row as Parameters<typeof rowToMentorSession>[0])
    );
  }

  async findByLearnerId(learnerId: string): Promise<MentorSession[]> {
    const result = await this.pool.query(
      `SELECT session_id, mentor_id, learner_id, scheduled_at, status
       FROM ${TABLE} WHERE learner_id = $1 ORDER BY scheduled_at`,
      [learnerId]
    );
    return result.rows.map((row) =>
      rowToMentorSession(row as Parameters<typeof rowToMentorSession>[0])
    );
  }
}
