"use client";

/**
 * Sheet — overlay + side panel for mobile menu.
 * COMPONENT-LIBRARY: Sheet
 */

import { type ReactNode, useEffect, useCallback } from "react";
import { cn } from "../lib/utils";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Sheet({ open, onClose, children, className }: SheetProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );
  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className={cn("fixed inset-0 z-50", className)}>
        <div
          className="fixed inset-0 bg-black/50"
          aria-hidden
          onClick={onClose}
        />
        <div
          className="fixed right-0 top-0 h-full w-80 max-w-[85vw] border-l border-border bg-background shadow-lg"
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
  );
}

export interface SheetContentProps {
  children: ReactNode;
  className?: string;
}

export function SheetContent({ children, className }: SheetContentProps) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export interface SheetTriggerProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  "aria-label"?: string;
}

export function SheetTrigger({
  children,
  onClick,
  className,
  "aria-label": ariaLabel,
}: SheetTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex items-center justify-center", className)}
      aria-label={ariaLabel ?? "Open menu"}
    >
      {children}
    </button>
  );
}
