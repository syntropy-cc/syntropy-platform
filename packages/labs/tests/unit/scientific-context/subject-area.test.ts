/**
 * Unit tests for SubjectArea entity and seed (COMP-022.1).
 */

import { describe, it, expect } from "vitest";
import {
  SubjectArea,
  createSubjectAreaId,
  isSubjectAreaId,
  type SubjectAreaId,
} from "../../../src/domain/scientific-context/subject-area.js";
import {
  SUBJECT_AREA_SEED,
  buildSubjectAreaTree,
} from "../../../src/infrastructure/seeds/subject-areas.js";

const VALID_UUID = "a1000001-0000-4000-8000-000000000001";
const VALID_UUID_2 = "a1000001-0000-4000-8000-000000000002";

describe("createSubjectAreaId", () => {
  it("returns branded id when value is valid UUID", () => {
    const id = createSubjectAreaId(VALID_UUID);
    expect(id).toBe(VALID_UUID);
    expect(isSubjectAreaId(id)).toBe(true);
  });

  it("throws when value is empty", () => {
    expect(() => createSubjectAreaId("")).toThrow("cannot be empty");
    expect(() => createSubjectAreaId("   ")).toThrow("cannot be empty");
  });

  it("throws when value is not a valid UUID", () => {
    expect(() => createSubjectAreaId("not-a-uuid")).toThrow("expected UUID format");
    expect(() => createSubjectAreaId("a1000001-0000-4000-8000")).toThrow("expected UUID format");
  });
});

describe("SubjectArea", () => {
  it("creates domain-level area with parentId null", () => {
    const area = new SubjectArea({
      id: createSubjectAreaId(VALID_UUID),
      parentId: null,
      name: "Computing methodologies",
      depthLevel: 1,
    });
    expect(area.name).toBe("Computing methodologies");
    expect(area.parentId).toBeNull();
    expect(area.depthLevel).toBe(1);
    expect(area.isRoot).toBe(true);
  });

  it("creates field-level area with parent reference", () => {
    const parentId = createSubjectAreaId(VALID_UUID);
    const area = new SubjectArea({
      id: createSubjectAreaId(VALID_UUID_2),
      parentId,
      name: "Artificial intelligence",
      depthLevel: 2,
    });
    expect(area.parentId).toBe(parentId);
    expect(area.depthLevel).toBe(2);
    expect(area.isRoot).toBe(false);
  });

  it("trims name and optional code and description", () => {
    const area = new SubjectArea({
      id: createSubjectAreaId(VALID_UUID),
      parentId: null,
      name: "  Natural sciences  ",
      code: " ns.bio ",
      description: "  Life sciences  ",
      depthLevel: 1,
    });
    expect(area.name).toBe("Natural sciences");
    expect(area.code).toBe("ns.bio");
    expect(area.description).toBe("Life sciences");
  });

  it("throws when name is empty", () => {
    expect(
      () =>
        new SubjectArea({
          id: createSubjectAreaId(VALID_UUID),
          parentId: null,
          name: "",
          depthLevel: 1,
        })
    ).toThrow("name cannot be empty");
    expect(
      () =>
        new SubjectArea({
          id: createSubjectAreaId(VALID_UUID),
          parentId: null,
          name: "   ",
          depthLevel: 1,
        })
    ).toThrow("name cannot be empty");
  });

  it("throws when depthLevel is not 1, 2, or 3", () => {
    expect(
      () =>
        new SubjectArea({
          id: createSubjectAreaId(VALID_UUID),
          parentId: null,
          name: "X",
          depthLevel: 0 as 1,
        })
    ).toThrow("depthLevel must be 1, 2, or 3");
    expect(
      () =>
        new SubjectArea({
          id: createSubjectAreaId(VALID_UUID),
          parentId: null,
          name: "X",
          depthLevel: 4 as 1,
        })
    ).toThrow("depthLevel must be 1, 2, or 3");
  });

  it("throws when domain (level 1) has non-null parentId", () => {
    expect(
      () =>
        new SubjectArea({
          id: createSubjectAreaId(VALID_UUID),
          parentId: createSubjectAreaId(VALID_UUID_2),
          name: "Domain",
          depthLevel: 1,
        })
    ).toThrow("Domain-level SubjectArea must have parentId null");
  });

  it("throws when field or subfield has null parentId", () => {
    expect(
      () =>
        new SubjectArea({
          id: createSubjectAreaId(VALID_UUID),
          parentId: null,
          name: "Field",
          depthLevel: 2,
        })
    ).toThrow("Field and subfield SubjectAreas must have a parentId");
  });
});

describe("SUBJECT_AREA_SEED", () => {
  it("has at least 20 entries", () => {
    expect(SUBJECT_AREA_SEED.length).toBeGreaterThanOrEqual(20);
  });

  it("every entry has valid depthLevel 1, 2, or 3", () => {
    for (const a of SUBJECT_AREA_SEED) {
      expect([1, 2, 3]).toContain(a.depthLevel);
    }
  });

  it("root entries have parentId null and depthLevel 1", () => {
    const roots = SUBJECT_AREA_SEED.filter((a) => a.parentId === null);
    expect(roots.length).toBeGreaterThanOrEqual(1);
    for (const r of roots) {
      expect(r.depthLevel).toBe(1);
    }
  });

  it("non-root entries have parentId set and depthLevel 2 or 3", () => {
    const ids = new Set(SUBJECT_AREA_SEED.map((a) => a.id as string));
    for (const a of SUBJECT_AREA_SEED) {
      if (a.parentId !== null) {
        expect(ids.has(a.parentId as string)).toBe(true);
        expect([2, 3]).toContain(a.depthLevel);
      }
    }
  });
});

describe("buildSubjectAreaTree", () => {
  it("returns tree with roots and nested children", () => {
    const tree = buildSubjectAreaTree(SUBJECT_AREA_SEED);
    expect(tree.length).toBeGreaterThanOrEqual(1);
    const withChildren = tree.filter((n) => n.children.length > 0);
    expect(withChildren.length).toBeGreaterThanOrEqual(1);
  });

  it("every node has depthLevel and name", () => {
    const tree = buildSubjectAreaTree(SUBJECT_AREA_SEED);
    function check(n: { depthLevel: number; name: string; children: unknown[] }) {
      expect(n.depthLevel).toBeGreaterThanOrEqual(1);
      expect(n.depthLevel).toBeLessThanOrEqual(3);
      expect(typeof n.name).toBe("string");
      expect(n.name.length).toBeGreaterThan(0);
      for (const c of n.children as { depthLevel: number; name: string; children: unknown[] }[]) {
        check(c);
      }
    }
    for (const root of tree) {
      check(root);
    }
  });
});
