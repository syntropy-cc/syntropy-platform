/**
 * DIP IACP (Institutional Artifact Consumption Protocol) package.
 * Architecture: COMP-005
 */

export { IACPRecord } from "./domain/iacp-record.js";
export { IACPStatus, isIACPStatus } from "./domain/iacp-status.js";
export {
  createIACPId,
  isIACPId,
} from "./domain/value-objects/iacp-id.js";
export type { IACPId } from "./domain/value-objects/iacp-id.js";
export { createIACPParty } from "./domain/value-objects/iacp-party.js";
export type { IACPParty } from "./domain/value-objects/iacp-party.js";
export {
  createSignatureThreshold,
  isThresholdMet,
} from "./domain/value-objects/signature-threshold.js";
export type { SignatureThreshold } from "./domain/value-objects/signature-threshold.js";
