/**
 * Sponsorship aggregate — sponsor-to-sponsored relationship (COMP-027.1).
 * Architecture: sponsorship domain, PAT-004
 */

import { isSponsorshipStatus } from "./sponsorship-status.js";
import type { SponsorshipStatus } from "./sponsorship-status.js";
import { InvalidSponsorshipTransitionError } from "./errors.js";

/** Sponsorship type: recurring or one-time. */
export type SponsorshipType = "recurring" | "one_time";

const SPONSORSHIP_TYPES: SponsorshipType[] = ["recurring", "one_time"];

export function isSponsorshipType(value: string): value is SponsorshipType {
  return SPONSORSHIP_TYPES.includes(value as SponsorshipType);
}

export interface SponsorshipParams {
  id: string;
  sponsorId: string;
  sponsoredId: string;
  type: SponsorshipType;
  amount: number;
  status: SponsorshipStatus;
  startedAt?: Date | null;
  cancelledAt?: Date | null;
}

/**
 * Sponsorship aggregate — financial support relationship between sponsor and sponsored.
 * Lifecycle: pending → active | cancelled; active → paused | cancelled; paused → active | cancelled.
 */
export class Sponsorship {
  readonly id: string;
  readonly sponsorId: string;
  readonly sponsoredId: string;
  readonly type: SponsorshipType;
  readonly amount: number;
  readonly status: SponsorshipStatus;
  readonly startedAt: Date | null;
  readonly cancelledAt: Date | null;

  constructor(params: SponsorshipParams) {
    if (!params.id?.trim()) {
      throw new Error("Sponsorship id cannot be empty");
    }
    if (!params.sponsorId?.trim()) {
      throw new Error("Sponsorship sponsorId cannot be empty");
    }
    if (!params.sponsoredId?.trim()) {
      throw new Error("Sponsorship sponsoredId cannot be empty");
    }
    if (!isSponsorshipType(params.type)) {
      throw new Error(
        `Invalid sponsorship type: ${params.type}. Must be recurring or one_time.`
      );
    }
    if (typeof params.amount !== "number" || params.amount < 0) {
      throw new Error("Sponsorship amount must be a non-negative number");
    }
    if (!isSponsorshipStatus(params.status)) {
      throw new Error(
        `Invalid sponsorship status: ${params.status}. Must be pending, active, paused, or cancelled.`
      );
    }

    this.id = params.id.trim();
    this.sponsorId = params.sponsorId.trim();
    this.sponsoredId = params.sponsoredId.trim();
    this.type = params.type;
    this.amount = params.amount;
    this.status = params.status;
    this.startedAt = params.startedAt ?? null;
    this.cancelledAt = params.cancelledAt ?? null;
  }

  /** Transition from pending to active (e.g. after payment confirmation). */
  activate(): Sponsorship {
    if (this.status !== "pending") {
      throw new InvalidSponsorshipTransitionError(
        this.status,
        "active",
        this.id
      );
    }
    return new Sponsorship({
      ...this,
      status: "active",
      startedAt: this.startedAt ?? new Date(),
    });
  }

  /** Pause an active sponsorship. */
  pause(): Sponsorship {
    if (this.status !== "active") {
      throw new InvalidSponsorshipTransitionError(
        this.status,
        "paused",
        this.id
      );
    }
    return new Sponsorship({
      ...this,
      status: "paused",
    });
  }

  /** Resume a paused sponsorship. */
  resume(): Sponsorship {
    if (this.status !== "paused") {
      throw new InvalidSponsorshipTransitionError(
        this.status,
        "active",
        this.id
      );
    }
    return new Sponsorship({
      ...this,
      status: "active",
    });
  }

  /** Cancel sponsorship (from pending, active, or paused). */
  cancel(): Sponsorship {
    if (this.status === "cancelled") {
      throw new InvalidSponsorshipTransitionError(
        this.status,
        "cancelled",
        this.id
      );
    }
    return new Sponsorship({
      ...this,
      status: "cancelled",
      cancelledAt: new Date(),
    });
  }
}
