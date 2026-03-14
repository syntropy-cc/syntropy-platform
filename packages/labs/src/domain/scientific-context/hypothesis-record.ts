/**
 * HypothesisRecord aggregate — formalized research hypothesis with status lifecycle (COMP-022.3).
 * Architecture: scientific-context-extension.md
 */

import type { ExperimentId } from "@syntropy/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Branded type for HypothesisId. UUID-based; immutable. */
export type HypothesisId = string & { readonly __brand: "HypothesisId" };

export function createHypothesisId(value: string): HypothesisId {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("HypothesisId cannot be empty");
  }
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(
      `Invalid HypothesisId: expected UUID format, got "${value}"`
    );
  }
  return trimmed as HypothesisId;
}

export function isHypothesisId(value: string): value is HypothesisId {
  return UUID_REGEX.test(value.trim());
}

/** Lifecycle status for a hypothesis. */
export type HypothesisStatus = "proposed" | "confirmed" | "refuted";

const HYPOTHESIS_STATUSES: HypothesisStatus[] = [
  "proposed",
  "confirmed",
  "refuted",
];

export function isHypothesisStatus(value: string): value is HypothesisStatus {
  return HYPOTHESIS_STATUSES.includes(value as HypothesisStatus);
}

export interface HypothesisRecordParams {
  hypothesisId: HypothesisId;
  projectId: string;
  statement: string;
  status: HypothesisStatus;
  experimentId?: ExperimentId | null;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * HypothesisRecord aggregate — formalized research hypothesis linked to a DIP project.
 * Status lifecycle: proposed → confirmed | refuted (e.g. after experiment).
 */
export class HypothesisRecord {
  readonly hypothesisId: HypothesisId;
  readonly projectId: string;
  readonly statement: string;
  readonly status: HypothesisStatus;
  readonly experimentId: ExperimentId | null;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: HypothesisRecordParams) {
    if (!params.statement?.trim()) {
      throw new Error("HypothesisRecord statement cannot be empty");
    }
    if (!isHypothesisStatus(params.status)) {
      throw new Error(
        `Invalid hypothesis status: ${params.status}. Must be proposed, confirmed, or refuted.`
      );
    }
    this.hypothesisId = params.hypothesisId;
    this.projectId = params.projectId;
    this.statement = params.statement.trim();
    this.status = params.status;
    this.experimentId = params.experimentId ?? null;
    this.createdBy = params.createdBy;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? this.createdAt;
  }

  /** Link this hypothesis to an experiment. Returns new record (immutable). */
  linkExperiment(experimentId: ExperimentId): HypothesisRecord {
    return new HypothesisRecord({
      ...this,
      experimentId,
      updatedAt: new Date(),
    });
  }

  /** Transition to confirmed (e.g. after experiment supports hypothesis). */
  confirm(): HypothesisRecord {
    if (this.status !== "proposed") {
      throw new Error(
        `Cannot confirm: current status is ${this.status}, expected proposed`
      );
    }
    return new HypothesisRecord({
      ...this,
      status: "confirmed",
      updatedAt: new Date(),
    });
  }

  /** Transition to refuted (e.g. after experiment contradicts hypothesis). */
  refute(): HypothesisRecord {
    if (this.status !== "proposed") {
      throw new Error(
        `Cannot refute: current status is ${this.status}, expected proposed`
      );
    }
    return new HypothesisRecord({
      ...this,
      status: "refuted",
      updatedAt: new Date(),
    });
  }
}
