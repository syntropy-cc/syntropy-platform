"use client";

/**
 * Sheet — overlay + side panel for mobile menu.
 * COMPONENT-LIBRARY: Sheet
 * COMP-041.6: Backdrop --bg-overlay; panel --bg-surface, --shadow-lg; z-index tokens;
 * 200ms slide+fade enter, 150ms exit; prefers-reduced-motion respected; 300px width.
 */

import { type ReactNode, useEffect, useCallback, useState } from "react";
import { cn } from "../lib/utils";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Sheet({ open, onClose, children, className }: SheetProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  const visible = open || isExiting;

  useEffect(() => {
    if (visible) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [visible, handleEscape]);

  useEffect(() => {
    if (open) {
      setIsExiting(false);
    } else {
      setIsExiting(true);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setIsExiting(true);
    }
  }, [open]);

  useEffect(() => {
    if (!isExiting) return;
    const t = setTimeout(() => setIsExiting(false), 150);
    return () => clearTimeout(t);
  }, [isExiting]);

  if (!visible) return null;

  const state = open && !isExiting ? "open" : "closed";

  return (
    <div
      className={cn("fixed inset-0 z-overlay", className)}
      data-state={state}
      data-exiting={isExiting ? "" : undefined}
    >
      <div
        className={cn(
          "sheet-backdrop fixed inset-0 bg-overlay",
          state === "open" ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
        onClick={onClose}
      />
      <div
        className={cn(
          "sheet-panel fixed right-0 top-0 z-modal h-full w-[300px] max-w-[85vw] border-l border-border bg-surface shadow-lg",
          state === "open"
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        )}
        role="dialog"
        aria-modal="true"
        data-state={state}
        data-exiting={isExiting ? "" : undefined}
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
