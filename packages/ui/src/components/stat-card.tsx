"use client";

/**
 * StatCard — display a single metric with label.
 * COMP-041.16: --bg-surface-sunken, --radius-lg; label --text-caption; value --text-h3.
 * COMPONENT-LIBRARY: StatCard
 */

import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export interface StatCardProps {
  /** Label above the value (caption style). */
  label: ReactNode;
  /** Main value (h3 style). */
  value: ReactNode;
  /** Optional trend line (e.g. "+3 from last month") with success color. */
  trend?: ReactNode;
  /** Optional additional content below value/trend. */
  children?: ReactNode;
  className?: string;
}

/**
 * Single metric card. Used in dashboard grids (2–4 per row).
 */
export function StatCard({
  label,
  value,
  trend,
  children,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-surface-sunken p-4",
        "flex flex-col gap-[var(--space-1)]",
        className
      )}
    >
      <div
        className="text-[length:var(--text-caption)] leading-[var(--text-caption-line)] font-normal text-[var(--text-secondary)]"
        aria-hidden
      >
        {label}
      </div>
      <div
        className="text-[length:var(--text-h3)] leading-[var(--text-h3-line)] font-medium text-[var(--text-primary)]"
        aria-hidden
      >
        {value}
      </div>
      {trend !== undefined && (
        <div
          className="text-[length:var(--text-caption)] leading-[var(--text-caption-line)] text-[var(--color-success-500)]"
          aria-hidden
        >
          {trend}
        </div>
      )}
      {children}
    </div>
  );
}
