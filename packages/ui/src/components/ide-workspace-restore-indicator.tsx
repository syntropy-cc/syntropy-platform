"use client";

/**
 * IDE workspace restore indicator (COMP-035.6).
 * Shows "Restoring workspace…" when the client receives workspace_restore_progress
 * from the gateway; hide when welcome is received.
 */

import React from "react";
import { cn } from "../lib/utils";

export interface IdeWorkspaceRestoreIndicatorProps {
  /** When true, shows the restoring state. */
  restoring: boolean;
  /** Optional class name for the wrapper. */
  className?: string;
}

/**
 * Displays a "Restoring workspace…" message during workspace restore after resume.
 * Use when the client has received workspace_restore_progress and has not yet received welcome.
 */
export function IdeWorkspaceRestoreIndicator({
  restoring,
  className,
}: IdeWorkspaceRestoreIndicatorProps): React.ReactElement | null {
  if (!restoring) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-blue-500/50 bg-blue-500/10 px-3 py-2 text-sm text-blue-700 dark:text-blue-300",
        className
      )}
      role="status"
      aria-live="polite"
      data-testid="ide-workspace-restore-indicator"
    >
      <span
        className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500"
        aria-hidden
      />
      Restoring workspace…
    </div>
  );
}
