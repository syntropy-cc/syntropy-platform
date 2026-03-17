"use client";

/**
 * Skeleton component — loading placeholder for content being fetched.
 * Architecture: COMP-041, COMPONENT-LIBRARY Skeleton
 * Shimmer animation 1.5s; respects prefers-reduced-motion.
 */

import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "../lib/utils";

const skeletonBaseClasses =
  "rounded-md min-h-[1em] animate-skeleton-shimmer motion-reduce:animate-none";

const skeletonBackgroundStyle = {
  backgroundImage:
    "linear-gradient(90deg, var(--bg-surface-sunken) 0%, var(--color-neutral-200) 50%, var(--bg-surface-sunken) 100%)",
  backgroundSize: "200% 100%",
  backgroundColor: "var(--bg-surface-sunken)",
} as const;

export type SkeletonProps = ComponentPropsWithoutRef<"div">;

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonBaseClasses, className)}
        style={{ ...skeletonBackgroundStyle, ...style }}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";
