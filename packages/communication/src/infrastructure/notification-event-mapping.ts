/**
 * Maps domain event (topic, eventType, payload) to notification DTOs (COMP-028.3).
 * Architecture: COMP-028. Event types that trigger notifications per communication domain architecture.
 */

/** Event types that trigger a notification. */
export const NOTIFICATION_TRIGGER_EVENT_TYPES = new Set([
  "dip.artifact.published",
  "hub.contribution.integrated",
  "learn.mentorship.proposed",
  "labs.review.submitted",
  "labs.review.published",
  "platform_core.achievement.unlocked",
  "platform_core.collectible.awarded",
]);

export interface NotificationDto {
  userId: string;
  notificationType: string;
  payload: Record<string, unknown>;
}

/**
 * Extract recipient user id from event payload. Tries common field names.
 */
export function recipientFromPayload(payload: Record<string, unknown>): string | null {
  const id =
    payload.actorId ??
    payload.actor_id ??
    payload.userId ??
    payload.user_id ??
    payload.recipientId ??
    payload.recipient_id ??
    payload.authorId ??
    payload.author_id;
  if (typeof id === "string" && id.trim().length > 0) return id.trim();
  return null;
}

/**
 * Map event type to notification type (template key). Simple 1:1 with sanitized name.
 */
export function eventTypeToNotificationType(eventType: string): string {
  return eventType.replace(/\./g, "_");
}

/**
 * Build notification DTOs for a given event. Returns empty array if event type
 * does not trigger notifications or recipient cannot be determined.
 */
export function mapEventToNotifications(
  eventType: string,
  payload: Record<string, unknown>
): NotificationDto[] {
  if (!NOTIFICATION_TRIGGER_EVENT_TYPES.has(eventType)) {
    return [];
  }
  const userId = recipientFromPayload(payload);
  if (!userId) {
    return [];
  }
  const notificationType = eventTypeToNotificationType(eventType);
  const payloadFragment: Record<string, unknown> = {
    eventType,
    ...(payload.entityId != null && { entityId: payload.entityId }),
    ...(payload.entity_id != null && { entityId: payload.entity_id }),
    ...(payload.artifactId != null && { artifactId: payload.artifactId }),
    ...(payload.artifact_id != null && { artifactId: payload.artifact_id }),
    ...(typeof payload.title === "string" && { title: payload.title }),
    ...(typeof payload.name === "string" && { name: payload.name }),
  };
  return [{ userId, notificationType, payload: payloadFragment }];
}
