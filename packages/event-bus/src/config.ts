/**
 * Kafka client configuration and env-based defaults.
 *
 * Architecture: COMP-009.1
 */

export interface KafkaClientConfig {
  /** Broker addresses (e.g. ["localhost:9092"]). */
  brokers: string[];
  /** Optional client ID for logging. */
  clientId?: string;
  /** Consumer group ID for KafkaConsumer (required when using consumer). */
  consumerGroupId?: string;
  /** Optional SSL config. */
  ssl?: boolean;
  /** Optional SASL config for authentication. */
  sasl?: {
    mechanism: "plain" | "scram-sha-256" | "scram-sha-512";
    username: string;
    password: string;
  };
}

const DEFAULT_BROKERS = ["localhost:9092"];

/**
 * Build Kafka client config from environment variables.
 * KAFKA_BROKERS: comma-separated list (default "localhost:9092")
 * KAFKA_CLIENT_ID: optional client id
 */
export function getKafkaConfigFromEnv(): KafkaClientConfig {
  const brokersEnv = process.env.KAFKA_BROKERS;
  const brokers = brokersEnv
    ? brokersEnv.split(",").map((b) => b.trim()).filter(Boolean)
    : DEFAULT_BROKERS;

  const clientId = process.env.KAFKA_CLIENT_ID;

  const config: KafkaClientConfig = { brokers };
  if (clientId) config.clientId = clientId;

  if (process.env.KAFKA_SASL_USERNAME && process.env.KAFKA_SASL_PASSWORD) {
    config.sasl = {
      mechanism: (process.env.KAFKA_SASL_MECHANISM as "plain" | "scram-sha-256" | "scram-sha-512") ?? "plain",
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD,
    };
  }

  if (process.env.KAFKA_SSL === "true") {
    config.ssl = true;
  }

  return config;
}
