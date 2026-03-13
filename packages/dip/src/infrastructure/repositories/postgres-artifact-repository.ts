/**
 * PostgreSQL implementation of ArtifactRepository (COMP-003.4, COMP-003.6).
 */

import { Artifact } from "../../domain/artifact-registry/artifact.js";
import { ArtifactStatus } from "../../domain/artifact-registry/artifact-status.js";
import type {
  ArtifactRepository as IArtifactRepository,
  FindPublishedOptions,
  FindPublishedResult,
} from "../../domain/artifact-registry/repositories/artifact-repository.js";
import { createArtifactId } from "../../domain/artifact-registry/value-objects/artifact-id.js";
import { createAuthorId } from "../../domain/artifact-registry/value-objects/author-id.js";
import { createContentHash } from "../../domain/artifact-registry/value-objects/content-hash.js";
import { createNostrEventId } from "../../domain/artifact-registry/value-objects/nostr-event-id.js";
import {
  isArtifactType,
  type ArtifactType,
} from "../../domain/artifact-registry/value-objects/artifact-type.js";
import type { ArtifactId } from "../../domain/artifact-registry/value-objects/artifact-id.js";
import type { AuthorId } from "../../domain/artifact-registry/value-objects/author-id.js";
import type { ArtifactDbClient } from "../artifact-db-client.js";

const TABLE = "dip.artifacts";
const COLS =
  "id, author_actor_id, content_hash, status, created_at, published_at, archived_at, nostr_event_id, artifact_type, tags";

const UPSERT_SQL = `
  INSERT INTO ${TABLE} (id, author_actor_id, content_hash, status, created_at, published_at, archived_at, nostr_event_id, artifact_type, tags)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  ON CONFLICT (id) DO UPDATE SET
    author_actor_id = EXCLUDED.author_actor_id,
    content_hash = EXCLUDED.content_hash,
    status = EXCLUDED.status,
    created_at = EXCLUDED.created_at,
    published_at = EXCLUDED.published_at,
    archived_at = EXCLUDED.archived_at,
    nostr_event_id = EXCLUDED.nostr_event_id,
    artifact_type = EXCLUDED.artifact_type,
    tags = EXCLUDED.tags
`;

const SELECT_BY_ID = `SELECT ${COLS} FROM ${TABLE} WHERE id = $1`;
const SELECT_BY_AUTHOR = `SELECT ${COLS} FROM ${TABLE} WHERE author_actor_id = $1 ORDER BY created_at ASC`;

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseTags(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [];
}

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
  const artifactType =
    row.artifact_type != null && row.artifact_type !== ""
      ? isArtifactType(String(row.artifact_type))
        ? (String(row.artifact_type) as ArtifactType)
        : null
      : null;
  const tags = parseTags(row.tags);
  return Artifact.fromPersistence({
    id,
    authorId,
    contentHash,
    nostrEventId,
    status,
    createdAt,
    publishedAt,
    archivedAt,
    artifactType,
    tags,
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

function encodeCursor(publishedAt: Date, id: string): string {
  return Buffer.from(
    JSON.stringify({ published_at: publishedAt.toISOString(), id }),
    "utf8",
  ).toString("base64url");
}

function decodeCursor(
  cursor: string,
): { published_at: string; id: string } | null {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf8");
    const obj = JSON.parse(json) as { published_at?: string; id?: string };
    if (typeof obj.published_at === "string" && typeof obj.id === "string") {
      return { published_at: obj.published_at, id: obj.id };
    }
  } catch {
    // ignore
  }
  return null;
}

export class PostgresArtifactRepository implements IArtifactRepository {
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
    const tagsDb = artifact.tags.length > 0 ? artifact.tags : null;
    await this.client.execute(UPSERT_SQL, [
      artifact.id,
      artifact.authorId,
      artifact.contentHash,
      artifact.status,
      artifact.createdAt,
      artifact.publishedAt,
      artifact.archivedAt,
      artifact.nostrEventId,
      artifact.artifactType ?? null,
      tagsDb,
    ]);
  }

  async findByAuthor(authorId: AuthorId): Promise<Artifact[]> {
    const rows = await this.client.query<Record<string, unknown>>(
      SELECT_BY_AUTHOR,
      [authorId],
    );
    return rows.map(rowToArtifact);
  }

  async findPublished(options?: FindPublishedOptions): Promise<FindPublishedResult> {
    const limit = Math.min(
      options?.limit ?? DEFAULT_LIMIT,
      MAX_LIMIT,
    );
    const fetchLimit = limit + 1;
    const filter = options?.filter;
    const cursor = options?.cursor ? decodeCursor(options.cursor) : null;

    const conditions: string[] = ["status = $1"];
    const params: unknown[] = [ArtifactStatus.Published];
    let paramIndex = 2;

    if (filter?.authorId != null) {
      conditions.push(`author_actor_id = $${paramIndex}`);
      params.push(filter.authorId);
      paramIndex += 1;
    }
    if (filter?.type != null && filter.type !== "") {
      conditions.push(`artifact_type = $${paramIndex}`);
      params.push(filter.type);
      paramIndex += 1;
    }
    if (filter?.tag != null && filter.tag !== "") {
      conditions.push(`$${paramIndex} = ANY(COALESCE(tags, ARRAY[]::text[]))`);
      params.push(filter.tag);
      paramIndex += 1;
    }
    if (cursor != null) {
      conditions.push(
        `(published_at, id) > ($${paramIndex}::timestamptz, $${paramIndex + 1}::uuid)`,
      );
      params.push(cursor.published_at, cursor.id);
      paramIndex += 2;
    }

    const whereClause = conditions.join(" AND ");
    params.push(fetchLimit);
    const selectPublished = `SELECT ${COLS} FROM ${TABLE} WHERE ${whereClause} ORDER BY published_at ASC NULLS LAST, id ASC LIMIT $${paramIndex}`;

    const rows = await this.client.query<Record<string, unknown>>(
      selectPublished,
      params,
    );
    const items = rows.slice(0, limit).map(rowToArtifact);
    const hasMore = rows.length > limit;
    const nextCursor =
      hasMore && items.length > 0
        ? (() => {
            const last = items[items.length - 1];
            const publishedAt = last.publishedAt ?? last.createdAt;
            return encodeCursor(publishedAt, last.id);
          })()
        : undefined;

    return { items, nextCursor };
  }
}
