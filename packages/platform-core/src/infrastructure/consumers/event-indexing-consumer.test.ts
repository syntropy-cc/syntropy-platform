/**
 * Unit tests for EventIndexingConsumer (COMP-011.3).
 */

import { describe, it, expect, vi } from "vitest";
import { EventIndexingConsumer } from "./event-indexing-consumer.js";
import { SearchIndex } from "../../domain/search-recommendation/search-index.js";
import type { SearchRepository } from "../../domain/search-recommendation/ports/search-repository.js";
import type { ConsumedMessage } from "@syntropy/event-bus";

function createMockConsumer(): {
  subscribeMany: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
} {
  return {
    subscribeMany: vi.fn(),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockRepository(): SearchRepository & { upserted: SearchIndex[] } {
  const upserted: SearchIndex[] = [];
  return {
    upserted,
    async search() {
      return [];
    },
    async upsert(index: SearchIndex): Promise<void> {
      upserted.push(index);
    },
  };
}

function makeMessage(eventType: string, payload: Record<string, unknown>): ConsumedMessage {
  return {
    topic: "dip.events",
    partition: 0,
    offset: "0",
    key: null,
    value: Buffer.from(JSON.stringify({ eventType, payload }), "utf8"),
  };
}

describe("EventIndexingConsumer", () => {
  it("indexes event when eventType ends with .published", async () => {
    const repo = createMockRepository();
    const consumer = createMockConsumer();
    const indexing = new EventIndexingConsumer({
      consumer: consumer as { subscribeMany: (t: string[], h: (m: ConsumedMessage) => Promise<void>) => void; disconnect: () => Promise<void> },
      repository: repo,
    });

    indexing.start();
    expect(consumer.subscribeMany).toHaveBeenCalled();
    const handler = consumer.subscribeMany.mock.calls[0]![1] as (msg: ConsumedMessage) => Promise<void>;

    await handler(
      makeMessage("dip.artifact.published", {
        entityId: "art-123",
        title: "My Artifact",
        content: "Full text for search",
      })
    );

    expect(repo.upserted).toHaveLength(1);
    expect(repo.upserted[0]!.entityType).toBe("artifact");
    expect(repo.upserted[0]!.entityId).toBe("art-123");
    expect(repo.upserted[0]!.tsvectorContent).toContain("My Artifact");
    expect(repo.upserted[0]!.tsvectorContent).toContain("Full text for search");
  });

  it("indexes event when eventType ends with .updated", async () => {
    const repo = createMockRepository();
    const consumer = createMockConsumer();
    const indexing = new EventIndexingConsumer({
      consumer: consumer as { subscribeMany: (t: string[], h: (m: ConsumedMessage) => Promise<void>) => void; disconnect: () => Promise<void> },
      repository: repo,
    });

    indexing.start();
    const handler = consumer.subscribeMany.mock.calls[0]![1] as (msg: ConsumedMessage) => Promise<void>;
    await handler(
      makeMessage("learn.track.updated", {
        entity_id: "trk-1",
        name: "Distributed Systems",
      })
    );

    expect(repo.upserted).toHaveLength(1);
    expect(repo.upserted[0]!.entityType).toBe("track");
    expect(repo.upserted[0]!.entityId).toBe("trk-1");
    expect(repo.upserted[0]!.tsvectorContent).toContain("Distributed Systems");
  });

  it("ignores events that are not .published or .updated", async () => {
    const repo = createMockRepository();
    const consumer = createMockConsumer();
    const indexing = new EventIndexingConsumer({
      consumer: consumer as { subscribeMany: (t: string[], h: (m: ConsumedMessage) => Promise<void>) => void; disconnect: () => Promise<void> },
      repository: repo,
    });

    indexing.start();
    const handler = consumer.subscribeMany.mock.calls[0]![1] as (msg: ConsumedMessage) => Promise<void>;
    await handler(makeMessage("dip.artifact.created", { entityId: "art-1", title: "X" }));

    expect(repo.upserted).toHaveLength(0);
  });

  it("disconnect calls consumer disconnect", async () => {
    const consumer = createMockConsumer();
    const indexing = new EventIndexingConsumer({
      consumer: consumer as { subscribeMany: (t: string[], h: (m: ConsumedMessage) => Promise<void>) => void; disconnect: () => Promise<void> },
      repository: createMockRepository(),
    });
    await indexing.disconnect();
    expect(consumer.disconnect).toHaveBeenCalled();
  });
});
