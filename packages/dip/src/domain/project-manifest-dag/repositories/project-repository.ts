/**
 * ProjectRepository — domain interface for DigitalProject persistence.
 * Architecture: COMP-006, DIP Project Manifest & DAG (ARCH-002)
 */

import type { DigitalProject } from "../digital-project.js";
import type { InstitutionId } from "../value-objects/institution-id.js";
import type { ProjectId } from "../value-objects/project-id.js";

/**
 * Port for persisting and loading DigitalProject aggregates.
 * Implementations live in the infrastructure layer (e.g. PostgresProjectRepository).
 */
export interface ProjectRepository {
  save(project: DigitalProject): Promise<void>;
  findById(projectId: ProjectId): Promise<DigitalProject | null>;
  findByInstitution(institutionId: InstitutionId): Promise<DigitalProject[]>;
}
