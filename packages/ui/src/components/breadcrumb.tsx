"use client";

/**
 * Breadcrumb — navigation hierarchy (e.g. Learn: Career > Track > Course > Fragment).
 * COMP-041.15: Current --text-primary 500; parents --text-link; --text-body-sm.
 * COMPONENT-LIBRARY: Breadcrumb
 */

import { ChevronRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../lib/utils";

export interface BreadcrumbProps extends ComponentPropsWithoutRef<"nav"> {
  children?: ReactNode;
}

export interface BreadcrumbItemProps {
  children?: ReactNode;
  /** If true, renders as current page (non-link, primary text). */
  isCurrent?: boolean;
  /** If set and not current, renders as link with this href. */
  href?: string;
  className?: string;
}

export interface BreadcrumbSeparatorProps {
  children?: ReactNode;
  className?: string;
}

const BREADCRUMB_SEPARATOR_DEFAULT = <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />;

/**
 * Breadcrumb nav. Use BreadcrumbItem for each segment; use BreadcrumbSeparator between items (or default chevron).
 */
export function Breadcrumb({ className, children, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex flex-wrap items-center gap-[var(--space-1)] text-[length:var(--text-body-sm)]", className)}
      {...props}
    >
      {children}
    </nav>
  );
}

/**
 * Single breadcrumb item. When isCurrent, renders as span with --text-primary and weight 500. Otherwise, if href, as link with --text-link.
 */
export function BreadcrumbItem({
  children,
  isCurrent,
  href,
  className,
}: BreadcrumbItemProps) {
  const baseClasses =
    "text-[length:var(--text-body-sm)] leading-[var(--text-body-sm-line)]";
  if (isCurrent) {
    return (
      <span
        aria-current="page"
        className={cn(
          baseClasses,
          "font-medium text-[var(--text-primary)]",
          className
        )}
      >
        {children}
      </span>
    );
  }
  if (href !== undefined) {
    return (
      <a
        href={href}
        className={cn(
          baseClasses,
          "text-[var(--text-link)] hover:underline",
          className
        )}
      >
        {children}
      </a>
    );
  }
  return (
    <span className={cn(baseClasses, "text-muted-foreground", className)}>
      {children}
    </span>
  );
}

/**
 * Optional separator between items. Defaults to chevron icon.
 */
export function BreadcrumbSeparator({
  children = BREADCRUMB_SEPARATOR_DEFAULT,
  className,
}: BreadcrumbSeparatorProps) {
  return (
    <span className={cn("shrink-0 text-muted-foreground", className)} role="presentation">
      {children}
    </span>
  );
}
