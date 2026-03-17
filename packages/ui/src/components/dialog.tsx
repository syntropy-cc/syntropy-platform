"use client";

/**
 * Dialog — modal for confirmations, forms, and detail views.
 * COMP-041.13: Radix Dialog; 3 sizes (480/640/800px); --bg-overlay backdrop;
 * 200ms enter, 150ms exit; mobile full-screen sheet; focus trap; aria-modal.
 * COMPONENT-LIBRARY: Dialog
 */

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
} from "react";
import { cn } from "../lib/utils";

export type DialogContentSize = "sm" | "md" | "lg";

const SIZE_MAX_WIDTH: Record<DialogContentSize, string> = {
  sm: "max-w-[480px]",
  md: "max-w-[640px]",
  lg: "max-w-[800px]",
};

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = forwardRef<
  ComponentRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "dialog-overlay fixed inset-0 z-overlay bg-overlay",
      "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Size variant: sm 480px, md 640px, lg 800px max-width. */
  size?: DialogContentSize;
  /** Optional drag handle shown at top on mobile. */
  showDragHandle?: boolean;
}

const DialogContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      size = "md",
      showDragHandle = true,
      children,
      ...props
    },
    ref
  ) => (
    <DialogPortal>
      <DialogOverlay />
      <div
        className={cn(
          "fixed inset-0 z-modal flex items-end justify-center p-0",
          "md:items-center md:p-4",
          "pointer-events-none"
        )}
      >
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "dialog-content pointer-events-auto z-modal w-full",
            "bg-surface rounded-xl shadow-lg p-6",
            "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
            "data-[state=closed]:scale-95 data-[state=open]:scale-100",
            "max-md:max-h-[90vh] max-md:rounded-b-none max-md:rounded-t-xl max-md:overflow-y-auto",
            SIZE_MAX_WIDTH[size],
            className
          )}
          aria-modal
          {...props}
        >
          {showDragHandle && (
            <div
              className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-border max-md:block md:hidden"
              aria-hidden
            />
          )}
          {children}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-medium text-foreground", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground mt-1", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
