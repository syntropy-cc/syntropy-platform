/**
 * Publishes sponsorship domain events to Kafka (COMP-027.5).
 * Architecture: COMP-009.1, event-driven
 */

import type { KafkaProducer } from "@syntropy/event-bus";
import type { Sponsorship } from "../domain/sponsorship.js";

/** Payload shape for sponsorship events (minimal for consumers). */
export interface SponsorshipEventPayload {
  sponsorshipId: string;
  sponsorId: string;
  sponsoredId: string;
  amount: number;
  status: string;
  timestamp: string;
}

/**
 * Publishes sponsorship.created and sponsorship.payment.completed events.
 */
export class SponsorshipEventPublisher {
  constructor(
    private readonly producer: KafkaProducer,
    private readonly topic: string
  ) {}

  /**
   * Publishes sponsorship.created when a new sponsorship is created.
   */
  async publishCreated(sponsorship: Sponsorship): Promise<void> {
    const payload: SponsorshipEventPayload = {
      sponsorshipId: sponsorship.id,
      sponsorId: sponsorship.sponsorId,
      sponsoredId: sponsorship.sponsoredId,
      amount: sponsorship.amount,
      status: sponsorship.status,
      timestamp: new Date().toISOString(),
    };
    await this.producer.publish(this.topic, {
      eventType: "sponsorship.created",
      payload,
      key: sponsorship.id,
    });
  }

  /**
   * Publishes sponsorship.payment.completed when payment is confirmed.
   */
  async publishPaymentCompleted(sponsorship: Sponsorship): Promise<void> {
    const payload: SponsorshipEventPayload = {
      sponsorshipId: sponsorship.id,
      sponsorId: sponsorship.sponsorId,
      sponsoredId: sponsorship.sponsoredId,
      amount: sponsorship.amount,
      status: sponsorship.status,
      timestamp: new Date().toISOString(),
    };
    await this.producer.publish(this.topic, {
      eventType: "sponsorship.payment.completed",
      payload,
      key: sponsorship.id,
    });
  }
}
