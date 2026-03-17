"use client";

/**
 * Input component — single-line text entry.
 * Architecture: COMP-041, COMPONENT-LIBRARY Input
 * Always pair with a <label> via id/htmlFor. Never use placeholder as the sole label.
 */

import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "../lib/utils";

const inputBaseClasses =
  "h-10 w-full rounded-md border px-3 text-[length:var(--text-body)] text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 disabled:bg-surface-sunken read-only:bg-surface-sunken read-only:focus-visible:shadow-none read-only:focus-visible:border-border";

const inputDefaultClasses =
  "border-border bg-surface focus-visible:border-[var(--border-focus)] focus-visible:shadow-[var(--focus-ring)]";

const inputErrorClasses =
  "border-[var(--border-error)] focus-visible:border-[var(--border-error)] focus-visible:shadow-[var(--focus-ring-error)]";

export type InputProps = ComponentPropsWithoutRef<"input"> & {
  /** When true, shows error border and focus ring. Sets aria-invalid. */
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={error ? true : undefined}
        className={cn(
          inputBaseClasses,
          error ? inputErrorClasses : inputDefaultClasses,
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
