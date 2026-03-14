/**
 * IDE domain event publisher port (COMP-030.6).
 * Architecture: IDE domain, PAT-009
 */

import type { ContainerProvisionedEvent } from "../events/container-provisioned.js";

export type IDEDomainEvent = ContainerProvisionedEvent;

/**
 * Port for publishing IDE domain events.
 * Implemented in infrastructure (event bus adapter).
 */
export interface IDEEventPublisher {
  publish(event: IDEDomainEvent): Promise<void>;
}
