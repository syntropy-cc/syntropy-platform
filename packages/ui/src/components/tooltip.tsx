"use client";

/**
 * Tooltip — supplementary information on hover/focus.
 * Architecture: COMP-041, COMPONENT-LIBRARY Tooltip
 * Radix-based; 300ms delay; dismiss on Escape; aria-describedby on trigger.
 */

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
} from "react";
import { cn } from "../lib/utils";

const TOOLTIP_DELAY_MS = 300;

/** Default delay for opening tooltips (COMPONENT-LIBRARY: 300ms). */
export const tooltipDelayDuration = TOOLTIP_DELAY_MS;

export interface TooltipProviderProps
  extends ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider> {}

function TooltipProvider({
  delayDuration = TOOLTIP_DELAY_MS,
  ...props
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
  );
}
TooltipProvider.displayName = "TooltipProvider";

const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const tooltipContentClasses =
  "z-[var(--z-tooltip)] max-w-[min(280px,90vw)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[var(--space-1.5)] text-[length:var(--text-caption)] leading-[var(--text-caption-line)] shadow-[var(--shadow-md)] " +
  "bg-[var(--color-neutral-800)] text-[var(--text-inverse)] " +
  "dark:bg-[var(--color-neutral-100)] dark:text-[var(--text-primary)]";

export interface TooltipContentProps
  extends ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  /** Optional arrow. COMPONENT-LIBRARY: arrow pointing to trigger. */
  showArrow?: boolean;
}

const TooltipContent = forwardRef<
  ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 6, showArrow = false, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(tooltipContentClasses, className)}
      {...props}
    >
      {children}
      {showArrow && (
        <TooltipPrimitive.Arrow
          className="fill-[var(--color-neutral-800)] dark:fill-[var(--color-neutral-100)]"
          width={8}
          height={4}
        />
      )}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
