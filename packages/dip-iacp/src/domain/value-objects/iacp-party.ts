/**
 * IACPParty — value object for a party in an IACP record.
 * Architecture: COMP-005, DIP IACP Engine
 */

/**
 * Immutable value object representing a party (actor) in an IACP record.
 * actorId and role are required; signature is optional until the party has signed.
 */
export interface IACPParty {
  readonly actorId: string;
  readonly role: string;
  readonly signature?: string;
}

/**
 * Creates an IACPParty value object.
 * Validates non-empty actorId and role.
 *
 * @param params.actorId - Identifier of the actor
 * @param params.role - Role of the party
 * @param params.signature - Optional signature (set when party has signed)
 * @returns IACPParty
 * @throws Error if actorId or role is empty
 */
export function createIACPParty(params: {
  actorId: string;
  role: string;
  signature?: string;
}): IACPParty {
  const actorId = params.actorId.trim();
  const role = params.role.trim();
  if (!actorId) {
    throw new Error("Invalid IACPParty: actorId cannot be empty");
  }
  if (!role) {
    throw new Error("Invalid IACPParty: role cannot be empty");
  }
  const result: IACPParty = {
    actorId,
    role,
  };
  if (params.signature !== undefined && params.signature !== "") {
    return { ...result, signature: params.signature };
  }
  return result;
}
