/**
 * PostgreSQL implementation of ArtifactRepository (COMP-003.4).
 */

import { Artifact } from "../../domain/artifact-registry/artifact.js";
import { ArtifactStatus } from "../../domain/artifact-registry/artifact-status.js";
import type {
  ArtifactRepository,
  FindPublishedOptions,
} from "../../domain/artifact-registry/repositories/artifact-repository.js";
import { createArtifactId } from "../../domain/artifact-registry/value-objects/artifact-id.js";
import { createAuthorId } from "../../domain/artifact-registry/value-objects/author-id.js";
import { createContentHash } from "../../domain/artifact-registry/value-objects/content-hash.js";
import { createNostrEventId } from "../../domain/artifact-registry/value-objects/nostr-event-id.js";
import type { ArtifactId } from "../../domain/artifact-registry/value-objects/artifact-id.js";
import type { AuthorId } from "../../domain/artifact-registry/value-objects/author-id.js";
import type { ArtifactDbClient } from "../artifact-db-client.js";

const TABLE = "dip.artifacts";

const UPSERT_SQL = `
  INSERT INTO ${TABLE} (id, author_actor_id, content_hash, status, created_at, published_at, archived_at, nostr_event_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  ON CONFLICT (id) DO UPDATE SET
    author_actor_id = EXCLUDED.author_actor_id,
    content_hash = EXCLUDED.content_hash,
    status = EXCLUDED.status,
    created_at = EXCLUDED.created_at,
    published_at = EXCLUDED.published_at,
    archived_at = EXCLUDED.archived_at,
    nostr_event_id = EXCLUDED.nostr_event_id
`;

const SELECT_BY_ID = `SELECT id, author_actor_id, content_hash, status, created_at, published_at, archived_at, nostr_event_id FROM ${TABLE} WHERE id = $1`;
const SELECT_BY_AUTHOR = `SELECT id, author_actor_id, content_hash, status, created_at, published_at, archived_at, nostr_event_id FROM ${TABLE} WHERE author_actor_id = $1 ORDER BY created_at ASC`;
const SELECT_PUBLISHED = `SELECT id, author_actor_id, content_hash, status, created_at, published_at, archived_at, nostr_event_id FROM ${TABLE} WHERE status = $1 ORDER BY published_at ASC NULLS LAST LIMIT $2 OFFSET $3`;

function rowToArtifact(row: Record<string, unknown>): Artifact {
  const id = createArtifactId(String(row.id));
  const authorId = createAuthorId(String(row.author_actor_id));
  const contentHash =
    row.content_hash != null && row.content_hash !== ""
      ? createContentHash(String(row.content_hash))
      : null;
  const nostrEventId =
    row.nostr_event_id != null && row.nostr_event_id !== ""
      ? createNostrEventId(String(row.nostr_event_id))
      : null;
  const status = String(row.status);
  if (!isArtifactStatus(status)) {
    throw new Error(`Invalid artifact status in DB: ${status}`);
  }
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at
      : new Date(String(row.created_at));
  const publishedAt =
    row.published_at != null
      ? row.published_at instanceof Date
        ? row.published_at
        : new Date(String(row.published_at))
      : null;
  const archivedAt =
    row.archived_at != null
      ? row.archived_at instanceof Date
        ? row.archived_at
        : new Date(String(row.archived_at))
      : null;
  return Artifact.fromPersistence({
    id,
    authorId,
    contentHash,
    nostrEventId,
    status,
    createdAt,
    publishedAt,
    archivedAt,
  });
}

function isArtifactStatus(
  value: string,
): value is (typeof ArtifactStatus)[keyof typeof ArtifactStatus] {
  return (
    value === ArtifactStatus.Draft ||
    value === ArtifactStatus.Submitted ||
    value === ArtifactStatus.Published ||
    value === ArtifactStatus.Archived
  );
}

export class PostgresArtifactRepository implements ArtifactRepository {
  constructor(private readonly client: ArtifactDbClient) {}

  async findById(id: ArtifactId): Promise<Artifact | null> {
    const rows = await this.client.query<Record<string, unknown>>(
      SELECT_BY_ID,
      [id],
    );
    if (rows.length === 0) return null;
    return rowToArtifact(rows[0]);
  }

  async save(artifact: Artifact): Promise<void> {
    await this.client.execute(UPSERT_SQL, [
      artifact.id,
      artifact.authorId,
      artifact.contentHash,
      artifact.status,
      artifact.createdAt,
      artifact.publishedAt,
      artifact.archivedAt,
      artifact.nostrEventId,
    ]);
  }

  async findByAuthor(authorId: AuthorId): Promise<Artifact[]> {
    const rows = await this.client.query<Record<string, unknown>>(
      SELECT_BY_AUTHOR,
      [authorId],
    );
    return rows.map(rowToArtifact);
  }

  async findPublished(options?: FindPublishedOptions): Promise<Artifact[]> {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;
    const rows = await this.client.query<Record<string, unknown>>(
      SELECT_PUBLISHED,
      [ArtifactStatus.Published, limit, offset],
    );
    return rows.map(rowToArtifact);
  }
}
