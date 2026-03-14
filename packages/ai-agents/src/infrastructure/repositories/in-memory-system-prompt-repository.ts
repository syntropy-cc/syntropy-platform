/**
 * In-memory system prompt repository (COMP-014.5).
 * Loaded from seed data (e.g. 12 prompt files) at app startup.
 */

import type { SystemPromptRepository } from "../../domain/registry/system-prompt-repository.js";

/**
 * In-memory implementation of SystemPromptRepository.
 * Pass a map of promptId -> prompt text (e.g. from file loader).
 */
export class InMemorySystemPromptRepository implements SystemPromptRepository {
  constructor(private readonly prompts: ReadonlyMap<string, string>) {}

  async getByPromptId(promptId: string): Promise<string | null> {
    return this.prompts.get(promptId) ?? null;
  }
}

/**
 * Build a repository from a plain record (for tests or inline config).
 */
export function createSystemPromptRepositoryFromMap(
  prompts: Record<string, string>
): SystemPromptRepository {
  return new InMemorySystemPromptRepository(new Map(Object.entries(prompts)));
}
