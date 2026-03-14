/**
 * Integration tests for PostgresContractRepository (COMP-004.5).
 * Uses in-memory mock client to verify repository logic without real DB.
 */

import { describe, expect, it, beforeEach } from "vitest";
import {
  GovernanceContract,
  type ContractClause,
} from "@syntropy/dip-contracts";
import { PostgresContractRepository } from "../../src/infrastructure/repositories/postgres-contract-repository.js";
import type { ContractDbClient } from "../../src/infrastructure/contract-db-client.js";

interface ContractRow {
  id: string;
  institution_id: string;
  dsl: { id: string; institutionId: string; clauses: ContractClause[] };
}

function createMockDbClient(): ContractDbClient & {
  rows: Map<string, ContractRow>;
} {
  const rows = new Map<string, ContractRow>();
  return {
    rows,
    async execute(_sql: string, params: unknown[]): Promise<void> {
      const id = String(params[0]);
      const institutionId = String(params[1]);
      const dslParam = params[2];
      const dsl =
        typeof dslParam === "string"
          ? (JSON.parse(dslParam) as ContractRow["dsl"])
          : (dslParam as ContractRow["dsl"]);
      rows.set(id, {
        id,
        institution_id: institutionId,
        dsl,
      });
    },
    async query<T = ContractRow>(
      sql: string,
      params: unknown[],
    ): Promise<T[]> {
      if (sql.includes("WHERE id = $1")) {
        const id = params[0] as string;
        const row = rows.get(id);
        return row ? [row as T] : [];
      }
      if (sql.includes("WHERE institution_id = $1")) {
        const institutionId = params[0] as string;
        return [...rows.values()]
          .filter((r) => r.institution_id === institutionId)
          .sort(
            (a, b) =>
              a.id.localeCompare(b.id),
          ) as T[];
      }
      return [];
    },
  };
}

describe("PostgresContractRepository", () => {
  let client: ReturnType<typeof createMockDbClient>;
  let repo: PostgresContractRepository;

  beforeEach(() => {
    client = createMockDbClient();
    repo = new PostgresContractRepository(client);
  });

  it("save and findById roundtrip returns same contract", async () => {
    const contract = GovernanceContract.create({
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      institutionId: "inst-001",
      clauses: [
        {
          kind: "transparency",
          requirePublicRecord: true,
          requiredDisclosures: ["budget"],
        },
      ],
    });

    await repo.save(contract);
    const found = await repo.findById(contract.id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(contract.id);
    expect(found!.institutionId).toBe(contract.institutionId);
    expect(found!.clauses).toHaveLength(1);
    expect(found!.clauses[0]).toMatchObject({
      kind: "transparency",
      requirePublicRecord: true,
      requiredDisclosures: ["budget"],
    });
  });

  it("findById returns null when contract does not exist", async () => {
    const found = await repo.findById("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    expect(found).toBeNull();
  });

  it("findByInstitution returns only that institution's contracts", async () => {
    const inst1 = "inst-001";
    const inst2 = "inst-002";
    await repo.save(
      GovernanceContract.create({
        id: "a0000001-0000-4000-8000-000000000001",
        institutionId: inst1,
        clauses: [],
      }),
    );
    await repo.save(
      GovernanceContract.create({
        id: "a0000002-0000-4000-8000-000000000002",
        institutionId: inst2,
        clauses: [],
      }),
    );
    await repo.save(
      GovernanceContract.create({
        id: "a0000003-0000-4000-8000-000000000003",
        institutionId: inst1,
        clauses: [],
      }),
    );

    const byInst1 = await repo.findByInstitution(inst1);
    const byInst2 = await repo.findByInstitution(inst2);

    expect(byInst1).toHaveLength(2);
    expect(byInst2).toHaveLength(1);
    expect(byInst1.map((c) => c.id).sort()).toEqual([
      "a0000001-0000-4000-8000-000000000001",
      "a0000003-0000-4000-8000-000000000003",
    ]);
  });

  it("save updates existing contract when same id", async () => {
    const id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
    const first = GovernanceContract.create({
      id,
      institutionId: "inst-001",
      clauses: [{ kind: "transparency", requirePublicRecord: false }],
    });
    await repo.save(first);

    const updated = GovernanceContract.create({
      id,
      institutionId: "inst-001",
      clauses: [
        { kind: "transparency", requirePublicRecord: true },
        {
          kind: "participation_threshold",
          minQuorumPercent: 50,
          minParticipants: 3,
        },
      ],
    });
    await repo.save(updated);

    const found = await repo.findById(id);
    expect(found).not.toBeNull();
    expect(found!.clauses).toHaveLength(2);
    expect(found!.clauses[0]).toMatchObject({
      kind: "transparency",
      requirePublicRecord: true,
    });
    expect(found!.clauses[1]).toMatchObject({
      kind: "participation_threshold",
      minQuorumPercent: 50,
      minParticipants: 3,
    });
  });
});
