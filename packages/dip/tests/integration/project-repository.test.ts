/**
 * Integration tests for PostgresProjectRepository (COMP-006.4).
 * Uses in-memory mock client to verify repository logic without real DB.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { DigitalProject } from "../../src/domain/project-manifest-dag/digital-project.js";
import { createInstitutionId } from "../../src/domain/project-manifest-dag/value-objects/institution-id.js";
import { createProjectId } from "../../src/domain/project-manifest-dag/value-objects/project-id.js";
import { PostgresProjectRepository } from "../../src/infrastructure/repositories/postgres-project-repository.js";
import type { ProjectDbClient } from "../../src/infrastructure/project-db-client.js";

function createMockDbClient(): ProjectDbClient & {
  rows: Map<string, Record<string, unknown>>;
} {
  const rows = new Map<string, Record<string, unknown>>();
  return {
    rows,
    async execute(_sql: string, params: unknown[]): Promise<void> {
      const id = params[0] as string;
      rows.set(id, {
        id: params[0],
        institution_id: params[1],
        manifest_id: params[2],
        title: params[3],
        description: params[4],
        created_at: params[5],
        updated_at: params[6],
      });
    },
    async query<T = Record<string, unknown>>(
      sql: string,
      params: unknown[],
    ): Promise<T[]> {
      if (sql.includes("WHERE id = $1")) {
        const id = params[0] as string;
        const row = rows.get(id);
        return row ? [row as T] : [];
      }
      if (sql.includes("WHERE institution_id = $1")) {
        const instId = params[0] as string;
        return [...rows.values()]
          .filter((r) => r.institution_id === instId)
          .sort(
            (a, b) =>
              new Date(a.created_at as string).getTime() -
              new Date(b.created_at as string).getTime(),
          ) as T[];
      }
      return [];
    },
  };
}

describe("PostgresProjectRepository", () => {
  let client: ReturnType<typeof createMockDbClient>;
  let repo: PostgresProjectRepository;

  beforeEach(() => {
    client = createMockDbClient();
    repo = new PostgresProjectRepository(client);
  });

  it("save then findById returns same project", async () => {
    const institutionId = createInstitutionId(
      "a1b2c3d4-e5f6-4789-a012-3456789abcde",
    );
    const { project } = DigitalProject.create(institutionId, {
      title: "Test Project",
      description: "A description",
    });

    await repo.save(project);
    const found = await repo.findById(project.projectId);

    expect(found).not.toBeNull();
    expect(found!.projectId).toBe(project.projectId);
    expect(found!.institutionId).toBe(project.institutionId);
    expect(found!.manifestId).toBe(project.manifestId);
    expect(found!.title).toBe("Test Project");
    expect(found!.description).toBe("A description");
  });

  it("findById returns null when project does not exist", async () => {
    const id = createProjectId(
      "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    );
    const found = await repo.findById(id);
    expect(found).toBeNull();
  });

  it("findByInstitution returns only projects for that institution", async () => {
    const instA = createInstitutionId(
      "a1b2c3d4-e5f6-4789-a012-3456789abcde",
    );
    const instB = createInstitutionId(
      "b2c3d4e5-f6a7-5890-b123-456789abcdef",
    );

    const { project: p1 } = DigitalProject.create(instA, {
      title: "Project A1",
    });
    const { project: p2 } = DigitalProject.create(instA, {
      title: "Project A2",
    });
    const { project: p3 } = DigitalProject.create(instB, {
      title: "Project B1",
    });

    await repo.save(p1);
    await repo.save(p2);
    await repo.save(p3);

    const forA = await repo.findByInstitution(instA);
    const forB = await repo.findByInstitution(instB);

    expect(forA).toHaveLength(2);
    expect(forA.map((p) => p.title).sort()).toEqual(["Project A1", "Project A2"]);
    expect(forB).toHaveLength(1);
    expect(forB[0].title).toBe("Project B1");
  });

  it("save updates existing project when same id", async () => {
    const institutionId = createInstitutionId(
      "a1b2c3d4-e5f6-4789-a012-3456789abcde",
    );
    const { project: initial } = DigitalProject.create(institutionId, {
      title: "Original",
      description: "Desc",
    });
    await repo.save(initial);

    const { project: updated } = initial.updateManifest({
      title: "Updated Title",
      description: "Updated Desc",
    });
    await repo.save(updated);

    const found = await repo.findById(initial.projectId);
    expect(found!.title).toBe("Updated Title");
    expect(found!.description).toBe("Updated Desc");
  });
});
