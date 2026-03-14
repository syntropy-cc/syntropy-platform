/**
 * Unit tests for ProjectEventPublisher (COMP-006.5).
 */

import { describe, expect, it, vi } from "vitest";
import type { KafkaProducer } from "@syntropy/event-bus";
import { createInstitutionId } from "../../src/domain/project-manifest-dag/value-objects/institution-id.js";
import { createManifestId } from "../../src/domain/project-manifest-dag/value-objects/manifest-id.js";
import { createProjectId } from "../../src/domain/project-manifest-dag/value-objects/project-id.js";
import { ProjectEventPublisher } from "../../src/infrastructure/project-event-publisher.js";

const SAMPLE_PROJECT_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const SAMPLE_INSTITUTION_ID = "a1b2c3d4-e5f6-4789-a012-3456789abcde";
const SAMPLE_MANIFEST_ID = "b58bd20c-69dd-5483-b678-1f13c3d4e580";

function createMockProducer(): KafkaProducer & {
  calls: { topic: string; event: unknown }[];
} {
  const calls: { topic: string; event: unknown }[] = [];
  return {
    calls,
    publish: vi.fn(async (topic: string, event: unknown) => {
      calls.push({ topic, event });
    }),
  } as unknown as KafkaProducer & {
    calls: { topic: string; event: unknown }[];
  };
}

describe("ProjectEventPublisher", () => {
  it("publishes dip.project.created with correct topic and payload", async () => {
    const producer = createMockProducer();
    const publisher = new ProjectEventPublisher(producer);
    const projectId = createProjectId(SAMPLE_PROJECT_ID);
    const institutionId = createInstitutionId(SAMPLE_INSTITUTION_ID);
    const manifestId = createManifestId(SAMPLE_MANIFEST_ID);
    const timestamp = new Date("2024-06-01T12:00:00Z");

    await publisher.publishProjectCreated({
      type: "dip.project.created",
      projectId,
      institutionId,
      manifestId,
      title: "My Project",
      description: "A description",
      timestamp,
    });

    expect(producer.publish).toHaveBeenCalledTimes(1);
    expect(producer.calls[0].topic).toBe("dip.project.events");
    expect(producer.calls[0].event).toMatchObject({
      eventType: "dip.project.created",
      schemaVersion: 1,
      payload: {
        projectId,
        institutionId,
        manifestId,
        title: "My Project",
        description: "A description",
        timestamp: "2024-06-01T12:00:00.000Z",
      },
      timestamp: "2024-06-01T12:00:00.000Z",
    });
  });

  it("publishes dip.project.manifest_updated with correct topic and payload", async () => {
    const producer = createMockProducer();
    const publisher = new ProjectEventPublisher(producer);
    const projectId = createProjectId(SAMPLE_PROJECT_ID);
    const institutionId = createInstitutionId(SAMPLE_INSTITUTION_ID);
    const manifestId = createManifestId(SAMPLE_MANIFEST_ID);
    const timestamp = new Date("2024-06-02T14:00:00Z");

    await publisher.publishProjectManifestUpdated({
      type: "dip.project.manifest_updated",
      projectId,
      institutionId,
      manifestId,
      title: "Updated Title",
      description: "Updated description",
      timestamp,
    });

    expect(producer.publish).toHaveBeenCalledTimes(1);
    expect(producer.calls[0].topic).toBe("dip.project.events");
    expect(producer.calls[0].event).toMatchObject({
      eventType: "dip.project.manifest_updated",
      schemaVersion: 1,
      payload: {
        projectId,
        institutionId,
        manifestId,
        title: "Updated Title",
        description: "Updated description",
        timestamp: "2024-06-02T14:00:00.000Z",
      },
    });
  });
});
