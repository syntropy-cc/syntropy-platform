/**
 * Integration tests for PostgresArtifactRepository (COMP-003.4).
 * Uses in-memory mock client to verify repository logic without real DB.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { Artifact } from "../../src/domain/artifact-registry/artifact.js";
import { ArtifactStatus } from "../../src/domain/artifact-registry/artifact-status.js";
import { createArtifactId } from "../../src/domain/artifact-registry/value-objects/artifact-id.js";
import { createAuthorId } from "../../src/domain/artifact-registry/value-objects/author-id.js";
import { createContentHash } from "../../src/domain/artifact-registry/value-objects/content-hash.js";
import { createNostrEventId } from "../../src/domain/artifact-registry/value-objects/nostr-event-id.js";
import { PostgresArtifactRepository } from "../../src/infrastructure/repositories/postgres-artifact-repository.js";
import type { ArtifactDbClient } from "../../src/infrastructure/artifact-db-client.js";

const SAMPLE_HASH =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

function createMockDbClient(): ArtifactDbClient & {
  rows: Map<string, Record<string, unknown>>;
} {
  const rows = new Map<string, Record<string, unknown>>();
  return {
    rows,
    async execute(_sql: string, params: unknown[]): Promise<void> {
      const id = params[0] as string;
      rows.set(id, {
        id: params[0],
        author_actor_id: params[1],
        content_hash: params[2],
        status: params[3],
        created_at: params[4],
        published_at: params[5],
        archived_at: params[6],
        nostr_event_id: params[7],
        artifact_type: params[8] ?? null,
        tags: params[9] ?? null,
      });
    },
    async query<T = Record<string, unknown>>(
      sql: string,
      params: unknown[],
    ): Promise<T[]> {
      if (sql.includes("WHERE id = $1")) {
        const id = params[0] as string;
        const row = rows.get(id);
        return row ? [row as T] : [];
      }
      if (sql.includes("WHERE author_actor_id = $1")) {
        const authorId = params[0] as string;
        return [...rows.values()]
          .filter((r) => r.author_actor_id === authorId)
          .sort(
            (a, b) =>
              new Date(a.created_at as string).getTime() -
              new Date(b.created_at as string).getTime(),
          ) as T[];
      }
      if (
        sql.includes("ORDER BY published_at") &&
        sql.includes("LIMIT")
      ) {
        const fetchLimit = (params[params.length - 1] as number) ?? 100;
        let published = [...rows.values()].filter(
          (r) => r.status === ArtifactStatus.Published,
        );
        const cursorAt = params[1];
        const cursorId = params[2];
        const isCursor =
          params.length >= 4 &&
          typeof cursorAt === "string" &&
          cursorAt.includes("T") &&
          typeof cursorId === "string";
        if (isCursor) {
          published = published.filter((r) => {
            const pt = new Date((r.published_at as string) ?? 0).getTime();
            const id = String(r.id);
            const ct = new Date(cursorAt as string).getTime();
            return pt > ct || (pt === ct && id > cursorId);
          });
        } else if (
          params.length >= 3 &&
          typeof params[1] === "string" &&
          !params[1].includes("T")
        ) {
          published = published.filter((r) => r.author_actor_id === params[1]);
        }
        published.sort((a, b) => {
          const ta = new Date((a.published_at as string) ?? 0).getTime();
          const tb = new Date((b.published_at as string) ?? 0).getTime();
          if (ta !== tb) return ta - tb;
          return String(a.id).localeCompare(String(b.id));
        });
        return published.slice(0, fetchLimit) as T[];
      }
      return [];
    },
  };
}

describe("PostgresArtifactRepository", () => {
  let client: ReturnType<typeof createMockDbClient>;
  let repo: PostgresArtifactRepository;

  beforeEach(() => {
    client = createMockDbClient();
    repo = new PostgresArtifactRepository(client);
  });

  it("save and findById roundtrip returns same artifact", async () => {
    const id = createArtifactId("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    const authorId = createAuthorId("a1b2c3d4-e5f6-4789-a012-3456789abcde");
    const artifact = Artifact.draft({ id, authorId });

    await repo.save(artifact);
    const found = await repo.findById(id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(artifact.id);
    expect(found!.authorId).toBe(artifact.authorId);
    expect(found!.status).toBe(ArtifactStatus.Draft);
    expect(found!.contentHash).toBeNull();
    expect(found!.nostrEventId).toBeNull();
  });

  it("findById returns null when artifact does not exist", async () => {
    const id = createArtifactId("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    const found = await repo.findById(id);
    expect(found).toBeNull();
  });

  it("save updates existing artifact", async () => {
    const id = createArtifactId("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    const authorId = createAuthorId("a1b2c3d4-e5f6-4789-a012-3456789abcde");
    const draft = Artifact.draft({ id, authorId });
    await repo.save(draft);

    const submitted = draft.submit();
    await repo.save(submitted);
    const found = await repo.findById(id);

    expect(found!.status).toBe(ArtifactStatus.Submitted);
  });

  it("save and findById preserve contentHash and nostrEventId", async () => {
    const id = createArtifactId("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    const authorId = createAuthorId("a1b2c3d4-e5f6-4789-a012-3456789abcde");
    const contentHash = createContentHash(SAMPLE_HASH);
    const nostrId = createNostrEventId("a".repeat(64));
    const artifact = Artifact.draft({ id, authorId, contentHash })
      .submit()
      .publish()
      .withNostrEventId(nostrId);

    await repo.save(artifact);
    const found = await repo.findById(id);

    expect(found!.contentHash).toBe(contentHash);
    expect(found!.nostrEventId).toBe(nostrId);
  });

  it("findByAuthor returns only that author's artifacts", async () => {
    const author1 = createAuthorId("a1b2c3d4-e5f6-4789-a012-3456789abcde");
    const author2 = createAuthorId("b2c3d4e5-f6a7-4890-b123-456789abcdef");
    const id1 = createArtifactId("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    const id2 = createArtifactId("e38bd91a-49dd-4483-b456-1f03c3d4e580");
    await repo.save(Artifact.draft({ id: id1, authorId: author1 }));
    await repo.save(Artifact.draft({ id: id2, authorId: author2 }));
    await repo.save(
      Artifact.draft({
        id: createArtifactId("d29ac02b-39ee-4594-a567-2e14d5f6a691"),
        authorId: author1,
      }),
    );

    const byAuthor1 = await repo.findByAuthor(author1);
    const byAuthor2 = await repo.findByAuthor(author2);

    expect(byAuthor1).toHaveLength(2);
    expect(byAuthor2).toHaveLength(1);
  });

  it("findPublished returns only published artifacts with limit and offset", async () => {
    const authorId = createAuthorId("a1b2c3d4-e5f6-4789-a012-3456789abcde");
    const ids = [
      createArtifactId("f47ac10b-58cc-4372-a567-0e02b2c3d479"),
      createArtifactId("e38bd91a-49dd-4483-b456-1f03c3d4e580"),
      createArtifactId("d29ac02b-39ee-4594-a567-2e14d5f6a691"),
    ];
    for (const id of ids) {
      const artifact = Artifact.draft({ id, authorId }).submit().publish();
      await repo.save(artifact);
    }
    await repo.save(
      Artifact.draft({
        id: createArtifactId("c18bd13c-28ff-4695-a678-3f25e6a7b792"),
        authorId,
      }),
    );

    const page1 = await repo.findPublished({ limit: 2 });
    const page2 = page1.nextCursor
      ? await repo.findPublished({ limit: 2, cursor: page1.nextCursor })
      : { items: [] };

    expect(page1.items).toHaveLength(2);
    expect(page2.items).toHaveLength(1);
    expect(page1.items.every((a) => a.status === ArtifactStatus.Published)).toBe(
      true,
    );
  });
});
