/**
 * DIP Project Manifest & DAG subdomain.
 * Architecture: COMP-006
 */

export { CyclicDependencyError } from "./errors.js";
export { DigitalProject } from "./digital-project.js";
export { ProjectManifest } from "./project-manifest.js";
export { DAGService } from "./services/dag-service.js";
export type { CreateProjectManifestSnapshot, CreateProjectResult } from "./digital-project.js";
export type { ProjectManifestJSON } from "./project-manifest.js";
export type { ProjectRepository } from "./repositories/project-repository.js";
export type { ProjectEventPublisherPort } from "./ports/project-event-publisher-port.js";
export type {
  ProjectCreatedEvent,
  ProjectManifestUpdatedEvent,
  ProjectDomainEvent,
} from "./events/project-events.js";
export {
  createInstitutionId,
  createManifestId,
  createProjectId,
  isInstitutionId,
  isManifestId,
  isProjectId,
} from "./value-objects/index.js";
export type {
  InstitutionId,
  ManifestId,
  ProjectId,
} from "./value-objects/index.js";
