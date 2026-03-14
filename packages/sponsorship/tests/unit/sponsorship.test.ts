/**
 * Unit tests for Sponsorship aggregate (COMP-027.1).
 */

import { describe, it, expect } from "vitest";
import {
  Sponsorship,
  isSponsorshipType,
  isSponsorshipStatus,
  InvalidSponsorshipTransitionError,
} from "../../src/domain/index.js";

function createPendingSponsorship(overrides: Partial<Parameters<typeof createSponsorship>[0]> = {}) {
  return createSponsorship({
    id: "sp-1",
    sponsorId: "user-a",
    sponsoredId: "user-b",
    type: "recurring",
    amount: 50,
    status: "pending",
    ...overrides,
  });
}

function createSponsorship(params: {
  id: string;
  sponsorId: string;
  sponsoredId: string;
  type: "recurring" | "one_time";
  amount: number;
  status: "pending" | "active" | "paused" | "cancelled";
  startedAt?: Date | null;
  cancelledAt?: Date | null;
}) {
  return new Sponsorship(params);
}

describe("Sponsorship aggregate", () => {
  describe("creation", () => {
    it("creates with valid params", () => {
      const s = createPendingSponsorship();
      expect(s.id).toBe("sp-1");
      expect(s.sponsorId).toBe("user-a");
      expect(s.sponsoredId).toBe("user-b");
      expect(s.type).toBe("recurring");
      expect(s.amount).toBe(50);
      expect(s.status).toBe("pending");
      expect(s.startedAt).toBeNull();
      expect(s.cancelledAt).toBeNull();
    });

    it("throws when id is empty", () => {
      expect(() =>
        createPendingSponsorship({ id: "" })
      ).toThrow("Sponsorship id cannot be empty");
    });

    it("throws when sponsorId is empty", () => {
      expect(() =>
        createPendingSponsorship({ sponsorId: "" })
      ).toThrow("Sponsorship sponsorId cannot be empty");
    });

    it("throws when sponsoredId is empty", () => {
      expect(() =>
        createPendingSponsorship({ sponsoredId: "" })
      ).toThrow("Sponsorship sponsoredId cannot be empty");
    });

    it("throws when type is invalid", () => {
      expect(() =>
        new Sponsorship({
          id: "sp-1",
          sponsorId: "user-a",
          sponsoredId: "user-b",
          type: "invalid" as "recurring",
          amount: 50,
          status: "pending",
        })
      ).toThrow("Invalid sponsorship type");
    });

    it("throws when amount is negative", () => {
      expect(() =>
        createPendingSponsorship({ amount: -1 })
      ).toThrow("Sponsorship amount must be a non-negative number");
    });

    it("throws when status is invalid", () => {
      expect(() =>
        new Sponsorship({
          id: "sp-1",
          sponsorId: "user-a",
          sponsoredId: "user-b",
          type: "recurring",
          amount: 50,
          status: "invalid" as "pending",
        })
      ).toThrow("Invalid sponsorship status");
    });

    it("accepts zero amount", () => {
      const s = createPendingSponsorship({ amount: 0 });
      expect(s.amount).toBe(0);
    });
  });

  describe("lifecycle transitions", () => {
    it("pending → active via activate()", () => {
      const s = createPendingSponsorship();
      const active = s.activate();
      expect(active.status).toBe("active");
      expect(active.startedAt).toBeInstanceOf(Date);
      expect(active.id).toBe(s.id);
    });

    it("pending → cancelled via cancel()", () => {
      const s = createPendingSponsorship();
      const cancelled = s.cancel();
      expect(cancelled.status).toBe("cancelled");
      expect(cancelled.cancelledAt).toBeInstanceOf(Date);
    });

    it("active → paused via pause()", () => {
      const active = createSponsorship({
        id: "sp-2",
        sponsorId: "a",
        sponsoredId: "b",
        type: "recurring",
        amount: 10,
        status: "active",
      });
      const paused = active.pause();
      expect(paused.status).toBe("paused");
    });

    it("paused → active via resume()", () => {
      const paused = createSponsorship({
        id: "sp-3",
        sponsorId: "a",
        sponsoredId: "b",
        type: "recurring",
        amount: 10,
        status: "paused",
      });
      const active = paused.resume();
      expect(active.status).toBe("active");
    });

    it("active → cancelled via cancel()", () => {
      const active = createSponsorship({
        id: "sp-4",
        sponsorId: "a",
        sponsoredId: "b",
        type: "recurring",
        amount: 10,
        status: "active",
      });
      const cancelled = active.cancel();
      expect(cancelled.status).toBe("cancelled");
      expect(cancelled.cancelledAt).toBeInstanceOf(Date);
    });

    it("throws when activate() called from non-pending", () => {
      const active = createSponsorship({
        id: "sp-5",
        sponsorId: "a",
        sponsoredId: "b",
        type: "recurring",
        amount: 10,
        status: "active",
      });
      expect(() => active.activate()).toThrow(InvalidSponsorshipTransitionError);
      expect(() => active.activate()).toThrow("active");
    });

    it("throws when pause() called from non-active", () => {
      const pending = createPendingSponsorship();
      expect(() => pending.pause()).toThrow(InvalidSponsorshipTransitionError);
      expect(() => pending.pause()).toThrow("pending");
    });

    it("throws when resume() called from non-paused", () => {
      const active = createSponsorship({
        id: "sp-6",
        sponsorId: "a",
        sponsoredId: "b",
        type: "recurring",
        amount: 10,
        status: "active",
      });
      expect(() => active.resume()).toThrow(InvalidSponsorshipTransitionError);
      expect(() => active.resume()).toThrow("active");
    });

    it("throws when cancel() called from already cancelled", () => {
      const cancelled = createSponsorship({
        id: "sp-7",
        sponsorId: "a",
        sponsoredId: "b",
        type: "recurring",
        amount: 10,
        status: "cancelled",
        cancelledAt: new Date(),
      });
      expect(() => cancelled.cancel()).toThrow(InvalidSponsorshipTransitionError);
    });
  });

  describe("type guards", () => {
    it("isSponsorshipType accepts recurring and one_time", () => {
      expect(isSponsorshipType("recurring")).toBe(true);
      expect(isSponsorshipType("one_time")).toBe(true);
      expect(isSponsorshipType("other")).toBe(false);
    });

    it("isSponsorshipStatus accepts pending, active, paused, cancelled", () => {
      expect(isSponsorshipStatus("pending")).toBe(true);
      expect(isSponsorshipStatus("active")).toBe(true);
      expect(isSponsorshipStatus("paused")).toBe(true);
      expect(isSponsorshipStatus("cancelled")).toBe(true);
      expect(isSponsorshipStatus("other")).toBe(false);
    });
  });
});
