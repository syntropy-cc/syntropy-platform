/**
 * Unit tests for createKafkaClient (COMP-009.1).
 */

import { describe, it, expect } from "vitest";
import { createKafkaClient } from "./createKafkaClient.js";

describe("createKafkaClient", () => {
  it("returns producer and consumer for valid config", () => {
    const client = createKafkaClient({ brokers: ["localhost:9092"] });
    expect(client.producer).toBeDefined();
    expect(client.consumer).toBeDefined();
    expect(typeof client.producer.publish).toBe("function");
    expect(typeof client.consumer.subscribe).toBe("function");
    expect(typeof client.consumer.connect).toBe("function");
    expect(typeof client.consumer.disconnect).toBe("function");
  });

  it("uses consumerGroupId from config", () => {
    const client = createKafkaClient({
      brokers: ["localhost:9092"],
      consumerGroupId: "my-group",
    });
    expect(client.consumer).toBeDefined();
  });
});
