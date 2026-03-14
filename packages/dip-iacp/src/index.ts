/**
 * DIP IACP (Institutional Artifact Consumption Protocol) package.
 * Architecture: COMP-005
 */

export { DuplicateSignatureError, InvalidTransitionError } from "./domain/errors.js";
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
export { SignatureCollector } from "./domain/signature-collector.js";
export type { SignatureCollectorState } from "./domain/signature-collector.js";
export {
  createEvaluationResult,
} from "./domain/evaluation-result.js";
export type { EvaluationResult } from "./domain/evaluation-result.js";
export { IACPEngine } from "./domain/iacp-engine.js";
export type { ConsensusEvaluatorPort, ConsensusEvaluatorContext } from "./domain/ports/consensus-evaluator-port.js";
export type { IACPRepository } from "./domain/repositories/iacp-repository.js";
export type {
  IACPCreatedEvent,
  IACPActivatedEvent,
  IACPTerminatedEvent,
  IACPLifecycleEvent,
} from "./domain/events/iacp-events.js";
export type { IACPEventPublisherPort } from "./domain/ports/iacp-event-publisher-port.js";
export { IACPEventPublisher } from "./infrastructure/iacp-event-publisher.js";
