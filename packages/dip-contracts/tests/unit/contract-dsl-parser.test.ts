/**
 * Unit tests for ContractDSLParser.
 * Architecture: COMP-004.4
 */

import { describe, it, expect } from "vitest";
import {
  ContractDSLParser,
  ContractDSLParseError,
  GovernanceContract,
} from "../../src/domain/index.js";

const parser = new ContractDSLParser();

describe("ContractDSLParser.parse", () => {
  describe("valid JSON", () => {
    it("parses minimal contract with id and institutionId only", () => {
      const dsl = JSON.stringify({
        id: "c1",
        institutionId: "inst-1",
      });

      const contract = parser.parse(dsl);

      expect(contract).toBeInstanceOf(GovernanceContract);
      expect(contract.id).toBe("c1");
      expect(contract.institutionId).toBe("inst-1");
      expect(contract.clauses).toEqual([]);
    });

    it("parses contract with one clause of each kind", () => {
      const dsl = JSON.stringify({
        id: "c2",
        institutionId: "inst-2",
        clauses: [
          { kind: "transparency", requirePublicRecord: true, requiredDisclosures: ["budget"] },
          { kind: "participation_threshold", minQuorumPercent: 50, minParticipants: 3 },
          { kind: "veto_right", holderRoleId: "admin" },
          { kind: "amendment_procedure", minApprovalPercent: 75, requireQuorum: true },
        ],
      });

      const contract = parser.parse(dsl);

      expect(contract.id).toBe("c2");
      expect(contract.institutionId).toBe("inst-2");
      expect(contract.clauses).toHaveLength(4);
      expect(contract.clauses[0]).toEqual({
        kind: "transparency",
        requirePublicRecord: true,
        requiredDisclosures: ["budget"],
      });
      expect(contract.clauses[1]).toEqual({
        kind: "participation_threshold",
        minQuorumPercent: 50,
        minParticipants: 3,
      });
      expect(contract.clauses[2]).toEqual({ kind: "veto_right", holderRoleId: "admin" });
      expect(contract.clauses[3]).toEqual({
        kind: "amendment_procedure",
        minApprovalPercent: 75,
        requireQuorum: true,
      });
    });

    it("parses contract with multiple clauses of same kind", () => {
      const dsl = JSON.stringify({
        id: "c3",
        institutionId: "inst-3",
        clauses: [
          { kind: "transparency", requirePublicRecord: false },
          { kind: "transparency", requirePublicRecord: true, requiredDisclosures: ["votes"] },
        ],
      });

      const contract = parser.parse(dsl);

      expect(contract.clauses).toHaveLength(2);
      expect(contract.clauses[0].kind).toBe("transparency");
      expect(contract.clauses[1].kind).toBe("transparency");
    });
  });

  describe("valid YAML", () => {
    it("parses YAML DSL into GovernanceContract", () => {
      const dsl = `
id: contract-yaml
institutionId: inst-yaml
clauses:
  - kind: participation_threshold
    minQuorumPercent: 66
    minParticipants: 5
  - kind: veto_right
    holderRoleId: role-moderator
`;

      const contract = parser.parse(dsl);

      expect(contract.id).toBe("contract-yaml");
      expect(contract.institutionId).toBe("inst-yaml");
      expect(contract.clauses).toHaveLength(2);
      expect(contract.clauses[0]).toEqual({
        kind: "participation_threshold",
        minQuorumPercent: 66,
        minParticipants: 5,
      });
      expect(contract.clauses[1]).toEqual({
        kind: "veto_right",
        holderRoleId: "role-moderator",
      });
    });
  });

  describe("malformed DSL — descriptive error", () => {
    it("throws ContractDSLParseError for empty string", () => {
      expect(() => parser.parse("")).toThrow(ContractDSLParseError);
      expect(() => parser.parse("")).toThrow("DSL input is empty");
    });

    it("throws ContractDSLParseError for whitespace-only string", () => {
      expect(() => parser.parse("   \n\t  ")).toThrow(ContractDSLParseError);
      expect(() => parser.parse("   \n\t  ")).toThrow("empty");
    });

    it("throws ContractDSLParseError for invalid JSON syntax", () => {
      expect(() => parser.parse("{ invalid json }")).toThrow(ContractDSLParseError);
      expect(() => parser.parse("{ invalid json }")).toThrow("Invalid JSON");
    });

    it("throws ContractDSLParseError for invalid YAML", () => {
      const badYaml = "key: [unclosed bracket";
      expect(() => parser.parse(badYaml)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(badYaml)).toThrow("Invalid YAML");
    });

    it("throws ContractDSLParseError when root is not an object", () => {
      expect(() => parser.parse("[]")).toThrow(ContractDSLParseError);
      expect(() => parser.parse("[]")).toThrow("root must be an object");

      expect(() => parser.parse("null")).toThrow(ContractDSLParseError);
      expect(() => parser.parse('"string"')).toThrow("root must be an object");
    });

    it("throws ContractDSLParseError when id is missing", () => {
      const dsl = JSON.stringify({ institutionId: "inst-1" });
      expect(() => parser.parse(dsl)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(dsl)).toThrow("Missing required field: id");
    });

    it("throws ContractDSLParseError when institutionId is missing", () => {
      const dsl = JSON.stringify({ id: "c1" });
      expect(() => parser.parse(dsl)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(dsl)).toThrow("Missing required field: institutionId");
    });

    it("throws ContractDSLParseError when id is null", () => {
      const dsl = JSON.stringify({ id: null, institutionId: "inst-1" });
      expect(() => parser.parse(dsl)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(dsl)).toThrow("id");
    });

    it("throws ContractDSLParseError when id is not a string", () => {
      const dsl = JSON.stringify({ id: 123, institutionId: "inst-1" });
      expect(() => parser.parse(dsl)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(dsl)).toThrow("'id' must be a string");
    });

    it("throws ContractDSLParseError when id is empty string", () => {
      const dsl = JSON.stringify({ id: "", institutionId: "inst-1" });
      expect(() => parser.parse(dsl)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(dsl)).toThrow("non-empty");
    });

    it("throws ContractDSLParseError when clauses is not an array", () => {
      const dsl = JSON.stringify({ id: "c1", institutionId: "inst-1", clauses: "not-array" });
      expect(() => parser.parse(dsl)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(dsl)).toThrow("'clauses' must be an array");
    });

    it("throws ContractDSLParseError for unknown clause kind", () => {
      const dsl = JSON.stringify({
        id: "c1",
        institutionId: "inst-1",
        clauses: [{ kind: "unknown_kind" }],
      });
      expect(() => parser.parse(dsl)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(dsl)).toThrow("invalid clause kind 'unknown_kind'");
    });

    it("throws ContractDSLParseError when transparency requirePublicRecord is not boolean", () => {
      const dsl = JSON.stringify({
        id: "c1",
        institutionId: "inst-1",
        clauses: [{ kind: "transparency", requirePublicRecord: "true" }],
      });
      expect(() => parser.parse(dsl)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(dsl)).toThrow("requirePublicRecord");
    });

    it("throws ContractDSLParseError when participation_threshold minQuorumPercent is not number", () => {
      const dsl = JSON.stringify({
        id: "c1",
        institutionId: "inst-1",
        clauses: [{ kind: "participation_threshold", minQuorumPercent: "50" }],
      });
      expect(() => parser.parse(dsl)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(dsl)).toThrow("minQuorumPercent");
    });

    it("throws ContractDSLParseError when veto_right holderRoleId is missing", () => {
      const dsl = JSON.stringify({
        id: "c1",
        institutionId: "inst-1",
        clauses: [{ kind: "veto_right" }],
      });
      expect(() => parser.parse(dsl)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(dsl)).toThrow("holderRoleId");
    });

    it("throws ContractDSLParseError when amendment_procedure requireQuorum is not boolean", () => {
      const dsl = JSON.stringify({
        id: "c1",
        institutionId: "inst-1",
        clauses: [
          { kind: "amendment_procedure", minApprovalPercent: 80, requireQuorum: "yes" },
        ],
      });
      expect(() => parser.parse(dsl)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(dsl)).toThrow("requireQuorum");
    });

    it("throws ContractDSLParseError when clause at index is not an object", () => {
      const dsl = JSON.stringify({
        id: "c1",
        institutionId: "inst-1",
        clauses: ["not an object"],
      });
      expect(() => parser.parse(dsl)).toThrow(ContractDSLParseError);
      expect(() => parser.parse(dsl)).toThrow("Clause at index 0");
    });
  });
});

describe("ContractDSLParser.serialize", () => {
  it("serializes contract to JSON string with id, institutionId, clauses", () => {
    const contract = GovernanceContract.create({
      id: "s1",
      institutionId: "inst-s1",
      clauses: [{ kind: "transparency", requirePublicRecord: true }],
    });

    const json = parser.serialize(contract);

    expect(json).toContain('"id": "s1"');
    expect(json).toContain('"institutionId": "inst-s1"');
    expect(json).toContain('"kind": "transparency"');
    const parsed = JSON.parse(json);
    expect(parsed.id).toBe("s1");
    expect(parsed.institutionId).toBe("inst-s1");
    expect(parsed.clauses).toHaveLength(1);
    expect(parsed.clauses[0].kind).toBe("transparency");
  });
});

describe("round-trip parse and serialize", () => {
  it("parse then serialize then parse yields equivalent contract", () => {
    const dsl = JSON.stringify({
      id: "round-1",
      institutionId: "inst-round",
      clauses: [
        { kind: "participation_threshold", minQuorumPercent: 60, minParticipants: 4 },
        { kind: "veto_right", holderRoleId: "chair" },
      ],
    });

    const contract1 = parser.parse(dsl);
    const serialized = parser.serialize(contract1);
    const contract2 = parser.parse(serialized);

    expect(contract2.id).toBe(contract1.id);
    expect(contract2.institutionId).toBe(contract1.institutionId);
    expect(contract2.clauses).toHaveLength(contract1.clauses.length);
    expect(contract2.clauses[0]).toEqual(contract1.clauses[0]);
    expect(contract2.clauses[1]).toEqual(contract1.clauses[1]);
  });

  it("YAML parse then serialize to JSON then parse yields equivalent contract", () => {
    const yamlDsl = `
id: yaml-round
institutionId: inst-yaml-round
clauses:
  - kind: amendment_procedure
    minApprovalPercent: 66
    requireQuorum: true
`;

    const contract1 = parser.parse(yamlDsl);
    const serialized = parser.serialize(contract1);
    const contract2 = parser.parse(serialized);

    expect(contract2.id).toBe(contract1.id);
    expect(contract2.institutionId).toBe(contract1.institutionId);
    expect(contract2.clauses).toHaveLength(1);
    expect(contract2.clauses[0]).toEqual(contract1.clauses[0]);
  });
});
