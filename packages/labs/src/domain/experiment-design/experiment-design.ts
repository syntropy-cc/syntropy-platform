/**
 * ExperimentDesign aggregate — experiment structure and protocol (COMP-024.1).
 * Architecture: experiment-design.md
 */

import type { ArticleId, ExperimentId } from "@syntropy/types";
import type { HypothesisId } from "../scientific-context/hypothesis-record.js";
import {
  isExperimentStatus,
  type ExperimentStatus,
} from "./experiment-status.js";

export interface ExperimentDesignParams {
  experimentId: ExperimentId;
  articleId: ArticleId;
  researcherId: string;
  title: string;
  methodologyId: string;
  hypothesisRecordId: HypothesisId | null;
  protocol: Record<string, unknown>;
  variables: Record<string, unknown>;
  ethicalApprovalStatus: string;
  status: ExperimentStatus;
  preRegisteredAt?: Date | null;
}

/**
 * ExperimentDesign aggregate — specifies reproducible experiment; protocol and
 * variables are immutable once register() is called.
 */
export class ExperimentDesign {
  readonly experimentId: ExperimentId;
  readonly articleId: ArticleId;
  readonly researcherId: string;
  readonly title: string;
  readonly methodologyId: string;
  readonly hypothesisRecordId: HypothesisId | null;
  readonly protocol: Record<string, unknown>;
  readonly variables: Record<string, unknown>;
  readonly ethicalApprovalStatus: string;
  readonly status: ExperimentStatus;
  readonly preRegisteredAt: Date | null;
  /** Once true, protocol and variables cannot be changed. */
  private readonly _registered: boolean;

  constructor(params: ExperimentDesignParams) {
    if (!params.title?.trim()) {
      throw new Error("ExperimentDesign title cannot be empty");
    }
    if (!params.researcherId?.trim()) {
      throw new Error("ExperimentDesign researcherId cannot be empty");
    }
    if (!isExperimentStatus(params.status)) {
      throw new Error(
        `Invalid experiment status: ${params.status}. Must be designing, registered, running, or completed.`
      );
    }
    this.experimentId = params.experimentId;
    this.articleId = params.articleId;
    this.researcherId = params.researcherId.trim();
    this.title = params.title.trim();
    this.methodologyId = params.methodologyId;
    this.hypothesisRecordId = params.hypothesisRecordId ?? null;
    this.protocol = params.protocol ?? {};
    this.variables = params.variables ?? {};
    this.ethicalApprovalStatus = params.ethicalApprovalStatus ?? "";
    this.status = params.status;
    this.preRegisteredAt = params.preRegisteredAt ?? null;
    this._registered = params.status === "registered" || params.status === "running" || params.status === "completed";
  }

  /** Transition to registered; locks protocol and variables (immutable from then on). */
  register(): ExperimentDesign {
    if (this._registered || this.status !== "designing") {
      throw new Error(
        `Cannot register: current status is ${this.status}, expected designing`
      );
    }
    return new ExperimentDesign({
      ...this,
      status: "registered",
      preRegisteredAt: new Date(),
    });
  }

  /** Returns true if protocol/variables are locked (after register). */
  isRegistered(): boolean {
    return this._registered;
  }
}
