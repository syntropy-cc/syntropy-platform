/**
 * Kafka producer wrapper with envelope validation (COMP-009.1, COMP-038.2).
 *
 * Architecture: COMP-009.1, ADR-002. Optional headers (e.g. correlation_id)
 * are set by callers from AsyncLocalStorage so event-bus does not depend on platform-core.
 */

import type { Producer, ProducerRecord } from "kafkajs";
import type { EventEnvelope } from "./types.js";
import { validateEventEnvelope } from "./validation.js";

export interface PublishOptions {
  /** Optional headers (e.g. correlation_id) for distributed tracing. */
  headers?: Record<string, string>;
}

/**
 * Wraps a KafkaJS Producer and exposes publish(topic, event, options?) with
 * event envelope validation before send.
 */
export class KafkaProducer {
  constructor(private readonly producer: Producer) {}

  /**
   * Validates the event envelope, serializes it to JSON, and sends to the topic.
   * @throws InvalidEventEnvelopeError if the event fails validation
   */
  async publish(
    topic: string,
    event: EventEnvelope,
    options?: PublishOptions
  ): Promise<void> {
    const validated = validateEventEnvelope(event);

    const value = JSON.stringify({
      ...validated,
      timestamp: validated.timestamp ?? new Date().toISOString(),
    });

    const record: ProducerRecord = {
      topic,
      messages: [
        {
          key: validated.key,
          value,
          headers: options?.headers
            ? Object.fromEntries(
                Object.entries(options.headers).map(([k, v]) => [k, Buffer.from(v, "utf8")])
              )
            : undefined,
        },
      ],
    };

    await this.producer.send(record);
  }

  /** Connect the underlying producer. */
  async connect(): Promise<void> {
    await this.producer.connect();
  }

  /** Disconnect the underlying producer. */
  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }
}
