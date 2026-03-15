/**
 * Unit tests for KafkaConsumer (COMP-009.1).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
    mockRun.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
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

    expect(mockSubscribe).toHaveBeenCalledWith({ topics: ["identity.events"], fromBeginning: true });
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

  it("on retriable run() error calls disconnect then connect and re-subscribes", async () => {
    vi.useFakeTimers();
    const consumer = new KafkaConsumer(mockConsumer as never);
    await consumer.connect();
    mockRun
      .mockRejectedValueOnce(Object.assign(new Error("leader election"), { retriable: true }))
      .mockResolvedValue(undefined);

    consumer.subscribeMany(["learn.events"], async () => {});

    await vi.advanceTimersByTimeAsync(3000);

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledTimes(2);
    expect(mockSubscribe).toHaveBeenCalledTimes(2);
    expect(mockRun).toHaveBeenCalledTimes(2);
  });

  it("on non-retriable run() error does not reconnect and does not rethrow", async () => {
    const consumer = new KafkaConsumer(mockConsumer as never);
    await consumer.connect();
    const fatalError = new Error("fatal");
    mockRun.mockRejectedValueOnce(fatalError);

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    consumer.subscribeMany(["hub.events"], async () => {});

    await new Promise((r) => setTimeout(r, 50));

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith("[KafkaConsumer] Non-retriable error, not reconnecting:", fatalError);

    consoleErrorSpy.mockRestore();
  });

  it("when stopping is true before retry catch runs, does not call connect again", async () => {
    vi.useFakeTimers();
    const consumer = new KafkaConsumer(mockConsumer as never);
    await consumer.connect();
    mockRun.mockRejectedValueOnce(Object.assign(new Error("retriable"), { retriable: true }));

    consumer.subscribeMany(["dip.events"], async () => {});

    await consumer.disconnect();

    await vi.advanceTimersByTimeAsync(5000);

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockRun).toHaveBeenCalledTimes(1);
  });
});
