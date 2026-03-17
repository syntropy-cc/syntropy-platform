"use client";

/**
 * TabBar — switch between views within a page.
 * COMP-041.17: Radix Tabs; 44px height; active teal border; arrow key nav.
 * COMPONENT-LIBRARY: TabBar
 */

import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
} from "react";
import { cn } from "../lib/utils";

const TabBar = TabsPrimitive.Root;

const TabList = forwardRef<
  ComponentRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-11 items-center justify-start gap-[var(--space-6)] overflow-x-auto border-b border-border",
      "scrollbar-thin [&::-webkit-scrollbar]:h-0",
      className
    )}
    {...props}
  />
));
TabList.displayName = TabsPrimitive.List.displayName;

const TabTrigger = forwardRef<
  ComponentRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-11 items-center justify-center whitespace-nowrap border-b-2 border-transparent px-1 pb-0 pt-0 text-[length:var(--text-body)] font-medium text-[var(--text-secondary)] transition-colors",
      "hover:text-[var(--text-primary)]",
      "data-[state=active]:border-[var(--action-primary)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
TabTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabContent = forwardRef<
  ComponentRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-4 focus-visible:outline-none", className)}
    {...props}
  />
));
TabContent.displayName = TabsPrimitive.Content.displayName;

export { TabBar, TabList, TabTrigger, TabContent };
