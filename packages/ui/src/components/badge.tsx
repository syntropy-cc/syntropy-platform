"use client";

/**
 * Badge component — tags, status labels, pillar badges (e.g. LE, PJ).
 * COMPONENT-LIBRARY: Badge
 */

import { type HTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-full)] font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-muted text-muted-foreground",
        outline: "border border-border bg-transparent text-foreground",
        success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
        destructive: "bg-red-500/15 text-red-700 dark:text-red-400",
        learn: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
        hub: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
        labs: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400",
        contribute: "bg-green-500/15 text-green-700 dark:text-green-400",
        portfolio: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Badge.displayName = "Badge";
