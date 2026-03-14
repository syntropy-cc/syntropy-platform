/**
 * Creator workflow domain events (COMP-017.1).
 * Architecture: creator-tools-copilot.md, PAT-009.
 */

import type { CreatorWorkflowId } from "@syntropy/types";
import type { CreatorWorkflowPhase } from "./creator-workflow-phase.js";

/**
 * Emitted when a workflow transitions into a new phase.
 * Application layer publishes to event bus; aggregate does not depend on infrastructure.
 */
export interface CreatorWorkflowPhaseEntered {
  readonly type: "CreatorWorkflowPhaseEntered";
  readonly workflowId: CreatorWorkflowId;
  readonly phase: CreatorWorkflowPhase;
  readonly occurredAt: Date;
}

export type CreatorWorkflowDomainEvent = CreatorWorkflowPhaseEntered;
