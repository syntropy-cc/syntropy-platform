"use client";

/**
 * PillarBadge component — identifies which pillar content belongs to.
 * Architecture: COMP-041, COMPONENT-LIBRARY PillarBadge
 * Same shape/typography as Badge; pillar-specific token colors.
 */

import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "../lib/utils";

const pillarConfig = {
  learn: {
    bg: "bg-[var(--color-learn-50)]",
    text: "text-[var(--color-learn-800)]",
    label: "Learn",
  },
  hub: {
    bg: "bg-[var(--color-hub-50)]",
    text: "text-[var(--color-hub-800)]",
    label: "Hub",
  },
  labs: {
    bg: "bg-[var(--color-labs-50)]",
    text: "text-[var(--color-labs-800)]",
    label: "Labs",
  },
} as const;

export type PillarBadgePillar = keyof typeof pillarConfig;

const badgeBaseClasses =
  "inline-flex items-center rounded-full font-medium py-[3px] px-[10px] text-[11px] leading-[1.4]";

export type PillarBadgeProps = ComponentPropsWithoutRef<"span"> & {
  /** Pillar: learn, hub, or labs. */
  pillar: PillarBadgePillar;
  /** Override the default label (e.g. "Learn", "Hub", "Labs"). */
  label?: string;
};

export const PillarBadge = forwardRef<HTMLSpanElement, PillarBadgeProps>(
  ({ className, pillar, label: labelOverride, ...props }, ref) => {
    const config = pillarConfig[pillar];
    const label = labelOverride ?? config.label;

    return (
      <span
        ref={ref}
        className={cn(
          badgeBaseClasses,
          config.bg,
          config.text,
          className
        )}
        {...props}
      >
        {label}
      </span>
    );
  }
);
PillarBadge.displayName = "PillarBadge";
