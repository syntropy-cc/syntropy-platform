/**
 * IACPRecord aggregate — Institutional Artifact Consumption Protocol record.
 * Architecture: COMP-005, DIP IACP Engine
 */

import type { IACPId } from "./value-objects/iacp-id.js";
import type { IACPParty } from "./value-objects/iacp-party.js";
import { InvalidTransitionError } from "./errors.js";
import { IACPStatus } from "./iacp-status.js";

/**
 * IACPRecord aggregate. Lifecycle: draft → pending_signatures → active → terminated.
 * Holds id, type, parties list, status, and optional institutionId for scoping.
 */
export class IACPRecord {
  readonly id: IACPId;
  readonly type: string;
  readonly parties: readonly IACPParty[];
  readonly status: IACPStatus;
  readonly institutionId?: string;

  private constructor(params: {
    id: IACPId;
    type: string;
    parties: readonly IACPParty[];
    status: IACPStatus;
    institutionId?: string;
  }) {
    this.id = params.id;
    this.type = params.type;
    this.parties = params.parties;
    this.status = params.status;
    this.institutionId = params.institutionId;
  }

  /**
   * Creates a new IACP record in draft state.
   *
   * @param params.id - IACPId
   * @param params.type - Record type
   * @param params.institutionId - Optional institution scope for findByInstitution
   */
  static draft(params: {
    id: IACPId;
    type: string;
    institutionId?: string;
  }): IACPRecord {
    return new IACPRecord({
      id: params.id,
      type: params.type,
      parties: [],
      status: IACPStatus.Draft,
      institutionId: params.institutionId,
    });
  }

  /**
   * Reconstructs an IACPRecord from persistence (repository use).
   * Use draft() for new records.
   */
  static fromPersistence(params: {
    id: IACPId;
    type: string;
    parties: readonly IACPParty[];
    status: IACPStatus;
    institutionId?: string;
  }): IACPRecord {
    return new IACPRecord(params);
  }

  /**
   * Returns a new IACPRecord with the given party appended.
   * Rejects duplicate actorId (existing party with same actorId is not replaced).
   *
   * @param party - Party to add
   * @returns New IACPRecord with the added party
   * @throws Error if a party with the same actorId already exists
   */
  addParty(party: IACPParty): IACPRecord {
    const exists = this.parties.some((p) => p.actorId === party.actorId);
    if (exists) {
      throw new Error(
        `Cannot add party: actor ${party.actorId} is already in the record`
      );
    }
    return new IACPRecord({
      id: this.id,
      type: this.type,
      parties: [...this.parties, party],
      status: this.status,
      institutionId: this.institutionId,
    });
  }

  /**
   * Transitions from draft to pending_signatures.
   * Caller must have added parties before submitting.
   *
   * @returns New IACPRecord in pending_signatures status
   * @throws InvalidTransitionError if not in draft
   */
  submit(): IACPRecord {
    if (this.status !== IACPStatus.Draft) {
      throw new InvalidTransitionError(
        this.status,
        IACPStatus.PendingSignatures,
        this.id,
      );
    }
    return new IACPRecord({
      id: this.id,
      type: this.type,
      parties: this.parties,
      status: IACPStatus.PendingSignatures,
      institutionId: this.institutionId,
    });
  }

  /**
   * Transitions from pending_signatures to active.
   * Caller must ensure signature threshold is met before calling.
   *
   * @returns New IACPRecord in active status
   * @throws InvalidTransitionError if not in pending_signatures
   */
  activate(): IACPRecord {
    if (this.status !== IACPStatus.PendingSignatures) {
      throw new InvalidTransitionError(
        this.status,
        IACPStatus.Active,
        this.id,
      );
    }
    return new IACPRecord({
      id: this.id,
      type: this.type,
      parties: this.parties,
      status: IACPStatus.Active,
      institutionId: this.institutionId,
    });
  }

  /**
   * Transitions to terminated from draft, pending_signatures, or active.
   *
   * @returns New IACPRecord in terminated status
   * @throws InvalidTransitionError if already terminated
   */
  terminate(): IACPRecord {
    if (this.status === IACPStatus.Terminated) {
      throw new InvalidTransitionError(
        this.status,
        IACPStatus.Terminated,
        this.id,
      );
    }
    return new IACPRecord({
      id: this.id,
      type: this.type,
      parties: this.parties,
      status: IACPStatus.Terminated,
      institutionId: this.institutionId,
    });
  }
}
