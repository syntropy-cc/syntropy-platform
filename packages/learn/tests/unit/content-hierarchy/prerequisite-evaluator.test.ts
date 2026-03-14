/**
 * Unit tests for PrerequisiteEvaluator (COMP-015.4).
 */

import { createCourseId } from "@syntropy/types";
import { describe, it, expect } from "vitest";
import { PrerequisiteEvaluator } from "../../../src/domain/content-hierarchy/services/prerequisite-evaluator.js";

const course1 = createCourseId("c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f");
const course2 = createCourseId("d4e5f6a7-b8c9-4d8e-8f2a-3b4c5d6e7f8a");
const course3 = createCourseId("e5f6a7b8-c9d0-4e9f-8a3b-4c5d6e7f8a9b");

describe("PrerequisiteEvaluator", () => {
  const evaluator = new PrerequisiteEvaluator();

  it("returns met and empty missing when all prerequisites completed", () => {
    const result = evaluator.evaluate(
      course3,
      [course1, course2],
      new Set([course1, course2])
    );

    expect(result.met).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("returns not met and missing list when no prerequisites completed", () => {
    const result = evaluator.evaluate(course3, [course1, course2], new Set());

    expect(result.met).toBe(false);
    expect(result.missing).toHaveLength(2);
    expect(result.missing).toContain(course1);
    expect(result.missing).toContain(course2);
  });

  it("returns not met with single missing when one prerequisite completed", () => {
    const result = evaluator.evaluate(course3, [course1, course2], new Set([course1]));

    expect(result.met).toBe(false);
    expect(result.missing).toHaveLength(1);
    expect(result.missing).toContain(course2);
  });

  it("returns met when prerequisites list is empty", () => {
    const result = evaluator.evaluate(course1, [], new Set());

    expect(result.met).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("accepts completedCourseIds as array", () => {
    const result = evaluator.evaluate(course3, [course1, course2], [course1, course2]);

    expect(result.met).toBe(true);
    expect(result.missing).toHaveLength(0);
  });
});
