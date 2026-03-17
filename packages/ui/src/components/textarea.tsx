"use client";

/**
 * Textarea component — multi-line text entry.
 * Architecture: COMP-041, COMPONENT-LIBRARY Textarea
 * Same styling as Input; min-height 80px, resize vertical, line-height 1.6.
 */

import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "../lib/utils";

const textareaBaseClasses =
  "min-h-[80px] w-full resize-y rounded-md border px-3 py-3 text-[length:var(--text-body)] leading-[1.6] text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 disabled:bg-surface-sunken read-only:bg-surface-sunken read-only:focus-visible:shadow-none read-only:focus-visible:border-border";

const textareaDefaultClasses =
  "border-border bg-surface focus-visible:border-[var(--border-focus)] focus-visible:shadow-[var(--focus-ring)]";

const textareaErrorClasses =
  "border-[var(--border-error)] focus-visible:border-[var(--border-error)] focus-visible:shadow-[var(--focus-ring-error)]";

export type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  /** When true, shows error border and focus ring. Sets aria-invalid. */
  error?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={cn(
          textareaBaseClasses,
          error ? textareaErrorClasses : textareaDefaultClasses,
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
