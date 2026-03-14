/**
 * IDE domain ports for pillar tool handlers (COMP-014.6).
 * Implementations are wired by the app using IDE domain session and
 * workspace snapshot; session ownership is enforced by the port implementation.
 */

/** Single file entry for list_files result. */
export interface IDEFileEntry {
  path: string;
}

/** Result of run_command. */
export interface IDERunCommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Port for IDE tool handlers. Each method receives userId so the app
 * can enforce session ownership (session must belong to userId).
 */
export interface IDEToolPort {
  listFiles(sessionId: string, userId: string): Promise<IDEFileEntry[]>;
  readFile(
    sessionId: string,
    path: string,
    userId: string
  ): Promise<string>;
  writeFile(
    sessionId: string,
    path: string,
    content: string,
    userId: string
  ): Promise<void>;
  runCommand(
    sessionId: string,
    cmd: string,
    userId: string
  ): Promise<IDERunCommandResult>;
}
