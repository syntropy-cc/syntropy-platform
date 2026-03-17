"use client";

/**
 * ProgressBar component — visual progress indication.
 * Architecture: COMP-041, COMPONENT-LIBRARY ProgressBar
 * Track 8px; fill uses --action-primary; full ARIA progressbar attributes.
 */

import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "../lib/utils";

const trackClasses =
  "h-2 w-full overflow-hidden rounded-full bg-[var(--bg-surface-sunken)]";

const fillClasses =
  "h-full rounded-full bg-[var(--action-primary)] transition-[width] duration-200 ease-out";

export type ProgressBarProps = ComponentPropsWithoutRef<"div"> & {
  /** Progress value 0–100. */
  value?: number;
  /** Optional label for screen readers (e.g. "35% complete"). */
  "aria-label"?: string;
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value = 0,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const clamped = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        className={cn(trackClasses, className)}
        {...props}
      >
        <div
          className={fillClasses}
          style={{ width: `${clamped}%` }}
          aria-hidden
        />
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";
