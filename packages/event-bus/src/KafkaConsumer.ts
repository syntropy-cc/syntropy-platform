/**
 * Kafka consumer wrapper with subscribe(topic, handler).
 *
 * Architecture: COMP-009.1, ADR-002
 * Retry with backoff on retriable Kafka errors (e.g. leadership election) so
 * workers do not crash on unhandledRejection.
 */

import type { Consumer, EachMessagePayload } from "kafkajs";

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_BACKOFF_MS = [2000, 5000, 10000, 20000, 30000];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns true if the error is a retriable Kafka error (e.g. leadership election,
 * topic not yet hosted). KafkaJS sets retriable: true on such errors.
 */
function isRetriableKafkaError(err: unknown): boolean {
  if (err !== null && typeof err === "object" && "retriable" in err) {
    return (err as { retriable?: boolean }).retriable === true;
  }
  return false;
}

/**
 * Normalized message shape passed to the subscribe handler.
 * Value is the raw buffer; callers may parse as JSON for EventEnvelope.
 */
export interface ConsumedMessage {
  topic: string;
  partition: number;
  offset: string;
  key: Buffer | null;
  value: Buffer | null;
  headers?: Record<string, Buffer | undefined>;
}

/**
 * Wraps a KafkaJS Consumer and exposes subscribe(topic, handler) with
 * connect/disconnect lifecycle and retry on retriable errors.
 */
export class KafkaConsumer {
  private runPromise: Promise<void> | null = null;
  private stopping = false;
  private topics: string[] | null = null;
  private messageHandler: ((message: ConsumedMessage) => Promise<void>) | null = null;

  constructor(private readonly consumer: Consumer) {}

  /**
   * Connect the consumer. Call before subscribe.
   */
  async connect(): Promise<void> {
    await this.consumer.connect();
  }

  /**
   * Subscribe to a topic and run the consumer. The handler is invoked for each message.
   * Must call connect() before subscribe. run() is started in the background (non-blocking).
   * Retries with backoff on retriable Kafka errors (e.g. leadership election).
   */
  subscribe(topic: string, handler: (message: ConsumedMessage) => Promise<void>): void {
    this.subscribeMany([topic], handler);
  }

  /**
   * Subscribe to multiple topics with one handler. Use for audit log and multi-topic consumers.
   */
  subscribeMany(topics: string[], handler: (message: ConsumedMessage) => Promise<void>): void {
    this.topics = topics;
    this.messageHandler = handler;
    this.startRunLoop(0);
  }

  /**
   * Internal: subscribe + run, with catch that retries on retriable errors.
   */
  private startRunLoop(attempt: number): void {
    if (this.stopping || this.topics === null || this.messageHandler === null) {
      return;
    }

    this.consumer.subscribe({ topics: this.topics, fromBeginning: true });

    this.runPromise = this.consumer.run({
      eachMessage: async (payload: EachMessagePayload): Promise<void> => {
        const message: ConsumedMessage = {
          topic: payload.topic,
          partition: payload.partition,
          offset: payload.message.offset,
          key: payload.message.key,
          value: payload.message.value,
          headers: payload.message.headers as Record<string, Buffer | undefined> | undefined,
        };
        await this.messageHandler!(message);
      },
    });

    this.runPromise.catch(async (err: unknown) => {
      if (this.stopping) return;
      if (!isRetriableKafkaError(err)) {
        console.error("[KafkaConsumer] Non-retriable error, not reconnecting:", err);
        return;
      }
      if (attempt >= MAX_RETRY_ATTEMPTS - 1) {
        console.error(
          `[KafkaConsumer] Kafka consumer failed after ${MAX_RETRY_ATTEMPTS} retries (topics: ${this.topics?.join(", ")}):`,
          err
        );
        return;
      }

      console.warn(
        `[KafkaConsumer] Retriable error (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS}, topics: ${this.topics?.join(", ")}), reconnecting after backoff:`,
        err
      );

      try {
        await this.consumer.disconnect();
      } catch {
        // Ignore disconnect errors when consumer is already in error state
      }
      if (this.stopping) return;

      const backoffMs = RETRY_BACKOFF_MS[attempt] ?? RETRY_BACKOFF_MS[RETRY_BACKOFF_MS.length - 1];
      await sleep(backoffMs);
      if (this.stopping) return;

      try {
        await this.consumer.connect();
      } catch (connectErr) {
        console.error("[KafkaConsumer] Reconnect failed:", connectErr);
        return;
      }
      if (this.stopping) return;

      this.startRunLoop(attempt + 1);
    });
  }

  /**
   * Stop the consumer and disconnect. Waits for in-flight processing to complete.
   */
  async disconnect(): Promise<void> {
    this.stopping = true;
    await this.consumer.disconnect();
    if (this.runPromise) {
      try {
        await this.runPromise;
      } catch {
        // Ignore rejection when we intentionally disconnected
      }
      this.runPromise = null;
    }
    this.topics = null;
    this.messageHandler = null;
  }
}
