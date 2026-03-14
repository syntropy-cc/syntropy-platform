/**
 * IACPRecord aggregate — Institutional Artifact Consumption Protocol record.
 * Architecture: COMP-005, DIP IACP Engine
 */

import type { IACPId } from "./value-objects/iacp-id.js";
import type { IACPParty } from "./value-objects/iacp-party.js";
import { IACPStatus } from "./iacp-status.js";

/**
 * IACPRecord aggregate. Lifecycle: draft → pending_signatures → active → terminated.
 * Holds id, type, parties list, and status.
 */
export class IACPRecord {
  readonly id: IACPId;
  readonly type: string;
  readonly parties: readonly IACPParty[];
  readonly status: IACPStatus;

  private constructor(params: {
    id: IACPId;
    type: string;
    parties: readonly IACPParty[];
    status: IACPStatus;
  }) {
    this.id = params.id;
    this.type = params.type;
    this.parties = params.parties;
    this.status = params.status;
  }

  /**
   * Creates a new IACP record in draft state.
   *
   * @param params.id - IACPId
   * @param params.type - Record type
   */
  static draft(params: { id: IACPId; type: string }): IACPRecord {
    return new IACPRecord({
      id: params.id,
      type: params.type,
      parties: [],
      status: IACPStatus.Draft,
    });
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
    });
  }
}
