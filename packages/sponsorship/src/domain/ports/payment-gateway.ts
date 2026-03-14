/**
 * Payment gateway port — abstraction for payment processing (COMP-027.2).
 * Domain layer; no Stripe or external SDK types.
 * Architecture: PAT-005, ARCH-012
 */

/** Result of creating a payment intent (e.g. for client-side confirmation). */
export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
}

/** Result of processing a webhook event. */
export interface WebhookResult {
  eventType: string;
  processedId: string;
}

/** Port for payment operations; implemented by Stripe adapter (ACL). */
export interface PaymentGateway {
  /**
   * Creates a payment intent for the given amount and currency.
   * @returns Payment intent id and client secret for client-side confirmation.
   */
  createPaymentIntent(
    amount: number,
    currency: string
  ): Promise<PaymentIntentResult>;

  /**
   * Processes a webhook payload with signature verification.
   * @param payload - Raw request body (string or Buffer).
   * @param signature - Value of Stripe-Signature header.
   * @returns Processed event type and id, or throws if invalid.
   */
  handleWebhook(payload: string | Buffer, signature: string): Promise<WebhookResult>;
}
