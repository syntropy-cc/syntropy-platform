/**
 * Unit tests for ProjectManifest value object.
 * Tests for: COMP-006.2
 */

import { describe, expect, it } from "vitest";
import { ProjectManifest } from "../../../src/domain/project-manifest-dag/project-manifest.js";

describe("ProjectManifest", () => {
  it("equals returns true for same title, description, goals, dependencies", () => {
    const a = new ProjectManifest({
      title: "T",
      description: "D",
      goals: ["g1", "g2"],
      dependencies: ["d1"],
    });
    const b = new ProjectManifest({
      title: "T",
      description: "D",
      goals: ["g1", "g2"],
      dependencies: ["d1"],
    });
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);
  });

  it("equals returns true for same instance", () => {
    const a = new ProjectManifest({ title: "T" });
    expect(a.equals(a)).toBe(true);
  });

  it("equals returns false when title differs", () => {
    const a = new ProjectManifest({ title: "T1", description: "D" });
    const b = new ProjectManifest({ title: "T2", description: "D" });
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);
  });

  it("equals returns false when description differs", () => {
    const a = new ProjectManifest({ title: "T", description: "D1" });
    const b = new ProjectManifest({ title: "T", description: "D2" });
    expect(a.equals(b)).toBe(false);
  });

  it("equals returns false when goals length or content differs", () => {
    const a = new ProjectManifest({ title: "T", goals: ["g1"] });
    const b = new ProjectManifest({ title: "T", goals: ["g1", "g2"] });
    expect(a.equals(b)).toBe(false);

    const c = new ProjectManifest({ title: "T", goals: ["g1", "g2"] });
    const d = new ProjectManifest({ title: "T", goals: ["g1", "gx"] });
    expect(c.equals(d)).toBe(false);
  });

  it("equals returns false when dependencies length or content differs", () => {
    const a = new ProjectManifest({ title: "T", dependencies: ["d1"] });
    const b = new ProjectManifest({ title: "T", dependencies: ["d1", "d2"] });
    expect(a.equals(b)).toBe(false);
  });

  it("toJSON returns serializable object and round-trips", () => {
    const manifest = new ProjectManifest({
      title: "My Project",
      description: "Desc",
      goals: ["goal1", "goal2"],
      dependencies: ["dep-a", "dep-b"],
    });
    const json = manifest.toJSON();
    expect(json).toEqual({
      title: "My Project",
      description: "Desc",
      goals: ["goal1", "goal2"],
      dependencies: ["dep-a", "dep-b"],
    });
    const restored = new ProjectManifest(json);
    expect(manifest.equals(restored)).toBe(true);
  });

  it("defaults description to empty string and goals/dependencies to empty arrays", () => {
    const manifest = new ProjectManifest({ title: "Only title" });
    expect(manifest.description).toBe("");
    expect(manifest.goals).toEqual([]);
    expect(manifest.dependencies).toEqual([]);
    expect(manifest.toJSON()).toEqual({
      title: "Only title",
      description: "",
      goals: [],
      dependencies: [],
    });
  });

  it("does not mutate when toJSON is called", () => {
    const goals = ["g1"];
    const manifest = new ProjectManifest({ title: "T", goals });
    manifest.toJSON();
    expect(manifest.goals).toEqual(["g1"]);
    expect(manifest.toJSON().goals).not.toBe(goals);
    expect(manifest.toJSON().goals).toEqual(["g1"]);
  });
});
