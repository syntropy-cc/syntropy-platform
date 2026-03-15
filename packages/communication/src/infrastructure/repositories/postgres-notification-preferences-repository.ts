/**
 * PostgreSQL implementation of NotificationPreferencesRepository (COMP-028.5).
 * Architecture: COMP-028.
 */

import { NotificationPreferences } from "../../domain/notification-preferences.js";
import type { NotificationPreferencesRepository } from "../../domain/ports/notification-preferences-repository.js";
import type { CommunicationDbClient } from "../communication-db-client.js";

const TABLE = "communication.notification_preferences";

const UPSERT_SQL = `
  INSERT INTO ${TABLE} (user_id, mute_until, channel_preferences)
  VALUES ($1, $2, $3::jsonb)
  ON CONFLICT (user_id) DO UPDATE SET
    mute_until = EXCLUDED.mute_until,
    channel_preferences = EXCLUDED.channel_preferences
`;

const SELECT_SQL = `
  SELECT user_id, mute_until, channel_preferences
  FROM ${TABLE}
  WHERE user_id = $1
`;

interface Row {
  user_id: string;
  mute_until: string | null;
  channel_preferences: Record<string, string[]>;
}

export class PostgresNotificationPreferencesRepository
  implements NotificationPreferencesRepository
{
  constructor(private readonly client: CommunicationDbClient) {}

  async getByUserId(userId: string): Promise<NotificationPreferences | null> {
    const rows = await this.client.query<Row>(SELECT_SQL, [userId]);
    const row = rows[0];
    if (!row) return null;
    return new NotificationPreferences({
      userId: row.user_id,
      muteUntil: row.mute_until ? new Date(row.mute_until) : null,
      channelPreferences: (row.channel_preferences ?? {}) as Record<
        string,
        ("in_app" | "email" | "push")[]
      >,
    });
  }

  async save(preferences: NotificationPreferences): Promise<void> {
    await this.client.execute(UPSERT_SQL, [
      preferences.userId,
      preferences.muteUntil,
      JSON.stringify(preferences.channelPreferences),
    ]);
  }
}
