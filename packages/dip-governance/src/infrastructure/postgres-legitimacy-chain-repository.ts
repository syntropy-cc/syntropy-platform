/**
 * PostgreSQL implementation of LegitimacyChainRepositoryPort (COMP-007.6).
 */

import { LegitimacyChainEntry } from "../domain/legitimacy-chain-entry.js";
import type { LegitimacyChainRepositoryPort } from "../domain/ports/legitimacy-chain-repository.js";
import type { GovernanceDbClient } from "./governance-db-client.js";

const TABLE = "dip.legitimacy_chain_entries";
const INSERT_SQL = `
  INSERT INTO ${TABLE} (
    institution_id, proposal_id, event_type, executed_at,
    executor_id, executor_signature, institution_state_before_hash,
    institution_state_after_hash, previous_chain_hash, chain_hash, nostr_event_id
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
`;
const SELECT_BY_INSTITUTION = `
  SELECT institution_id, proposal_id, event_type, executed_at,
         executor_id, executor_signature, institution_state_before_hash,
         institution_state_after_hash, previous_chain_hash, chain_hash, nostr_event_id
  FROM ${TABLE}
  WHERE institution_id = $1
  ORDER BY id ASC
`;

function rowToEntry(row: Record<string, unknown>): LegitimacyChainEntry {
  return LegitimacyChainEntry.fromPersistence({
    institutionId: String(row.institution_id),
    proposalId: String(row.proposal_id),
    eventType: String(row.event_type),
    executedAt:
      row.executed_at instanceof Date
        ? row.executed_at.toISOString()
        : new Date(String(row.executed_at)).toISOString(),
    executorId:
      row.executor_id != null && String(row.executor_id) !== ""
        ? String(row.executor_id)
        : undefined,
    executorSignature:
      row.executor_signature != null && String(row.executor_signature) !== ""
        ? String(row.executor_signature)
        : undefined,
    institutionStateBeforeHash:
      row.institution_state_before_hash != null &&
      String(row.institution_state_before_hash) !== ""
        ? String(row.institution_state_before_hash)
        : undefined,
    institutionStateAfterHash:
      row.institution_state_after_hash != null &&
      String(row.institution_state_after_hash) !== ""
        ? String(row.institution_state_after_hash)
        : undefined,
    previousChainHash: String(row.previous_chain_hash),
    chainHash: String(row.chain_hash),
    nostrEventId:
      row.nostr_event_id != null && String(row.nostr_event_id) !== ""
        ? String(row.nostr_event_id)
        : undefined,
  });
}

export class PostgresLegitimacyChainRepository implements LegitimacyChainRepositoryPort {
  constructor(private readonly db: GovernanceDbClient) {}

  async append(entry: LegitimacyChainEntry): Promise<void> {
    await this.db.execute(INSERT_SQL, [
      entry.institutionId,
      entry.proposalId,
      entry.eventType,
      entry.executedAt,
      entry.executorId ?? null,
      entry.executorSignature ?? null,
      entry.institutionStateBeforeHash ?? null,
      entry.institutionStateAfterHash ?? null,
      entry.previousChainHash,
      entry.chainHash,
      entry.nostrEventId ?? null,
    ]);
  }

  async findByInstitutionId(institutionId: string): Promise<LegitimacyChainEntry[]> {
    const rows = await this.db.query<Record<string, unknown>>(SELECT_BY_INSTITUTION, [
      institutionId,
    ]);
    return rows.map(rowToEntry);
  }
}
