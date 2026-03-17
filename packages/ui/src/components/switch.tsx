"use client";

/**
 * Switch component — toggle on/off for immediate effect.
 * Architecture: COMP-041, COMPONENT-LIBRARY Switch
 * 40×24px track; off: neutral; on: --action-primary. Thumb: white 20px circle.
 */

import * as SwitchPrimitive from "@radix-ui/react-switch";
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
} from "react";
import { cn } from "../lib/utils";

const switchRootClasses =
  "inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 data-[state=unchecked]:bg-[var(--color-neutral-300)] data-[state=checked]:bg-[var(--action-primary)]";

const switchThumbClasses =
  "pointer-events-none block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5";

export type SwitchProps = ComponentPropsWithoutRef<
  typeof SwitchPrimitive.Root
>;

export const Switch = forwardRef<
  ComponentRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(switchRootClasses, className)}
    {...props}
  >
    <SwitchPrimitive.Thumb className={switchThumbClasses} />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;
