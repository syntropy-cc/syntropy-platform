"use client";

/**
 * ListRow — single row in a Dense List.
 * COMP-041.18: 44–56px height; status dot + title + metadata; hover --bg-hover; selected --bg-selected.
 * COMPONENT-LIBRARY: ListRow
 */

import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type ListRowStatus = "success" | "neutral" | "error";

export interface ListRowProps {
  /** Row title (required). */
  title: ReactNode;
  /** Optional metadata (right-aligned; wraps below title on mobile). */
  metadata?: ReactNode;
  /** Optional status for the leading dot: success (teal), neutral (gray), error (red). */
  status?: ListRowStatus;
  /** When true, applies selected background. */
  selected?: boolean;
  /** Optional href to render row as link. */
  href?: string;
  /** Optional ID or badge (e.g. monospace issue ID). */
  idLabel?: ReactNode;
  /** Optional custom leading content (overrides status dot when provided). */
  leading?: ReactNode;
  /** Optional trailing content (right side). */
  trailing?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const statusDotColors: Record<ListRowStatus, string> = {
  success: "bg-[var(--color-success-500)]",
  neutral: "bg-[var(--color-neutral-400)]",
  error: "bg-[var(--color-error-500)]",
};

/**
 * Single row for dense lists. Height 44–56px; status dot + optional ID + title + metadata; hover/selected states.
 */
export function ListRow({
  title,
  metadata,
  status = "neutral",
  selected = false,
  href,
  idLabel,
  leading,
  trailing,
  className,
  children,
}: ListRowProps) {
  const content = (
    <>
      {leading !== undefined ? (
        <div className="flex shrink-0 items-center">{leading}</div>
      ) : (
        <span
          className={cn(
            "h-2 w-2 shrink-0 rounded-full",
            statusDotColors[status]
          )}
          aria-hidden
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-[var(--space-2)] gap-y-[var(--space-1)]">
          {idLabel !== undefined && (
            <span className="font-mono text-[length:var(--text-caption)] text-[var(--text-secondary)]">
              {idLabel}
            </span>
          )}
          <span className="text-[length:var(--text-body)] font-medium text-[var(--text-primary)] truncate">
            {title}
          </span>
        </div>
        {metadata !== undefined && (
          <div className="mt-[var(--space-0.5)] text-[length:var(--text-caption)] text-[var(--text-secondary)] md:mt-0 md:inline md:pl-[var(--space-2)]">
            {metadata}
          </div>
        )}
      </div>
      {trailing !== undefined && (
        <div className="shrink-0">{trailing}</div>
      )}
      {children}
    </>
  );

  const rowClasses = cn(
    "flex min-h-[44px] max-h-[56px] items-center gap-[var(--space-3)] border-b border-border py-[var(--space-3)] px-[var(--space-4)]",
    "transition-colors hover:bg-[var(--bg-hover)]",
    selected && "bg-[var(--bg-selected)]",
    className
  );

  if (href !== undefined) {
    return (
      <a href={href} className={cn(rowClasses, "block no-underline text-inherit")}>
        {content}
      </a>
    );
  }

  return <div className={rowClasses}>{content}</div>;
}
