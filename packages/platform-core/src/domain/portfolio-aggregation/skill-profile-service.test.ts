/**
 * Unit tests for SkillProfileService (COMP-010.4).
 */

import { describe, it, expect } from "vitest";
import { compute } from "./services/skill-profile-service.js";

describe("SkillProfileService", () => {
  it("returns empty profile when no events given", () => {
    const profile = compute("user-1", []);
    expect(profile.userId).toBe("user-1");
    expect(profile.skills).toHaveLength(0);
  });

  it("returns empty profile when events have no skill evidence", () => {
    const profile = compute("user-1", [
      { type: "learn.fragment.artifact_published", payload: {} },
      { type: "hub.contribution.integrated", payload: { foo: "bar" } },
    ]);
    expect(profile.userId).toBe("user-1");
    expect(profile.skills).toHaveLength(0);
  });

  it("extracts skills from learn.fragment.artifact_published payload.tags", () => {
    const profile = compute("user-1", [
      {
        type: "learn.fragment.artifact_published",
        payload: { tags: ["typescript", "React"] },
      },
    ]);
    expect(profile.userId).toBe("user-1");
    expect(profile.skills).toHaveLength(2);
    const names = profile.skills.map((s) => s.skillName).sort();
    expect(names).toEqual(["react", "typescript"]);
    profile.skills.forEach((s) => {
      expect(s.level).toBe("beginner");
      expect(s.evidenceEventIds.length).toBe(1);
    });
  });

  it("extracts skills from hub.contribution.integrated payload.skills", () => {
    const profile = compute("user-1", [
      {
        type: "hub.contribution.integrated",
        payload: { skills: ["collaboration", "writing"] },
      },
    ]);
    expect(profile.skills).toHaveLength(2);
    const names = profile.skills.map((s) => s.skillName).sort();
    expect(names).toEqual(["collaboration", "writing"]);
  });

  it("uses payload.tags and payload.skills and deduplicates skill names", () => {
    const profile = compute("user-1", [
      {
        type: "hub.contribution.integrated",
        payload: { tags: ["typescript"], skills: ["typescript", "research"] },
      },
    ]);
    expect(profile.skills).toHaveLength(2);
    const names = profile.skills.map((s) => s.skillName).sort();
    expect(names).toEqual(["research", "typescript"]);
  });

  it("assigns higher level when multiple events contribute to same skill", () => {
    const profile = compute("user-1", [
      { type: "learn.fragment.artifact_published", payload: { tags: ["typescript"] } },
      { type: "learn.fragment.artifact_published", payload: { tags: ["typescript"] } },
      { type: "learn.fragment.artifact_published", payload: { tags: ["typescript"] } },
    ]);
    expect(profile.skills).toHaveLength(1);
    expect(profile.skills[0].skillName).toBe("typescript");
    expect(profile.skills[0].level).toBe("intermediate");
    expect(profile.skills[0].evidenceEventIds).toHaveLength(3);
  });

  it("ignores unknown event types", () => {
    const profile = compute("user-1", [
      { type: "other.domain.event", payload: { tags: ["typescript"] } },
    ]);
    expect(profile.skills).toHaveLength(0);
  });

  it("normalizes skill names to lowercase and merges duplicate tags from same event", () => {
    const profile = compute("user-1", [
      {
        type: "learn.fragment.artifact_published",
        payload: { tags: ["TypeScript", "TYPESCRIPT"] },
      },
    ]);
    expect(profile.skills).toHaveLength(1);
    expect(profile.skills[0].skillName).toBe("typescript");
    expect(profile.skills[0].evidenceEventIds).toHaveLength(1);
  });

  it("assigns expert level at 15+ signals", () => {
    const events = Array.from({ length: 15 }, () => ({
      type: "learn.fragment.artifact_published" as const,
      payload: { tags: ["research"] },
    }));
    const profile = compute("user-1", events);
    expect(profile.skills[0].level).toBe("expert");
    expect(profile.skills[0].evidenceEventIds).toHaveLength(15);
  });
});
