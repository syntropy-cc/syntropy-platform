/**
 * Unit tests for GovernanceContract scaffold and base types.
 * Architecture: COMP-004.1
 */

import { describe, it, expect } from "vitest";
import {
  GovernanceContract,
  type ContractClause,
  type EvaluationResult,
} from "../../src/domain/index.js";

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
      const clauses: ContractClause[] = [{ kind: "transparency" }];
      const contract = GovernanceContract.create({
        id: "contract-2",
        institutionId: "inst-2",
        clauses,
      });

      expect(contract.clauses).toHaveLength(1);
      expect(contract.clauses[0]).toEqual({ kind: "transparency" });
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
