/**
 * Repository port for NotificationPreferences (COMP-028.5).
 * Architecture: COMP-028, communication domain, PAT-004
 */

import type { NotificationPreferences } from "../notification-preferences.js";

/**
 * Persists and retrieves per-user notification preferences.
 */
export interface NotificationPreferencesRepository {
  getByUserId(userId: string): Promise<NotificationPreferences | null>;
  save(preferences: NotificationPreferences): Promise<void>;
}
