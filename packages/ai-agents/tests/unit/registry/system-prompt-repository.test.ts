/**
 * Unit tests for SystemPromptRepository implementation (COMP-014.5).
 */

import { describe, it, expect } from "vitest";
import {
  createSystemPromptRepositoryFromMap,
  InMemorySystemPromptRepository,
} from "../../../src/infrastructure/repositories/in-memory-system-prompt-repository.js";

describe("InMemorySystemPromptRepository", () => {
  it("getByPromptId returns content for known prompt id", async () => {
    const repo = createSystemPromptRepositoryFromMap({
      "learn-project-scoping": "You are the Project Scoping Agent.",
      "hub-artifact-copilot": "You are the Artifact Copilot.",
    });

    const a = await repo.getByPromptId("learn-project-scoping");
    const b = await repo.getByPromptId("hub-artifact-copilot");

    expect(a).toBe("You are the Project Scoping Agent.");
    expect(b).toBe("You are the Artifact Copilot.");
  });

  it("getByPromptId returns null for unknown prompt id", async () => {
    const repo = createSystemPromptRepositoryFromMap({
      "learn-project-scoping": "Content",
    });

    const result = await repo.getByPromptId("unknown-agent");

    expect(result).toBeNull();
  });

  it("supports all 12 agent prompt ids", async () => {
    const promptIds = [
      "learn-project-scoping",
      "learn-curriculum-architect",
      "learn-fragment-author",
      "learn-pedagogical-validator",
      "learn-iteration",
      "hub-artifact-copilot",
      "hub-institution-setup",
      "hub-contribution-reviewer",
      "labs-literature-review",
      "labs-research-structuring",
      "labs-article-drafting",
      "cross-pillar-navigation",
    ];
    const map = Object.fromEntries(
      promptIds.map((id) => [id, `Prompt for ${id}`])
    );
    const repo = new InMemorySystemPromptRepository(new Map(Object.entries(map)));

    for (const id of promptIds) {
      const content = await repo.getByPromptId(id);
      expect(content).toBe(`Prompt for ${id}`);
    }
  });
});
