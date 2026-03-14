/**
 * Unit tests for SendGridEmailSender (COMP-028.4).
 * Mocks fetch to assert request shape and that non-2xx throws.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SendGridEmailSender } from "../../src/infrastructure/sendgrid-email-sender.js";

describe("SendGridEmailSender", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("throws when apiKey is empty", () => {
    expect(
      () =>
        new SendGridEmailSender({
          apiKey: "",
          fromEmail: "from@example.com",
        })
    ).toThrow("SendGridEmailSender requires a non-empty apiKey");
  });

  it("throws when fromEmail is empty", () => {
    expect(
      () =>
        new SendGridEmailSender({
          apiKey: "key",
          fromEmail: "",
        })
    ).toThrow("SendGridEmailSender requires a non-empty fromEmail");
  });

  it("sends POST to SendGrid API with correct body and headers", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    const sender = new SendGridEmailSender({
      apiKey: "test-key",
      fromEmail: "noreply@test.com",
      fromName: "Test",
    });

    await sender.send({
      to: "user@example.com",
      subject: "Test Subject",
      body: "Test body",
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://api.sendgrid.com/v3/mail/send");
    expect(options.method).toBe("POST");
    expect(options.headers).toMatchObject({
      Authorization: "Bearer test-key",
      "Content-Type": "application/json",
    });
    const body = JSON.parse(options.body);
    expect(body.personalizations).toHaveLength(1);
    expect(body.personalizations[0].to).toEqual([{ email: "user@example.com" }]);
    expect(body.personalizations[0].subject).toBe("Test Subject");
    expect(body.from).toEqual({ email: "noreply@test.com", name: "Test" });
    expect(body.content).toContainEqual({ type: "text/plain", value: "Test body" });
  });

  it("throws on non-2xx response so caller can retry", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      text: () => Promise.resolve("overloaded"),
    });
    const sender = new SendGridEmailSender({
      apiKey: "key",
      fromEmail: "from@example.com",
    });

    await expect(
      sender.send({
        to: "to@example.com",
        subject: "S",
        body: "B",
      })
    ).rejects.toThrow(/SendGrid mail send failed: 503/);
  });
});
