/**
 * Port for persisting LearnerProgressRecord (COMP-016.3).
 * Architecture: fragment-artifact-engine.md, PAT-004.
 */

import type { LearnerProgressRecord } from "../learner-progress-record.js";
import type { ProgressEntityType } from "../learner-progress-record.js";

export interface LearnerProgressRepositoryPort {
  findByUserAndEntity(
    userId: string,
    entityId: string,
    entityType: ProgressEntityType
  ): Promise<LearnerProgressRecord | null>;

  save(record: LearnerProgressRecord): Promise<void>;
}
