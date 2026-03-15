/**
 * PostgreSQL implementation of NotificationRepository (COMP-028.3, COMP-028.6).
 * Architecture: COMP-028.
 */

import { Notification } from "../../domain/notification.js";
import type {
  NotificationRepository,
  FindByUserIdOptions,
} from "../../domain/ports/notification-repository.js";
import type { CommunicationDbClient } from "../communication-db-client.js";

const TABLE = "communication.notifications";

const INSERT_SQL = `
  INSERT INTO ${TABLE} (id, user_id, notification_type, source_event_type, payload, is_read, created_at)
  VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
`;

const SELECT_BY_USER_SQL = `
  SELECT id, user_id, notification_type, source_event_type, payload, is_read, created_at
  FROM ${TABLE}
  WHERE user_id = $1
  ORDER BY created_at DESC
  LIMIT $2 OFFSET $3
`;

const SELECT_BY_USER_SINCE_SQL = `
  SELECT id, user_id, notification_type, source_event_type, payload, is_read, created_at
  FROM ${TABLE}
  WHERE user_id = $1 AND created_at > $2
  ORDER BY created_at DESC
  LIMIT $3 OFFSET $4
`;

const UPDATE_READ_SQL = `
  UPDATE ${TABLE}
  SET is_read = true
  WHERE id = $1 AND user_id = $2
`;

interface NotificationRow {
  id: string;
  user_id: string;
  notification_type: string;
  source_event_type: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: Date;
}

function rowToNotification(row: NotificationRow): Notification {
  return new Notification({
    id: row.id,
    userId: row.user_id,
    notificationType: row.notification_type,
    sourceEventType: row.source_event_type,
    payload: row.payload ?? {},
    isRead: row.is_read,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
  });
}

export class PostgresNotificationRepository implements NotificationRepository {
  constructor(private readonly client: CommunicationDbClient) {}

  async save(notification: Notification): Promise<void> {
    await this.client.execute(INSERT_SQL, [
      notification.id,
      notification.userId,
      notification.notificationType,
      notification.sourceEventType,
      JSON.stringify(notification.payload),
      notification.isRead,
      notification.createdAt,
    ]);
  }

  async findByUserId(
    userId: string,
    options?: FindByUserIdOptions
  ): Promise<Notification[]> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    const since = options?.since;
    const rows = since
      ? await this.client.query<NotificationRow>(SELECT_BY_USER_SINCE_SQL, [
          userId,
          since,
          limit,
          offset,
        ])
      : await this.client.query<NotificationRow>(SELECT_BY_USER_SQL, [
          userId,
          limit,
          offset,
        ]);
    return rows.map(rowToNotification);
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const existing = await this.client.query<{ id: string }>(
      `SELECT id FROM ${TABLE} WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (existing.length === 0) return false;
    await this.client.execute(UPDATE_READ_SQL, [id, userId]);
    return true;
  }
}
