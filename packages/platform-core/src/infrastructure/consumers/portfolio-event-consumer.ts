/**
 * Kafka consumer that updates portfolios from domain events (COMP-010.6).
 *
 * Subscribes to learn.events, hub.events, labs.events, dip.events; on each message
 * applies the event to the user's portfolio (XP, achievements, skills, reputation) and saves.
 */

import type { KafkaConsumer as EventBusKafkaConsumer } from "@syntropy/event-bus";
import type { ConsumedMessage } from "@syntropy/event-bus";
import type { PortfolioRepository } from "../../domain/portfolio-aggregation/ports/portfolio-repository.js";
import { Portfolio } from "../../domain/portfolio-aggregation/portfolio.js";
import { applyEvent } from "../../domain/portfolio-aggregation/portfolio-update.js";

const PORTFOLIO_TOPICS = [
  "learn.events",
  "hub.events",
  "labs.events",
  "dip.events",
];

const CONSUMER_GROUP_ID = "portfolio-agg";

/**
 * Event types that affect portfolio (XP, achievements, or skills).
 */
const PORTFOLIO_EVENT_TYPES = new Set([
  "learn.fragment.artifact_published",
  "hub.contribution.integrated",
  "labs.review.submitted",
  "learn.track.completed",
  "labs.article.published",
  "learn.mentorship.started",
  "dip.artifact.published",
]);

function actorIdFromPayload(payload: unknown): string {
  if (payload !== null && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (typeof o.actorId === "string") return o.actorId;
    if (typeof o.actor_id === "string") return o.actor_id;
    if (typeof o.userId === "string") return o.userId;
  }
  return "system";
}

export interface PortfolioEventConsumerOptions {
  consumer: EventBusKafkaConsumer;
  repository: PortfolioRepository;
  topics?: string[];
}

/**
 * Consumer that updates portfolio state from domain events. Use with WorkerRegistry.
 */
export class PortfolioEventConsumer {
  private readonly consumer: EventBusKafkaConsumer;
  private readonly repository: PortfolioRepository;
  private readonly topics: string[];

  constructor(options: PortfolioEventConsumerOptions) {
    this.consumer = options.consumer;
    this.repository = options.repository;
    this.topics = options.topics ?? PORTFOLIO_TOPICS;
  }

  start(): void {
    this.consumer.subscribeMany(this.topics, (msg: ConsumedMessage) => this.handleMessage(msg));
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }

  private async handleMessage(message: ConsumedMessage): Promise<void> {
    let envelope: unknown;
    try {
      const raw = message.value ? message.value.toString("utf8") : "{}";
      envelope = JSON.parse(raw) as unknown;
    } catch {
      return;
    }

    if (envelope === null || typeof envelope !== "object") return;
    const env = envelope as Record<string, unknown>;
    const eventType = typeof env.eventType === "string" ? env.eventType : "";
    if (!PORTFOLIO_EVENT_TYPES.has(eventType)) return;

    const payload = (env.payload !== null && typeof env.payload === "object"
      ? env.payload
      : {}) as Record<string, unknown>;
    const userId = actorIdFromPayload(payload);
    if (userId === "system") return;

    const portfolioEvent = { type: eventType, payload };
    let portfolio = await this.repository.findByUserId(userId);
    if (!portfolio) {
      portfolio = Portfolio.empty(userId);
    }

    const updated = applyEvent(portfolio, portfolioEvent);
    await this.repository.save(updated);
  }
}

export { PORTFOLIO_TOPICS, CONSUMER_GROUP_ID as PORTFOLIO_CONSUMER_GROUP_ID };
