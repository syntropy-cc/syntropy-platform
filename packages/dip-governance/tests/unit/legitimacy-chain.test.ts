/**
 * Unit tests for LegitimacyChain and LegitimacyChainVerifier (COMP-007.5).
 */

import { describe, it, expect } from "vitest";
import {
  LegitimacyChain,
  LegitimacyChainVerifier,
  LEGITIMACY_CHAIN_GENESIS_HASH,
} from "../../src/domain/legitimacy-chain.js";
import { LegitimacyChainEntry } from "../../src/domain/legitimacy-chain-entry.js";

describe("LegitimacyChain", () => {
  it("append first entry uses genesis as previousChainHash and computes chainHash", () => {
    const chain = new LegitimacyChain();
    const payload = {
      institutionId: "inst-1",
      proposalId: "prop-1",
      eventType: "proposal_executed",
      executedAt: "2026-03-14T12:00:00.000Z",
    };
    const entry = chain.append(payload);

    expect(entry.previousChainHash).toBe(LEGITIMACY_CHAIN_GENESIS_HASH);
    expect(entry.chainHash).toBeTruthy();
    expect(entry.chainHash).toMatch(/^[a-f0-9]{64}$/);
    expect(entry.institutionId).toBe("inst-1");
    expect(entry.proposalId).toBe("prop-1");
    expect(chain.entries).toHaveLength(1);
  });

  it("append second entry links to first entry chainHash and verify returns true", () => {
    const chain = new LegitimacyChain();
    const first = chain.append({
      institutionId: "inst-1",
      proposalId: "prop-1",
      eventType: "proposal_executed",
      executedAt: "2026-03-14T12:00:00.000Z",
    });
    const second = chain.append({
      institutionId: "inst-1",
      proposalId: "prop-2",
      eventType: "proposal_executed",
      executedAt: "2026-03-14T12:01:00.000Z",
    });

    expect(second.previousChainHash).toBe(first.chainHash);
    expect(second.chainHash).toBeTruthy();
    expect(second.chainHash).not.toBe(first.chainHash);
    expect(chain.entries).toHaveLength(2);
    expect(chain.verify()).toBe(true);
  });

  it("verify returns true for valid chain of three entries", () => {
    const chain = new LegitimacyChain();
    chain.append({
      institutionId: "i1",
      proposalId: "p1",
      eventType: "proposal_executed",
      executedAt: "2026-03-14T10:00:00.000Z",
    });
    chain.append({
      institutionId: "i1",
      proposalId: "p2",
      eventType: "proposal_executed",
      executedAt: "2026-03-14T11:00:00.000Z",
    });
    chain.append({
      institutionId: "i1",
      proposalId: "p3",
      eventType: "proposal_executed",
      executedAt: "2026-03-14T12:00:00.000Z",
    });
    expect(chain.verify()).toBe(true);
  });

  it("verify returns false when entry payload is tampered (wrong chainHash)", () => {
    const chain = new LegitimacyChain();
    chain.append({
      institutionId: "inst-1",
      proposalId: "prop-1",
      eventType: "proposal_executed",
      executedAt: "2026-03-14T12:00:00.000Z",
    });
    const entries = [...chain.entries];
    const tampered = LegitimacyChainEntry.fromPersistence({
      ...entries[0],
      chainHash: "f".repeat(64),
    });
    expect(LegitimacyChainVerifier.verify([tampered])).toBe(false);
  });

  it("verify returns false when previousChainHash link is broken", () => {
    const chain = new LegitimacyChain();
    const first = chain.append({
      institutionId: "inst-1",
      proposalId: "prop-1",
      eventType: "proposal_executed",
      executedAt: "2026-03-14T12:00:00.000Z",
    });
    const second = chain.append({
      institutionId: "inst-1",
      proposalId: "prop-2",
      eventType: "proposal_executed",
      executedAt: "2026-03-14T12:01:00.000Z",
    });
    const entries = [first, second];
    const tamperedSecond = LegitimacyChainEntry.fromPersistence({
      ...entries[1],
      previousChainHash: "0".repeat(63) + "1",
    });
    expect(LegitimacyChainVerifier.verify([entries[0], tamperedSecond])).toBe(
      false
    );
  });

  it("verify returns true for empty chain", () => {
    const chain = new LegitimacyChain();
    expect(chain.verify()).toBe(true);
    expect(LegitimacyChainVerifier.verify([])).toBe(true);
  });

  it("append includes optional state hashes in canonical payload", () => {
    const chain = new LegitimacyChain();
    const entry = chain.append({
      institutionId: "i1",
      proposalId: "p1",
      eventType: "proposal_executed",
      executedAt: "2026-03-14T12:00:00.000Z",
      institutionStateBeforeHash: "hash-before",
      institutionStateAfterHash: "hash-after",
    });
    expect(entry.chainHash).toBeTruthy();
    expect(chain.verify()).toBe(true);
  });
});

describe("LegitimacyChainEntry", () => {
  it("create throws when required fields are empty", () => {
    expect(() =>
      LegitimacyChainEntry.create({
        institutionId: "",
        proposalId: "p1",
        eventType: "e1",
        executedAt: "2026-03-14T12:00:00Z",
        previousChainHash: LEGITIMACY_CHAIN_GENESIS_HASH,
        chainHash: "a".repeat(64),
      })
    ).toThrow("institutionId cannot be empty");
    expect(() =>
      LegitimacyChainEntry.create({
        institutionId: "i1",
        proposalId: "",
        eventType: "e1",
        executedAt: "2026-03-14T12:00:00Z",
        previousChainHash: LEGITIMACY_CHAIN_GENESIS_HASH,
        chainHash: "a".repeat(64),
      })
    ).toThrow("proposalId cannot be empty");
  });
});
