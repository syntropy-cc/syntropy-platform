/**
 * IACPRepository — domain interface for IACP record persistence.
 * Architecture: COMP-005.6, DIP IACP Engine (ARCH-002: depend on abstractions)
 */

import type { IACPRecord } from "../iacp-record.js";
import type { IACPId } from "../value-objects/iacp-id.js";

/**
 * Port for persisting and loading IACP aggregates.
 * Implementations live in the infrastructure layer (e.g. PostgresIACPRepository in packages/dip).
 */
export interface IACPRepository {
  save(record: IACPRecord): Promise<void>;
  findById(id: IACPId): Promise<IACPRecord | null>;
  findByInstitution(institutionId: string): Promise<IACPRecord[]>;
}
