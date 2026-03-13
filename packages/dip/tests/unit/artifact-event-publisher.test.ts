/**
 * Unit tests for ArtifactEventPublisher (COMP-003.5).
 */

import { describe, expect, it, vi } from "vitest";
import type { KafkaProducer } from "@syntropy/event-bus";
import { createArtifactId } from "../../src/domain/artifact-registry/value-objects/artifact-id.js";
import { createAuthorId } from "../../src/domain/artifact-registry/value-objects/author-id.js";
import { ArtifactEventPublisher } from "../../src/infrastructure/artifact-event-publisher.js";

const SAMPLE_ARTIFACT_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const SAMPLE_AUTHOR_ID = "a1b2c3d4-e5f6-4789-a012-3456789abcde";

function createMockProducer(): KafkaProducer & { calls: { topic: string; event: unknown }[] } {
  const calls: { topic: string; event: unknown }[] = [];
  return {
    calls,
    publish: vi.fn(async (topic: string, event: unknown) => {
      calls.push({ topic, event });
    }),
  } as unknown as KafkaProducer & { calls: { topic: string; event: unknown }[] };
}

describe("ArtifactEventPublisher", () => {
  it("publishes drafted event with correct topic, eventType, schemaVersion and payload", async () => {
    const producer = createMockProducer();
    const publisher = new ArtifactEventPublisher(producer);
    const artifactId = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const timestamp = new Date("2024-06-01T12:00:00Z");

    await publisher.publish({
      type: "dip.artifact.drafted",
      artifactId,
      authorId,
      timestamp,
    });

    expect(producer.publish).toHaveBeenCalledTimes(1);
    expect(producer.calls[0].topic).toBe("dip.artifact.events");
    expect(producer.calls[0].event).toMatchObject({
      eventType: "dip.artifact.drafted",
      schemaVersion: 1,
      payload: {
        artifactId,
        authorId,
        timestamp: "2024-06-01T12:00:00.000Z",
      },
    });
  });

  it("publishes submitted event with correct eventType", async () => {
    const producer = createMockProducer();
    const publisher = new ArtifactEventPublisher(producer);
    const artifactId = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const timestamp = new Date();

    await publisher.publish({
      type: "dip.artifact.submitted",
      artifactId,
      authorId,
      timestamp,
    });

    expect(producer.calls[0].event).toMatchObject({
      eventType: "dip.artifact.submitted",
      schemaVersion: 1,
      payload: { artifactId, authorId },
    });
  });

  it("publishes published event with correct eventType", async () => {
    const producer = createMockProducer();
    const publisher = new ArtifactEventPublisher(producer);
    const artifactId = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const timestamp = new Date();

    await publisher.publish({
      type: "dip.artifact.published",
      artifactId,
      authorId,
      timestamp,
    });

    expect(producer.calls[0].event).toMatchObject({
      eventType: "dip.artifact.published",
      schemaVersion: 1,
    });
  });

  it("publishes archived event with correct eventType", async () => {
    const producer = createMockProducer();
    const publisher = new ArtifactEventPublisher(producer);
    const artifactId = createArtifactId(SAMPLE_ARTIFACT_ID);
    const authorId = createAuthorId(SAMPLE_AUTHOR_ID);
    const timestamp = new Date();

    await publisher.publish({
      type: "dip.artifact.archived",
      artifactId,
      authorId,
      timestamp,
    });

    expect(producer.calls[0].event).toMatchObject({
      eventType: "dip.artifact.archived",
      schemaVersion: 1,
    });
  });
});
