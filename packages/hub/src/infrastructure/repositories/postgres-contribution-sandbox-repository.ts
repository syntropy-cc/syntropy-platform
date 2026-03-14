/**
 * PostgreSQL implementation of ContributionSandboxRepositoryPort (COMP-019.7).
 */

import {
  ContributionSandbox,
  type SandboxConfig,
} from "../../domain/collaboration/contribution-sandbox.js";
import type { ContributionSandboxRepositoryPort } from "../../domain/collaboration/ports/contribution-sandbox-repository-port.js";
import type { HubCollaborationDbClient } from "../hub-collaboration-db-client.js";

const TABLE = "hub.contribution_sandboxes";

const UPSERT_SQL = `
  INSERT INTO ${TABLE} (id, project_id, title, challenge_description, status, config, ide_session_id, challenge_issue_ids, participant_contribution_ids, started_at, completed_at, created_at, updated_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    project_id = EXCLUDED.project_id,
    title = EXCLUDED.title,
    challenge_description = EXCLUDED.challenge_description,
    status = EXCLUDED.status,
    config = EXCLUDED.config,
    ide_session_id = EXCLUDED.ide_session_id,
    challenge_issue_ids = EXCLUDED.challenge_issue_ids,
    participant_contribution_ids = EXCLUDED.participant_contribution_ids,
    started_at = EXCLUDED.started_at,
    completed_at = EXCLUDED.completed_at,
    updated_at = now()
`;

const SELECT_BY_ID = `SELECT id, project_id, title, challenge_description, status, config, ide_session_id, challenge_issue_ids, participant_contribution_ids, started_at, completed_at FROM ${TABLE} WHERE id = $1`;

interface SandboxRow {
  id: string;
  project_id: string;
  title: string;
  challenge_description: string;
  status: string;
  config: unknown;
  ide_session_id: string | null;
  challenge_issue_ids: unknown;
  participant_contribution_ids: unknown;
  started_at: Date | string | null;
  completed_at: Date | string | null;
}

function parseStringArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [];
}

function parseConfig(value: unknown): SandboxConfig {
  if (value != null && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    return {
      maxParticipants:
        typeof obj.maxParticipants === "number" ? obj.maxParticipants : undefined,
      challengeDefinition:
        obj.challengeDefinition != null &&
        typeof obj.challengeDefinition === "object"
          ? (obj.challengeDefinition as Record<string, unknown>)
          : undefined,
    };
  }
  return {};
}

function parseDate(value: Date | string | null): Date | null {
  if (value == null) return null;
  return value instanceof Date ? value : new Date(value);
}

function rowToSandbox(row: SandboxRow): ContributionSandbox {
  return ContributionSandbox.fromPersistence({
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    challengeDescription: row.challenge_description ?? "",
    status: row.status as "setting_up" | "active" | "completed",
    config: parseConfig(row.config),
    ideSessionId: row.ide_session_id ?? null,
    challengeIssueIds: parseStringArray(row.challenge_issue_ids),
    participantContributionIds: parseStringArray(row.participant_contribution_ids),
    startedAt: parseDate(row.started_at),
    completedAt: parseDate(row.completed_at),
  });
}

export class PostgresContributionSandboxRepository
  implements ContributionSandboxRepositoryPort
{
  constructor(private readonly client: HubCollaborationDbClient) {}

  async getById(id: string): Promise<ContributionSandbox | null> {
    const rows = await this.client.query<SandboxRow>(SELECT_BY_ID, [id]);
    if (rows.length === 0) return null;
    return rowToSandbox(rows[0]!);
  }

  async save(sandbox: ContributionSandbox): Promise<void> {
    const configJson = JSON.stringify(sandbox.config);
    const challengeIdsJson = JSON.stringify(sandbox.challengeIssueIds);
    const participantIdsJson = JSON.stringify(sandbox.participantContributionIds);
    await this.client.execute(UPSERT_SQL, [
      sandbox.id,
      sandbox.projectId,
      sandbox.title,
      sandbox.challengeDescription,
      sandbox.status,
      configJson,
      sandbox.ideSessionId ?? null,
      challengeIdsJson,
      participantIdsJson,
      sandbox.startedAt ?? null,
      sandbox.completedAt ?? null,
    ]);
  }
}
