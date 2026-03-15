/**
 * Port for resolving user ID to email address (COMP-028.4).
 * Architecture: COMP-028. Used by NotificationDeliveryService for email channel delivery.
 */

/**
 * Resolves a user ID to an email address for notification delivery.
 * Returns null if the user has no email or should not receive email.
 */
export interface UserEmailResolver {
  resolveEmail(userId: string): Promise<string | null>;
}
