"use client";

/**
 * Checkbox component — toggle a boolean option.
 * Architecture: COMP-041, COMPONENT-LIBRARY Checkbox
 * Always pair with a visible label (inline or via htmlFor). Uses Radix for accessibility.
 */

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
} from "react";
import { cn } from "../lib/utils";

const checkboxRootClasses =
  "group flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-surface transition-colors focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:border-[var(--action-primary)] data-[state=checked]:bg-[var(--action-primary)] data-[state=indeterminate]:border-[var(--action-primary)] data-[state=indeterminate]:bg-[var(--action-primary)]";

const checkboxIndicatorClasses =
  "flex items-center justify-center text-white [&>svg]:size-3";

export type CheckboxProps = ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
>;

export const Checkbox = forwardRef<
  ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxRootClasses, className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={checkboxIndicatorClasses}>
      <Check className="size-3.5 stroke-[3] group-data-[state=indeterminate]:hidden" aria-hidden />
      <Minus className="size-3.5 stroke-[3] hidden group-data-[state=indeterminate]:block" aria-hidden />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
