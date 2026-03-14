/**
 * Port for querying ResearchMethodology catalog (COMP-022.4).
 */

import type {
  ResearchMethodology,
  ResearchMethodologyId,
} from "../research-methodology.js";

export interface ResearchMethodologyRepositoryPort {
  listAll(): Promise<ResearchMethodology[]>;
  findById(id: ResearchMethodologyId): Promise<ResearchMethodology | null>;
  save(methodology: ResearchMethodology): Promise<void>;
}
