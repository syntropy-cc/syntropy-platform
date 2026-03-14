/**
 * Integration tests for PostgresIACPRepository (COMP-005.6).
 * Uses in-memory mock client to verify repository logic without real DB.
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  IACPRecord,
  IACPStatus,
  createIACPId,
  createIACPParty,
} from "@syntropy/dip-iacp";
import { PostgresIACPRepository } from "../../src/infrastructure/repositories/postgres-iacp-repository.js";
import type { IacpDbClient } from "../../src/infrastructure/iacp-db-client.js";

function createMockIacpDbClient(): IacpDbClient & {
  records: Map<string, Record<string, unknown>>;
  parties: Array<Record<string, unknown>>;
} {
  const records = new Map<string, Record<string, unknown>>();
  const parties: Array<Record<string, unknown>> = [];
  return {
    records,
    parties,
    async execute(sql: string, params: unknown[]): Promise<void> {
      if (sql.includes("INSERT INTO dip.iacp_records") || sql.includes("ON CONFLICT (id) DO UPDATE")) {
        const [id, type, status, institutionId] = params as [string, string, string, string | null];
        records.set(id, { id, type, status, institution_id: institutionId });
      } else if (sql.includes("DELETE FROM dip.iacp_parties")) {
        const [iacpId] = params as [string];
        for (let i = parties.length - 1; i >= 0; i--) {
          if (parties[i].iacp_id === iacpId) parties.splice(i, 1);
        }
      } else if (sql.includes("INSERT INTO dip.iacp_parties")) {
        const [iacpId, actorId, role, signature] = params as [string, string, string, string | null];
        parties.push({ iacp_id: iacpId, actor_id: actorId, role, signature });
      }
    },
    async query<T = Record<string, unknown>>(
      sql: string,
      params: unknown[],
    ): Promise<T[]> {
      if (sql.includes("WHERE id = $1") && sql.includes("iacp_records")) {
        const [id] = params as [string];
        const row = records.get(id);
        return row ? [row as T] : [];
      }
      if (sql.includes("WHERE iacp_id = $1")) {
        const [iacpId] = params as [string];
        return parties
          .filter((p) => p.iacp_id === iacpId)
          .map((p) => ({
            actor_id: p.actor_id,
            role: p.role,
            signature: p.signature ?? null,
          })) as T[];
      }
      if (sql.includes("WHERE institution_id = $1")) {
        const [instId] = params as [string];
        return [...records.values()]
          .filter((r) => r.institution_id === instId)
          .sort(
            (a, b) =>
              (a.created_at as number) ?? 0 - (b.created_at as number) ?? 0,
          ) as T[];
      }
      return [];
    },
  };
}

describe("PostgresIACPRepository", () => {
  let client: ReturnType<typeof createMockIacpDbClient>;
  let repo: PostgresIACPRepository;

  beforeEach(() => {
    client = createMockIacpDbClient();
    repo = new PostgresIACPRepository(client);
  });

  it("save then findById returns same record", async () => {
    const id = createIACPId("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    const record = IACPRecord.draft({
      id,
      type: "usage_agreement",
      institutionId: "inst-1",
    })
      .addParty(createIACPParty({ actorId: "actor-1", role: "signer" }))
      .submit();

    await repo.save(record);
    const found = await repo.findById(id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(record.id);
    expect(found!.type).toBe(record.type);
    expect(found!.status).toBe(IACPStatus.PendingSignatures);
    expect(found!.institutionId).toBe("inst-1");
    expect(found!.parties).toHaveLength(1);
    expect(found!.parties[0].actorId).toBe("actor-1");
    expect(found!.parties[0].role).toBe("signer");
  });

  it("findById returns null when record does not exist", async () => {
    const id = createIACPId("a0000000-0000-4000-8000-000000000001");

    const found = await repo.findById(id);

    expect(found).toBeNull();
  });

  it("findByInstitution returns records for that institution", async () => {
    const id1 = createIACPId("a1000000-0000-4000-8000-000000000001");
    const id2 = createIACPId("a2000000-0000-4000-8000-000000000002");
    const record1 = IACPRecord.draft({
      id: id1,
      type: "usage_agreement",
      institutionId: "inst-A",
    });
    const record2 = IACPRecord.draft({
      id: id2,
      type: "governance",
      institutionId: "inst-A",
    });

    await repo.save(record1);
    await repo.save(record2);

    const list = await repo.findByInstitution("inst-A");

    expect(list).toHaveLength(2);
    const ids = list.map((r) => r.id).sort();
    expect(ids).toEqual([id1, id2]);
  });

  it("findByInstitution returns empty when no records for institution", async () => {
    const list = await repo.findByInstitution("nonexistent");

    expect(list).toEqual([]);
  });

  it("save overwrites parties for existing record", async () => {
    const id = createIACPId("b1000000-0000-4000-8000-000000000001");
    let record = IACPRecord.draft({ id, type: "usage_agreement" })
      .addParty(createIACPParty({ actorId: "a1", role: "signer" }))
      .submit();

    await repo.save(record);

    record = IACPRecord.fromPersistence({
      id,
      type: "usage_agreement",
      status: IACPStatus.PendingSignatures,
      parties: [
        createIACPParty({ actorId: "a1", role: "signer", signature: "sig1" }),
        createIACPParty({ actorId: "a2", role: "author", signature: "sig2" }),
      ],
    });
    await repo.save(record);

    const found = await repo.findById(id);
    expect(found!.parties).toHaveLength(2);
    expect(found!.parties.map((p) => p.actorId).sort()).toEqual(["a1", "a2"]);
  });
});
