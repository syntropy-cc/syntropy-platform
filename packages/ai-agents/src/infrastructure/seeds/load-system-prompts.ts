/**
 * Load system prompts from a directory of .md files (COMP-014.5).
 * Key = filename without extension (e.g. learn-project-scoping).
 * Node.js only; use createSystemPromptRepositoryFromMap for tests.
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Loads all .md files from the given directory and returns a record
 * promptId (filename without .md) -> content.
 *
 * @param dirPath - Absolute or relative path to directory containing .md files
 * @returns Record of promptId to prompt text
 */
export async function loadSystemPromptsFromDirectory(
  dirPath: string
): Promise<Record<string, string>> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const out: Record<string, string> = {};
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith(".md")) continue;
    const fullPath = join(dirPath, e.name);
    const content = await readFile(fullPath, "utf-8");
    const promptId = e.name.slice(0, -3);
    out[promptId] = content.trim();
  }
  return out;
}
