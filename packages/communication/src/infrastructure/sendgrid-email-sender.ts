/**
 * SendGrid adapter for email notification delivery (COMP-028.4).
 * Architecture: COMP-028. Uses SendGrid v3 Mail Send API; throws on non-2xx so caller can retry.
 */

import type { EmailNotificationSender } from "../domain/ports/email-notification-sender.js";

const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";

export interface SendGridEmailSenderOptions {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

/**
 * Sends email via SendGrid REST API.
 * Throws on failure (network or non-2xx) so RetryPolicy can retry.
 */
export class SendGridEmailSender implements EmailNotificationSender {
  private readonly apiKey: string;
  private readonly from: { email: string; name?: string };

  constructor(options: SendGridEmailSenderOptions) {
    if (!options.apiKey?.trim()) {
      throw new Error("SendGridEmailSender requires a non-empty apiKey");
    }
    if (!options.fromEmail?.trim()) {
      throw new Error("SendGridEmailSender requires a non-empty fromEmail");
    }
    this.apiKey = options.apiKey.trim();
    this.from = {
      email: options.fromEmail.trim(),
      name: options.fromName?.trim() ?? "Syntropy",
    };
  }

  async send(params: { to: string; subject: string; body: string; html?: string }): Promise<void> {
    const body = {
      personalizations: [{ to: [{ email: params.to }], subject: params.subject }],
      from: this.from,
      content: [
        { type: "text/plain", value: params.body },
        ...(params.html ? [{ type: "text/html", value: params.html }] : []),
      ],
    };

    const response = await fetch(SENDGRID_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `SendGrid mail send failed: ${response.status} ${response.statusText}. ${text}`
      );
    }
  }
}
