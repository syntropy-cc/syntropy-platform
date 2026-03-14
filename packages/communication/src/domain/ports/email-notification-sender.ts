/**
 * Port for sending notification emails (COMP-028.4).
 * Implemented by SendGrid adapter; throw on failure so caller can retry.
 */

export interface EmailSendParams {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

/**
 * Sends a single email. Throws on failure so RetryPolicy can retry.
 */
export interface EmailNotificationSender {
  send(params: EmailSendParams): Promise<void>;
}
