/**
 * Kafka producer wrapper with envelope validation.
 *
 * Architecture: COMP-009.1, ADR-002
 */

import type { Producer, ProducerRecord } from "kafkajs";
import type { EventEnvelope } from "./types.js";
import { validateEventEnvelope } from "./validation.js";

/**
 * Wraps a KafkaJS Producer and exposes publish(topic, event) with
 * event envelope validation before send.
 */
export class KafkaProducer {
  constructor(private readonly producer: Producer) {}

  /**
   * Validates the event envelope, serializes it to JSON, and sends to the topic.
   * @throws InvalidEventEnvelopeError if the event fails validation
   */
  async publish(topic: string, event: EventEnvelope): Promise<void> {
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
