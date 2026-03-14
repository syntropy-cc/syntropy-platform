/**
 * Stub push token provider — returns no tokens (COMP-028.4).
 * Push delivery is no-op until real device token storage exists.
 */

import type { PushTokenProvider } from "../domain/ports/push-token-provider.js";

/**
 * Returns empty array for every user so push is never sent.
 * Replace with real implementation when FCM token storage is available.
 */
export class StubPushTokenProvider implements PushTokenProvider {
  async getTokens(_userId: string): Promise<string[]> {
    return [];
  }
}
