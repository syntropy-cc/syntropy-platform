/**
 * InstitutionEventPublisherPort — publish hub.institution.created (COMP-020.4).
 * Optional; when provided, orchestration service publishes after successful creation.
 */

export interface InstitutionCreatedEvent {
  institutionId: string;
  workflowId: string;
  name: string;
  type: string;
}

export interface InstitutionEventPublisherPort {
  publishInstitutionCreated(event: InstitutionCreatedEvent): Promise<void>;
}
