/**
 * DigitalProject aggregate — collaborative unit of work with manifest.
 * Architecture: COMP-006, DIP Project Manifest & DAG
 */

import type { InstitutionId } from "./value-objects/institution-id.js";
import type { ManifestId } from "./value-objects/manifest-id.js";
import type { ProjectId } from "./value-objects/project-id.js";
import { createManifestId } from "./value-objects/manifest-id.js";
import { createProjectId } from "./value-objects/project-id.js";
import type {
  ProjectCreatedEvent,
  ProjectManifestUpdatedEvent,
} from "./events/project-events.js";

/** Minimal manifest snapshot for create/update until ProjectManifest (COMP-006.2). */
export interface CreateProjectManifestSnapshot {
  title: string;
  description?: string;
}

/** Result of DigitalProject.create: aggregate and event to publish. */
export interface CreateProjectResult {
  project: DigitalProject;
  event: ProjectCreatedEvent;
}

/**
 * DigitalProject aggregate. Holds projectId, institutionId, manifestId, and
 * minimal manifest snapshot (title, description). Domain events: ProjectCreated,
 * ProjectManifestUpdated.
 */
export class DigitalProject {
  readonly projectId: ProjectId;
  readonly institutionId: InstitutionId;
  readonly manifestId: ManifestId;
  readonly title: string;
  readonly description: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(params: {
    projectId: ProjectId;
    institutionId: InstitutionId;
    manifestId: ManifestId;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.projectId = params.projectId;
    this.institutionId = params.institutionId;
    this.manifestId = params.manifestId;
    this.title = params.title;
    this.description = params.description;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  /**
   * Creates a new DigitalProject and a ProjectCreated event.
   * Generates projectId and manifestId (UUIDs).
   *
   * @param institutionId - Owning institution
   * @param manifest - Initial manifest snapshot (title, optional description)
   * @param idGenerator - Optional UUID generator (default: crypto.randomUUID)
   * @returns Aggregate and event to publish
   */
  static create(
    institutionId: InstitutionId,
    manifest: CreateProjectManifestSnapshot,
    idGenerator: () => string = () => crypto.randomUUID()
  ): CreateProjectResult {
    const now = new Date();
    const projectId = createProjectId(idGenerator());
    const manifestId = createManifestId(idGenerator());
    const description = manifest.description ?? "";

    const project = new DigitalProject({
      projectId,
      institutionId,
      manifestId,
      title: manifest.title,
      description,
      createdAt: now,
      updatedAt: now,
    });

    const event: ProjectCreatedEvent = {
      type: "dip.project.created",
      projectId,
      institutionId,
      manifestId,
      title: manifest.title,
      description: description || undefined,
      timestamp: now,
    };

    return { project, event };
  }

  /**
   * Reconstructs a DigitalProject from persistence.
   */
  static fromPersistence(params: {
    projectId: ProjectId;
    institutionId: InstitutionId;
    manifestId: ManifestId;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }): DigitalProject {
    return new DigitalProject(params);
  }

  /**
   * Updates manifest snapshot and returns new aggregate plus ProjectManifestUpdated event.
   * Only provided fields are updated.
   */
  updateManifest(manifest: {
    title?: string;
    description?: string;
  }): { project: DigitalProject; event: ProjectManifestUpdatedEvent } {
    const now = new Date();
    const title = manifest.title ?? this.title;
    const description =
      manifest.description !== undefined ? manifest.description : this.description;

    const project = new DigitalProject({
      projectId: this.projectId,
      institutionId: this.institutionId,
      manifestId: this.manifestId,
      title,
      description,
      createdAt: this.createdAt,
      updatedAt: now,
    });

    const event: ProjectManifestUpdatedEvent = {
      type: "dip.project.manifest_updated",
      projectId: this.projectId,
      institutionId: this.institutionId,
      manifestId: this.manifestId,
      title,
      description: description || undefined,
      timestamp: now,
    };

    return { project, event };
  }
}
