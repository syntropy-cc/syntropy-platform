/**
 * Port for resolving user ID to FCM/push device tokens (COMP-028.4).
 * Stub returns [] until token storage exists.
 */

/**
 * Returns FCM (or other push) device tokens for a user.
 * Empty array means no push delivery for that user.
 */
export interface PushTokenProvider {
  getTokens(userId: string): Promise<string[]>;
}
