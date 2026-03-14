/**
 * ExperimentDesignRepositoryPort — persistence for ExperimentDesign (COMP-024.4).
 */

import type { ExperimentId } from "@syntropy/types";
import type { ExperimentDesign } from "../experiment-design.js";

export interface ExperimentDesignRepositoryPort {
  save(design: ExperimentDesign): Promise<void>;
  findById(id: ExperimentId): Promise<ExperimentDesign | null>;
}
