/**
 * Kafka consumer wrapper with subscribe(topic, handler).
 *
 * Architecture: COMP-009.1, ADR-002
 */

import type { Consumer, EachMessagePayload } from "kafkajs";

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
 * connect/disconnect lifecycle.
 */
export class KafkaConsumer {
  private runPromise: Promise<void> | null = null;

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
   */
  subscribe(topic: string, handler: (message: ConsumedMessage) => Promise<void>): void {
    this.consumer.subscribe({ topic, fromBeginning: true });

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
        await handler(message);
      },
    });
  }

  /**
   * Stop the consumer and disconnect. Waits for in-flight processing to complete.
   */
  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    if (this.runPromise) {
      await this.runPromise;
    }
  }
}
