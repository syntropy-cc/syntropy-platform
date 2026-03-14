/**
 * PostgreSQL implementation of DiscoveryRepositoryPort (COMP-021.4).
 */

import type { DiscoveryDocument, RecentArtifactRef } from "../../domain/public-square/discovery-document.js";
import type { DiscoveryRepositoryPort } from "../../domain/public-square/ports/discovery-repository-port.js";
import type { HubCollaborationDbClient } from "../hub-collaboration-db-client.js";

const TABLE = "hub.discovery_documents";

const UPSERT_SQL = `
  INSERT INTO ${TABLE} (institution_id, name, prominence_score, project_count, contributor_count, recent_artifacts, indexed_at)
  VALUES ($1, $2, $3, $4, $5, $6::jsonb, now())
  ON CONFLICT (institution_id) DO UPDATE SET
    name = EXCLUDED.name,
    prominence_score = EXCLUDED.prominence_score,
    project_count = EXCLUDED.project_count,
    contributor_count = EXCLUDED.contributor_count,
    recent_artifacts = EXCLUDED.recent_artifacts,
    indexed_at = now()
`;

const SELECT_BY_ID = `SELECT institution_id, name, prominence_score, project_count, contributor_count, recent_artifacts FROM ${TABLE} WHERE institution_id = $1`;
const SELECT_TOP = `SELECT institution_id, name, prominence_score, project_count, contributor_count, recent_artifacts FROM ${TABLE} ORDER BY prominence_score DESC NULLS LAST LIMIT $1`;

interface DiscoveryRow {
  institution_id: string;
  name: string;
  prominence_score: number | string;
  project_count: number;
  contributor_count: number;
  recent_artifacts: unknown;
}

function parseRecentArtifacts(value: unknown): RecentArtifactRef[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
    .map((item) => ({
      artifactId: typeof item.artifactId === "string" ? item.artifactId : String(item.artifactId ?? ""),
      at: typeof item.at === "string" ? item.at : undefined,
    }));
}

function rowToDocument(row: DiscoveryRow): DiscoveryDocument {
  const prominenceScore =
    typeof row.prominence_score === "string"
      ? parseFloat(row.prominence_score)
      : Number(row.prominence_score);
  return {
    institutionId: row.institution_id,
    name: row.name ?? "",
    prominenceScore: Number.isFinite(prominenceScore) ? prominenceScore : 0,
    projectCount: Number(row.project_count) || 0,
    contributorCount: Number(row.contributor_count) || 0,
    recentArtifacts: parseRecentArtifacts(row.recent_artifacts),
  };
}

export class PostgresDiscoveryRepository implements DiscoveryRepositoryPort {
  constructor(private readonly client: HubCollaborationDbClient) {}

  async upsert(doc: DiscoveryDocument): Promise<void> {
    const recentArtifactsJson = JSON.stringify(doc.recentArtifacts);
    await this.client.execute(UPSERT_SQL, [
      doc.institutionId,
      doc.name,
      doc.prominenceScore,
      doc.projectCount,
      doc.contributorCount,
      recentArtifactsJson,
    ]);
  }

  async findById(institutionId: string): Promise<DiscoveryDocument | null> {
    const rows = await this.client.query<DiscoveryRow>(SELECT_BY_ID, [institutionId]);
    if (rows.length === 0) return null;
    return rowToDocument(rows[0]!);
  }

  async findTop(limit: number): Promise<DiscoveryDocument[]> {
    const rows = await this.client.query<DiscoveryRow>(SELECT_TOP, [Math.max(0, limit)]);
    return rows.map(rowToDocument);
  }
}
