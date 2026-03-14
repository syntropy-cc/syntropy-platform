/**
 * Unit tests for IDE tool handlers (COMP-014.6).
 */

import { describe, it, expect, vi } from "vitest";
import { createIDEToolDefinitions } from "../../../src/infrastructure/tool-handlers/ide-tool-handler.js";
import type { IDEToolPort } from "../../../src/infrastructure/tool-handlers/ports/ide-ports.js";

function createMockIDEPort(): IDEToolPort {
  return {
    listFiles: vi.fn().mockResolvedValue([]),
    readFile: vi.fn().mockResolvedValue(""),
    writeFile: vi.fn().mockResolvedValue(undefined),
    runCommand: vi.fn().mockResolvedValue({
      stdout: "",
      stderr: "",
      exitCode: 0,
    }),
  };
}

const getCurrentUserId = () => "user-1";

describe("IDE tool handlers", () => {
  it("createIDEToolDefinitions returns four tools with correct names", () => {
    const port = createMockIDEPort();
    const defs = createIDEToolDefinitions(port, getCurrentUserId);
    const names = defs.map((d) => d.name).sort();
    expect(names).toEqual([
      "list_files",
      "read_file",
      "run_command",
      "write_file",
    ]);
  });

  describe("list_files", () => {
    it("calls port.listFiles with sessionId and current userId", async () => {
      const port = createMockIDEPort();
      (port.listFiles as ReturnType<typeof vi.fn>).mockResolvedValue([
        { path: "src/index.ts" },
      ]);
      const defs = createIDEToolDefinitions(port, getCurrentUserId);
      const tool = defs.find((d) => d.name === "list_files")!;
      const result = await tool.handler({ sessionId: "sess-1" });

      expect(port.listFiles).toHaveBeenCalledWith("sess-1", "user-1");
      expect(result.success).toBe(true);
      expect((result as { data?: { files: { path: string }[] } }).data?.files).toEqual([
        { path: "src/index.ts" },
      ]);
    });

    it("returns failure when port throws (e.g. session not owner)", async () => {
      const port = createMockIDEPort();
      (port.listFiles as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Session not found or access denied")
      );
      const defs = createIDEToolDefinitions(port, getCurrentUserId);
      const tool = defs.find((d) => d.name === "list_files")!;
      const result = await tool.handler({ sessionId: "sess-1" });

      expect(result.success).toBe(false);
      expect((result as { error?: string }).error).toBe(
        "Session not found or access denied"
      );
    });
  });

  describe("read_file", () => {
    it("calls port.readFile and returns success with content", async () => {
      const port = createMockIDEPort();
      (port.readFile as ReturnType<typeof vi.fn>).mockResolvedValue("const x = 1;");
      const defs = createIDEToolDefinitions(port, getCurrentUserId);
      const tool = defs.find((d) => d.name === "read_file")!;
      const result = await tool.handler({
        sessionId: "sess-1",
        path: "src/index.ts",
      });

      expect(port.readFile).toHaveBeenCalledWith("sess-1", "src/index.ts", "user-1");
      expect(result.success).toBe(true);
      expect((result as { data?: { content: string } }).data?.content).toBe(
        "const x = 1;"
      );
    });
  });

  describe("write_file", () => {
    it("calls port.writeFile and returns success", async () => {
      const port = createMockIDEPort();
      const defs = createIDEToolDefinitions(port, getCurrentUserId);
      const tool = defs.find((d) => d.name === "write_file")!;
      const result = await tool.handler({
        sessionId: "sess-1",
        path: "src/foo.ts",
        content: "export {}",
      });

      expect(port.writeFile).toHaveBeenCalledWith(
        "sess-1",
        "src/foo.ts",
        "export {}",
        "user-1"
      );
      expect(result.success).toBe(true);
    });
  });

  describe("run_command", () => {
    it("calls port.runCommand and returns success with stdout/stderr/exitCode", async () => {
      const port = createMockIDEPort();
      (port.runCommand as ReturnType<typeof vi.fn>).mockResolvedValue({
        stdout: "hello",
        stderr: "",
        exitCode: 0,
      });
      const defs = createIDEToolDefinitions(port, getCurrentUserId);
      const tool = defs.find((d) => d.name === "run_command")!;
      const result = await tool.handler({
        sessionId: "sess-1",
        cmd: "echo hello",
      });

      expect(port.runCommand).toHaveBeenCalledWith("sess-1", "echo hello", "user-1");
      expect(result.success).toBe(true);
      expect((result as { data?: { stdout: string } }).data?.stdout).toBe("hello");
      expect((result as { data?: { exitCode: number } }).data?.exitCode).toBe(0);
    });
  });
});
