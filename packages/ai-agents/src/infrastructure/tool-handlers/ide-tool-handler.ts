/**
 * IDE tool handlers (COMP-014.6).
 * list_files, read_file, write_file, run_command — session ownership enforced via port.
 */

import { z } from "zod";
import type {
  ToolDefinition,
  ToolResult,
} from "../../domain/orchestration/tool-types.js";
import type { IDEToolPort } from "./ports/ide-ports.js";

const listFilesParamsSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});

const readFileParamsSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  path: z.string().min(1, "path is required"),
});

const writeFileParamsSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  path: z.string().min(1, "path is required"),
  content: z.string(),
});

const runCommandParamsSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  cmd: z.string().min(1, "cmd is required"),
});

/**
 * Creates IDE tool definitions. getCurrentUserId is provided by the app
 * from agent session context so the port can enforce session ownership.
 */
export function createIDEToolDefinitions(
  port: IDEToolPort,
  getCurrentUserId: () => string
): ToolDefinition[] {
  return [
    {
      name: "list_files",
      description: "List files in the IDE workspace for the given session",
      paramsSchema: listFilesParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { sessionId } = listFilesParamsSchema.parse(params);
        const userId = getCurrentUserId();
        try {
          const files = await port.listFiles(sessionId, userId);
          return { success: true, data: { files } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "read_file",
      description: "Read file content from the IDE workspace",
      paramsSchema: readFileParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { sessionId, path } = readFileParamsSchema.parse(params);
        const userId = getCurrentUserId();
        try {
          const content = await port.readFile(sessionId, path, userId);
          return { success: true, data: { path, content } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "write_file",
      description: "Write content to a file in the IDE workspace",
      paramsSchema: writeFileParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { sessionId, path, content } = writeFileParamsSchema.parse(params);
        const userId = getCurrentUserId();
        try {
          await port.writeFile(sessionId, path, content, userId);
          return { success: true, data: { path } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
    {
      name: "run_command",
      description: "Run a command in the IDE session terminal",
      paramsSchema: runCommandParamsSchema,
      handler: async (params: unknown): Promise<ToolResult> => {
        const { sessionId, cmd } = runCommandParamsSchema.parse(params);
        const userId = getCurrentUserId();
        try {
          const result = await port.runCommand(sessionId, cmd, userId);
          return { success: true, data: result };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { success: false, error: message };
        }
      },
    },
  ];
}
