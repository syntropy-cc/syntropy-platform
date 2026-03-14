/**
 * Integration tests for PublicSquareIndexer (COMP-021.3).
 * Uses in-memory repository and mock consumer to assert index updates.
 */

import { describe, it, expect } from "vitest";
import { PublicSquareIndexer } from "../../src/infrastructure/consumers/public-square-indexer.js";
import { InMemoryDiscoveryRepository } from "../../src/infrastructure/repositories/in-memory-discovery-repository.js";
import type { ConsumedMessage } from "@syntropy/event-bus";

function makeMessage(topic: string, eventType: string, payload: Record<string, unknown>): ConsumedMessage {
  const value = Buffer.from(
    JSON.stringify({ eventType, payload }),
    "utf8"
  );
  return {
    topic,
    partition: 0,
    offset: "0",
    key: null,
    value,
  };
}

describe("PublicSquareIndexer", () => {
  it("upserts DiscoveryDocument on dip.governance.institution_created and recomputes prominence", async () => {
    const repository = new InMemoryDiscoveryRepository();
    let capturedHandler: ((msg: ConsumedMessage) => Promise<void>) | null = null;
    const mockConsumer = {
      subscribeMany(_topics: string[], handler: (msg: ConsumedMessage) => Promise<void>) {
        capturedHandler = handler;
      },
      disconnect: async () => {},
    };

    const indexer = new PublicSquareIndexer({
      consumer: mockConsumer as any,
      repository,
    });
    indexer.start();
    expect(capturedHandler).not.toBeNull();

    const msg = makeMessage("dip.governance.events", "dip.governance.institution_created", {
      institutionId: "inst-1",
      name: "Acme Lab",
    });
    await capturedHandler!(msg);

    const doc = await repository.findById("inst-1");
    expect(doc).not.toBeNull();
    expect(doc!.institutionId).toBe("inst-1");
    expect(doc!.name).toBe("Acme Lab");
    expect(doc!.prominenceScore).toBeGreaterThanOrEqual(0);
    expect(doc!.prominenceScore).toBeLessThanOrEqual(100);
  });

  it("updates document on hub.contribution.integrated and adds recent artifact", async () => {
    const repository = new InMemoryDiscoveryRepository();
    let capturedHandler: ((msg: ConsumedMessage) => Promise<void>) | null = null;
    const mockConsumer = {
      subscribeMany(_topics: string[], handler: (msg: ConsumedMessage) => Promise<void>) {
        capturedHandler = handler;
      },
      disconnect: async () => {},
    };

    const indexer = new PublicSquareIndexer({
      consumer: mockConsumer as any,
      repository,
    });
    indexer.start();

    await capturedHandler!(
      makeMessage("dip.governance.events", "dip.governance.institution_created", {
        institutionId: "inst-2",
        name: "Beta Org",
      })
    );
    await capturedHandler!(
      makeMessage("hub.events", "hub.contribution.integrated", {
        institutionId: "inst-2",
        artifactId: "art-1",
      })
    );

    const doc = await repository.findById("inst-2");
    expect(doc).not.toBeNull();
    expect(doc!.recentArtifacts.length).toBe(1);
    expect(doc!.recentArtifacts[0].artifactId).toBe("art-1");
    expect(doc!.prominenceScore).toBeGreaterThanOrEqual(0);
  });

  it("findTop returns documents ordered by prominence", async () => {
    const repository = new InMemoryDiscoveryRepository();
    let capturedHandler: ((msg: ConsumedMessage) => Promise<void>) | null = null;
    const mockConsumer = {
      subscribeMany(_topics: string[], handler: (msg: ConsumedMessage) => Promise<void>) {
        capturedHandler = handler;
      },
      disconnect: async () => {},
    };

    const indexer = new PublicSquareIndexer({
      consumer: mockConsumer as any,
      repository,
    });
    indexer.start();

    await capturedHandler!(
      makeMessage("dip.governance.events", "dip.governance.institution_created", {
        institutionId: "low",
        name: "Low",
      })
    );
    await capturedHandler!(
      makeMessage("dip.governance.events", "dip.governance.institution_created", {
        institutionId: "high",
        name: "High",
      })
    );
    await capturedHandler!(
      makeMessage("hub.events", "hub.contribution.integrated", {
        institutionId: "high",
        artifactId: "a1",
      })
    );

    const top = await repository.findTop(10);
    expect(top.length).toBeGreaterThanOrEqual(1);
    const ids = top.map((d) => d.institutionId);
    expect(ids).toContain("high");
    expect(ids).toContain("low");
    if (top.length >= 2) {
      expect(top[0].prominenceScore).toBeGreaterThanOrEqual(top[1].prominenceScore);
    }
  });
});
