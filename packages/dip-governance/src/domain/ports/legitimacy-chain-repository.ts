/**
 * Port for persisting and loading LegitimacyChain entries (COMP-007.6).
 * Architecture: DIP Institutional Governance — dependency inversion
 */

import type { LegitimacyChainEntry } from "../legitimacy-chain-entry.js";

/**
 * Append-only repository for legitimacy chain entries. Entries are immutable.
 */
export interface LegitimacyChainRepositoryPort {
  append(entry: LegitimacyChainEntry): Promise<void>;
  findByInstitutionId(institutionId: string): Promise<LegitimacyChainEntry[]>;
}
