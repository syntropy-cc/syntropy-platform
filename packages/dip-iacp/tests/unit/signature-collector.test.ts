/**
 * Unit tests for SignatureCollector (n-of-m threshold logic).
 * Tests for: COMP-005.4
 */

import { describe, expect, it } from "vitest";
import { DuplicateSignatureError } from "../../src/domain/errors.js";
import { SignatureCollector } from "../../src/domain/signature-collector.js";
import { createSignatureThreshold } from "../../src/domain/value-objects/signature-threshold.js";
import { createIACPParty } from "../../src/domain/value-objects/iacp-party.js";

describe("SignatureCollector.addSignature", () => {
  it("adds first signature and returns new collector", () => {
    const threshold = createSignatureThreshold(2, 3);
    const collector = new SignatureCollector(threshold);
    const party = createIACPParty({ actorId: "actor-1", role: "signer" });

    const next = collector.addSignature(party, "sig-abc");

    expect(next).not.toBe(collector);
    expect(next.signedCount).toBe(1);
    expect(next.signatures.get("actor-1")).toBe("sig-abc");
    expect(collector.signedCount).toBe(0);
  });

  it("adds multiple signatures from different parties", () => {
    const threshold = createSignatureThreshold(2, 3);
    let collector = new SignatureCollector(threshold);
    const p1 = createIACPParty({ actorId: "actor-1", role: "signer" });
    const p2 = createIACPParty({ actorId: "actor-2", role: "author" });

    collector = collector.addSignature(p1, "sig-1");
    collector = collector.addSignature(p2, "sig-2");

    expect(collector.signedCount).toBe(2);
    expect(collector.signatures.get("actor-1")).toBe("sig-1");
    expect(collector.signatures.get("actor-2")).toBe("sig-2");
  });

  it("throws DuplicateSignatureError when same actorId signs twice", () => {
    const threshold = createSignatureThreshold(2, 3);
    const party = createIACPParty({ actorId: "actor-1", role: "signer" });
    const collector = new SignatureCollector(threshold).addSignature(party, "sig-1");

    expect(() => collector.addSignature(party, "sig-2")).toThrow(DuplicateSignatureError);
    expect(() => collector.addSignature(party, "sig-2")).toThrow(/party actor-1 has already signed/);
  });

  it("DuplicateSignatureError exposes actorId", () => {
    const threshold = createSignatureThreshold(1, 1);
    const party = createIACPParty({ actorId: "dup-actor", role: "signer" });
    const collector = new SignatureCollector(threshold).addSignature(party, "sig");

    try {
      collector.addSignature(party, "other");
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(DuplicateSignatureError);
      expect((err as DuplicateSignatureError).actorId).toBe("dup-actor");
    }
  });
});

describe("SignatureCollector.isThresholdMet", () => {
  it("returns false when no signatures collected", () => {
    const threshold = createSignatureThreshold(2, 3);
    const collector = new SignatureCollector(threshold);

    expect(collector.isThresholdMet()).toBe(false);
  });

  it("returns false when below threshold", () => {
    const threshold = createSignatureThreshold(2, 3);
    const collector = new SignatureCollector(threshold).addSignature(
      createIACPParty({ actorId: "a1", role: "signer" }),
      "s1"
    );

    expect(collector.isThresholdMet()).toBe(false);
  });

  it("returns true when exactly at threshold", () => {
    const threshold = createSignatureThreshold(2, 3);
    let collector = new SignatureCollector(threshold);
    collector = collector.addSignature(createIACPParty({ actorId: "a1", role: "signer" }), "s1");
    collector = collector.addSignature(createIACPParty({ actorId: "a2", role: "author" }), "s2");

    expect(collector.isThresholdMet()).toBe(true);
  });

  it("returns true when above threshold", () => {
    const threshold = createSignatureThreshold(2, 3);
    let collector = new SignatureCollector(threshold);
    collector = collector.addSignature(createIACPParty({ actorId: "a1", role: "signer" }), "s1");
    collector = collector.addSignature(createIACPParty({ actorId: "a2", role: "author" }), "s2");
    collector = collector.addSignature(createIACPParty({ actorId: "a3", role: "witness" }), "s3");

    expect(collector.isThresholdMet()).toBe(true);
  });

  it("returns true for 1-of-1 when one signature collected", () => {
    const threshold = createSignatureThreshold(1, 1);
    const collector = new SignatureCollector(threshold).addSignature(
      createIACPParty({ actorId: "sole", role: "signer" }),
      "sig"
    );

    expect(collector.isThresholdMet()).toBe(true);
  });
});
