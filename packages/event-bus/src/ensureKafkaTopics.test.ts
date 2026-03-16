/**
 * Unit tests for ensureKafkaTopicsExist (COMP-009.1, COMP-034).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ensureKafkaTopicsExist,
  REQUIRED_KAFKA_TOPICS,
} from "./ensureKafkaTopics.js";

const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockDisconnect = vi.fn().mockResolvedValue(undefined);
const mockCreateTopics = vi.fn().mockResolvedValue(true);

vi.mock("kafkajs", () => ({
  Kafka: vi.fn().mockImplementation(() => ({
    admin: () => ({
      connect: mockConnect,
      disconnect: mockDisconnect,
      createTopics: mockCreateTopics,
    }),
  })),
}));

describe("ensureKafkaTopics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("REQUIRED_KAFKA_TOPICS", () => {
    it("includes all topics used by platform workers", () => {
      expect(REQUIRED_KAFKA_TOPICS).toContain("learn.events");
      expect(REQUIRED_KAFKA_TOPICS).toContain("hub.events");
      expect(REQUIRED_KAFKA_TOPICS).toContain("labs.events");
      expect(REQUIRED_KAFKA_TOPICS).toContain("dip.events");
      expect(REQUIRED_KAFKA_TOPICS).toContain("identity.events");
      expect(REQUIRED_KAFKA_TOPICS).toContain("dip.governance.events");
      expect(REQUIRED_KAFKA_TOPICS).toContain("default.dlq");
    });
  });

  describe("ensureKafkaTopicsExist", () => {
    it("connects admin, creates default topics, disconnects", async () => {
      const config = { brokers: ["localhost:9092"] };
      await ensureKafkaTopicsExist(config);

      expect(mockConnect).toHaveBeenCalledOnce();
      expect(mockCreateTopics).toHaveBeenCalledOnce();
      expect(mockCreateTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          topics: REQUIRED_KAFKA_TOPICS.map((topic) =>
            expect.objectContaining({
              topic,
              numPartitions: 1,
              replicationFactor: 1,
            })
          ),
          waitForLeaders: true,
        })
      );
      expect(mockDisconnect).toHaveBeenCalledOnce();
    });

    it("creates only requested topics when topicNames passed", async () => {
      const config = { brokers: ["broker:9092"] };
      const topics = ["custom.a", "custom.b"];
      await ensureKafkaTopicsExist(config, topics);

      expect(mockCreateTopics).toHaveBeenCalledWith(
        expect.objectContaining({
          topics: [
            { topic: "custom.a", numPartitions: 1, replicationFactor: 1 },
            { topic: "custom.b", numPartitions: 1, replicationFactor: 1 },
          ],
        })
      );
    });

    it("disconnects admin even when createTopics throws", async () => {
      mockCreateTopics.mockRejectedValueOnce(new Error("Broker unavailable"));

      const config = { brokers: ["localhost:9092"] };
      await expect(ensureKafkaTopicsExist(config)).rejects.toThrow(
        "Broker unavailable"
      );
      expect(mockDisconnect).toHaveBeenCalledOnce();
    });

    it("is no-op when topicNames is empty", async () => {
      const config = { brokers: ["localhost:9092"] };
      await ensureKafkaTopicsExist(config, []);

      expect(mockConnect).not.toHaveBeenCalled();
      expect(mockCreateTopics).not.toHaveBeenCalled();
      expect(mockDisconnect).not.toHaveBeenCalled();
    });
  });
});
