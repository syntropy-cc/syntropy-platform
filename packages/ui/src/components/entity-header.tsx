"use client";

/**
 * EntityHeader — header for institution, project, lab, track, or user profile.
 * COMP-041.17: Name h1 + type badge + inline stats + primary action.
 * COMPONENT-LIBRARY: EntityHeader
 */

import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Badge } from "./badge";

export interface EntityHeaderStat {
  label: string;
  value: ReactNode;
}

export interface EntityHeaderProps {
  /** Entity name (h1). */
  name: ReactNode;
  /** Optional type label shown as Badge (e.g. "Project", "Institution"). */
  typeLabel?: ReactNode;
  /** Optional 3–4 inline stats: label (secondary) + value (primary). */
  stats?: EntityHeaderStat[];
  /** Optional primary action button. */
  action?: ReactNode;
  className?: string;
}

/**
 * Entity detail header with name, type badge, stats row, and action.
 */
export function EntityHeader({
  name,
  typeLabel,
  stats = [],
  action,
  className,
}: EntityHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-border bg-surface px-[var(--space-6)] py-[var(--space-6)]",
        className
      )}
    >
      <div className="flex flex-col gap-[var(--space-4)] md:flex-row md:items-center md:justify-between md:gap-[var(--space-6)]">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-[var(--space-2)]">
            <h1
              className="text-[length:var(--text-h1)] leading-[var(--text-h1-line)] font-medium text-[var(--text-primary)]"
              id="entity-header-name"
            >
              {name}
            </h1>
            {typeLabel !== undefined && (
              <Badge variant="default">{typeLabel}</Badge>
            )}
          </div>
          {stats.length > 0 && (
            <div
              className="mt-[var(--space-2)] flex flex-wrap gap-x-[var(--space-6)] gap-y-[var(--space-1)]"
              role="list"
              aria-label="Statistics"
            >
              {stats.map(({ label, value }, i) => (
                <div
                  key={i}
                  className="text-[length:var(--text-body-sm)] leading-[var(--text-body-sm-line)]"
                  role="listitem"
                >
                  <span className="text-[var(--text-secondary)]">{label}: </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {action !== undefined && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
