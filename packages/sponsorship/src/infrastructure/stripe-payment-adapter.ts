/**
 * Stripe payment adapter — ACL for Stripe API (COMP-027.2).
 * Wraps Stripe SDK; domain types only at boundary.
 * Architecture: PAT-005, ARCH-012
 */

import type Stripe from "stripe";
import type { PaymentGateway } from "../domain/ports/payment-gateway.js";
import type { PaymentIntentResult, WebhookResult } from "../domain/ports/payment-gateway.js";
import { CircuitBreaker } from "@syntropy/platform-core";

/**
 * Stripe payment gateway adapter.
 * Uses circuit breaker around createPaymentIntent; webhook handling does not call Stripe API.
 */
export class StripePaymentAdapter implements PaymentGateway {
  constructor(
    private readonly stripe: Stripe,
    private readonly webhookSecret: string,
    private readonly circuitBreaker: CircuitBreaker
  ) {}

  async createPaymentIntent(
    amount: number,
    currency: string
  ): Promise<PaymentIntentResult> {
    return this.circuitBreaker.execute(async () => {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
      });
      if (!paymentIntent.client_secret) {
        throw new Error("Stripe did not return client_secret for PaymentIntent");
      }
      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      };
    });
  }

  async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<WebhookResult> {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    );
    const eventType = event.type;
    const processedId =
      "id" in event && typeof event.id === "string"
        ? event.id
        : (event as { id?: string }).id ?? "";
    return { eventType, processedId };
  }
}
