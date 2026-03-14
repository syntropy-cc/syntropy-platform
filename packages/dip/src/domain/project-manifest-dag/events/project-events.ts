/**
 * Project domain events for DIP DigitalProject.
 * Architecture: COMP-006, DIP Project Manifest & DAG
 */

import type { InstitutionId } from "../value-objects/institution-id.js";
import type { ManifestId } from "../value-objects/manifest-id.js";
import type { ProjectId } from "../value-objects/project-id.js";

/** Payload for project creation. */
export interface ProjectCreatedEvent {
  type: "dip.project.created";
  projectId: ProjectId;
  institutionId: InstitutionId;
  manifestId: ManifestId;
  title: string;
  description?: string;
  timestamp: Date;
}

/** Payload for manifest update. */
export interface ProjectManifestUpdatedEvent {
  type: "dip.project.manifest_updated";
  projectId: ProjectId;
  institutionId: InstitutionId;
  manifestId: ManifestId;
  title: string;
  description?: string;
  timestamp: Date;
}

export type ProjectDomainEvent =
  | ProjectCreatedEvent
  | ProjectManifestUpdatedEvent;
