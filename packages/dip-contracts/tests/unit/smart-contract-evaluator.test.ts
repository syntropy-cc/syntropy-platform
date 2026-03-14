/**
 * Unit tests for SmartContractEvaluator.
 * Architecture: COMP-004.3
 */

import { describe, it, expect } from "vitest";
import {
  GovernanceContract,
  SmartContractEvaluator,
  type ContractClause,
  type EvaluationContext,
} from "../../src/domain/index.js";

const evaluator = new SmartContractEvaluator();

function contractWithClauses(clauses: ContractClause[], institutionId = "inst-1"): GovernanceContract {
  return GovernanceContract.create({ id: "c1", institutionId, clauses });
}

function context(overrides: Partial<EvaluationContext> & { institutionId: string }): EvaluationContext {
  const { institutionId, ...rest } = overrides;
  return { institutionId, ...rest };
}

describe("SmartContractEvaluator", () => {
  describe("cross-institution guard", () => {
    it("returns permitted false when context institutionId does not match contract", () => {
      const contract = contractWithClauses([], "inst-A");
      const ctx = context({ institutionId: "inst-B" });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(false);
      expect(result.details).toContain("inst-A");
      expect(result.details).toContain("inst-B");
    });

    it("proceeds with evaluation when institutionId matches", () => {
      const contract = contractWithClauses([], "inst-1");
      const ctx = context({ institutionId: "inst-1" });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(true);
    });
  });

  describe("empty clauses", () => {
    it("returns permitted true when contract has no clauses", () => {
      const contract = contractWithClauses([]);
      const ctx = context({ institutionId: "inst-1" });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(true);
      expect(result.details).toBeUndefined();
    });
  });

  describe("TransparencyClause", () => {
    it("returns permitted false when requirePublicRecord is true but context has no public record", () => {
      const contract = contractWithClauses([
        { kind: "transparency", requirePublicRecord: true },
      ]);
      const ctx = context({ institutionId: "inst-1", hasPublicRecord: false });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(false);
      expect(result.details).toContain("TransparencyClause");
      expect(result.details).toContain("public record");
    });

    it("returns permitted true when requirePublicRecord is true and context has public record", () => {
      const contract = contractWithClauses([
        { kind: "transparency", requirePublicRecord: true },
      ]);
      const ctx = context({ institutionId: "inst-1", hasPublicRecord: true });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(true);
    });

    it("returns permitted false when requiredDisclosures are not all in disclosedItems", () => {
      const contract = contractWithClauses([
        {
          kind: "transparency",
          requirePublicRecord: true,
          requiredDisclosures: ["budget", "votes"],
        },
      ]);
      const ctx = context({
        institutionId: "inst-1",
        hasPublicRecord: true,
        disclosedItems: ["budget"],
      });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(false);
      expect(result.details).toContain("votes");
    });

    it("returns permitted true when requiredDisclosures are all present in disclosedItems", () => {
      const contract = contractWithClauses([
        {
          kind: "transparency",
          requirePublicRecord: true,
          requiredDisclosures: ["budget", "votes"],
        },
      ]);
      const ctx = context({
        institutionId: "inst-1",
        hasPublicRecord: true,
        disclosedItems: ["budget", "votes"],
      });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(true);
    });
  });

  describe("ParticipationThreshold", () => {
    it("returns permitted false when participationPercent is below minQuorumPercent", () => {
      const contract = contractWithClauses([
        { kind: "participation_threshold", minQuorumPercent: 50 },
      ]);
      const ctx = context({ institutionId: "inst-1", participationPercent: 40 });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(false);
      expect(result.details).toContain("ParticipationThreshold");
      expect(result.details).toContain("quorum");
    });

    it("returns permitted true when participationPercent meets minQuorumPercent", () => {
      const contract = contractWithClauses([
        { kind: "participation_threshold", minQuorumPercent: 50 },
      ]);
      const ctx = context({ institutionId: "inst-1", participationPercent: 50 });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(true);
    });

    it("returns permitted false when minParticipants is set and currentParticipants is below", () => {
      const contract = contractWithClauses([
        { kind: "participation_threshold", minQuorumPercent: 50, minParticipants: 3 },
      ]);
      const ctx = context({
        institutionId: "inst-1",
        participationPercent: 60,
        currentParticipants: 2,
      });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(false);
      expect(result.details).toContain("minimum participants");
    });

    it("returns permitted true when minParticipants is met and quorum is met", () => {
      const contract = contractWithClauses([
        { kind: "participation_threshold", minQuorumPercent: 50, minParticipants: 3 },
      ]);
      const ctx = context({
        institutionId: "inst-1",
        participationPercent: 60,
        currentParticipants: 3,
      });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(true);
    });

    it("derives participationPercent from currentParticipants and totalEligible when not provided", () => {
      const contract = contractWithClauses([
        { kind: "participation_threshold", minQuorumPercent: 50 },
      ]);
      const ctx = context({
        institutionId: "inst-1",
        currentParticipants: 6,
        totalEligible: 10,
      });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(true);
    });

    it("returns permitted false when derived participationPercent is below quorum", () => {
      const contract = contractWithClauses([
        { kind: "participation_threshold", minQuorumPercent: 50 },
      ]);
      const ctx = context({
        institutionId: "inst-1",
        currentParticipants: 4,
        totalEligible: 10,
      });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(false);
    });

    it("returns permitted false when context provides neither participationPercent nor currentParticipants and totalEligible", () => {
      const contract = contractWithClauses([
        { kind: "participation_threshold", minQuorumPercent: 50 },
      ]);
      const ctx = context({ institutionId: "inst-1" });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(false);
      expect(result.details).toContain("participationPercent");
    });
  });

  describe("VetoRight", () => {
    it("returns permitted false when vetoHolderHasVetoed is true", () => {
      const contract = contractWithClauses([
        { kind: "veto_right", holderRoleId: "role-admin" },
      ]);
      const ctx = context({ institutionId: "inst-1", vetoHolderHasVetoed: true });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(false);
      expect(result.details).toContain("VetoRight");
      expect(result.details).toContain("role-admin");
    });

    it("returns permitted true when vetoHolderHasVetoed is false or omitted", () => {
      const contract = contractWithClauses([
        { kind: "veto_right", holderRoleId: "role-admin" },
      ]);

      expect(evaluator.evaluate(contract, context({ institutionId: "inst-1" })).permitted).toBe(true);
      expect(
        evaluator.evaluate(contract, context({ institutionId: "inst-1", vetoHolderHasVetoed: false }))
          .permitted
      ).toBe(true);
    });
  });

  describe("AmendmentProcedure", () => {
    it("returns permitted false when approvalPercent is below minApprovalPercent", () => {
      const contract = contractWithClauses([
        { kind: "amendment_procedure", minApprovalPercent: 75, requireQuorum: false },
      ]);
      const ctx = context({ institutionId: "inst-1", approvalPercent: 70 });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(false);
      expect(result.details).toContain("AmendmentProcedure");
      expect(result.details).toContain("approval");
    });

    it("returns permitted true when approvalPercent meets threshold and requireQuorum is false", () => {
      const contract = contractWithClauses([
        { kind: "amendment_procedure", minApprovalPercent: 75, requireQuorum: false },
      ]);
      const ctx = context({ institutionId: "inst-1", approvalPercent: 80 });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(true);
    });

    it("returns permitted false when requireQuorum is true but quorumReached is not true", () => {
      const contract = contractWithClauses([
        { kind: "amendment_procedure", minApprovalPercent: 75, requireQuorum: true },
      ]);
      const ctx = context({
        institutionId: "inst-1",
        approvalPercent: 80,
        quorumReached: false,
      });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(false);
      expect(result.details).toContain("quorum");
    });

    it("returns permitted true when requireQuorum is true and quorumReached is true", () => {
      const contract = contractWithClauses([
        { kind: "amendment_procedure", minApprovalPercent: 75, requireQuorum: true },
      ]);
      const ctx = context({
        institutionId: "inst-1",
        approvalPercent: 80,
        quorumReached: true,
      });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(true);
    });
  });

  describe("combined clauses", () => {
    it("returns permitted true when all clauses pass", () => {
      const contract = contractWithClauses([
        { kind: "transparency", requirePublicRecord: true },
        { kind: "participation_threshold", minQuorumPercent: 50 },
        { kind: "veto_right", holderRoleId: "admin" },
      ]);
      const ctx = context({
        institutionId: "inst-1",
        hasPublicRecord: true,
        participationPercent: 60,
      });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(true);
    });

    it("returns permitted false with details when one clause fails among many", () => {
      const contract = contractWithClauses([
        { kind: "transparency", requirePublicRecord: true },
        { kind: "participation_threshold", minQuorumPercent: 50 },
      ]);
      const ctx = context({
        institutionId: "inst-1",
        hasPublicRecord: true,
        participationPercent: 30,
      });

      const result = evaluator.evaluate(contract, ctx);

      expect(result.permitted).toBe(false);
      expect(result.details).toContain("ParticipationThreshold");
    });
  });
});
