/**
 * Factory for creating a Kafka client (producer + consumer).
 *
 * Architecture: COMP-009.1, ADR-002
 */

import { Kafka, type KafkaConfig, type SASLOptions } from "kafkajs";
import type { KafkaClientConfig } from "./config.js";
import { KafkaProducer } from "./KafkaProducer.js";
import { KafkaConsumer } from "./KafkaConsumer.js";

export type { KafkaClientConfig } from "./config.js";

export interface KafkaClient {
  producer: KafkaProducer;
  consumer: KafkaConsumer;
}

/**
 * Creates a Kafka client with producer and consumer wrappers.
 * Uses config.consumerGroupId for the consumer (default "syntropy-event-bus" if omitted).
 */
export function createKafkaClient(config: KafkaClientConfig): KafkaClient {
  const kafkaConfig: KafkaConfig = {
    brokers: config.brokers,
  };
  if (config.clientId) kafkaConfig.clientId = config.clientId;
  if (config.ssl) kafkaConfig.ssl = true;
  if (config.sasl) {
    kafkaConfig.sasl = {
      mechanism: config.sasl.mechanism,
      username: config.sasl.username,
      password: config.sasl.password,
    } as SASLOptions;
  }

  const kafka = new Kafka(kafkaConfig);
  const producer = kafka.producer();
  const consumer = kafka.consumer({
    groupId: config.consumerGroupId ?? "syntropy-event-bus",
  });

  return {
    producer: new KafkaProducer(producer),
    consumer: new KafkaConsumer(consumer),
  };
}
