/**
 * Ensures required Kafka topics exist by creating them if missing (idempotent).
 * Used at workers/API startup to avoid "This server does not host this topic-partition"
 * when consumers subscribe before any producer has created the topics.
 *
 * Architecture: COMP-009.1, COMP-034
 */

import { Kafka, type KafkaConfig, type SASLOptions } from "kafkajs";
import type { KafkaClientConfig } from "./config.js";

/** Default replication factor for local/single-broker (docker-compose). */
const DEFAULT_REPLICATION_FACTOR = 1;
const DEFAULT_NUM_PARTITIONS = 1;
const CREATE_TOPICS_TIMEOUT_MS = 10_000;

/**
 * Topic names required by Syntropy Platform workers and event bus.
 * Keep in sync with: search-index, notifications, public-square-indexer,
 * session-invalidation, dlq-processor consumers.
 */
export const REQUIRED_KAFKA_TOPICS = [
  "learn.events",
  "hub.events",
  "labs.events",
  "dip.events",
  "identity.events",
  "dip.governance.events",
  "default.dlq",
] as const;

function buildKafkaConfig(config: KafkaClientConfig): KafkaConfig {
  const kafkaConfig: KafkaConfig = { brokers: config.brokers };
  if (config.clientId) kafkaConfig.clientId = config.clientId;
  if (config.ssl) kafkaConfig.ssl = true;
  if (config.sasl) {
    kafkaConfig.sasl = {
      mechanism: config.sasl.mechanism,
      username: config.sasl.username,
      password: config.sasl.password,
    } as SASLOptions;
  }
  return kafkaConfig;
}

/**
 * Ensures the given Kafka topics exist. Creates any that are missing.
 * Idempotent: safe to call on every startup; existing topics are left unchanged.
 *
 * @param config - Kafka client config (e.g. from getKafkaConfigFromEnv()).
 * @param topicNames - Topic names to ensure (default: REQUIRED_KAFKA_TOPICS).
 * @throws If Kafka is unreachable or topic creation fails after timeout.
 */
export async function ensureKafkaTopicsExist(
  config: KafkaClientConfig,
  topicNames: readonly string[] = REQUIRED_KAFKA_TOPICS
): Promise<void> {
  if (topicNames.length === 0) return;

  const kafka = new Kafka(
    buildKafkaConfig({ ...config, clientId: config.clientId ?? "syntropy-topic-setup" })
  );
  const admin = kafka.admin();

  try {
    await admin.connect();
    await admin.createTopics({
      topics: topicNames.map((topic) => ({
        topic,
        numPartitions: DEFAULT_NUM_PARTITIONS,
        replicationFactor: DEFAULT_REPLICATION_FACTOR,
      })),
      timeout: CREATE_TOPICS_TIMEOUT_MS,
      waitForLeaders: true,
    });
  } finally {
    await admin.disconnect();
  }
}
