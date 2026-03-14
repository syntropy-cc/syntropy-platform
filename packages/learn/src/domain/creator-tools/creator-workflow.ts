/**
 * CreatorWorkflow aggregate — 5-phase lifecycle (COMP-017.1).
 * Architecture: creator-tools-copilot.md, IMPLEMENTATION-PLAN Section 7.
 */

import type { CreatorWorkflowId, TrackId } from "@syntropy/types";

import { InvalidPhaseTransitionError } from "../errors.js";
import type { CreatorWorkflowPhaseEntered } from "./events.js";
import {
  CREATOR_WORKFLOW_PHASES,
  type CreatorWorkflowPhase,
  isValidNextPhase,
} from "./creator-workflow-phase.js";

const INITIAL_PHASE: CreatorWorkflowPhase = "ideation";

export interface CreatorWorkflowParams {
  id: CreatorWorkflowId;
  trackId: TrackId;
  creatorId: string;
  currentPhase?: CreatorWorkflowPhase;
  phasesCompleted?: readonly CreatorWorkflowPhase[];
  startedAt: Date;
  completedAt?: Date | null;
}

/**
 * CreatorWorkflow aggregate. Manages the 5-phase authoring workflow.
 * Transition to the next phase only; no skipping or going backwards.
 */
export class CreatorWorkflow {
  readonly id: CreatorWorkflowId;
  readonly trackId: TrackId;
  readonly creatorId: string;
  private _currentPhase: CreatorWorkflowPhase;
  private _phasesCompleted: readonly CreatorWorkflowPhase[];
  readonly startedAt: Date;
  private _completedAt: Date | null;

  private constructor(params: CreatorWorkflowParams) {
    this.id = params.id;
    this.trackId = params.trackId;
    this.creatorId = params.creatorId;
    this._currentPhase = params.currentPhase ?? INITIAL_PHASE;
    this._phasesCompleted = [...(params.phasesCompleted ?? [])];
    this.startedAt = params.startedAt;
    this._completedAt = params.completedAt ?? null;
  }

  static create(params: Omit<CreatorWorkflowParams, "currentPhase" | "phasesCompleted">): CreatorWorkflow {
    return new CreatorWorkflow({
      ...params,
      currentPhase: INITIAL_PHASE,
      phasesCompleted: [],
    });
  }

  get currentPhase(): CreatorWorkflowPhase {
    return this._currentPhase;
  }

  get phasesCompleted(): readonly CreatorWorkflowPhase[] {
    return this._phasesCompleted;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  /** True when workflow has reached the publication phase. */
  get isComplete(): boolean {
    return this._currentPhase === "publication" || this._completedAt !== null;
  }

  /**
   * Transition to the next phase. Only the immediate next phase is allowed.
   * Returns the domain event to publish; caller (application layer) is responsible for publishing.
   */
  transition(nextPhase: CreatorWorkflowPhase): CreatorWorkflowPhaseEntered {
    if (!isValidNextPhase(this._currentPhase, nextPhase)) {
      throw new InvalidPhaseTransitionError(
        this._currentPhase,
        nextPhase
      );
    }

    this._phasesCompleted = [...this._phasesCompleted, this._currentPhase];
    this._currentPhase = nextPhase;

    if (nextPhase === "publication") {
      this._completedAt = new Date();
    }

    const event: CreatorWorkflowPhaseEntered = {
      type: "CreatorWorkflowPhaseEntered",
      workflowId: this.id,
      phase: nextPhase,
      occurredAt: new Date(),
    };
    return event;
  }
}

export { CREATOR_WORKFLOW_PHASES, type CreatorWorkflowPhase } from "./creator-workflow-phase.js";
