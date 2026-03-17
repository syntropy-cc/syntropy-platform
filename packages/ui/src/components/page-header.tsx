"use client";

/**
 * PageHeader — top section of a page with title, description, and optional actions.
 * COMP-041.17: h1 --text-h1; description --text-body --text-secondary; action right-aligned.
 * COMPONENT-LIBRARY: PageHeader
 */

import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export interface PageHeaderProps {
  /** Page title (h1). */
  title: ReactNode;
  /** Optional description below title. */
  description?: ReactNode;
  /** Optional action (e.g. primary Button), right-aligned on desktop, below on mobile. */
  action?: ReactNode;
  /** Optional bottom border. */
  withBorder?: boolean;
  className?: string;
}

/**
 * Page header with title, optional description and action.
 */
export function PageHeader({
  title,
  description,
  action,
  withBorder = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-[var(--space-2)] pb-[var(--space-6)]",
        "md:flex-row md:items-start md:justify-between md:gap-[var(--space-4)]",
        withBorder && "border-b border-border",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1
          className="text-[length:var(--text-h1)] leading-[var(--text-h1-line)] font-medium text-[var(--text-primary)]"
          id="page-header-title"
        >
          {title}
        </h1>
        {description !== undefined && (
          <p
            className="mt-[var(--space-1)] text-[length:var(--text-body)] leading-[var(--text-body-line)] text-[var(--text-secondary)]"
            id="page-header-description"
          >
            {description}
          </p>
        )}
      </div>
      {action !== undefined && (
        <div className="shrink-0 md:mt-0">{action}</div>
      )}
    </div>
  );
}
