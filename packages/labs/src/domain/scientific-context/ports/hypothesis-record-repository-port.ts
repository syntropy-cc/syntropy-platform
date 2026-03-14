/**
 * Port for persisting and querying HypothesisRecord (COMP-022.4).
 */

import type { HypothesisRecord, HypothesisId } from "../hypothesis-record.js";

export interface HypothesisRecordRepositoryPort {
  save(record: HypothesisRecord): Promise<void>;
  findById(id: HypothesisId): Promise<HypothesisRecord | null>;
}
