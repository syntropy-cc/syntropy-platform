/**
 * Integration tests for governance repositories (COMP-007.6).
 * Uses in-memory mock client to verify repository logic without real DB.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { DigitalInstitution } from "../../src/domain/digital-institution.js";
import { LegitimacyChain, LegitimacyChainVerifier } from "../../src/domain/legitimacy-chain.js";
import { Proposal } from "../../src/domain/proposal.js";
import { ProposalStatus } from "../../src/domain/proposal-status.js";
import type { GovernanceDbClient } from "../../src/infrastructure/governance-db-client.js";
import { PostgresDigitalInstitutionRepository } from "../../src/infrastructure/postgres-digital-institution-repository.js";
import { PostgresLegitimacyChainRepository } from "../../src/infrastructure/postgres-legitimacy-chain-repository.js";
import { PostgresProposalRepository } from "../../src/infrastructure/postgres-proposal-repository.js";

function createMockGovernanceDbClient(): GovernanceDbClient {
  const institutions = new Map<string, Record<string, unknown>>();
  const proposals = new Map<string, Record<string, unknown>>();
  const chainEntries: Record<string, unknown>[] = [];

  return {
    async execute(sql: string, params: unknown[]): Promise<void> {
      if (sql.includes("digital_institutions")) {
        if (sql.includes("INSERT")) {
          institutions.set(String(params[0]), {
            institution_id: params[0],
            name: params[1],
            institution_type: params[2],
            governance_contract_id: params[3],
            status: params[4],
          });
        }
      } else if (sql.includes("proposals") && !sql.includes("legitimacy")) {
        if (sql.includes("INSERT")) {
          proposals.set(String(params[0]), {
            proposal_id: params[0],
            institution_id: params[1],
            type: params[2],
            status: params[3],
          });
        }
      } else if (sql.includes("legitimacy_chain_entries")) {
        if (sql.includes("INSERT")) {
          chainEntries.push({
            institution_id: params[0],
            proposal_id: params[1],
            event_type: params[2],
            executed_at: params[3],
            executor_id: params[4],
            executor_signature: params[5],
            institution_state_before_hash: params[6],
            institution_state_after_hash: params[7],
            previous_chain_hash: params[8],
            chain_hash: params[9],
            nostr_event_id: params[10],
          });
        }
      }
    },
    async query<T = Record<string, unknown>>(sql: string, params: unknown[]): Promise<T[]> {
      if (sql.includes("digital_institutions") && sql.includes("WHERE institution_id")) {
        const id = params[0] as string;
        const row = institutions.get(id);
        return (row ? [row] : []) as T[];
      }
      if (sql.includes("proposals") && !sql.includes("legitimacy")) {
        if (sql.includes("WHERE proposal_id = $1")) {
          const id = params[0] as string;
          const row = proposals.get(id);
          return (row ? [row] : []) as T[];
        }
        if (sql.includes("WHERE institution_id = $1")) {
          const institutionId = params[0] as string;
          if (sql.includes("COUNT(*)")) {
            const count = [...proposals.values()].filter(
              (r) => r.institution_id === institutionId
            ).length;
            return [{ count }] as T[];
          }
          const limit = (params[1] as number) ?? 50;
          const offset = (params[2] as number) ?? 0;
          const list = [...proposals.values()]
            .filter((r) => r.institution_id === institutionId)
            .sort((a, b) => String(a.proposal_id).localeCompare(String(b.proposal_id)));
          return list.slice(offset, offset + limit) as T[];
        }
      }
      if (sql.includes("legitimacy_chain_entries") && sql.includes("WHERE institution_id")) {
        const institutionId = params[0] as string;
        const filtered = chainEntries.filter(
          (e) => String(e.institution_id) === institutionId
        );
        return filtered as T[];
      }
      return [];
    },
  };
}

describe("Governance repositories integration", () => {
  let db: GovernanceDbClient;
  let institutionRepo: PostgresDigitalInstitutionRepository;
  let proposalRepo: PostgresProposalRepository;
  let chainRepo: PostgresLegitimacyChainRepository;

  beforeEach(() => {
    db = createMockGovernanceDbClient();
    institutionRepo = new PostgresDigitalInstitutionRepository(db);
    proposalRepo = new PostgresProposalRepository(db);
    chainRepo = new PostgresLegitimacyChainRepository(db);
  });

  it("saves institution and loads by id", async () => {
    const institution = DigitalInstitution.create({
      institutionId: "inst-1",
      name: "Test Org",
      type: "laboratory",
      governanceContract: "contract-1",
    });
    await institutionRepo.save(institution);
    const loaded = await institutionRepo.findById("inst-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.institutionId).toBe("inst-1");
    expect(loaded!.name).toBe("Test Org");
    expect(loaded!.status).toBe("forming");
  });

  it("saves proposal and loads by id", async () => {
    const institution = DigitalInstitution.create({
      institutionId: "inst-1",
      name: "Test",
      type: "lab",
      governanceContract: "c1",
    });
    await institutionRepo.save(institution);
    const proposal = Proposal.open({
      proposalId: "prop-1",
      institutionId: "inst-1",
      type: "amendment",
    });
    await proposalRepo.save(proposal);
    const loaded = await proposalRepo.findById("prop-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.proposalId).toBe("prop-1");
    expect(loaded!.status).toBe(ProposalStatus.Open);
  });

  it("appends legitimacy chain entries and loads by institution; verify passes", async () => {
    const chain = new LegitimacyChain();
    const e1 = chain.append({
      institutionId: "inst-1",
      proposalId: "prop-1",
      eventType: "proposal_executed",
      executedAt: "2026-03-14T12:00:00.000Z",
    });
    const e2 = chain.append({
      institutionId: "inst-1",
      proposalId: "prop-2",
      eventType: "proposal_executed",
      executedAt: "2026-03-14T12:01:00.000Z",
    });
    await chainRepo.append(e1);
    await chainRepo.append(e2);

    const loaded = await chainRepo.findByInstitutionId("inst-1");
    expect(loaded).toHaveLength(2);
    expect(loaded[0].proposalId).toBe("prop-1");
    expect(loaded[1].proposalId).toBe("prop-2");
    expect(LegitimacyChainVerifier.verify(loaded)).toBe(true);
  });

  it("findByInstitutionId returns empty array when no entries", async () => {
    const loaded = await chainRepo.findByInstitutionId("inst-none");
    expect(loaded).toEqual([]);
  });
});
