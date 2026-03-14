/**
 * In-memory mock payment gateway for tests (COMP-027.2).
 * Architecture: PAT-005, testing
 */

import type { PaymentGateway } from "../domain/ports/payment-gateway.js";
import type { PaymentIntentResult, WebhookResult } from "../domain/ports/payment-gateway.js";

/** Mock payment gateway that records calls and returns configurable results. */
export class MockPaymentGateway implements PaymentGateway {
  private _createPaymentIntentCalls: { amount: number; currency: string }[] = [];
  private _handleWebhookCalls: { payload: string | Buffer; signature: string }[] = [];

  /** Next result to return from createPaymentIntent; defaults to success. */
  public nextPaymentIntentResult: PaymentIntentResult = {
    id: "pi_mock_123",
    clientSecret: "pi_mock_123_secret_xyz",
  };

  /** If set, createPaymentIntent will throw this error. */
  public createPaymentIntentError: Error | null = null;

  /** If set, handleWebhook will throw this error. */
  public handleWebhookError: Error | null = null;

  get createPaymentIntentCalls(): readonly { amount: number; currency: string }[] {
    return this._createPaymentIntentCalls;
  }

  get handleWebhookCalls(): readonly { payload: string | Buffer; signature: string }[] {
    return this._handleWebhookCalls;
  }

  async createPaymentIntent(
    amount: number,
    currency: string
  ): Promise<PaymentIntentResult> {
    this._createPaymentIntentCalls.push({ amount, currency });
    if (this.createPaymentIntentError) {
      throw this.createPaymentIntentError;
    }
    return { ...this.nextPaymentIntentResult };
  }

  async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<WebhookResult> {
    this._handleWebhookCalls.push({ payload, signature });
    if (this.handleWebhookError) {
      throw this.handleWebhookError;
    }
    return {
      eventType: "payment_intent.succeeded",
      processedId: "evt_mock_123",
    };
  }

  reset(): void {
    this._createPaymentIntentCalls = [];
    this._handleWebhookCalls = [];
    this.nextPaymentIntentResult = {
      id: "pi_mock_123",
      clientSecret: "pi_mock_123_secret_xyz",
    };
    this.createPaymentIntentError = null;
    this.handleWebhookError = null;
  }
}
