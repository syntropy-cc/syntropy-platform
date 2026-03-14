/**
 * PostgreSQL implementation of ContributionRepositoryPort (COMP-019.7).
 */

import { Contribution } from "../../domain/collaboration/contribution.js";
import type { ContributionRepositoryPort } from "../../domain/collaboration/ports/contribution-repository-port.js";
import { createContributionId } from "../../domain/collaboration/value-objects/contribution-id.js";
import type { ContributionId } from "../../domain/collaboration/value-objects/contribution-id.js";
import type { HubCollaborationDbClient } from "../hub-collaboration-db-client.js";

const TABLE = "hub.contributions";
const LINKS_TABLE = "hub.contribution_issue_links";

const UPSERT_SQL = `
  INSERT INTO ${TABLE} (id, project_id, contributor_id, title, description, content, status, dip_artifact_id, reviewer_ids, created_at, updated_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    project_id = EXCLUDED.project_id,
    contributor_id = EXCLUDED.contributor_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    status = EXCLUDED.status,
    dip_artifact_id = COALESCE(EXCLUDED.dip_artifact_id, ${TABLE}.dip_artifact_id),
    reviewer_ids = EXCLUDED.reviewer_ids,
    updated_at = now()
`;

const DELETE_LINKS_SQL = `DELETE FROM ${LINKS_TABLE} WHERE contribution_id = $1`;
const INSERT_LINK_SQL = `INSERT INTO ${LINKS_TABLE} (contribution_id, issue_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`;

const SELECT_BY_ID = `SELECT id, project_id, contributor_id, title, description, content, status, dip_artifact_id, reviewer_ids FROM ${TABLE} WHERE id = $1`;
const SELECT_LINKS = `SELECT issue_id FROM ${LINKS_TABLE} WHERE contribution_id = $1`;

interface ContributionRow {
  id: string;
  project_id: string;
  contributor_id: string;
  title: string;
  description: string;
  content: unknown;
  status: string;
  dip_artifact_id: string | null;
  reviewer_ids: unknown;
}

function parseReviewerIds(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [];
}

function rowToContribution(row: ContributionRow, linkedIssueIds: string[]): Contribution {
  const content =
    row.content != null && typeof row.content === "object" && !Array.isArray(row.content)
      ? (row.content as Record<string, unknown>)
      : {};
  return Contribution.fromPersistence({
    id: createContributionId(row.id),
    projectId: row.project_id,
    contributorId: row.contributor_id,
    title: row.title,
    description: row.description ?? "",
    content,
    status: row.status as
      | "submitted"
      | "in_review"
      | "accepted"
      | "rejected"
      | "integrated",
    linkedIssueIds,
    dipArtifactId: row.dip_artifact_id ?? null,
    reviewerIds: parseReviewerIds(row.reviewer_ids),
  });
}

export class PostgresContributionRepository implements ContributionRepositoryPort {
  constructor(private readonly client: HubCollaborationDbClient) {}

  async getById(id: ContributionId): Promise<Contribution | null> {
    const rows = await this.client.query<ContributionRow>(SELECT_BY_ID, [
      id as string,
    ]);
    if (rows.length === 0) return null;
    const linkRows = await this.client.query<{ issue_id: string }>(
      SELECT_LINKS,
      [id as string]
    );
    const linkedIssueIds = linkRows.map((r) => r.issue_id);
    return rowToContribution(rows[0]!, linkedIssueIds);
  }

  async save(contribution: Contribution): Promise<void> {
    const reviewerIdsJson = JSON.stringify(contribution.reviewerIds);
    const contentJson = JSON.stringify(contribution.content);
    await this.client.execute(UPSERT_SQL, [
      contribution.id as string,
      contribution.projectId,
      contribution.contributorId,
      contribution.title,
      contribution.description,
      contentJson,
      contribution.status,
      contribution.dipArtifactId ?? null,
      reviewerIdsJson,
    ]);
    await this.client.execute(DELETE_LINKS_SQL, [contribution.id as string]);
    for (const issueId of contribution.linkedIssueIds) {
      await this.client.execute(INSERT_LINK_SQL, [
        contribution.id as string,
        issueId,
      ]);
    }
  }
}
