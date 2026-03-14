/**
 * Unit tests for IACPParty value object.
 * Tests for: COMP-005.2
 */

import { describe, expect, it } from "vitest";
import { createIACPParty } from "../../src/domain/value-objects/iacp-party.js";

describe("createIACPParty", () => {
  it("creates party with actorId and role", () => {
    const party = createIACPParty({
      actorId: "actor-1",
      role: "signer",
    });

    expect(party.actorId).toBe("actor-1");
    expect(party.role).toBe("signer");
    expect(party.signature).toBeUndefined();
  });

  it("creates party with optional signature", () => {
    const party = createIACPParty({
      actorId: "actor-2",
      role: "author",
      signature: "sig-abc123",
    });

    expect(party.actorId).toBe("actor-2");
    expect(party.role).toBe("author");
    expect(party.signature).toBe("sig-abc123");
  });

  it("trims actorId and role", () => {
    const party = createIACPParty({
      actorId: "  actor-3  ",
      role: "  reviewer  ",
    });

    expect(party.actorId).toBe("actor-3");
    expect(party.role).toBe("reviewer");
  });

  it("throws when actorId is empty", () => {
    expect(() =>
      createIACPParty({ actorId: "", role: "signer" })
    ).toThrow("actorId cannot be empty");
    expect(() =>
      createIACPParty({ actorId: "   ", role: "signer" })
    ).toThrow("actorId cannot be empty");
  });

  it("throws when role is empty", () => {
    expect(() =>
      createIACPParty({ actorId: "actor-1", role: "" })
    ).toThrow("role cannot be empty");
    expect(() =>
      createIACPParty({ actorId: "actor-1", role: "   " })
    ).toThrow("role cannot be empty");
  });

  it("omits signature when empty string", () => {
    const party = createIACPParty({
      actorId: "a",
      role: "r",
      signature: "",
    });
    expect(party.signature).toBeUndefined();
  });
});
