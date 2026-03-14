/**
 * Unit tests for StripePaymentAdapter (COMP-027.2).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { StripePaymentAdapter } from "../../src/infrastructure/stripe-payment-adapter.js";
import { MockPaymentGateway } from "../../src/infrastructure/mock-payment-gateway.js";
import { CircuitBreaker, CircuitOpenError } from "@syntropy/platform-core";

function createMockStripe() {
  return {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: "pi_test_123",
        client_secret: "pi_test_123_secret_abc",
      }),
    },
    webhooks: {
      constructEvent: vi.fn().mockReturnValue({
        type: "payment_intent.succeeded",
        id: "evt_test_123",
      }),
    },
  };
}

describe("StripePaymentAdapter", () => {
  describe("createPaymentIntent", () => {
    it("calls Stripe and returns id and clientSecret", async () => {
      const mockStripe = createMockStripe();
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 1,
        resetTimeoutMs: 1000,
      });
      const adapter = new StripePaymentAdapter(
        mockStripe as never,
        "whsec_test",
        circuitBreaker
      );

      const result = await adapter.createPaymentIntent(5000, "usd");

      expect(result).toEqual({
        id: "pi_test_123",
        clientSecret: "pi_test_123_secret_abc",
      });
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledTimes(1);
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 5000,
        currency: "usd",
      });
    });

    it("rounds amount when passing to Stripe", async () => {
      const mockStripe = createMockStripe();
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 1,
        resetTimeoutMs: 1000,
      });
      const adapter = new StripePaymentAdapter(
        mockStripe as never,
        "whsec_test",
        circuitBreaker
      );

      await adapter.createPaymentIntent(50.5, "eur");

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 51,
        currency: "eur",
      });
    });

    it("throws when Stripe does not return client_secret", async () => {
      const mockStripe = createMockStripe();
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: "pi_1",
        client_secret: null,
      });
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 1,
        resetTimeoutMs: 1000,
      });
      const adapter = new StripePaymentAdapter(
        mockStripe as never,
        "whsec_test",
        circuitBreaker
      );

      await expect(adapter.createPaymentIntent(100, "usd")).rejects.toThrow(
        "Stripe did not return client_secret"
      );
    });

    it("throws CircuitOpenError when circuit is open without calling Stripe", async () => {
      const mockStripe = createMockStripe();
      mockStripe.paymentIntents.create.mockRejectedValue(new Error("Stripe API error"));
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 1,
        successThreshold: 1,
        resetTimeoutMs: 10000,
      });
      const adapter = new StripePaymentAdapter(
        mockStripe as never,
        "whsec_test",
        circuitBreaker
      );

      await expect(adapter.createPaymentIntent(100, "usd")).rejects.toThrow(
        "Stripe API error"
      );
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledTimes(1);

      mockStripe.paymentIntents.create.mockClear();
      await expect(adapter.createPaymentIntent(200, "usd")).rejects.toThrow(
        CircuitOpenError
      );
      expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();
    });
  });

  describe("handleWebhook", () => {
    it("verifies signature and returns event type and id", async () => {
      const mockStripe = createMockStripe();
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 1,
        successThreshold: 1,
        resetTimeoutMs: 1000,
      });
      const adapter = new StripePaymentAdapter(
        mockStripe as never,
        "whsec_test",
        circuitBreaker
      );
      const payload = '{"type":"payment_intent.succeeded","id":"evt_1"}';
      const signature = "stripe-signature";

      const result = await adapter.handleWebhook(payload, signature);

      expect(result).toEqual({
        eventType: "payment_intent.succeeded",
        processedId: "evt_test_123",
      });
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        "whsec_test"
      );
    });

    it("throws when constructEvent throws (invalid signature)", async () => {
      const mockStripe = createMockStripe();
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error("Signature verification failed");
      });
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 1,
        successThreshold: 1,
        resetTimeoutMs: 1000,
      });
      const adapter = new StripePaymentAdapter(
        mockStripe as never,
        "whsec_test",
        circuitBreaker
      );

      await expect(
        adapter.handleWebhook("body", "bad-sig")
      ).rejects.toThrow("Signature verification failed");
    });
  });
});

describe("MockPaymentGateway", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("records createPaymentIntent calls and returns configured result", async () => {
    const mock = new MockPaymentGateway();
    mock.nextPaymentIntentResult = {
      id: "pi_custom",
      clientSecret: "secret_custom",
    };

    const result = await mock.createPaymentIntent(1000, "gbp");

    expect(result).toEqual({ id: "pi_custom", clientSecret: "secret_custom" });
    expect(mock.createPaymentIntentCalls).toEqual([
      { amount: 1000, currency: "gbp" },
    ]);
  });

  it("records handleWebhook calls and returns event result", async () => {
    const mock = new MockPaymentGateway();
    const result = await mock.handleWebhook('{"id":"evt_1"}', "sig");

    expect(result.eventType).toBe("payment_intent.succeeded");
    expect(result.processedId).toBe("evt_mock_123");
    expect(mock.handleWebhookCalls).toHaveLength(1);
  });

  it("throws when createPaymentIntentError is set", async () => {
    const mock = new MockPaymentGateway();
    mock.createPaymentIntentError = new Error("Mock failure");

    await expect(mock.createPaymentIntent(10, "usd")).rejects.toThrow(
      "Mock failure"
    );
  });
});
