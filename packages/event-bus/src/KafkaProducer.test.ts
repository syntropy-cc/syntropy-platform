/**
 * Unit tests for KafkaProducer (COMP-009.1).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { KafkaProducer } from "./KafkaProducer.js";
import { InvalidEventEnvelopeError } from "./validation.js";

describe("KafkaProducer", () => {
  const mockSend = vi.fn().mockResolvedValue(undefined);

  const mockProducer = {
    send: mockSend,
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publish sends validated envelope as JSON to the topic", async () => {
    const producer = new KafkaProducer(mockProducer as never);
    const event = { eventType: "identity.user.created", payload: { userId: "u1" } };

    await producer.publish("identity.events", event);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const [record] = mockSend.mock.calls[0];
    expect(record.topic).toBe("identity.events");
    expect(record.messages).toHaveLength(1);
    const body = JSON.parse(record.messages[0].value as string);
    expect(body.eventType).toBe("identity.user.created");
    expect(body.payload).toEqual({ userId: "u1" });
    expect(body.timestamp).toBeDefined();
  });

  it("publish throws when event fails validation", async () => {
    const producer = new KafkaProducer(mockProducer as never);

    await expect(producer.publish("topic", { eventType: "", payload: {} })).rejects.toThrow(
      InvalidEventEnvelopeError,
    );
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("publish uses event key when provided", async () => {
    const producer = new KafkaProducer(mockProducer as never);
    await producer.publish("topic", {
      eventType: "test",
      payload: {},
      key: "partition-key",
    });

    expect(mockSend.mock.calls[0][0].messages[0].key).toBe("partition-key");
  });

  it("connect and disconnect delegate to underlying producer", async () => {
    const producer = new KafkaProducer(mockProducer as never);
    await producer.connect();
    expect(mockProducer.connect).toHaveBeenCalledTimes(1);
    await producer.disconnect();
    expect(mockProducer.disconnect).toHaveBeenCalledTimes(1);
  });

  it("publish includes optional headers when provided (COMP-038.2)", async () => {
    const producer = new KafkaProducer(mockProducer as never);
    await producer.publish("topic", { eventType: "test", payload: {} }, {
      headers: { correlation_id: "550e8400-e29b-41d4-a716-446655440000" },
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const msg = mockSend.mock.calls[0][0].messages[0];
    expect(msg.headers).toBeDefined();
    expect(msg.headers!.correlation_id).toBeDefined();
    const val = msg.headers!.correlation_id as Buffer;
    expect(val.toString("utf8")).toBe("550e8400-e29b-41d4-a716-446655440000");
  });
});
