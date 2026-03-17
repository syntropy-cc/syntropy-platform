"use client";

/**
 * EmptyState — shown when a list, grid, or section has no content.
 * COMP-041.16: Centered, max-width 400px; title --text-h3; description --text-body --text-secondary; optional action.
 * COMPONENT-LIBRARY: EmptyState
 */

import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export interface EmptyStateProps {
  /** Main title. */
  title: ReactNode;
  /** Supporting description. */
  description: ReactNode;
  /** Optional primary action (e.g. Button). */
  action?: ReactNode;
  /** Optional illustration (max-height 160px per spec). */
  illustration?: ReactNode;
  className?: string;
}

/**
 * Centered empty state. Use when a list or grid has no items.
 */
export function EmptyState({
  title,
  description,
  action,
  illustration,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-[400px] flex-col items-center gap-[var(--space-6)] px-4 py-[var(--space-12)] text-center",
        className
      )}
    >
      {illustration !== undefined && (
        <div className="max-h-[160px] shrink-0 [&>img]:max-h-[160px] [&>svg]:max-h-[160px]">
          {illustration}
        </div>
      )}
      <div className="flex flex-col gap-[var(--space-2)]">
        <h3
          className="text-[length:var(--text-h3)] leading-[var(--text-h3-line)] font-medium text-[var(--text-primary)]"
          id="empty-state-title"
        >
          {title}
        </h3>
        <p
          className="text-[length:var(--text-body)] leading-[var(--text-body-line)] text-[var(--text-secondary)]"
          id="empty-state-description"
        >
          {description}
        </p>
      </div>
      {action !== undefined && <div className="shrink-0">{action}</div>}
    </div>
  );
}
