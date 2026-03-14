/**
 * PostgreSQL implementation of IACPRepository (COMP-005.6).
 */

import {
  IACPRecord,
  IACPStatus,
  createIACPId,
  createIACPParty,
  isIACPStatus,
} from "@syntropy/dip-iacp";
import type { IACPId } from "@syntropy/dip-iacp";
import type { IACPRepository } from "@syntropy/dip-iacp";
import type { IacpDbClient } from "../iacp-db-client.js";

const RECORDS_TABLE = "dip.iacp_records";
const PARTIES_TABLE = "dip.iacp_parties";

const UPSERT_RECORD = `
  INSERT INTO ${RECORDS_TABLE} (id, type, status, institution_id, created_at, updated_at)
  VALUES ($1, $2, $3, $4, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    type = EXCLUDED.type,
    status = EXCLUDED.status,
    institution_id = EXCLUDED.institution_id,
    updated_at = now()
`;

const DELETE_PARTIES = `DELETE FROM ${PARTIES_TABLE} WHERE iacp_id = $1`;
const INSERT_PARTY = `
  INSERT INTO ${PARTIES_TABLE} (iacp_id, actor_id, role, signature)
  VALUES ($1, $2, $3, $4)
`;

const SELECT_RECORD = `SELECT id, type, status, institution_id FROM ${RECORDS_TABLE} WHERE id = $1`;
const SELECT_PARTIES = `SELECT actor_id, role, signature FROM ${PARTIES_TABLE} WHERE iacp_id = $1 ORDER BY created_at ASC`;
const SELECT_BY_INSTITUTION = `SELECT id, type, status, institution_id FROM ${RECORDS_TABLE} WHERE institution_id = $1 ORDER BY created_at ASC`;

function rowToRecord(
  row: Record<string, unknown>,
  parties: Array<{ actor_id: string; role: string; signature: string | null }>,
): IACPRecord {
  const id = createIACPId(String(row.id));
  const status = String(row.status);
  if (!isIACPStatus(status)) {
    throw new Error(`Invalid IACP status in DB: ${status}`);
  }
  const institutionId =
    row.institution_id != null && row.institution_id !== ""
      ? String(row.institution_id)
      : undefined;
  const partyList = parties.map((p) =>
    createIACPParty({
      actorId: p.actor_id,
      role: p.role,
      signature: p.signature ?? undefined,
    }),
  );
  return IACPRecord.fromPersistence({
    id,
    type: String(row.type),
    status,
    parties: partyList,
    institutionId,
  });
}

export class PostgresIACPRepository implements IACPRepository {
  constructor(private readonly client: IacpDbClient) {}

  async save(record: IACPRecord): Promise<void> {
    await this.client.execute(UPSERT_RECORD, [
      record.id,
      record.type,
      record.status,
      record.institutionId ?? null,
    ]);
    await this.client.execute(DELETE_PARTIES, [record.id]);
    for (const party of record.parties) {
      await this.client.execute(INSERT_PARTY, [
        record.id,
        party.actorId,
        party.role,
        party.signature ?? null,
      ]);
    }
  }

  async findById(id: IACPId): Promise<IACPRecord | null> {
    const rows = await this.client.query<Record<string, unknown>>(
      SELECT_RECORD,
      [id],
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    const partyRows = await this.client.query<{
      actor_id: string;
      role: string;
      signature: string | null;
    }>(SELECT_PARTIES, [row.id]);
    return rowToRecord(row, partyRows);
  }

  async findByInstitution(institutionId: string): Promise<IACPRecord[]> {
    const rows = await this.client.query<Record<string, unknown>>(
      SELECT_BY_INSTITUTION,
      [institutionId],
    );
    const result: IACPRecord[] = [];
    for (const row of rows) {
      const partyRows = await this.client.query<{
        actor_id: string;
        role: string;
        signature: string | null;
      }>(SELECT_PARTIES, [row.id]);
      result.push(rowToRecord(row, partyRows));
    }
    return result;
  }
}
