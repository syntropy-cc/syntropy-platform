/**
 * Unit tests for KafkaConsumer (COMP-009.1).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { KafkaConsumer } from "./KafkaConsumer.js";

describe("KafkaConsumer", () => {
  const mockConnect = vi.fn().mockResolvedValue(undefined);
  const mockSubscribe = vi.fn();
  const mockRun = vi.fn().mockResolvedValue(undefined);
  const mockDisconnect = vi.fn().mockResolvedValue(undefined);

  const mockConsumer = {
    connect: mockConnect,
    subscribe: mockSubscribe,
    run: mockRun,
    disconnect: mockDisconnect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("connect delegates to underlying consumer", async () => {
    const consumer = new KafkaConsumer(mockConsumer as never);
    await consumer.connect();
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it("subscribe calls consumer.subscribe and consumer.run", () => {
    const consumer = new KafkaConsumer(mockConsumer as never);
    const handler = vi.fn().mockResolvedValue(undefined);

    consumer.subscribe("identity.events", handler);

    expect(mockSubscribe).toHaveBeenCalledWith({ topic: "identity.events", fromBeginning: true });
    expect(mockRun).toHaveBeenCalledTimes(1);
    const runArg = mockRun.mock.calls[0][0];
    expect(typeof runArg.eachMessage).toBe("function");
  });

  it("subscribe eachMessage handler receives normalized ConsumedMessage", async () => {
    let capturedMessage: unknown = null;
    const handler = vi.fn().mockImplementation(async (msg) => {
      capturedMessage = msg;
    });

    const consumer = new KafkaConsumer(mockConsumer as never);
    consumer.subscribe("test", handler);

    const eachMessage = mockRun.mock.calls[0][0].eachMessage as (payload: {
      topic: string;
      partition: number;
      message: { offset: string; key: Buffer | null; value: Buffer | null; headers?: Record<string, Buffer> };
    }) => Promise<void>;

    await eachMessage({
      topic: "test",
      partition: 0,
      message: {
        offset: "42",
        key: Buffer.from("k"),
        value: Buffer.from(JSON.stringify({ eventType: "e", payload: {} })),
      },
    });

    expect(capturedMessage).toEqual({
      topic: "test",
      partition: 0,
      offset: "42",
      key: Buffer.from("k"),
      value: Buffer.from(JSON.stringify({ eventType: "e", payload: {} })),
      headers: undefined,
    });
  });

  it("disconnect delegates to underlying consumer", async () => {
    const consumer = new KafkaConsumer(mockConsumer as never);
    consumer.subscribe("t", async () => {});
    await consumer.disconnect();
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});
