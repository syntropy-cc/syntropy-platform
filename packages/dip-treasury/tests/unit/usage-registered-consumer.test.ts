import { describe, it, expect } from "vitest";
import { UsageRegisteredConsumer, computeUsageContribution } from "../../src/infrastructure/usage-registered-consumer.js";
import { InMemoryUsageRegistry } from "../../src/infrastructure/in-memory-usage-registry.js";

describe("computeUsageContribution", () => {
  it("returns 1 for any payload", () => {
    expect(computeUsageContribution({})).toBe(1);
    expect(computeUsageContribution({ artifactId: "a1" })).toBe(1);
  });
});

describe("UsageRegisteredConsumer", () => {
  it("records contribution when message is dip.artifact.published", async () => {
    const registry = new InMemoryUsageRegistry();
    const consumer = new UsageRegisteredConsumer(registry, {
      defaultInstitutionId: "inst-default",
    });

    const message = {
      topic: "dip.events",
      partition: 0,
      offset: "0",
      key: null,
      value: Buffer.from(
        JSON.stringify({
          type: "dip.artifact.published",
          artifactId: "art-123",
          authorId: "user-1",
          timestamp: "2026-01-01T00:00:00Z",
        }),
        "utf8"
      ),
      headers: undefined,
    };

    await consumer.handleMessage(message);

    const contributions = registry.getContributions();
    expect(contributions).toHaveLength(1);
    expect(contributions[0].artifactId).toBe("art-123");
    expect(contributions[0].institutionId).toBe("inst-default");
    expect(contributions[0].contributionScore).toBe(1);
    expect(contributions[0].recordedAt).toBeInstanceOf(Date);
  });

  it("uses institutionId from payload when present", async () => {
    const registry = new InMemoryUsageRegistry();
    const consumer = new UsageRegisteredConsumer(registry);

    const message = {
      topic: "dip.events",
      partition: 0,
      offset: "1",
      key: null,
      value: Buffer.from(
        JSON.stringify({
          type: "dip.artifact.published",
          artifactId: "art-456",
          institutionId: "inst-org",
        }),
        "utf8"
      ),
      headers: undefined,
    };

    await consumer.handleMessage(message);

    const contributions = registry.getContributions();
    expect(contributions[0].institutionId).toBe("inst-org");
  });

  it("ignores messages that are not dip.artifact.published", async () => {
    const registry = new InMemoryUsageRegistry();
    const consumer = new UsageRegisteredConsumer(registry);

    const message = {
      topic: "dip.events",
      partition: 0,
      offset: "2",
      key: null,
      value: Buffer.from(
        JSON.stringify({
          type: "dip.artifact.drafted",
          artifactId: "art-789",
        }),
        "utf8"
      ),
      headers: undefined,
    };

    await consumer.handleMessage(message);

    expect(registry.getContributions()).toHaveLength(0);
  });

  it("ignores empty or invalid JSON value", async () => {
    const registry = new InMemoryUsageRegistry();
    const consumer = new UsageRegisteredConsumer(registry);

    await consumer.handleMessage({
      topic: "dip.events",
      partition: 0,
      offset: "3",
      key: null,
      value: null,
      headers: undefined,
    });
    expect(registry.getContributions()).toHaveLength(0);

    await consumer.handleMessage({
      topic: "dip.events",
      partition: 0,
      offset: "4",
      key: null,
      value: Buffer.from("not json", "utf8"),
      headers: undefined,
    });
    expect(registry.getContributions()).toHaveLength(0);
  });
});
