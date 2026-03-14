/**
 * Unit tests for DigitalProject aggregate.
 * Tests for: COMP-006.1
 */

import { describe, expect, it } from "vitest";
import { DigitalProject } from "../../../src/domain/project-manifest-dag/digital-project.js";
import { createInstitutionId } from "../../../src/domain/project-manifest-dag/value-objects/institution-id.js";
import { createManifestId } from "../../../src/domain/project-manifest-dag/value-objects/manifest-id.js";
import { createProjectId } from "../../../src/domain/project-manifest-dag/value-objects/project-id.js";
import { isProjectId } from "../../../src/domain/project-manifest-dag/value-objects/project-id.js";

const INSTITUTION_ID = "a1b2c3d4-e5f6-4789-a012-3456789abcde";
const FIXED_UUID_PROJECT = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const FIXED_UUID_MANIFEST = "b58bd20c-69dd-5483-b678-1f13c3d4e580";

describe("DigitalProject.create", () => {
  it("returns aggregate with projectId, institutionId, manifestId and emits ProjectCreated", () => {
    const institutionId = createInstitutionId(INSTITUTION_ID);
    let callCount = 0;
    const idGenerator = () =>
      callCount++ === 0 ? FIXED_UUID_PROJECT : FIXED_UUID_MANIFEST;

    const { project, event } = DigitalProject.create(
      institutionId,
      { title: "My Project", description: "A test project" },
      idGenerator
    );

    expect(project.projectId).toBe(createProjectId(FIXED_UUID_PROJECT));
    expect(project.institutionId).toBe(institutionId);
    expect(project.manifestId).toBe(createManifestId(FIXED_UUID_MANIFEST));
    expect(project.title).toBe("My Project");
    expect(project.description).toBe("A test project");
    expect(project.createdAt).toBeInstanceOf(Date);
    expect(project.updatedAt).toBeInstanceOf(Date);

    expect(event.type).toBe("dip.project.created");
    expect(event.projectId).toBe(project.projectId);
    expect(event.institutionId).toBe(institutionId);
    expect(event.manifestId).toBe(project.manifestId);
    expect(event.title).toBe("My Project");
    expect(event.description).toBe("A test project");
    expect(event.timestamp).toBe(project.createdAt);
  });

  it("generates valid UUIDs for projectId and manifestId when no idGenerator provided", () => {
    const institutionId = createInstitutionId(INSTITUTION_ID);
    const { project } = DigitalProject.create(institutionId, {
      title: "No IDs",
    });

    expect(isProjectId(project.projectId)).toBe(true);
    expect(project.projectId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(project.manifestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("uses empty string for description when not provided", () => {
    const institutionId = createInstitutionId(INSTITUTION_ID);
    const { project, event } = DigitalProject.create(institutionId, {
      title: "Title only",
    });

    expect(project.description).toBe("");
    expect(event.description).toBeUndefined();
  });
});

describe("DigitalProject.updateManifest", () => {
  it("returns new aggregate and ProjectManifestUpdated event with updated title", () => {
    const institutionId = createInstitutionId(INSTITUTION_ID);
    let idCount = 0;
    const idGen = () =>
      idCount++ === 0 ? FIXED_UUID_PROJECT : FIXED_UUID_MANIFEST;
    const { project: created } = DigitalProject.create(
      institutionId,
      { title: "Old", description: "Desc" },
      idGen
    );

    const { project: updated, event } = created.updateManifest({
      title: "New Title",
    });

    expect(updated.title).toBe("New Title");
    expect(updated.description).toBe("Desc");
    expect(updated.projectId).toBe(created.projectId);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      created.updatedAt.getTime()
    );

    expect(event.type).toBe("dip.project.manifest_updated");
    expect(event.projectId).toBe(created.projectId);
    expect(event.title).toBe("New Title");
    expect(event.timestamp).toBe(updated.updatedAt);
  });

  it("returns new aggregate with updated description when only description provided", () => {
    const institutionId = createInstitutionId(INSTITUTION_ID);
    let idCount = 0;
    const idGen = () =>
      idCount++ === 0 ? FIXED_UUID_PROJECT : FIXED_UUID_MANIFEST;
    const { project: created } = DigitalProject.create(
      institutionId,
      { title: "Title", description: "Old desc" },
      idGen
    );

    const { project: updated } = created.updateManifest({
      description: "New desc",
    });

    expect(updated.title).toBe("Title");
    expect(updated.description).toBe("New desc");
  });
});

describe("DigitalProject.fromPersistence", () => {
  it("reconstructs aggregate with given fields", () => {
    const projectId = createProjectId(FIXED_UUID_PROJECT);
    const institutionId = createInstitutionId(INSTITUTION_ID);
    const manifestId = createManifestId(FIXED_UUID_MANIFEST);
    const createdAt = new Date("2024-01-01T00:00:00Z");
    const updatedAt = new Date("2024-01-02T00:00:00Z");

    const project = DigitalProject.fromPersistence({
      projectId,
      institutionId,
      manifestId,
      title: "Restored",
      description: "From DB",
      createdAt,
      updatedAt,
    });

    expect(project.projectId).toBe(projectId);
    expect(project.institutionId).toBe(institutionId);
    expect(project.manifestId).toBe(manifestId);
    expect(project.title).toBe("Restored");
    expect(project.description).toBe("From DB");
    expect(project.createdAt).toEqual(createdAt);
    expect(project.updatedAt).toEqual(updatedAt);
  });
});
