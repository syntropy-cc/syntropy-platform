/**
 * IACP domain event payloads for Kafka (created, activated, terminated).
 * Architecture: COMP-005.7, DIP IACP Engine
 */

export interface IACPCreatedEvent {
  readonly eventType: "dip.iacp.created";
  readonly iacpId: string;
  readonly type: string;
  readonly institutionId?: string;
  readonly timestamp: string;
}

export interface IACPActivatedEvent {
  readonly eventType: "dip.iacp.activated";
  readonly iacpId: string;
  readonly type: string;
  readonly institutionId?: string;
  readonly timestamp: string;
}

export interface IACPTerminatedEvent {
  readonly eventType: "dip.iacp.terminated";
  readonly iacpId: string;
  readonly type: string;
  readonly institutionId?: string;
  readonly timestamp: string;
}

export type IACPLifecycleEvent =
  | IACPCreatedEvent
  | IACPActivatedEvent
  | IACPTerminatedEvent;
