/**
 * PostgreSQL implementation of FragmentRepository (COMP-016.5).
 * Architecture: fragment-artifact-engine.md, PAT-004.
 */

import type { CourseId, FragmentId } from "@syntropy/types";
import type { Pool } from "pg";
import { Fragment } from "../../domain/fragment-artifact/fragment.js";
import { FragmentStatus } from "../../domain/fragment-artifact/fragment-status.js";
import type { FragmentRepositoryPort } from "../../domain/fragment-artifact/ports/fragment-repository-port.js";

interface FragmentRow {
  id: string;
  course_id: string;
  creator_id: string;
  title: string;
  status: string;
  problem_content: string;
  theory_content: string;
  artifact_content: string;
  published_artifact_id: string | null;
}

function rowToFragment(row: FragmentRow): Fragment {
  const status =
    row.status === "published"
      ? FragmentStatus.Published
      : row.status === "in_review"
        ? FragmentStatus.InReview
        : FragmentStatus.Draft;
  return Fragment.create({
    id: row.id as FragmentId,
    courseId: row.course_id as CourseId,
    creatorId: row.creator_id,
    title: row.title,
    status,
    problemContent: row.problem_content ?? "",
    theoryContent: row.theory_content ?? "",
    artifactContent: row.artifact_content ?? "",
    publishedArtifactId: row.published_artifact_id ?? null,
  });
}

export class PostgresFragmentRepository implements FragmentRepositoryPort {
  constructor(private readonly pool: Pool) {}

  async findById(id: FragmentId): Promise<Fragment | null> {
    const result = await this.pool.query<FragmentRow>(
      `SELECT id, course_id, creator_id, title, status,
              problem_content, theory_content, artifact_content,
              published_artifact_id
       FROM learn.fragments WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return rowToFragment(result.rows[0]);
  }

  async save(fragment: Fragment): Promise<void> {
    const status =
      fragment.status === FragmentStatus.Published
        ? "published"
        : fragment.status === FragmentStatus.InReview
          ? "in_review"
          : "draft";
    await this.pool.query(
      `INSERT INTO learn.fragments (
         id, course_id, creator_id, title, status,
         problem_content, theory_content, artifact_content,
         published_artifact_id, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
       ON CONFLICT (id) DO UPDATE SET
         course_id = EXCLUDED.course_id,
         creator_id = EXCLUDED.creator_id,
         title = EXCLUDED.title,
         status = EXCLUDED.status,
         problem_content = EXCLUDED.problem_content,
         theory_content = EXCLUDED.theory_content,
         artifact_content = EXCLUDED.artifact_content,
         published_artifact_id = COALESCE(learn.fragments.published_artifact_id, EXCLUDED.published_artifact_id),
         updated_at = now()`,
      [
        fragment.id,
        fragment.courseId,
        fragment.creatorId,
        fragment.title,
        status,
        fragment.problemSection.content,
        fragment.theorySection.content,
        fragment.artifactSection.content,
        fragment.publishedArtifactId,
      ]
    );
  }
}
