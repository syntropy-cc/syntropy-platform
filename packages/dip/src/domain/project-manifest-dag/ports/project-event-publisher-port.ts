/**
 * Port for publishing project domain events (COMP-006.5).
 * Implementations (e.g. Kafka) live in infrastructure.
 */

import type { ProjectCreatedEvent } from "../events/project-events.js";
import type { ProjectManifestUpdatedEvent } from "../events/project-events.js";

/**
 * Port for publishing project domain events to the event bus.
 */
export interface ProjectEventPublisherPort {
  publishProjectCreated(event: ProjectCreatedEvent): Promise<void>;
  publishProjectManifestUpdated(event: ProjectManifestUpdatedEvent): Promise<void>;
}
