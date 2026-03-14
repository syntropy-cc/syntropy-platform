/**
 * ExperimentResultRepositoryPort — persistence for ExperimentResult (COMP-024.4).
 */

import type { ExperimentId, ExperimentResultId } from "@syntropy/types";
import type { ExperimentResult } from "../experiment-result.js";

export interface ExperimentResultRepositoryPort {
  save(result: ExperimentResult): Promise<void>;
  findById(id: ExperimentResultId): Promise<ExperimentResult | null>;
  findByExperimentId(experimentId: ExperimentId): Promise<ExperimentResult[]>;
}
