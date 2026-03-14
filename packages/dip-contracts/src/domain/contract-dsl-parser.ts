/**
 * ContractDSLParser — parses JSON and YAML DSL into GovernanceContract.
 * Architecture: COMP-004.4, smart-contract-engine subdomain
 */

import { parse as parseYaml } from "yaml";
import type { ContractClause } from "./types.js";
import { GovernanceContract } from "./governance-contract.js";
import { ContractDSLParseError } from "./contract-dsl-errors.js";

/** Raw parsed root: id, institutionId, optional clauses array. */
interface ParsedRoot {
  id?: unknown;
  institutionId?: unknown;
  clauses?: unknown;
}

/**
 * Parses contract DSL (JSON or YAML) into a GovernanceContract.
 * Rejects malformed input with descriptive ContractDSLParseError.
 */
export class ContractDSLParser {
  /**
   * Parses a DSL string (JSON or YAML) into a GovernanceContract.
   * Format detection: if trimmed input starts with '{', parse as JSON; otherwise parse as YAML.
   *
   * @param dsl - Raw DSL string (JSON or YAML)
   * @returns GovernanceContract with validated id, institutionId, and clauses
   * @throws ContractDSLParseError when input is empty, invalid syntax, or fails validation
   */
  parse(dsl: string): GovernanceContract {
    const trimmed = dsl.trim();
    if (trimmed.length === 0) {
      throw new ContractDSLParseError("DSL input is empty.");
    }

    let raw: unknown;
    if (trimmed.startsWith("{")) {
      try {
        raw = JSON.parse(trimmed) as unknown;
      } catch (e) {
        const msg = e instanceof SyntaxError ? e.message : String(e);
        throw new ContractDSLParseError(`Invalid JSON: ${msg}`);
      }
    } else {
      try {
        raw = parseYaml(trimmed) as unknown;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new ContractDSLParseError(`Invalid YAML: ${msg}`);
      }
    }

    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      throw new ContractDSLParseError("DSL root must be an object.");
    }

    const root = raw as ParsedRoot;

    const id = this.requireNonEmptyString(root.id, "id");
    const institutionId = this.requireNonEmptyString(root.institutionId, "institutionId");
    const clauses = this.parseClauses(root.clauses);

    return GovernanceContract.create({ id, institutionId, clauses });
  }

  /**
   * Serializes a GovernanceContract to JSON DSL string.
   * Used for round-trip testing: parse(dsl) → contract → serialize(contract) → parse again.
   *
   * @param contract - The governance contract to serialize
   * @returns JSON string of { id, institutionId, clauses }
   */
  serialize(contract: GovernanceContract): string {
    const obj = {
      id: contract.id,
      institutionId: contract.institutionId,
      clauses: [...contract.clauses],
    };
    return JSON.stringify(obj, null, 2);
  }

  private requireNonEmptyString(value: unknown, field: string): string {
    if (value == null) {
      throw new ContractDSLParseError(`Missing required field: ${field}.`);
    }
    if (typeof value !== "string") {
      throw new ContractDSLParseError(`Field '${field}' must be a string, got ${typeof value}.`);
    }
    if (value.trim().length === 0) {
      throw new ContractDSLParseError(`Field '${field}' must be non-empty.`);
    }
    return value;
  }

  private parseClauses(value: unknown): ContractClause[] {
    if (value === undefined || value === null) {
      return [];
    }
    if (!Array.isArray(value)) {
      throw new ContractDSLParseError("'clauses' must be an array.");
    }

    const clauses: ContractClause[] = [];
    for (let i = 0; i < value.length; i++) {
      const raw = value[i];
      if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
        throw new ContractDSLParseError(`Clause at index ${i}: must be an object.`);
      }
      const clause = this.parseClause(raw as Record<string, unknown>, i);
      clauses.push(clause);
    }
    return clauses;
  }

  private parseClause(raw: Record<string, unknown>, index: number): ContractClause {
    const kind = raw.kind;
    if (kind === undefined || kind === null) {
      throw new ContractDSLParseError(`Clause at index ${index}: missing 'kind'.`);
    }
    if (typeof kind !== "string") {
      throw new ContractDSLParseError(`Clause at index ${index}: 'kind' must be a string, got ${typeof kind}.`);
    }

    switch (kind) {
      case "transparency":
        return this.parseTransparencyClause(raw, index);
      case "participation_threshold":
        return this.parseParticipationThresholdClause(raw, index);
      case "veto_right":
        return this.parseVetoRightClause(raw, index);
      case "amendment_procedure":
        return this.parseAmendmentProcedureClause(raw, index);
      default:
        throw new ContractDSLParseError(`Clause at index ${index}: invalid clause kind '${kind}'.`);
    }
  }

  private parseTransparencyClause(raw: Record<string, unknown>, index: number): ContractClause {
    const requirePublicRecord = raw.requirePublicRecord;
    if (typeof requirePublicRecord !== "boolean") {
      throw new ContractDSLParseError(
        `Clause at index ${index} (transparency): 'requirePublicRecord' must be a boolean, got ${typeof requirePublicRecord}.`
      );
    }
    const requiredDisclosures = raw.requiredDisclosures;
    if (requiredDisclosures !== undefined) {
      if (!Array.isArray(requiredDisclosures)) {
        throw new ContractDSLParseError(
          `Clause at index ${index} (transparency): 'requiredDisclosures' must be an array of strings, got ${typeof requiredDisclosures}.`
        );
      }
      for (let i = 0; i < requiredDisclosures.length; i++) {
        if (typeof requiredDisclosures[i] !== "string") {
          throw new ContractDSLParseError(
            `Clause at index ${index} (transparency): 'requiredDisclosures[${i}]' must be a string.`
          );
        }
      }
    }
    return {
      kind: "transparency",
      requirePublicRecord,
      requiredDisclosures:
        requiredDisclosures === undefined
          ? undefined
          : (requiredDisclosures as string[]),
    };
  }

  private parseParticipationThresholdClause(raw: Record<string, unknown>, index: number): ContractClause {
    const minQuorumPercent = raw.minQuorumPercent;
    if (typeof minQuorumPercent !== "number" || Number.isNaN(minQuorumPercent)) {
      throw new ContractDSLParseError(
        `Clause at index ${index} (participation_threshold): 'minQuorumPercent' must be a number, got ${typeof raw.minQuorumPercent}.`
      );
    }
    const minParticipants = raw.minParticipants;
    if (minParticipants !== undefined) {
      if (typeof minParticipants !== "number" || !Number.isInteger(minParticipants) || minParticipants < 0) {
        throw new ContractDSLParseError(
          `Clause at index ${index} (participation_threshold): 'minParticipants' must be a non-negative integer, got ${typeof minParticipants}.`
        );
      }
    }
    return {
      kind: "participation_threshold",
      minQuorumPercent,
      minParticipants,
    };
  }

  private parseVetoRightClause(raw: Record<string, unknown>, index: number): ContractClause {
    const holderRoleId = raw.holderRoleId;
    if (holderRoleId == null) {
      throw new ContractDSLParseError(`Clause at index ${index} (veto_right): missing 'holderRoleId'.`);
    }
    if (typeof holderRoleId !== "string") {
      throw new ContractDSLParseError(
        `Clause at index ${index} (veto_right): 'holderRoleId' must be a string, got ${typeof holderRoleId}.`
      );
    }
    return { kind: "veto_right", holderRoleId };
  }

  private parseAmendmentProcedureClause(raw: Record<string, unknown>, index: number): ContractClause {
    const minApprovalPercent = raw.minApprovalPercent;
    if (typeof minApprovalPercent !== "number" || Number.isNaN(minApprovalPercent)) {
      throw new ContractDSLParseError(
        `Clause at index ${index} (amendment_procedure): 'minApprovalPercent' must be a number, got ${typeof raw.minApprovalPercent}.`
      );
    }
    const requireQuorum = raw.requireQuorum;
    if (typeof requireQuorum !== "boolean") {
      throw new ContractDSLParseError(
        `Clause at index ${index} (amendment_procedure): 'requireQuorum' must be a boolean, got ${typeof requireQuorum}.`
      );
    }
    return {
      kind: "amendment_procedure",
      minApprovalPercent,
      requireQuorum,
    };
  }
}
