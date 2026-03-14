/**
 * PostgreSQL implementation of MentorshipRepository (COMP-018.4).
 * Architecture: mentorship-community.md, PAT-004.
 */

import type {
  FragmentId,
  MentorReviewId,
  MentorshipRelationshipId,
  TrackId,
} from "@syntropy/types";
import type { Pool } from "pg";

import { MentorReview } from "../../domain/mentorship/mentor-review.js";
import { MentorshipRelationship } from "../../domain/mentorship/mentorship-relationship.js";
import type { MentorshipStatus } from "../../domain/mentorship/mentorship-relationship-status.js";
import type { MentorshipRepositoryPort } from "../../domain/mentorship/ports/mentorship-repository-port.js";

interface MentorshipRelationshipRow {
  id: string;
  mentor_id: string;
  learner_id: string;
  track_id: string;
  status: string;
  scope_description: string | null;
  proposed_at: Date;
  started_at: Date | null;
  concluded_at: Date | null;
}

interface MentorReviewRow {
  id: string;
  relationship_id: string;
  reviewer_id: string;
  fragment_id: string;
  rating: number;
  feedback: string;
  submitted_at: Date;
  created_at: Date;
}

function rowToRelationship(row: MentorshipRelationshipRow): MentorshipRelationship {
  return MentorshipRelationship.fromStorage({
    id: row.id as MentorshipRelationshipId,
    mentorId: row.mentor_id,
    learnerId: row.learner_id,
    trackId: row.track_id as TrackId,
    status: row.status as MentorshipStatus,
    scopeDescription: row.scope_description,
    proposedAt: new Date(row.proposed_at),
    startedAt: row.started_at ? new Date(row.started_at) : null,
    concludedAt: row.concluded_at ? new Date(row.concluded_at) : null,
  });
}

function rowToReview(row: MentorReviewRow): MentorReview {
  return MentorReview.fromStorage({
    id: row.id as MentorReviewId,
    relationshipId: row.relationship_id as MentorshipRelationshipId,
    reviewerId: row.reviewer_id,
    fragmentId: row.fragment_id as FragmentId,
    rating: row.rating,
    feedback: row.feedback ?? "",
    createdAt: new Date(row.created_at),
  });
}

export class PostgresMentorshipRepository implements MentorshipRepositoryPort {
  constructor(private readonly pool: Pool) {}

  async findById(
    id: MentorshipRelationshipId
  ): Promise<MentorshipRelationship | null> {
    const result = await this.pool.query<MentorshipRelationshipRow>(
      `SELECT id, mentor_id, learner_id, track_id, status, scope_description,
              proposed_at, started_at, concluded_at
       FROM learn.mentorship_relationships WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return rowToRelationship(result.rows[0]!);
  }

  async findByMentor(mentorId: string): Promise<MentorshipRelationship[]> {
    const result = await this.pool.query<MentorshipRelationshipRow>(
      `SELECT id, mentor_id, learner_id, track_id, status, scope_description,
              proposed_at, started_at, concluded_at
       FROM learn.mentorship_relationships WHERE mentor_id = $1
       ORDER BY proposed_at DESC`,
      [mentorId]
    );
    return result.rows.map(rowToRelationship);
  }

  async findByLearner(learnerId: string): Promise<MentorshipRelationship[]> {
    const result = await this.pool.query<MentorshipRelationshipRow>(
      `SELECT id, mentor_id, learner_id, track_id, status, scope_description,
              proposed_at, started_at, concluded_at
       FROM learn.mentorship_relationships WHERE learner_id = $1
       ORDER BY proposed_at DESC`,
      [learnerId]
    );
    return result.rows.map(rowToRelationship);
  }

  async countActiveByMentor(mentorId: string): Promise<number> {
    const result = await this.pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM learn.mentorship_relationships
       WHERE mentor_id = $1 AND status = 'active'`,
      [mentorId]
    );
    return parseInt(result.rows[0]?.count ?? "0", 10);
  }

  async save(relationship: MentorshipRelationship): Promise<void> {
    await this.pool.query(
      `INSERT INTO learn.mentorship_relationships (
         id, mentor_id, learner_id, track_id, status, scope_description,
         proposed_at, started_at, concluded_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         started_at = EXCLUDED.started_at,
         concluded_at = EXCLUDED.concluded_at,
         updated_at = now()`,
      [
        relationship.id,
        relationship.mentorId,
        relationship.learnerId,
        relationship.trackId,
        relationship.status,
        relationship.scopeDescription,
        relationship.proposedAt,
        relationship.startedAt,
        relationship.concludedAt,
      ]
    );
  }

  async saveReview(review: MentorReview): Promise<void> {
    await this.pool.query(
      `INSERT INTO learn.mentor_reviews (
         id, relationship_id, reviewer_id, fragment_id, rating, feedback, submitted_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (relationship_id) DO UPDATE SET
         reviewer_id = EXCLUDED.reviewer_id,
         fragment_id = EXCLUDED.fragment_id,
         rating = EXCLUDED.rating,
         feedback = EXCLUDED.feedback,
         submitted_at = EXCLUDED.submitted_at`,
      [
        review.id,
        review.relationshipId,
        review.reviewerId,
        review.fragmentId,
        review.rating,
        review.feedback,
        review.createdAt,
      ]
    );
  }

  async findReviewByRelationship(
    relationshipId: MentorshipRelationshipId
  ): Promise<MentorReview | null> {
    const result = await this.pool.query<MentorReviewRow>(
      `SELECT id, relationship_id, reviewer_id, fragment_id, rating, feedback,
              submitted_at, created_at
       FROM learn.mentor_reviews WHERE relationship_id = $1`,
      [relationshipId]
    );
    if (result.rows.length === 0) return null;
    return rowToReview(result.rows[0]!);
  }

  async findReviewById(id: MentorReviewId): Promise<MentorReview | null> {
    const result = await this.pool.query<MentorReviewRow>(
      `SELECT id, relationship_id, reviewer_id, fragment_id, rating, feedback,
              submitted_at, created_at
       FROM learn.mentor_reviews WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return rowToReview(result.rows[0]!);
  }
}
