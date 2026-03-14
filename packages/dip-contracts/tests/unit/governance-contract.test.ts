/**
 * Unit tests for GovernanceContract aggregate and clause value objects.
 * Architecture: COMP-004.1, COMP-004.2
 */

import { describe, it, expect } from "vitest";
import {
  GovernanceContract,
  type AmendmentProcedure,
  type ContractClause,
  type EvaluationResult,
  type ParticipationThreshold,
  type TransparencyClause,
  type VetoRight,
} from "../../src/domain/index.js";

describe("TransparencyClause", () => {
  it("has kind transparency and requirePublicRecord", () => {
    const clause: TransparencyClause = {
      kind: "transparency",
      requirePublicRecord: true,
    };
    expect(clause.kind).toBe("transparency");
    expect(clause.requirePublicRecord).toBe(true);
    expect(clause.requiredDisclosures).toBeUndefined();
  });

  it("accepts optional requiredDisclosures", () => {
    const clause: TransparencyClause = {
      kind: "transparency",
      requirePublicRecord: false,
      requiredDisclosures: ["budget", "votes"],
    };
    expect(clause.requiredDisclosures).toEqual(["budget", "votes"]);
  });
});

describe("ParticipationThreshold", () => {
  it("has kind participation_threshold and minQuorumPercent", () => {
    const clause: ParticipationThreshold = {
      kind: "participation_threshold",
      minQuorumPercent: 50,
    };
    expect(clause.kind).toBe("participation_threshold");
    expect(clause.minQuorumPercent).toBe(50);
    expect(clause.minParticipants).toBeUndefined();
  });

  it("accepts optional minParticipants", () => {
    const clause: ParticipationThreshold = {
      kind: "participation_threshold",
      minQuorumPercent: 66,
      minParticipants: 3,
    };
    expect(clause.minParticipants).toBe(3);
  });
});

describe("VetoRight", () => {
  it("has kind veto_right and holderRoleId", () => {
    const clause: VetoRight = {
      kind: "veto_right",
      holderRoleId: "role-admin",
    };
    expect(clause.kind).toBe("veto_right");
    expect(clause.holderRoleId).toBe("role-admin");
  });
});

describe("AmendmentProcedure", () => {
  it("has kind amendment_procedure, minApprovalPercent and requireQuorum", () => {
    const clause: AmendmentProcedure = {
      kind: "amendment_procedure",
      minApprovalPercent: 75,
      requireQuorum: true,
    };
    expect(clause.kind).toBe("amendment_procedure");
    expect(clause.minApprovalPercent).toBe(75);
    expect(clause.requireQuorum).toBe(true);
  });
});

describe("GovernanceContract", () => {
  describe("create", () => {
    it("creates contract with required id and institutionId and empty clauses by default", () => {
      const contract = GovernanceContract.create({
        id: "contract-1",
        institutionId: "inst-1",
      });

      expect(contract.id).toBe("contract-1");
      expect(contract.institutionId).toBe("inst-1");
      expect(contract.clauses).toEqual([]);
    });

    it("creates contract with provided clauses", () => {
      const clauses: ContractClause[] = [
        { kind: "transparency", requirePublicRecord: true },
      ];
      const contract = GovernanceContract.create({
        id: "contract-2",
        institutionId: "inst-2",
        clauses,
      });

      expect(contract.clauses).toHaveLength(1);
      expect(contract.clauses[0].kind).toBe("transparency");
      expect((contract.clauses[0] as TransparencyClause).requirePublicRecord).toBe(true);
    });

    it("creates contract with all four clause types when provided", () => {
      const clauses: ContractClause[] = [
        { kind: "transparency", requirePublicRecord: true },
        { kind: "participation_threshold", minQuorumPercent: 50 },
        { kind: "veto_right", holderRoleId: "role-admin" },
        {
          kind: "amendment_procedure",
          minApprovalPercent: 75,
          requireQuorum: true,
        },
      ];
      const contract = GovernanceContract.create({
        id: "contract-3",
        institutionId: "inst-3",
        clauses,
      });

      expect(contract.clauses).toHaveLength(4);
      expect(contract.clauses[0].kind).toBe("transparency");
      expect(contract.clauses[1].kind).toBe("participation_threshold");
      expect(contract.clauses[2].kind).toBe("veto_right");
      expect(contract.clauses[3].kind).toBe("amendment_procedure");
    });

    it("exposes clauses as readonly so array is not mutable by reference", () => {
      const clauses: ContractClause[] = [
        { kind: "transparency", requirePublicRecord: true },
      ];
      const contract = GovernanceContract.create({
        id: "c",
        institutionId: "i",
        clauses,
      });
      expect(contract.clauses).toHaveLength(1);
      clauses.push({
        kind: "veto_right",
        holderRoleId: "x",
      } as ContractClause);
      expect(contract.clauses).toHaveLength(1);
    });
  });
});

describe("EvaluationResult", () => {
  it("has permitted boolean and optional newState and details", () => {
    const permitted: EvaluationResult = { permitted: true };
    expect(permitted.permitted).toBe(true);
    expect(permitted.newState).toBeUndefined();
    expect(permitted.details).toBeUndefined();

    const denied: EvaluationResult = {
      permitted: false,
      newState: { version: 2 },
      details: "Quorum not met",
    };
    expect(denied.permitted).toBe(false);
    expect(denied.newState).toEqual({ version: 2 });
    expect(denied.details).toBe("Quorum not met");
  });
});
