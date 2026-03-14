/**
 * Port for publishing IACP lifecycle events (created, activated, terminated).
 * Architecture: COMP-005.7, DIP IACP Engine (ARCH-002: depend on abstractions)
 */

import type {
  IACPCreatedEvent,
  IACPActivatedEvent,
  IACPTerminatedEvent,
} from "../events/iacp-events.js";

/**
 * Port for publishing IACP events. Implementations publish to Kafka or other transports.
 */
export interface IACPEventPublisherPort {
  publishCreated(event: IACPCreatedEvent): Promise<void>;
  publishActivated(event: IACPActivatedEvent): Promise<void>;
  publishTerminated(event: IACPTerminatedEvent): Promise<void>;
}
