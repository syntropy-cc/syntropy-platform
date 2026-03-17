"use client";

/**
 * Badge component — design system compliant, token-based variants.
 * Architecture: COMP-041, COMPONENT-LIBRARY Badge
 */

import { type HTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium py-[3px] px-[10px] text-[11px] leading-[1.4]",
  {
    variants: {
      variant: {
        default: "bg-surface-sunken text-foreground",
        primary: "bg-primary-50 text-primary-800",
        success: "bg-success-light text-success-700",
        error: "bg-error-light text-error-700",
        warning: "bg-warning-light text-warning-700",
        info: "bg-info-light text-info-700",
        pillar: "bg-pillar-subtle text-pillar-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
);
Badge.displayName = "Badge";
