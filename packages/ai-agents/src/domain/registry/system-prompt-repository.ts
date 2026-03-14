/**
 * System prompt repository port (COMP-014.5).
 * Resolves system prompt text by prompt ID for agent invocation.
 */

/**
 * Port for loading system prompt content by ID.
 * Implementations may load from files, database, or in-memory map.
 */
export interface SystemPromptRepository {
  getByPromptId(promptId: string): Promise<string | null>;
}
