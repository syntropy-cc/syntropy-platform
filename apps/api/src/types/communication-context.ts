/**
 * Communication context for REST API communication routes (COMP-028.6).
 *
 * Injected when registering communication routes; provides notification,
 * thread, and message repository ports from the communication domain.
 */

import type {
  NotificationRepository,
  ThreadRepository,
  MessageRepository,
} from "@syntropy/communication";

export interface CommunicationContext {
  notificationRepository: NotificationRepository;
  threadRepository: ThreadRepository;
  messageRepository: MessageRepository;
}
