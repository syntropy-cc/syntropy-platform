"use client";

/**
 * IDE reconnection indicator (COMP-035.4).
 * Shows "Reconnecting…" when the client is attempting to reconnect to the IDE WebSocket.
 */

import React from "react";
import { cn } from "../lib/utils";

export interface IdeReconnectionIndicatorProps {
  /** When true, shows the reconnecting state. */
  reconnecting: boolean;
  /** Optional class name for the wrapper. */
  className?: string;
}

/**
 * Displays a "Reconnecting…" message when the IDE WebSocket is reconnecting.
 * Use when the client has lost connection and is retrying within the reconnection window.
 */
export function IdeReconnectionIndicator({
  reconnecting,
  className,
}: IdeReconnectionIndicatorProps): React.ReactElement | null {
  if (!reconnecting) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300",
        className
      )}
      role="status"
      aria-live="polite"
      data-testid="ide-reconnection-indicator"
    >
      <span
        className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500"
        aria-hidden
      />
      Reconnecting…
    </div>
  );
}
