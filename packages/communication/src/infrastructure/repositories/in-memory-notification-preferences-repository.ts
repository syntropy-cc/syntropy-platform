/**
 * In-memory implementation of NotificationPreferencesRepository (COMP-028.5).
 * Used in tests and when persistence is not required.
 */

import type { NotificationPreferences } from "../../domain/notification-preferences.js";
import type { NotificationPreferencesRepository } from "../../domain/ports/notification-preferences-repository.js";

export class InMemoryNotificationPreferencesRepository
  implements NotificationPreferencesRepository
{
  private readonly store = new Map<string, NotificationPreferences>();

  async getByUserId(userId: string): Promise<NotificationPreferences | null> {
    return this.store.get(userId) ?? null;
  }

  async save(preferences: NotificationPreferences): Promise<void> {
    this.store.set(preferences.userId, preferences);
  }

  /** For tests: clear storage. */
  clear(): void {
    this.store.clear();
  }
}
