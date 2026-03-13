/**
 * Event Bus package — Kafka client wrappers for the Syntropy Platform.
 *
 * Provides KafkaProducer, KafkaConsumer, and createKafkaClient for publishing
 * and subscribing to domain events with minimal envelope validation.
 *
 * Architecture: COMP-009, ADR-002
 */

export { createKafkaClient } from "./createKafkaClient.js";
export { KafkaProducer } from "./KafkaProducer.js";
export { KafkaConsumer } from "./KafkaConsumer.js";
export type { KafkaClientConfig } from "./config.js";
export { getKafkaConfigFromEnv } from "./config.js";
export type { KafkaClient } from "./createKafkaClient.js";
export type { EventEnvelope } from "./types.js";
export type { ConsumedMessage } from "./KafkaConsumer.js";
export { validateEventEnvelope, InvalidEventEnvelopeError } from "./validation.js";
