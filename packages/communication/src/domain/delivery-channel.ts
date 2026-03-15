/**
 * Delivery channel and result types for notification delivery (COMP-028.4).
 * Architecture: COMP-028, communication domain
 */

/** Channels through which a notification can be delivered. */
export type DeliveryChannel = "in_app" | "email" | "push";

/** Result of a single delivery call for observability and tests. */
export interface DeliveryResult {
  inApp: boolean;
  emailSent: boolean;
  pushSent: boolean;
}
