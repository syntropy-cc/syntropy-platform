/**
 * CreateProjectUseCase — creates a DigitalProject and publishes the created event (COMP-006.6).
 * Architecture: COMP-006, DIP Project Manifest & DAG
 */

import { DigitalProject } from "../domain/project-manifest-dag/digital-project.js";
import type { CreateProjectManifestSnapshot } from "../domain/project-manifest-dag/digital-project.js";
import type { InstitutionId } from "../domain/project-manifest-dag/value-objects/institution-id.js";
import type { ProjectEventPublisherPort } from "../domain/project-manifest-dag/ports/project-event-publisher-port.js";
import type { ProjectRepository } from "../domain/project-manifest-dag/repositories/project-repository.js";

/**
 * Use case: create a new DigitalProject, persist it, and publish the project-created event.
 */
export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectEventPublisher: ProjectEventPublisherPort,
  ) {}

  /**
   * Creates a project for the given institution and manifest, saves it, and publishes the event.
   *
   * @param institutionId - Owning institution (must be valid InstitutionId)
   * @param manifest - Initial manifest snapshot (title, optional description)
   * @returns The created DigitalProject
   */
  async execute(
    institutionId: InstitutionId,
    manifest: CreateProjectManifestSnapshot,
  ): Promise<DigitalProject> {
    const { project, event } = DigitalProject.create(institutionId, manifest);
    await this.projectRepository.save(project);
    await this.projectEventPublisher.publishProjectCreated(event);
    return project;
  }
}
