/**
 * ExperimentResult entity — collected data and analysis outputs (COMP-024.2).
 * Architecture: experiment-design.md
 */

import type { ExperimentId, ExperimentResultId } from "@syntropy/types";

export interface ExperimentResultParams {
  id: ExperimentResultId;
  experimentId: ExperimentId;
  /** Reference to raw data (e.g. storage path or artifact ID). */
  rawDataLocation: string;
  /** Statistical summary (e.g. mean, std, n). */
  statisticalSummary: Record<string, unknown>;
  /** p-value from analysis; null if not applicable. */
  pValue: number | null;
  /** When the result was collected. */
  collectedAt: Date;
}

/**
 * ExperimentResult entity — immutable once created. Holds raw data reference,
 * statistical summary, and p-value; linked to an experiment.
 */
export class ExperimentResult {
  readonly id: ExperimentResultId;
  readonly experimentId: ExperimentId;
  readonly rawDataLocation: string;
  readonly statisticalSummary: Record<string, unknown>;
  readonly pValue: number | null;
  readonly collectedAt: Date;

  constructor(params: ExperimentResultParams) {
    if (!params.rawDataLocation?.trim()) {
      throw new Error("ExperimentResult rawDataLocation cannot be empty");
    }
    if (params.pValue !== null && (params.pValue < 0 || params.pValue > 1)) {
      throw new Error(
        `ExperimentResult pValue must be in [0, 1], got ${params.pValue}`
      );
    }
    if (!(params.collectedAt instanceof Date)) {
      throw new Error("ExperimentResult collectedAt must be a Date");
    }
    this.id = params.id;
    this.experimentId = params.experimentId;
    this.rawDataLocation = params.rawDataLocation.trim();
    this.statisticalSummary = params.statisticalSummary ?? {};
    this.pValue = params.pValue ?? null;
    this.collectedAt = params.collectedAt;
  }
}
