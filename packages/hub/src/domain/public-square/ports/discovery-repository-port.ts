/**
 * Port for persisting and querying DiscoveryDocument (COMP-021.3 / COMP-021.4).
 * Implemented by Postgres in COMP-021.4; in-memory for tests.
 */

import type { DiscoveryDocument } from "../discovery-document.js";

export interface DiscoveryRepositoryPort {
  upsert(doc: DiscoveryDocument): Promise<void>;
  findById(institutionId: string): Promise<DiscoveryDocument | null>;
  findTop(limit: number): Promise<DiscoveryDocument[]>;
}
