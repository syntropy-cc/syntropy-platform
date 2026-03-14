/**
 * PostgreSQL implementation of ProjectRepository (COMP-006.4).
 */

import { DigitalProject } from "../../domain/project-manifest-dag/digital-project.js";
import type { ProjectRepository } from "../../domain/project-manifest-dag/repositories/project-repository.js";
import { createInstitutionId } from "../../domain/project-manifest-dag/value-objects/institution-id.js";
import { createManifestId } from "../../domain/project-manifest-dag/value-objects/manifest-id.js";
import { createProjectId } from "../../domain/project-manifest-dag/value-objects/project-id.js";
import type { InstitutionId } from "../../domain/project-manifest-dag/value-objects/institution-id.js";
import type { ProjectId } from "../../domain/project-manifest-dag/value-objects/project-id.js";
import type { ProjectDbClient } from "../project-db-client.js";

const TABLE = "dip.digital_projects";

const UPSERT_SQL = `
  INSERT INTO ${TABLE} (id, institution_id, manifest_id, title, description, created_at, updated_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  ON CONFLICT (id) DO UPDATE SET
    institution_id = EXCLUDED.institution_id,
    manifest_id = EXCLUDED.manifest_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = EXCLUDED.updated_at
`;

const SELECT_BY_ID = `SELECT id, institution_id, manifest_id, title, description, created_at, updated_at FROM ${TABLE} WHERE id = $1`;
const SELECT_BY_INSTITUTION = `SELECT id, institution_id, manifest_id, title, description, created_at, updated_at FROM ${TABLE} WHERE institution_id = $1 ORDER BY created_at ASC`;

function rowToProject(row: Record<string, unknown>): DigitalProject {
  const projectId = createProjectId(String(row.id));
  const institutionId = createInstitutionId(String(row.institution_id));
  const manifestId = createManifestId(String(row.manifest_id));
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at
      : new Date(String(row.created_at));
  const updatedAt =
    row.updated_at instanceof Date
      ? row.updated_at
      : new Date(String(row.updated_at));
  return DigitalProject.fromPersistence({
    projectId,
    institutionId,
    manifestId,
    title: String(row.title),
    description: row.description != null ? String(row.description) : "",
    createdAt,
    updatedAt,
  });
}

export class PostgresProjectRepository implements ProjectRepository {
  constructor(private readonly client: ProjectDbClient) {}

  async save(project: DigitalProject): Promise<void> {
    await this.client.execute(UPSERT_SQL, [
      project.projectId,
      project.institutionId,
      project.manifestId,
      project.title,
      project.description,
      project.createdAt,
      project.updatedAt,
    ]);
  }

  async findById(projectId: ProjectId): Promise<DigitalProject | null> {
    const rows = await this.client.query<Record<string, unknown>>(
      SELECT_BY_ID,
      [projectId],
    );
    if (rows.length === 0) return null;
    return rowToProject(rows[0]);
  }

  async findByInstitution(
    institutionId: InstitutionId,
  ): Promise<DigitalProject[]> {
    const rows = await this.client.query<Record<string, unknown>>(
      SELECT_BY_INSTITUTION,
      [institutionId],
    );
    return rows.map(rowToProject);
  }
}
