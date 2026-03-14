/**
 * PostgreSQL implementation of IssueRepositoryPort (COMP-019.7).
 */

import { Issue } from "../../domain/collaboration/issue.js";
import type { IssueRepositoryPort } from "../../domain/collaboration/ports/issue-repository-port.js";
import { createIssueId } from "../../domain/collaboration/value-objects/issue-id.js";
import type { IssueId } from "../../domain/collaboration/value-objects/issue-id.js";
import type { HubCollaborationDbClient } from "../hub-collaboration-db-client.js";

const TABLE = "hub.issues";

const SELECT_ALL = `SELECT id, project_id, title, type, status, assignee_id FROM ${TABLE} ORDER BY created_at DESC`;
const SELECT_BY_PROJECT = `SELECT id, project_id, title, type, status, assignee_id FROM ${TABLE} WHERE project_id = $1 ORDER BY created_at DESC`;

const UPSERT_SQL = `
  INSERT INTO ${TABLE} (id, project_id, title, type, status, assignee_id, created_at, updated_at)
  VALUES ($1, $2, $3, $4, $5, $6, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    project_id = EXCLUDED.project_id,
    title = EXCLUDED.title,
    type = EXCLUDED.type,
    status = EXCLUDED.status,
    assignee_id = EXCLUDED.assignee_id,
    updated_at = now()
`;

const SELECT_BY_ID = `SELECT id, project_id, title, type, status, assignee_id FROM ${TABLE} WHERE id = $1`;
const SELECT_BY_IDS = `SELECT id, project_id, title, type, status, assignee_id FROM ${TABLE} WHERE id = ANY($1::uuid[])`;

interface IssueRow {
  id: string;
  project_id: string;
  title: string;
  type: string;
  status: string;
  assignee_id: string | null;
}

function rowToIssue(row: IssueRow): Issue {
  return Issue.fromPersistence({
    issueId: createIssueId(row.id),
    projectId: row.project_id,
    title: row.title,
    type: row.type as "bug" | "feature" | "task" | "chore",
    status: row.status as "open" | "in_progress" | "in_review" | "closed",
    assigneeId: row.assignee_id ?? null,
  });
}

export class PostgresIssueRepository implements IssueRepositoryPort {
  constructor(private readonly client: HubCollaborationDbClient) {}

  async getById(id: IssueId): Promise<Issue | null> {
    const rows = await this.client.query<IssueRow>(SELECT_BY_ID, [id as string]);
    if (rows.length === 0) return null;
    return rowToIssue(rows[0]!);
  }

  async getByIds(ids: string[]): Promise<Issue[]> {
    if (ids.length === 0) return [];
    const rows = await this.client.query<IssueRow>(SELECT_BY_IDS, [ids]);
    return rows.map(rowToIssue);
  }

  async list(filters?: { projectId?: string }): Promise<Issue[]> {
    if (filters?.projectId) {
      const rows = await this.client.query<IssueRow>(SELECT_BY_PROJECT, [
        filters.projectId,
      ]);
      return rows.map(rowToIssue);
    }
    const rows = await this.client.query<IssueRow>(SELECT_ALL, []);
    return rows.map(rowToIssue);
  }

  async save(issue: Issue): Promise<void> {
    await this.client.execute(UPSERT_SQL, [
      issue.issueId as string,
      issue.projectId,
      issue.title,
      issue.type,
      issue.status,
      issue.assigneeId ?? null,
    ]);
  }
}
